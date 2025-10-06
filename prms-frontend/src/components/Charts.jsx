import React, { useEffect, useState } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import axios from "axios";
import "./Charts.css";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const colorPalette = [
  "#3498db", "#e74c3c", "#2ecc71", "#9b59b6", "#f39c12", "#1abc9c",
  "#e67e22", "#16a085", "#8e44ad", "#2980b9", "#d35400", "#27ae60"
];

const Charts = () => {
  const [departmentData, setDepartmentData] = useState([]);
  const [diseasesData, setDiseasesData] = useState(null);
  const [totalPatients, setTotalPatients] = useState(0);

  useEffect(() => {
    // TODO: Implement get_patients_per_department.php endpoint
    setDepartmentData([]);
    setTotalPatients(0);
  }, []);

  useEffect(() => {
    // TODO: Implement get_top_diseases.php endpoint
    setDiseasesData(null);
  }, []);

  return (
    <div className="charts-container">
    <div className="department-chart-section">
        <div className="chart-wrapper">
        <h3>Patients by Department</h3>

        <div className="legend">
            {departmentData.map((dept, index) => (
            <div className="legend-item" key={index}>
                <span
                className="legend-color"
                style={{ backgroundColor: colorPalette[index % colorPalette.length] }}
                />
                {dept.department}
            </div>
            ))}
            <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: "#ecf0f1" }} />
            Others
            </div>
        </div>

        <div className="doughnut-grid">
            {departmentData.map((dept, index) => {
            const percent = ((dept.count / totalPatients) * 100).toFixed(1);
            const chartData = {
                labels: [dept.department, "Others"],
                datasets: [{
                data: [dept.count, totalPatients - dept.count],
                backgroundColor: [
                    colorPalette[index % colorPalette.length],
                    "#ecf0f1"
                ],
                borderWidth: 1,
                }]
            };

            const options = {
                plugins: {
                legend: {
                    display: false
                }
                },
                maintainAspectRatio: false,
            };

            return (
                <div className="doughnut-card" key={index}>
                <div className="doughnut-canvas-wrapper">
                    <Doughnut data={chartData} options={options} />
                </div>
                <p><strong>{dept.department}</strong>: {percent}%</p>
                </div>
            );
            })}
        </div>
        </div>
    </div>

    <div className="diseases-chart-section">
        <div className="chart-wrapper">
        <h3>Top Diagnosed Family Illnesses</h3>
        {diseasesData && (
            <div className="bar-chart">
            <Bar
                data={diseasesData}
                options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                    display: true,
                    position: "top",
                    labels: {
                        font: { size: 14 },
                        weight: "800"
                    }
                    }
                },
                scales: {
                    x: {
                    ticks: {
                        color: "#34495e",
                        font: {
                        size: 12,
                        weight: "500"
                        }
                    }
                    },
                    y: {
                    ticks: {
                        color: "#34495e",
                        beginAtZero: true
                    }
                    }
                }
                }}
            />
            </div>
        )}
        </div>
    </div>
    </div>
  );
};

export default Charts;
