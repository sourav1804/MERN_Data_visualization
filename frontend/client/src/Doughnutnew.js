import React, { useState, useEffect } from 'react';
import Button from "./style.module.css"
import Axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJs, ArcElement, Legend, Tooltip } from 'chart.js/auto';
ChartJs.register(
    ArcElement,
    Legend,
    Tooltip
);


function DoughnutGraphData() {
    const [orders, setOrders] = useState([]);
    const [labelData, setLabelData] = useState([]);
    const [maxLikelihoods, setMaxLikelihoods] = useState([]);
    const [labelText, setLabelText] = useState("Region");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [graphData, setGraphData] = useState(null);
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
            const uniqueLabels = getUniqueLabels(orders, labelText.toLowerCase());
            const maxLikelihoodsByLabel = getMaxLikelihoodsByLabel(orders, labelText.toLowerCase(), uniqueLabels);
            setLabelData(uniqueLabels);
            setMaxLikelihoods(maxLikelihoodsByLabel);
            updateGraphData(uniqueLabels, maxLikelihoodsByLabel);
        }
    }, [orders, labelText]);

    const getUniqueLabels = (orders, property) => {
        if (property === 'end_year') {
            // Extract unique end_year values
            const uniqueEndYears = [...new Set(orders.map(order => order[property]))];
            // Sort the unique end_year values in ascending order
            return uniqueEndYears.sort((a, b) => a - b);
        } else {
            // For other properties, simply extract unique values
            return [...new Set(orders.map(order => order[property]))];
        }
    };

    const getMaxLikelihoodsByLabel = (orders, property, uniqueLabels) => {
        return uniqueLabels.map(label => {
            const ordersWithLabel = orders.filter(order => order[property] === label);
            const maxLikelihood = Math.max(...ordersWithLabel.map(order => order.likelihood));
            return maxLikelihood || 0;
        });
    };

    const updateGraphData = (labels, likelihoods) => {
        setGraphData({
            labels: labels,
            datasets: [{
                label: `${labelText} vs Greatest Likelihood`,
                data: likelihoods,
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
    };

    const handleLabelChange = (e) => {
        setLabelText(e.target.value);
    };

    const handleSWOTButtonClick = () => {
        // Find the top five likelihoods according to the selected graph
        const topFiveLikelihoods = maxLikelihoods
            .map((likelihood, index) => ({ likelihood, label: labelData[index] }))
            .sort((a, b) => b.likelihood - a.likelihood)
            .slice(0, 5);
        // Update the state with the data for the graph
        setGraphData({
            labels: topFiveLikelihoods.map(item => item.label), // X-axis: Selected item
            datasets: [{
                label: 'Top Five Likelihoods', // Y-axis: Top likelihood
                data: topFiveLikelihoods.map(item => item.likelihood),
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
        updateGraphData(labelData, maxLikelihoods);
        // Set showAllData state to true
        setShowAllData(true);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            <h1>{`${labelText} Vs Greatest Likelihood Doughnut Graph`}</h1>
            <div>
                <div className='filter category'>
                    <h3>Filter According to Your choice</h3>
                    <select style={{
            padding: '8px',
            fontSize: '16px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            marginRight: '10px' // Adjust as needed
        }} onChange={handleLabelChange} value={labelText}>
                        <option value="Region">Region</option>
                        <option value="Topic">Topic</option>
                        <option value="End_Year">End Year</option>
                        <option value="Sector">Sector</option>
                        <option value="Source">Source</option>
                        <option value="Country">Country</option>
                        <option value="Pestle">Pestle</option>
                    </select>
                    
                    <button className={Button.btn} onClick={handleNormalFilterButtonClick}>FILTER</button>
                    <button className={Button.btn} onClick={handleSWOTButtonClick}>SWOT</button>
                </div>
            </div>
            <div>
                {graphData && (
                    <Doughnut
                        data={graphData}
                        height={400}
                        options={{
                            maintainAspectRatio: false
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export default DoughnutGraphData;
