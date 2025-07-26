import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const [ticker, setTicker] = useState('AAPL');
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState('2024-01-01');
  const [error, setError] = useState(null);
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  const fetchData = React.useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/stock/${ticker}?start=${startDate}&end=${endDate}`
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch data');
      }
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, [ticker, startDate, endDate]);

  useEffect(() => {
    if (chartContainerRef.current) {
      try {
        const { createChart, CrosshairMode } = window.LightweightCharts;
        const chart = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 500,
          layout: { background: { color: '#1f2937' }, textColor: '#d1d5db' },
          grid: { vertLines: { color: '#374151' }, horzLines: { color: '#374151' } },
          crosshair: { mode: CrosshairMode.Normal },
          rightPriceScale: { borderColor: '#374151' },
          timeScale: { borderColor: '#374151', timeVisible: true }
        });

        console.log('Chart object:', chart);
        console.log('Chart methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(chart)));
        console.log('Chart prototype:', Object.getPrototypeOf(chart));

        if (!chart.addCandlestickSeries) {
          throw new Error('addCandlestickSeries is not available on chart object');
        }

        const candlestickSeries = chart.addCandlestickSeries({
          upColor: '#10b981',
          downColor: '#ef4444',
          borderVisible: false,
          wickUpColor: '#10b981',
          wickDownColor: '#ef4444'
        });

        chartRef.current = chart;

        fetchData().then(data => {
          if (data.length > 0) {
            console.log('Fetched data:', data); // Debug: Log raw data
            const chartData = data.map(d => ({
              time: Math.floor(new Date(d.date).getTime() / 1000), // Parse date string
              open: d.open,
              high: d.high,
              low: d.low,
              close: d.close
            }));
            candlestickSeries.setData(chartData);
            chartRef.current.timeScale().fitContent();
            setError(null);
          } else {
            setError('No data received from backend');
          }
        });
      } catch (err) {
        console.error('Chart initialization error:', err);
        setError('Failed to initialize chart: ' + err.message);
      }

      const handleResize = () => {
        if (chartRef.current && chartContainerRef.current) {
          chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
        }
      };
    }
  }, [ticker, startDate, endDate, fetchData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData().then(data => {
      if (data.length > 0 && chartRef.current) {
        console.log('Fetched data on submit:', data); // Debug: Log raw data
        const chartData = data.map(d => ({
          time: Math.floor(new Date(d.date).getTime() / 1000), // Parse date string
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close
        }));
        const candlestickSeries = chartRef.current.getSeriesByIndex(0);
        if (candlestickSeries) {
          candlestickSeries.setData(chartData);
          chartRef.current.timeScale().fitContent();
          setError(null);
        } else {
          setError('Candlestick series not found');
        }
      } else {
        setError('No data received from backend');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-6">Thong Chart</h1>
      <form onSubmit={handleSubmit} className="mb-4 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="Enter ticker (e.g., AAPL)"
          className="p-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="p-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="p-2 bg-blue-600 hover:bg-blue-700 rounded transition"
        >
          Update Chart
        </button>
      </form>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div ref={chartContainerRef} className="w-full max-w-5xl" />
    </div>
  );
};

export default App;