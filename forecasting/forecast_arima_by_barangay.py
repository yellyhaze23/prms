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
    Efficiently preprocess data for ARIMA training with barangay grouping
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
    data = data.sort_values(['disease_name', 'barangay_name', 'date'])
    
    return data

def load_cached_model(disease, barangay, forecast_period):
    """
    Load cached ARIMA model if it exists and is recent
    """
    safe_barangay = barangay.replace(' ', '_').replace(',', '').replace('.', '')
    cache_file = f"cache/{disease}_{safe_barangay}_{forecast_period}.pkl"
    if os.path.exists(cache_file) and (time.time() - os.path.getmtime(cache_file)) < 3600:  # 1 hour cache
        try:
            with open(cache_file, 'rb') as f:
                return pickle.load(f)
        except:
            return None
    return None

def save_cached_model(model, disease, barangay, forecast_period):
    """
    Save trained ARIMA model to cache
    """
    safe_barangay = barangay.replace(' ', '_').replace(',', '').replace('.', '')
    cache_file = f"cache/{disease}_{safe_barangay}_{forecast_period}.pkl"
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
        required_columns = {"year", "month", "disease_name", "barangay_name", "total_cases"}
        if not required_columns.issubset(data.columns):
            raise ValueError("Dataset must contain year, month, disease_name, barangay_name, total_cases columns.")
        
        # Preprocess data efficiently
        data = preprocess_data(data)
        
        forecast_results = []
        high_risk_barangays = {}
        barangay_summary = {}
        
        # Group by disease AND barangay
        for (disease, barangay), group in data.groupby(["disease_name", "barangay_name"]):
            group = group.sort_values("date")
            group.set_index("date", inplace=True)
            ts = group["total_cases"]
            
            if len(ts) < 3:  # Need at least 3 data points for ARIMA
                continue
            
            try:
                # Check for cached model first
                cached_model = load_cached_model(disease, barangay, forecast_period)
                
                if cached_model is not None:
                    # Use cached model for faster prediction
                    model_fit = cached_model
                else:
                    # Build ARIMA model (1,1,1) - simple but effective
                    model = ARIMA(ts, order=(1, 1, 1))
                    model_fit = model.fit()
                    
                    # Cache the trained model
                    save_cached_model(model_fit, disease, barangay, forecast_period)
                
                # Forecast next periods
                forecast = model_fit.forecast(steps=forecast_period)
                
                # Calculate accuracy metrics using last 20% of data for validation
                if len(ts) >= 5:  # Only calculate if we have enough data
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
                
                # Store results with barangay info
                current_date = datetime.now()
                last_actual_cases = int(ts.iloc[-1])
                
                # Get latitude/longitude if available
                latitude = group['latitude'].iloc[0] if 'latitude' in group.columns else None
                longitude = group['longitude'].iloc[0] if 'longitude' in group.columns else None
                
                for i, val in enumerate(forecast):
                    # Calculate forecast date from current date
                    next_month = pd.Timestamp(current_date) + pd.DateOffset(months=i + 1)
                    predicted_cases = int(round(float(val))) if not pd.isna(val) else 0
                    
                    # Determine trend
                    if i == 0:
                        trend = "increasing" if predicted_cases > last_actual_cases else "decreasing" if predicted_cases < last_actual_cases else "stable"
                    else:
                        prev_forecast = int(round(float(forecast[i-1])))
                        trend = "increasing" if predicted_cases > prev_forecast else "decreasing" if predicted_cases < prev_forecast else "stable"
                    
                    result = {
                        "disease_name": disease,
                        "barangay_name": barangay,
                        "forecast_month": next_month.strftime("%Y-%m"),
                        "forecast_cases": predicted_cases,
                        "trend": trend,
                        "last_actual_cases": last_actual_cases,
                        "accuracy_rmse": accuracy_metrics['rmse'],
                        "accuracy_mape": accuracy_metrics['mape']
                    }
                    
                    # Add coordinates if available
                    if latitude is not None and longitude is not None:
                        result['latitude'] = float(latitude)
                        result['longitude'] = float(longitude)
                    
                    forecast_results.append(result)
                    
                    # Track high-risk barangays (increasing trend)
                    if trend == "increasing":
                        if barangay not in high_risk_barangays:
                            high_risk_barangays[barangay] = {
                                'diseases': [],
                                'total_predicted_cases': 0
                            }
                            if latitude is not None and longitude is not None:
                                high_risk_barangays[barangay]['latitude'] = float(latitude)
                                high_risk_barangays[barangay]['longitude'] = float(longitude)
                        
                        high_risk_barangays[barangay]['diseases'].append({
                            'disease': disease,
                            'forecast_cases': predicted_cases,
                            'month': next_month.strftime("%Y-%m"),
                            'last_actual': last_actual_cases
                        })
                        high_risk_barangays[barangay]['total_predicted_cases'] += predicted_cases
                
                # Track barangay summary
                if barangay not in barangay_summary:
                    barangay_summary[barangay] = {
                        'diseases_tracked': 0,
                        'total_forecasts': 0
                    }
                barangay_summary[barangay]['diseases_tracked'] += 1
                barangay_summary[barangay]['total_forecasts'] += len(forecast)
                
            except Exception as e:
                # Skip this combination if error occurs
                continue
        
        # Sort high risk barangays by total predicted cases
        sorted_high_risk = dict(sorted(
            high_risk_barangays.items(), 
            key=lambda x: x[1]['total_predicted_cases'], 
            reverse=True
        ))
        
        result_data = {
            'success': True,
            'forecast_results': forecast_results,
            'high_risk_barangays': sorted_high_risk,
            'barangay_summary': barangay_summary,
            'summary': {
                'total_forecasts': int(len(forecast_results)),
                'unique_diseases': int(len(set(r['disease_name'] for r in forecast_results))),
                'unique_barangays': int(len(set(r['barangay_name'] for r in forecast_results))),
                'barangays_at_risk': int(len(high_risk_barangays)),
                'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
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

