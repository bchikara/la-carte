import React, { useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

// Define the type for your data items
interface DataPoint {
  x: string | number; // Could be string (for categories) or number (for timestamps)
  y: number;
}

// Define the props for your component
interface LineChartProps {
  data: DataPoint[];
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  useEffect(() => {
    if (chartRef.current && data) {
      const chart = chartRef.current.chart;

      const xValues = data.map(item => item.x);
      const yValues = data.map(item => item.y);

      const options: Highcharts.Options = {
        chart: {
          type: 'line'
        },
        title: {
          text: 'Sales'
        },
        xAxis: {
          categories: xValues as string[], // Cast to string[] if you're sure x values are strings
          title: {
            text: 'Months'
          }
        },
        yAxis: {
          title: {
            text: 'Amount'
          }
        },
        series: [{
          type: 'line',
          name: 'Data',
          data: yValues
        }]
      };

      chart.update(options);
    }
  }, [data]);

  const initialOptions: Highcharts.Options = {
    chart: {
      type: 'line'
    },
    title: {
      text: 'Sales'
    },
    series: [{
      type: 'line',
      name: 'Data',
      data: []
    }]
  };

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={initialOptions}
      ref={chartRef}
    />
  );
};

export default LineChart;