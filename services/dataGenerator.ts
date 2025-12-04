import { CloudAccount, OrgLevel1, OrgLevel2, OrgLevel3, CloudProvider, SkuDetail, MonthlyMetric, SafeDeploymentProfile } from '../types';

const PROVIDERS: CloudProvider[] = ['AWS', 'Azure', 'GCP', 'OCI'];
const L1_NAMES = ['Global Engineering', 'Corporate IT', 'Product R&D'];
const L2_PREFIXES = ['Platform', 'Data', 'Security', 'Marketing', 'SalesOps', 'Core'];
const L3_PREFIXES = ['Team Alpha', 'Team Beta', 'Team Gamma', 'Legacy Systems', 'Innovation Lab'];

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number) => Math.random() * (max - min) + min;

const generateSkus = (totalSpend: number): SkuDetail[] => {
  const skus: SkuDetail[] = [];
  let remaining = totalSpend;
  let count = 0;
  
  const categories = ['Compute', 'Storage', 'Networking', 'Database', 'AI/ML'];
  
  while (remaining > 0 && count < 8) {
    const cost = count === 7 ? remaining : randomFloat(remaining * 0.1, remaining * 0.4);
    const category = categories[randomInt(0, categories.length - 1)];
    
    // Categorize into the 3 main buckets
    let skuType: 'Compute' | 'Storage' | 'Networking' = 'Compute';
    if (['Storage', 'Database'].includes(category)) {
      skuType = 'Storage';
    } else if (category === 'Networking') {
      skuType = 'Networking';
    }
    // Default is Compute (includes AI/ML and Compute)

    skus.push({
      id: `sku-${randomInt(1000, 9999)}`,
      name: `${category} Instance Type ${String.fromCharCode(65 + count)}`,
      category: category,
      skuType: skuType,
      cost: Number(cost.toFixed(2))
    });
    remaining -= cost;
    count++;
  }
  return skus;
};

const generateMonthlyData = (): MonthlyMetric[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  // Base trend: start lower, trend higher
  const trendBase = randomFloat(500, 5000); 
  
  return months.map((month, idx) => {
    // Add some seasonality and growth
    const growthFactor = 1 + (idx * 0.05); 
    const randomVar = randomFloat(0.8, 1.2);
    const spend = trendBase * growthFactor * randomVar;
    // Forecast usually slightly different from actual
    const forecast = spend * randomFloat(0.95, 1.05) + (randomInt(-100, 100));
    
    return {
      month,
      spend: Number(spend.toFixed(2)),
      forecast: Number(forecast.toFixed(2))
    };
  });
};

const generateSafeDeployment = (): SafeDeploymentProfile => {
  // 7 criteria
  const checks = {
    terraformIaC: Math.random() > 0.15, // High adoption
    ciCdDeploy: Math.random() > 0.1,    // High adoption
    noManualAccess: Math.random() > 0.4, // Harder to enforce
    incrementalRollout: Math.random() > 0.3,
    soakTime: Math.random() > 0.5,
    autoRollback: Math.random() > 0.3,
    healthChecks: Math.random() > 0.1
  };

  const riskCount = Object.values(checks).filter(val => !val).length;
  const score = Math.round(((7 - riskCount) / 7) * 100);

  return {
    ...checks,
    riskCount,
    score
  };
};

const generateAccount = (idPrefix: string): CloudAccount => {
  const monthlyData = generateMonthlyData();
  const spend = monthlyData.reduce((acc, curr) => acc + curr.spend, 0);
  const forecast = monthlyData.reduce((acc, curr) => acc + curr.forecast, 0);
  
  return {
    id: `${idPrefix}-acc-${randomInt(100, 999)}`,
    name: `Cloud Acct ${randomInt(1, 99)}`,
    provider: PROVIDERS[randomInt(0, PROVIDERS.length - 1)],
    tier: randomInt(0, 5) as 0 | 1 | 2 | 3 | 4 | 5,
    spend: Number(spend.toFixed(2)),
    forecast: Number(forecast.toFixed(2)),
    monthlyData,
    vulnerabilities: {
      critical: Math.random() > 0.8 ? randomInt(1, 5) : 0, // 20% chance of critical
      high: Math.random() > 0.6 ? randomInt(1, 10) : 0,
      medium: randomInt(0, 20),
      low: randomInt(0, 50)
    },
    safeDeployment: generateSafeDeployment(),
    skus: generateSkus(spend)
  };
};

const generateL3 = (idPrefix: string, name: string): OrgLevel3 => {
  const numAccounts = randomInt(2, 6);
  const accounts: CloudAccount[] = [];
  for (let i = 0; i < numAccounts; i++) {
    accounts.push(generateAccount(idPrefix));
  }
  return {
    id: idPrefix,
    name,
    accounts
  };
};

const generateL2 = (idPrefix: string, name: string): OrgLevel2 => {
  const numL3 = randomInt(2, 4);
  const children: OrgLevel3[] = [];
  for (let i = 0; i < numL3; i++) {
    children.push(generateL3(`${idPrefix}-l3-${i}`, `${L3_PREFIXES[randomInt(0, L3_PREFIXES.length - 1)]}`));
  }
  return {
    id: idPrefix,
    name,
    children
  };
};

export const generateDataset = (): OrgLevel1[] => {
  return L1_NAMES.map((l1Name, idx) => {
    const numL2 = randomInt(2, 4);
    const children: OrgLevel2[] = [];
    for (let i = 0; i < numL2; i++) {
      children.push(generateL2(`l1-${idx}-l2-${i}`, `${L2_PREFIXES[randomInt(0, L2_PREFIXES.length - 1)]}`));
    }
    return {
      id: `l1-${idx}`,
      name: l1Name,
      children
    };
  });
};