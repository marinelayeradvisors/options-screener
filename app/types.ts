export interface CoveredCallRecommendation {
  strike: number;
  otmPercent: number;
  premium: number;
  optionYield: number;
  annualizedYield: number;
  upsidePercent: number;
  daysToExpiration: number;
  iv: number | null;
  volume: number;
  openInterest: number;
  recommended: boolean;
}

export interface CollarRecommendation {
  putStrike: number;
  callStrike: number;
  putOtmPercent: number;
  callOtmPercent: number;
  putPremium: number;
  callPremium: number;
  netCost: number;
  netCostPercent: number;
  downsideProtection: number;
  upsideCap: number;
  daysToExpiration: number;
  putIv: number | null;
  callIv: number | null;
  recommended: boolean;
}

export interface MarketData {
  ticker: string;
  name: string;
  price: number;
  iv: number;
  ivRank: number;
  skew: number;
  putCallRatio: number;
  strategy: "Income Generator" | "Cheap Protection" | "Neutral";
  rationale: string;
  expiration: string;
  daysToExpiration: number;
  optionRecommendations?: CoveredCallRecommendation[] | CollarRecommendation[];
}

