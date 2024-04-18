import React, { useState, useEffect } from 'react';
import Button from "./style.module.css"
import Axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJs, CategoryScale, LinearScale, LineElement } from 'chart.js';

ChartJs.register(
    CategoryScale,
    LinearScale,
    LineElement,
);

function LinegraphData() {
    const [orders, setOrders] = useState([]);
    const [labelIndex, setLabelIndex] = useState(0);
    const [labelData, setLabelData] = useState([]);
    const [maxIntensities, setMaxIntensities] = useState([]);
    const [labelText, setLabelText] = useState("Region");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [graphData, setGraphData] = useState(null);
    const [showAllData, setShowAllData] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await Axios.get('http://localhost:3300/getorders');
                setOrders(response.data);
                setLoading(false);
            } catch (error) {
                console.log(error);
                setError(error);
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    useEffect(() => {
        if (orders.length > 0) {
            let uniqueData;
            let maxIntensitiesByLabel;
            if (labelText.toLowerCase() === 'end_year') {
                const sortedOrders = [...orders].sort((a, b) => a.end_year - b.end_year);
                uniqueData = getUniqueData(sortedOrders, labelText.toLowerCase());
                const topicGreatestIntensity = getTopicGreatestIntensity(sortedOrders, labelText.toLowerCase());
                maxIntensitiesByLabel = getMaxIntensitiesByLabel(topicGreatestIntensity, uniqueData);
            } else {
                uniqueData = getUniqueData(orders, labelText.toLowerCase());
                const topicGreatestIntensity = getTopicGreatestIntensity(orders, labelText.toLowerCase());
                maxIntensitiesByLabel = getMaxIntensitiesByLabel(topicGreatestIntensity, uniqueData);
            }
            setLabelData(uniqueData);
            setMaxIntensities(maxIntensitiesByLabel);
            if (showAllData) {
                setGraphData({
                    labels: uniqueData,
                    datasets: [{
                        label: 'Intensity',
                        data: maxIntensitiesByLabel,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                });
            }
        }
    }, [orders, labelIndex, labelText, showAllData]);

    const getUniqueData = (orders, property) => {
        return [...new Set(orders.map(order => order[property]))];
    };

    const getTopicGreatestIntensity = (orders, property) => {
        const topicGreatestIntensity = {};
        orders.forEach(order => {
            if (!topicGreatestIntensity[order[property]] || order.intensity > topicGreatestIntensity[order[property]]) {
                topicGreatestIntensity[order[property]] = order.intensity;
            }
        });
        return topicGreatestIntensity;
    };

    const getMaxIntensitiesByLabel = (topicGreatestIntensity, uniqueData) => {
        return uniqueData.map(data => topicGreatestIntensity[data] || 0);
    };

    const handleButtonClick = (index, text) => {
        setLabelIndex(index);
        setLabelText(text); 
    };
    
    const handleSwotButtonClick = () => {
        const topFiveIntensities = maxIntensities
            .map((intensity, index) => ({ intensity, label: labelData[index] }))
            .sort((a, b) => b.intensity - a.intensity)
            .slice(0, 5);
        setGraphData({
            labels: topFiveIntensities.map(item => item.label),
            datasets: [{
                label: 'Top Five Intensities',
                data: topFiveIntensities.map(item => item.intensity),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1
            }]
        });
        setShowAllData(false);
    };

    const handleNormalFilterButtonClick = () => {
        setGraphData({
            labels: labelData,
            datasets: [{
                label: 'Intensity',
                data: maxIntensities,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        });
        setShowAllData(true);
    };

    const buttonNames = ["Region", "Topic", "End_Year", "Sector", "Source", "Country", "Pestle"];

    const options = {
        maintainAspectRatio: false,
        legend: {
            labels: {
                fontSize: 40
            }
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            <h1>{`${labelText} Vs Greatest Intensity Line Graph`}</h1>
            <div>
                <div className='filter category'>
                    <h3>Filter According to Your choice</h3>
                    <select
        style={{
            padding: '8px',
            fontSize: '16px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            marginRight: '10px' // Adjust as needed
        }}
        onChange={(e) => setLabelText(e.target.value)}
    >
        {buttonNames.map((name, index) => (
            <option key={index} value={name}>{name}</option>
        ))}
    </select>
                    
                    <button className={Button.btn} onClick={handleNormalFilterButtonClick}>FILTER</button>
                    <button className={Button.btn} onClick={handleSwotButtonClick}>SWOT</button>
                </div>
            </div>
            <div>
                {graphData && (
                    <Line
                        data={graphData}
                        height={400}
                        options={options}
                    />
                )}
            </div>
        </div>
    );
}

export default LinegraphData;
