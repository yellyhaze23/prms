import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_squared_error, mean_absolute_percentage_error
import matplotlib.pyplot as plt
import os
import json
import sys
import pickle
import time
from datetime import datetime, timedelta

# Set working directory to script's folder
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

def preprocess_data(data):
    """
    Efficiently preprocess data for ARIMA training:
    - Fill missing values with forward fill then backward fill
    - Remove unnecessary columns
    - Ensure data is sorted by date
    """
    # Convert data types efficiently
    data['year'] = data['year'].astype(int)
    data['month'] = data['month'].astype(int)
    data['total_cases'] = pd.to_numeric(data['total_cases'], errors='coerce')
    
    # Create date column for sorting
    data["date"] = pd.to_datetime(data["year"].astype(str) + "-" + data["month"].astype(str) + "-01")
    
    # Fill missing values efficiently using vectorized operations
    data['total_cases'] = data['total_cases'].ffill().bfill().fillna(0)
    
    # Remove any rows with invalid data
    data = data.dropna()
    
    # Sort by date for time series
    data = data.sort_values('date')
    
    return data

def load_cached_model(disease, forecast_period):
    """
    Load cached ARIMA model if it exists and is recent
    """
    cache_file = f"cache/{disease}_{forecast_period}.pkl"
    if os.path.exists(cache_file) and (time.time() - os.path.getmtime(cache_file)) < 3600:  # 1 hour cache
        try:
            with open(cache_file, 'rb') as f:
                return pickle.load(f)
        except:
            return None
    return None

def save_cached_model(model, disease, forecast_period):
    """
    Save trained ARIMA model to cache
    """
    cache_file = f"cache/{disease}_{forecast_period}.pkl"
    os.makedirs(os.path.dirname(cache_file), exist_ok=True)
    with open(cache_file, 'wb') as f:
        pickle.dump(model, f)

def calculate_accuracy_metrics(actual, predicted):
    """
    Calculate RMSE and MAPE for forecast accuracy
    """
    # Remove any NaN values
    mask = ~(np.isnan(actual) | np.isnan(predicted))
    actual_clean = actual[mask]
    predicted_clean = predicted[mask]
    
    if len(actual_clean) == 0:
        return {'rmse': 0, 'mape': 0}
    
    # Calculate RMSE
    rmse = np.sqrt(mean_squared_error(actual_clean, predicted_clean))
    
    # Calculate MAPE (avoid division by zero)
    mape = mean_absolute_percentage_error(actual_clean, predicted_clean) * 100
    
    return {'rmse': float(rmse), 'mape': float(mape)}

