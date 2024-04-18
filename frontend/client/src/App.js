import React, { useState } from 'react';
import './App.css';
import Barchartdata from './barchartdata';
import Linegraphdata from './Linechart';
import DoughnutGraphData from './Doughnutnew';
import PieChartGraphData from './piechartnew';

function App() {
  // State to track the current mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Apply or remove the dark-mode class to the body element
    if (isDarkMode) {
      document.body.classList.remove('dark-mode');
    } else {
      document.body.classList.add('dark-mode');
    }
  };

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Other components */}
      <Barchartdata />
      <Linegraphdata />
      <DoughnutGraphData />
      <PieChartGraphData />

      {/* Dark mode toggle button */}
      <button className="dark-mode-toggle" onClick={toggleDarkMode}>
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
    </div>
  );
}

export default App;
