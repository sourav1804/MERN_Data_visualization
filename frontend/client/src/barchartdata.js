import React, { useState, useEffect } from 'react';
import Button from "./style.module.css"
import Axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJs, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJs.register(
    CategoryScale,
    LinearScale,
    BarElement,
);

function Barchartdata() {
    const [orders, setOrders] = useState([]);
    const [labelIndex, setLabelIndex] = useState(0);
    const [labelData, setLabelData] = useState([]);
    const [maxIntensities, setMaxIntensities] = useState([]);
    const [labelText, setLabelText] = useState("Region");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [graphData, setGraphData] = useState(null); // State to hold data for the graph
    const [showAllData, setShowAllData] = useState("Region"); // State to track whether to show all data

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await Axios.get('https://mern-data-visualization.vercel.app/getorders');
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
                // Sort orders by End_Year
                const sortedOrders = [...orders].sort((a, b) => a.end_year - b.end_year);
                // Get unique data based on sorted End_Year
                uniqueData = getUniqueData(sortedOrders, labelText.toLowerCase());
                // Calculate max intensity for each unique data
                const topicGreatestIntensity = getTopicGreatestIntensity(sortedOrders, labelText.toLowerCase());
                maxIntensitiesByLabel = getMaxIntensitiesByLabel(topicGreatestIntensity, uniqueData);
            } else {
                // Get unique data based on current label
                uniqueData = getUniqueData(orders, labelText.toLowerCase());
                // Calculate greatest intensity for the current label
                const topicGreatestIntensity = getTopicGreatestIntensity(orders, labelText.toLowerCase());
                // Calculate max intensity for each unique data
                maxIntensitiesByLabel = getMaxIntensitiesByLabel(topicGreatestIntensity, uniqueData);
            }
            setLabelData(uniqueData);
            setMaxIntensities(maxIntensitiesByLabel);
            // If the button is clicked to show all data, update the graph
            if (showAllData) {
                setGraphData({
                    labels: uniqueData, // X-axis: Selected item
                    datasets: [{
                        label: 'Intensity', // Y-axis: Intensity
                        data: maxIntensitiesByLabel,
                        backgroundColor: 'rgba(103, 198, 227,0.2)',
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
        // Update the labelText to match the selected button text
        setLabelText(text); 
    };
    

    const handleSwotButtonClick = () => {
        // Find the top five intensities according to the selected graph
        const topFiveIntensities = maxIntensities
            .map((intensity, index) => ({ intensity, label: labelData[index] }))
            .sort((a, b) => b.intensity - a.intensity)
            .slice(0, 5);
        // Update the state with the data for the graph
        setGraphData({
            labels: topFiveIntensities.map(item => item.label), // X-axis: Selected item
            datasets: [{
                label: 'Top Five Intensities', // Y-axis: Top intensity
                data: topFiveIntensities.map(item => item.intensity),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                   'rgba(255, 206, 86, 0.6)',
                     'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                     'rgba(255, 159, 64, 0.6)',
                ],
                borderColor: [
                    'rgba(220, 20, 60, 0.6)',
                    'rgba(30, 144, 255, 0.6)', 
                    'rgba(255, 193, 7, 0.6)', 
                    'rgba(0, 128, 128, 0.6)',
                    'rgba(128, 0, 128, 0.6)',
                    'rgba(255, 69, 0, 0.6)'
                ],
                borderWidth: 1
            }]
        });
        // Set showAllData state to false
        setShowAllData(false);
    };

    const handleNormalFilterButtonClick = () => {
        // Update the state with the data for the graph to show all data
        setGraphData({
            labels: labelData, // X-axis: Selected item
            datasets: [{
                label: 'Intensity', // Y-axis: Intensity
                data: maxIntensities,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        });
        // Set showAllData state to true
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
            <h1>{`${labelText} Vs Greatest Intensity Barchart`}</h1>
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
                    
                    <button className={Button.btn}  onClick={handleNormalFilterButtonClick}>FILTER</button>
                    <button className={Button.btn} onClick={handleSwotButtonClick}>SWOT</button>
                </div>
            </div>
            <div>
                {graphData && (
                    <Bar
                        data={graphData}
                        height={400}
                        options={options}
                    />
                )}
            </div>
        </div>
    );
}

export default Barchartdata;
