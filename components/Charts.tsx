import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { CloudProvider } from '../types';

interface ChartProps {
  data: any[];
}

const PROVIDER_COLORS: Record<CloudProvider, string> = {
  AWS: '#FF9900',
  Azure: '#007FFF',
  GCP: '#34A853',
  OCI: '#C74634'
};

const VULN_COLORS = {
  critical: '#EF4444', // red-500
  high: '#F97316',     // orange-500
  medium: '#EAB308',   // yellow-500
  low: '#3B82F6'       // blue-500
};

export const SpendByL1Chart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Spend by Area (L1)</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} tickFormatter={(val) => `$${val/1000}k`} />
          <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} />
          <Tooltip 
            cursor={{fill: '#f8fafc'}}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spend']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SpendByTierChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Spend by Tier</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} tickFormatter={(val) => `$${val/1000}k`} />
          <Tooltip 
             cursor={{fill: '#f8fafc'}}
             formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spend']}
             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SpendByProviderChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Spend by Provider</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} tickFormatter={(val) => `$${val/1000}k`} />
          <Tooltip 
            cursor={{fill: '#f8fafc'}}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spend']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PROVIDER_COLORS[entry.name as CloudProvider] || '#cbd5e1'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SpendBySkuTypeChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Spend by SKU Type</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} tickFormatter={(val) => `$${val/1000}k`} />
          <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} />
          <Tooltip 
            cursor={{fill: '#f8fafc'}}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spend']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TopAccountsChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Top 5 Accounts by Spend</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} tickFormatter={(val) => `$${val/1000}k`} />
          <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} />
          <Tooltip 
            cursor={{fill: '#f8fafc'}}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spend']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TopSkusChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Top 5 SKUs by Spend</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} tickFormatter={(val) => `$${val/1000}k`} />
          <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 500}} />
          <Tooltip 
            cursor={{fill: '#f8fafc'}}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Cost']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SpendVsForecastChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Spend vs Forecast Trend</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(val) => `$${val/1000}k`} />
          <Tooltip 
             formatter={(value: number) => `$${value.toLocaleString()}`}
             cursor={{fill: '#f8fafc'}}
             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend />
          <Bar dataKey="spend" name="Actual Spend" fill="#0f172a" radius={[4, 4, 0, 0]} maxBarSize={50} />
          <Bar dataKey="forecast" name="Forecast" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={50} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const VulnerabilityChart: React.FC<ChartProps & { title?: string }> = ({ data, title }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{title || "Security Posture"}</h3>
      <ResponsiveContainer width="100%" height="90%">
         <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
          <XAxis type="number" axisLine={false} tickLine={false} />
          <YAxis dataKey="name" type="category" width={110} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Legend />
          <Bar dataKey="critical" stackId="a" fill={VULN_COLORS.critical} radius={[0, 4, 4, 0]} />
          <Bar dataKey="high" stackId="a" fill={VULN_COLORS.high} />
          <Bar dataKey="medium" stackId="a" fill={VULN_COLORS.medium} />
          <Bar dataKey="low" stackId="a" fill={VULN_COLORS.low} radius={[4, 0, 0, 4]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SafeDeploymentRisksChart: React.FC<ChartProps & { title?: string }> = ({ data, title }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{title || "Safe Deployment Risks"}</h3>
      <ResponsiveContainer width="100%" height="90%">
         <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
          <XAxis type="number" axisLine={false} tickLine={false} allowDecimals={false} />
          <YAxis dataKey="name" type="category" width={110} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Bar dataKey="value" name="Risks Count" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};