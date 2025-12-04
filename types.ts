export type CloudProvider = 'AWS' | 'Azure' | 'GCP' | 'OCI';

export interface SkuDetail {
  id: string;
  name: string;
  category: string;
  skuType: 'Compute' | 'Storage' | 'Networking';
  cost: number;
}

export interface VulnerabilityReport {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface SafeDeploymentProfile {
  terraformIaC: boolean;
  ciCdDeploy: boolean;
  noManualAccess: boolean;
  incrementalRollout: boolean;
  soakTime: boolean;
  autoRollback: boolean;
  healthChecks: boolean;
  riskCount: number; // Count of failed checks
  score: number; // 0-100 score
}

export interface MonthlyMetric {
  month: string;
  spend: number;
  forecast: number;
}

export interface CloudAccount {
  id: string;
  name: string;
  provider: CloudProvider;
  tier: 0 | 1 | 2 | 3 | 4 | 5;
  spend: number;
  forecast: number;
  monthlyData: MonthlyMetric[];
  vulnerabilities: VulnerabilityReport;
  safeDeployment: SafeDeploymentProfile;
  skus: SkuDetail[];
}

export interface OrgLevel3 {
  id: string;
  name: string;
  accounts: CloudAccount[];
}

export interface OrgLevel2 {
  id: string;
  name: string;
  children: OrgLevel3[];
}

export interface OrgLevel1 {
  id: string;
  name: string;
  children: OrgLevel2[];
}

// Helper types for aggregated views
export interface AggregatedStats {
  totalSpend: number;
  totalForecast: number;
  totalVulnerabilities: VulnerabilityReport;
  totalSafeDeploymentRisks: number;
  spendByProvider: Record<CloudProvider, number>;
}