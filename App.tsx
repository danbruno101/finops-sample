import React, { useState, useMemo, useEffect } from 'react';
import { generateDataset } from './services/dataGenerator';
import { OrgLevel1, OrgLevel2, OrgLevel3, CloudAccount, AggregatedStats } from './types';
import StatsCard from './components/StatsCard';
import { 
  SpendByProviderChart, 
  SpendVsForecastChart, 
  VulnerabilityChart,
  SpendByL1Chart,
  SpendByTierChart,
  SpendBySkuTypeChart,
  TopAccountsChart,
  TopSkusChart,
  SafeDeploymentRisksChart
} from './components/Charts';
import AiAssistant from './components/AiAssistant';
import { 
  LayoutDashboard, 
  ChevronRight, 
  Building2, 
  Users, 
  Wallet, 
  ShieldAlert, 
  TrendingUp, 
  Server,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Activity
} from 'lucide-react';

const App: React.FC = () => {
  // --- Data State ---
  const [data, setData] = useState<OrgLevel1[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Navigation State ---
  const [selectedL1, setSelectedL1] = useState<OrgLevel1 | null>(null);
  const [selectedL2, setSelectedL2] = useState<OrgLevel2 | null>(null);
  const [selectedL3, setSelectedL3] = useState<OrgLevel3 | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<CloudAccount | null>(null);

  // --- UI State ---
  const [isAiOpen, setIsAiOpen] = useState(false);

  // --- Init ---
  useEffect(() => {
    const d = generateDataset();
    setData(d);
    setLoading(false);
  }, []);

  // --- Navigation Handlers ---
  const goHome = () => {
    setSelectedL1(null);
    setSelectedL2(null);
    setSelectedL3(null);
    setSelectedAccount(null);
  };

  const selectL1 = (l1: OrgLevel1) => {
    setSelectedL1(l1);
    setSelectedL2(null);
    setSelectedL3(null);
    setSelectedAccount(null);
  };

  const selectL2 = (l2: OrgLevel2) => {
    setSelectedL2(l2);
    setSelectedL3(null);
    setSelectedAccount(null);
  };

  const selectL3 = (l3: OrgLevel3) => {
    setSelectedL3(l3);
    setSelectedAccount(null);
  };

  const selectAccount = (acc: CloudAccount) => {
    setSelectedAccount(acc);
  };

  // --- Aggregation Logic (The "Engine") ---
  const currentViewData = useMemo(() => {
    if (selectedAccount) return { accounts: [selectedAccount] };
    if (selectedL3) return { accounts: selectedL3.accounts };
    
    let accounts: CloudAccount[] = [];
    if (selectedL2) {
      selectedL2.children.forEach(l3 => accounts.push(...l3.accounts));
    } else if (selectedL1) {
      selectedL1.children.forEach(l2 => l2.children.forEach(l3 => accounts.push(...l3.accounts)));
    } else {
      data.forEach(l1 => l1.children.forEach(l2 => l2.children.forEach(l3 => accounts.push(...l3.accounts))));
    }
    return { accounts };
  }, [data, selectedL1, selectedL2, selectedL3, selectedAccount]);

  const stats: AggregatedStats = useMemo(() => {
    const accs = currentViewData.accounts;
    return accs.reduce((acc, curr) => {
      acc.totalSpend += curr.spend;
      acc.totalForecast += curr.forecast;
      acc.totalVulnerabilities.critical += curr.vulnerabilities.critical;
      acc.totalVulnerabilities.high += curr.vulnerabilities.high;
      acc.totalVulnerabilities.medium += curr.vulnerabilities.medium;
      acc.totalVulnerabilities.low += curr.vulnerabilities.low;
      acc.totalSafeDeploymentRisks += curr.safeDeployment.riskCount;
      acc.spendByProvider[curr.provider] = (acc.spendByProvider[curr.provider] || 0) + curr.spend;
      return acc;
    }, {
      totalSpend: 0,
      totalForecast: 0,
      totalVulnerabilities: { critical: 0, high: 0, medium: 0, low: 0 },
      totalSafeDeploymentRisks: 0,
      spendByProvider: { AWS: 0, Azure: 0, GCP: 0, OCI: 0 }
    } as AggregatedStats);
  }, [currentViewData]);

  // Helper function to aggregate stats for a specific row (node)
  const getRowStats = (node: OrgLevel1 | OrgLevel2 | OrgLevel3, level: 'L1' | 'L2' | 'L3') => {
    let accounts: CloudAccount[] = [];
    
    if (level === 'L1') {
      const l1 = node as OrgLevel1;
      l1.children.forEach(l2 => l2.children.forEach(l3 => accounts.push(...l3.accounts)));
    } else if (level === 'L2') {
      const l2 = node as OrgLevel2;
      l2.children.forEach(l3 => accounts.push(...l3.accounts));
    } else if (level === 'L3') {
      const l3 = node as OrgLevel3;
      accounts = l3.accounts;
    }

    return accounts.reduce((acc, curr) => ({
      spend: acc.spend + curr.spend,
      forecast: acc.forecast + curr.forecast,
      critical: acc.critical + curr.vulnerabilities.critical,
      high: acc.high + curr.vulnerabilities.high,
      safeDeploymentRisks: acc.safeDeploymentRisks + curr.safeDeployment.riskCount
    }), { spend: 0, forecast: 0, critical: 0, high: 0, safeDeploymentRisks: 0 });
  };

  const renderVulnBadge = (critical: number, high: number) => {
    if (critical > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <ShieldAlert size={12} />
          {critical} Critical
        </span>
      );
    }
    if (high > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <ShieldAlert size={12} />
          {high} High
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Secure
      </span>
    );
  };

  const topSpenders = useMemo(() => {
    return [...currentViewData.accounts]
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 5)
      .map(a => ({ name: a.name, spend: a.spend, forecast: a.forecast }));
  }, [currentViewData]);

  // --- Chart Data Prep ---
  const providerChartData = Object.entries(stats.spendByProvider)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  const spendVsForecastData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const monthlyAgg = months.map(m => ({ name: m, spend: 0, forecast: 0 }));
    
    currentViewData.accounts.forEach(acc => {
      acc.monthlyData.forEach((m, idx) => {
        if (monthlyAgg[idx]) {
          monthlyAgg[idx].spend += m.spend;
          monthlyAgg[idx].forecast += m.forecast;
        }
      });
    });
    return monthlyAgg;
  }, [currentViewData]);

  // --- Entity Summaries for AI Context ---
  const entityContext = useMemo(() => {
    const summaries: any[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    data.forEach(l1 => {
      // L1 Aggregation
      const l1Accounts: CloudAccount[] = [];
      l1.children.forEach(l2 => l2.children.forEach(l3 => l1Accounts.push(...l3.accounts)));
      
      const l1Monthly = months.map((m, i) => ({
        month: m,
        spend: l1Accounts.reduce((acc, curr) => acc + (curr.monthlyData[i]?.spend || 0), 0)
      }));
      
      summaries.push({
        name: l1.name,
        type: 'Level 1 (Area)',
        monthlySpend: l1Monthly,
        totalSpend: l1Accounts.reduce((sum, a) => sum + a.spend, 0)
      });

      // L2 Aggregation
      l1.children.forEach(l2 => {
        const l2Accounts: CloudAccount[] = [];
        l2.children.forEach(l3 => l2Accounts.push(...l3.accounts));
        
        const l2Monthly = months.map((m, i) => ({
            month: m,
            spend: l2Accounts.reduce((acc, curr) => acc + (curr.monthlyData[i]?.spend || 0), 0)
        }));

        summaries.push({
            name: l2.name,
            type: 'Level 2 (Department)',
            parent: l1.name,
            monthlySpend: l2Monthly,
            totalSpend: l2Accounts.reduce((sum, a) => sum + a.spend, 0)
        });
      });
    });
    return summaries;
  }, [data]);

  const vulnChartData = useMemo(() => {
    const tierData = [0, 1, 2, 3, 4, 5].map(tier => {
      const tierAccounts = currentViewData.accounts.filter(a => a.tier === tier);
      return {
        name: `Tier ${tier}`,
        critical: tierAccounts.reduce((sum, a) => sum + a.vulnerabilities.critical, 0),
        high: tierAccounts.reduce((sum, a) => sum + a.vulnerabilities.high, 0),
        medium: tierAccounts.reduce((sum, a) => sum + a.vulnerabilities.medium, 0),
        low: tierAccounts.reduce((sum, a) => sum + a.vulnerabilities.low, 0),
      };
    }).filter(d => (d.critical + d.high + d.medium + d.low) > 0);
    return tierData;
  }, [currentViewData]);

  const securityByL1Data = useMemo(() => {
    return data.map(l1 => {
      const accounts: CloudAccount[] = [];
      l1.children.forEach(l2 => l2.children.forEach(l3 => accounts.push(...l3.accounts)));
      return {
        name: l1.name,
        critical: accounts.reduce((sum, a) => sum + a.vulnerabilities.critical, 0),
        high: accounts.reduce((sum, a) => sum + a.vulnerabilities.high, 0),
        medium: accounts.reduce((sum, a) => sum + a.vulnerabilities.medium, 0),
        low: accounts.reduce((sum, a) => sum + a.vulnerabilities.low, 0),
      };
    }).sort((a, b) => (b.critical + b.high) - (a.critical + a.high));
  }, [data]);

  const safeDeployByL1Data = useMemo(() => {
    return data.map(l1 => {
      const accounts: CloudAccount[] = [];
      l1.children.forEach(l2 => l2.children.forEach(l3 => accounts.push(...l3.accounts)));
      return {
        name: l1.name,
        value: accounts.reduce((sum, a) => sum + a.safeDeployment.riskCount, 0),
      };
    }).sort((a, b) => b.value - a.value);
  }, [data]);

  const safeDeployByTierData = useMemo(() => {
    const tierMap = new Map<number, number>();
    currentViewData.accounts.forEach(acc => {
      tierMap.set(acc.tier, (tierMap.get(acc.tier) || 0) + acc.safeDeployment.riskCount);
    });
    return Array.from(tierMap.entries())
      .map(([tier, value]) => ({ name: `Tier ${tier}`, value }))
      .sort((a, b) => b.value - a.value);
  }, [currentViewData]);

  const spendByL1Data = useMemo(() => {
    return data.map(l1 => {
      const l1Stats = getRowStats(l1, 'L1');
      return { name: l1.name, value: l1Stats.spend };
    }).sort((a, b) => b.value - a.value);
  }, [data]);

  const spendByTierData = useMemo(() => {
    const tierMap = new Map<number, number>();
    currentViewData.accounts.forEach(acc => {
      tierMap.set(acc.tier, (tierMap.get(acc.tier) || 0) + acc.spend);
    });
    return Array.from(tierMap.entries())
      .map(([tier, value]) => ({ name: `Tier ${tier}`, value }))
      .sort((a, b) => b.value - a.value);
  }, [currentViewData]);

  const spendBySkuTypeData = useMemo(() => {
    const typeMap = new Map<string, number>();
    currentViewData.accounts.forEach(acc => {
      acc.skus.forEach(sku => {
        typeMap.set(sku.skuType, (typeMap.get(sku.skuType) || 0) + sku.cost);
      });
    });
    return Array.from(typeMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [currentViewData]);

  const topAccountsData = useMemo(() => {
    return [...currentViewData.accounts]
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 5)
      .map(a => ({ name: a.name, value: a.spend }));
  }, [currentViewData]);

  const topSkusData = useMemo(() => {
    const skuMap = new Map<string, number>();
    currentViewData.accounts.forEach(acc => {
      acc.skus.forEach(sku => {
        skuMap.set(sku.name, (skuMap.get(sku.name) || 0) + sku.cost);
      });
    });
    return Array.from(skuMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [currentViewData]);

  const getCurrentBreadcrumb = () => {
    let path = 'Global View';
    if (selectedL1) path = selectedL1.name;
    if (selectedL2) path = selectedL2.name;
    if (selectedL3) path = selectedL3.name;
    if (selectedAccount) path = selectedAccount.name;
    return path;
  };

  const SafeDeploymentItem = ({ label, passed }: { label: string; passed: boolean }) => (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100 mb-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {passed ? (
        <span className="flex items-center gap-1 text-green-600 text-xs font-semibold bg-green-50 px-2 py-1 rounded-full">
          <CheckCircle2 size={14} /> Pass
        </span>
      ) : (
        <span className="flex items-center gap-1 text-red-600 text-xs font-semibold bg-red-50 px-2 py-1 rounded-full">
          <XCircle size={14} /> Fail
        </span>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-700">Generating Synthetic Dataset...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <LayoutDashboard className="text-white h-6 w-6" />
              </div>
              <span className="font-bold text-xl text-slate-800 tracking-tight">CloudSpend AI Nexus</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsAiOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all hover:scale-105 font-medium text-sm"
              >
                <Sparkles size={16} />
                Ask AI Analyst
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumbs & Navigation Back */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 bg-white p-3 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
           {selectedL1 && (
             <button onClick={goHome} className="hover:text-indigo-600 flex items-center">
               <ArrowLeft size={14} className="mr-1"/> Back to Global
             </button>
           )}
           <span onClick={goHome} className={`cursor-pointer ${!selectedL1 ? 'font-bold text-indigo-600' : 'hover:text-indigo-600'}`}>Global</span>
           {selectedL1 && <ChevronRight size={14} />}
           {selectedL1 && (
             <span onClick={() => selectL1(selectedL1)} className={`cursor-pointer ${!selectedL2 ? 'font-bold text-indigo-600' : 'hover:text-indigo-600'}`}>{selectedL1.name}</span>
           )}
           {selectedL2 && <ChevronRight size={14} />}
           {selectedL2 && (
             <span onClick={() => selectL2(selectedL2)} className={`cursor-pointer ${!selectedL3 ? 'font-bold text-indigo-600' : 'hover:text-indigo-600'}`}>{selectedL2.name}</span>
           )}
           {selectedL3 && <ChevronRight size={14} />}
           {selectedL3 && (
             <span onClick={() => selectL3(selectedL3)} className={`cursor-pointer ${!selectedAccount ? 'font-bold text-indigo-600' : 'hover:text-indigo-600'}`}>{selectedL3.name}</span>
           )}
           {selectedAccount && <ChevronRight size={14} />}
           {selectedAccount && <span className="font-bold text-indigo-600">{selectedAccount.name}</span>}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Total Spend" 
            value={`$${stats.totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            subValue={`Forecast: $${stats.totalForecast.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            icon={<Wallet className="text-slate-500" />}
            color={stats.totalSpend > stats.totalForecast ? 'red' : 'green'}
          />
          <StatsCard 
            title="Forecast Variance" 
            value={`${(((stats.totalSpend - stats.totalForecast) / stats.totalForecast) * 100).toFixed(1)}%`}
            subValue={stats.totalSpend > stats.totalForecast ? 'Over Budget' : 'Under Budget'}
            icon={<TrendingUp className="text-slate-500" />}
            color={stats.totalSpend > stats.totalForecast ? 'red' : 'green'}
          />
          <StatsCard 
            title="Critical Vulns" 
            value={stats.totalVulnerabilities.critical}
            subValue="Requires Immediate Action"
            icon={<ShieldAlert className="text-red-500" />}
            color="red"
          />
          <StatsCard 
            title="Safe Deployment Risks" 
            value={stats.totalSafeDeploymentRisks}
            subValue="Across all accounts"
            icon={<Activity className="text-orange-500" />}
            color="yellow"
          />
        </div>

        {/* Trend Row (Moved Up) */}
        {!selectedAccount && (
           <div className="grid grid-cols-1 mb-8">
              <SpendVsForecastChart data={spendVsForecastData} />
           </div>
        )}

        {/* Breakdown Row */}
        {!selectedAccount && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
             <SpendByL1Chart data={spendByL1Data} />
             <SpendByTierChart data={spendByTierData} />
             <SpendByProviderChart data={providerChartData} />
             <SpendBySkuTypeChart data={spendBySkuTypeData} />
          </div>
        )}

        {/* Top Spenders Row */}
        {!selectedAccount && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
             <TopAccountsChart data={topAccountsData} />
             <TopSkusChart data={topSkusData} />
          </div>
        )}

        {/* Vulnerability Row */}
        {!selectedAccount && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
               <VulnerabilityChart title="Security Risks by Tier" data={vulnChartData} />
               <VulnerabilityChart title="Security Risks by Area (L1)" data={securityByL1Data} />
            </div>
            {/* Safe Deployment Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
               <SafeDeploymentRisksChart title="Safe Deployment Risks by Tier" data={safeDeployByTierData} />
               <SafeDeploymentRisksChart title="Safe Deployment Risks by Area (L1)" data={safeDeployByL1Data} />
            </div>
          </>
        )}

        {/* Drill Down / Navigation Lists */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-800">
              {selectedAccount ? 'Account Details & SKUs' : 'Organization Hierarchy'}
            </h3>
            <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
               Viewing: {getCurrentBreadcrumb()}
            </span>
          </div>

          {selectedAccount ? (
            <div className="p-0">
               <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                 {/* Account Info Column */}
                 <div className="p-6 border-b lg:border-b-0 lg:border-r border-slate-100">
                    <h4 className="font-medium text-slate-500 mb-4 uppercase text-xs tracking-wider">Account Information</h4>
                    <div className="space-y-4">
                       <div className="flex justify-between border-b border-slate-50 pb-2">
                          <span className="text-slate-600">Provider</span>
                          <span className="font-semibold">{selectedAccount.provider}</span>
                       </div>
                       <div className="flex justify-between border-b border-slate-50 pb-2">
                          <span className="text-slate-600">Tier</span>
                          <span className="font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">Tier {selectedAccount.tier}</span>
                       </div>
                       <div className="flex justify-between border-b border-slate-50 pb-2">
                          <span className="text-slate-600">Security Status</span>
                          <span className={`font-semibold ${selectedAccount.vulnerabilities.critical > 0 ? 'text-red-600' : 'text-green-600'}`}>
                             {selectedAccount.vulnerabilities.critical > 0 ? 'High Risk' : 'Acceptable'}
                          </span>
                       </div>
                       <div className="flex justify-between border-b border-slate-50 pb-2">
                          <span className="text-slate-600">Safe Deployment Score</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${selectedAccount.safeDeployment.score < 70 ? 'text-orange-600' : 'text-green-600'}`}>
                              {selectedAccount.safeDeployment.score}/100
                            </span>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Safe Deployment Scorecard */}
                 <div className="p-6 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/50">
                    <h4 className="font-medium text-slate-500 mb-4 uppercase text-xs tracking-wider">Safe Deployment Scorecard</h4>
                    <div className="space-y-1">
                      <SafeDeploymentItem label="Terraform IaC" passed={selectedAccount.safeDeployment.terraformIaC} />
                      <SafeDeploymentItem label="CI/CD Pipeline" passed={selectedAccount.safeDeployment.ciCdDeploy} />
                      <SafeDeploymentItem label="No Manual Access" passed={selectedAccount.safeDeployment.noManualAccess} />
                      <SafeDeploymentItem label="Incremental Rollout" passed={selectedAccount.safeDeployment.incrementalRollout} />
                      <SafeDeploymentItem label="Soak Time" passed={selectedAccount.safeDeployment.soakTime} />
                      <SafeDeploymentItem label="Auto Rollback" passed={selectedAccount.safeDeployment.autoRollback} />
                      <SafeDeploymentItem label="Health Checks" passed={selectedAccount.safeDeployment.healthChecks} />
                    </div>
                 </div>

                 {/* SKUs Column */}
                 <div className="p-6 xl:col-span-1 lg:col-span-2">
                    <h4 className="font-medium text-slate-500 mb-4 uppercase text-xs tracking-wider">Top SKUs</h4>
                    <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-2 bg-slate-50">Type</th>
                            <th className="px-4 py-2 bg-slate-50">Resource</th>
                            <th className="px-4 py-2 bg-slate-50 text-right">Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedAccount.skus.map((sku, i) => (
                            <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                              <td className="px-4 py-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  sku.skuType === 'Compute' ? 'bg-purple-100 text-purple-800' :
                                  sku.skuType === 'Storage' ? 'bg-orange-100 text-orange-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {sku.skuType}
                                </span>
                              </td>
                              <td className="px-4 py-2 font-medium truncate max-w-[150px]">{sku.name}</td>
                              <td className="px-4 py-2 text-right font-mono">${sku.cost.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                 </div>
               </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3 text-center">Type</th>
                    <th className="px-6 py-3 text-right">Spend</th>
                    <th className="px-6 py-3 text-right">Forecast</th>
                    <th className="px-6 py-3 text-center">Security Risks</th>
                    <th className="px-6 py-3 text-center">Safe Deployment Risks</th>
                    <th className="px-6 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {!selectedL1 && data.map((l1) => {
                    const rowStats = getRowStats(l1, 'L1');
                    return (
                      <tr key={l1.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                          <Building2 size={16} className="text-indigo-500" />
                          {l1.name}
                        </td>
                        <td className="px-6 py-4 text-center"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">Level 1</span></td>
                        <td className="px-6 py-4 text-right font-mono text-xs">${rowStats.spend.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                        <td className="px-6 py-4 text-right font-mono text-xs">${rowStats.forecast.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                        <td className="px-6 py-4 text-center">
                          {renderVulnBadge(rowStats.critical, rowStats.high)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`font-semibold ${rowStats.safeDeploymentRisks > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                             {rowStats.safeDeploymentRisks}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => selectL1(l1)} className="text-indigo-600 hover:text-indigo-900 font-medium">Drill Down</button>
                        </td>
                      </tr>
                    );
                  })}

                  {selectedL1 && !selectedL2 && selectedL1.children.map((l2) => {
                    const rowStats = getRowStats(l2, 'L2');
                    return (
                      <tr key={l2.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                          <Users size={16} className="text-blue-500" />
                          {l2.name}
                        </td>
                        <td className="px-6 py-4 text-center"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs">Level 2</span></td>
                        <td className="px-6 py-4 text-right font-mono text-xs">${rowStats.spend.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                        <td className="px-6 py-4 text-right font-mono text-xs">${rowStats.forecast.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                        <td className="px-6 py-4 text-center">
                          {renderVulnBadge(rowStats.critical, rowStats.high)}
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className={`font-semibold ${rowStats.safeDeploymentRisks > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                             {rowStats.safeDeploymentRisks}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <button onClick={() => selectL2(l2)} className="text-indigo-600 hover:text-indigo-900 font-medium">Drill Down</button>
                        </td>
                      </tr>
                    );
                  })}

                  {selectedL2 && !selectedL3 && selectedL2.children.map((l3) => {
                    const rowStats = getRowStats(l3, 'L3');
                    return (
                      <tr key={l3.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                           <Users size={16} className="text-cyan-500" />
                           {l3.name}
                        </td>
                         <td className="px-6 py-4 text-center"><span className="bg-cyan-50 text-cyan-600 px-2 py-1 rounded text-xs">Level 3</span></td>
                         <td className="px-6 py-4 text-right font-mono text-xs">${rowStats.spend.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                         <td className="px-6 py-4 text-right font-mono text-xs">${rowStats.forecast.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                         <td className="px-6 py-4 text-center">
                           {renderVulnBadge(rowStats.critical, rowStats.high)}
                         </td>
                        <td className="px-6 py-4 text-center">
                           <span className={`font-semibold ${rowStats.safeDeploymentRisks > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                             {rowStats.safeDeploymentRisks}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <button onClick={() => selectL3(l3)} className="text-indigo-600 hover:text-indigo-900 font-medium">Drill Down</button>
                        </td>
                      </tr>
                    );
                  })}

                  {selectedL3 && selectedL3.accounts.map((acc) => (
                    <tr key={acc.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                        <Server size={16} className="text-emerald-500" />
                        {acc.name}
                      </td>
                      <td className="px-6 py-4 text-center"><span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-xs">{acc.provider}</span></td>
                      <td className="px-6 py-4 text-right font-mono text-xs">${acc.spend.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-mono text-xs">${acc.forecast.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        {renderVulnBadge(acc.vulnerabilities.critical, acc.vulnerabilities.high)}
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className={`font-semibold ${acc.safeDeployment.riskCount > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                             {acc.safeDeployment.riskCount}
                          </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <button onClick={() => selectAccount(acc)} className="text-indigo-600 hover:text-indigo-900 font-medium">Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* AI Assistant Sidebar */}
      <AiAssistant 
        isOpen={isAiOpen} 
        onClose={() => setIsAiOpen(false)} 
        contextData={{
          currentLevel: getCurrentBreadcrumb(),
          stats,
          topSpenders,
          monthlyTrends: spendVsForecastData,
          availableEntities: entityContext
        }}
      />
    </div>
  );
};

export default App;
