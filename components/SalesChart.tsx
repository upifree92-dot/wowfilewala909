
import React from 'react';

interface SalesChartProps {
  data: { date: string; sales: number }[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const chartHeight = 250;
  const chartWidth = 500; // This will be responsive
  const maxSales = Math.max(...data.map(d => d.sales), 0);
  const barWidth = chartWidth / data.length;

  const yLabels = [];
  if (maxSales > 0) {
      for (let i = 0; i <= 4; i++) {
          yLabels.push(Math.round((maxSales / 4) * i));
      }
  } else {
       yLabels.push(0, 1);
  }


  return (
    <div className="w-full h-[300px] text-xs text-gray-500 dark:text-gray-400">
      <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
        {/* Y-axis lines and labels */}
        {yLabels.map((label, index) => {
             const y = chartHeight - (index * (chartHeight / 4));
             return (
                <g key={label}>
                    <line x1="0" y1={y} x2={chartWidth} y2={y} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
                    <text x="-5" y={y + 3} textAnchor="end" fill="currentColor">₹{label}</text>
                </g>
             )
        })}
        
        {/* Bars and X-axis labels */}
        {data.map((item, index) => {
          const barHeight = maxSales > 0 ? (item.sales / maxSales) * chartHeight : 0;
          const x = index * barWidth;
          const y = chartHeight - barHeight;
          const date = new Date(item.date);
          const day = date.getDate();
          const month = date.toLocaleString('default', { month: 'short' });

          return (
            <g key={item.date}>
              <rect
                x={x + barWidth * 0.1}
                y={y}
                width={barWidth * 0.8}
                height={barHeight}
                fill="url(#barGradient)"
                rx="2"
              />
               <text x={x + barWidth / 2} y={chartHeight + 15} textAnchor="middle" fill="currentColor">
                 {month} {day}
              </text>
            </g>
          );
        })}

        <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default SalesChart;