def main():
    try:
        # Suppress warnings to clean output
        import warnings
        warnings.filterwarnings('ignore')
        
        # Get command line arguments
        if len(sys.argv) < 2:
            print(json.dumps({"success": False, "error": "JSON file path required"}))
            return
        
        json_file = sys.argv[1]
        forecast_period = int(sys.argv[2]) if len(sys.argv) > 2 else 3
        
        # Load dataset from JSON file
        with open(json_file, 'r') as f:
            data_list = json.load(f)
        
        # Convert to DataFrame
        data = pd.DataFrame(data_list)
        
        # Validate dataset
        required_columns = {"year", "month", "disease_name", "total_cases"}
        if not required_columns.issubset(data.columns):
            raise ValueError("Dataset must contain year, month, disease_name, total_cases columns.")
        
        # Preprocess data efficiently
        data = preprocess_data(data)
        
        # Note: Backend already provides smart data selection based on forecast period:
        # 1 month forecast → 3 months data, 2 months → 6 months, 3+ months → 12 months
        # No additional limiting needed here as backend handles optimal data selection
        
        # Calculate current cases (last 30 days) - get recent data
        current_date = datetime.now()
        thirty_days_ago = current_date - timedelta(days=30)
        
        # Filter data for last 30 days
        recent_data = data[data['date'] >= thirty_days_ago]
        
        # Calculate current cases by disease
        current_cases_30d = {}
        if not recent_data.empty:
            for disease, group in recent_data.groupby('disease_name'):
                current_cases_30d[disease] = int(group['total_cases'].sum())  # Convert to int
        
        forecast_results = []
        
        # Group by disease and generate forecasts
        for disease, group in data.groupby("disease_name"):
            group = group.sort_values("date")
            group.set_index("date", inplace=True)
            ts = group["total_cases"]
            
            if len(ts) < 5:  # Need at least 5 data points for ARIMA
                forecast_results.append({
                    "disease_name": disease,
                    "forecast_month": "Error",
                    "forecast_cases": 0,
                    "error": "Not enough data points for ARIMA forecast"
                })
                continue
            
            try:
                # Check for cached model first
                cached_model = load_cached_model(disease, forecast_period)
                
                if cached_model is not None:
                    # Use cached model for faster prediction
                    model_fit = cached_model
                else:
                    # Build ARIMA model (1,1,1) - simple but effective
                    model = ARIMA(ts, order=(1, 1, 1))
                    model_fit = model.fit()
                    
                    # Cache the trained model
                    save_cached_model(model_fit, disease, forecast_period)
                
                # Forecast next periods
                forecast = model_fit.forecast(steps=forecast_period)
                
                # Calculate accuracy metrics using last 20% of data for validation
                if len(ts) >= 10:  # Only calculate if we have enough data
                    split_point = int(len(ts) * 0.8)
                    train_data = ts[:split_point]
                    test_data = ts[split_point:]
                    
                    # Create a temporary model for validation
                    temp_model = ARIMA(train_data, order=(1, 1, 1))
                    temp_fit = temp_model.fit()
                    validation_forecast = temp_fit.forecast(steps=len(test_data))
                    
                    # Calculate accuracy metrics
                    accuracy_metrics = calculate_accuracy_metrics(test_data.values, validation_forecast)
                else:
                    accuracy_metrics = {'rmse': 0, 'mape': 0}
                
                # Store results - ROUND TO WHOLE NUMBERS for panelist presentation
                # Use current date for forecasting instead of last historical data point
                current_date = datetime.now()
                for i, val in enumerate(forecast):
                    # Calculate forecast date from current date, not from last historical data
                    next_month = pd.Timestamp(current_date) + pd.DateOffset(months=i + 1)
                    forecast_results.append({
                        "disease_name": disease,
                        "forecast_month": next_month.strftime("%Y-%m"),
                        "forecast_cases": int(round(float(val))) if not pd.isna(val) else int(max(1, float(ts.mean()))), # Convert to int for JSON serialization
                        "accuracy_rmse": accuracy_metrics['rmse'],
                        "accuracy_mape": accuracy_metrics['mape']
                    })
                
                # Plot actual vs forecast
                plt.figure(figsize=(8, 4))
                plt.plot(ts, label="Actual Cases", marker='o')
                # Use current date for forecast dates in plot
                forecast_dates = pd.date_range(pd.Timestamp(current_date), periods=forecast_period+1, freq="M")[1:]
                plt.plot(forecast_dates, forecast, label="Forecast", linestyle="--", marker='s')
                plt.title(f"Disease Forecast: {disease}")
                plt.xlabel("Date")
                plt.ylabel("Cases")
                plt.legend()
                plt.grid(True)
                plt.tight_layout()
                plt.savefig(f"forecast_{disease.lower().replace(' ', '_')}.png", dpi=300, bbox_inches='tight')
                plt.close()
                
                # Forecast completed silently
                
            except Exception as e:
                # Add error entry to results
                forecast_results.append({
                    "disease_name": disease,
                    "forecast_month": "Error",
                    "forecast_cases": 0,
                    "error": str(e)
                })
        
        # Save forecast results
        #forecast_df = pd.DataFrame(forecast_results)
        #forecast_df.to_csv("forecast_result.csv", index=False)
        
        # Return JSON output for PHP (no chart data)
        result_data = {
            'success': True,
            'forecast_results': forecast_results,
            'summary': {
                'total_diseases': int(len(set(r['disease_name'] for r in forecast_results if 'error' not in r))),
                'total_forecast_months': int(len(forecast_results)),
                'historical_records': int(len(data)),
                'current_cases_30d': current_cases_30d,  # Keep as dictionary
                'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # Use datetime instead of pd.Timestamp
            }
        }
        
        # Output JSON to stdout for PHP to capture
        print(json.dumps(result_data))
        return forecast_results
        
    except Exception as e:
        # Return error as JSON
        error_data = {
            'success': False,
            'error': str(e)
        }
        print(json.dumps(error_data))
        return None

if __name__ == "__main__":
    main()