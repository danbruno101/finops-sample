import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'red' | 'green' | 'blue' | 'yellow' | 'slate';
  icon: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subValue, trend, color = 'slate', icon }) => {
  const colorClasses = {
    red: 'bg-red-50 text-red-700 border-red-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <div className={`p-6 rounded-xl border ${colorClasses[color]} transition-all duration-300 hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
          {subValue && <p className="text-sm mt-1 opacity-90">{subValue}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-white/50 backdrop-blur-sm`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;