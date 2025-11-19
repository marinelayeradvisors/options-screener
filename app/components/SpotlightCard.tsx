'use client'

import { X, TrendingUp, Shield, Mail, Star, DollarSign, Activity, TrendingDown, BarChart3 } from 'lucide-react'
import { MarketData, CoveredCallRecommendation, CollarRecommendation } from '../types'

interface SpotlightCardProps {
  data: MarketData | null
  onClose: () => void
}

export default function SpotlightCard({ data, onClose }: SpotlightCardProps) {
  if (!data) return null

  const isIncome = data.strategy === 'Income Generator'
  const isProtection = data.strategy === 'Cheap Protection'

  // Calculate mock metrics for the spotlight
  const crowdingPercentile = Math.min(99, Math.max(1, Math.round(data.ivRank + (Math.random() * 20 - 10))))
  const skewStatus = data.skew > 0 ? 'Expensive' : 'Cheap'
  const ivStatus = data.ivRank > 50 ? 'Elevated' : data.ivRank < 30 ? 'Low' : 'Moderate'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Slide-over Panel */}
      <div 
        className="fixed inset-y-0 right-0 w-full sm:w-[640px] bg-white shadow-2xl z-50 transform transition-transform overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="spotlight-title"
      >
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6 pb-6 border-b-2 border-border">
            <div className="flex-1">
              <h2 id="spotlight-title" className="text-3xl font-bold text-foreground mb-2">{data.ticker}</h2>
              <p className="text-base text-muted-foreground font-medium">{data.name}</p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Close spotlight"
            >
              <X className="w-6 h-6 text-muted-foreground" />
            </button>
          </div>

          {/* Strategy Badge */}
          <div className="mb-8">
            <div
              className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-base shadow-md ${
                isIncome
                  ? 'bg-success text-white'
                  : isProtection
                  ? 'bg-info text-white'
                  : 'bg-gray-600 text-white'
              }`}
            >
              {isIncome ? (
                <TrendingUp className="w-5 h-5" />
              ) : isProtection ? (
                <Shield className="w-5 h-5" />
              ) : null}
              {data.strategy}
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-muted to-white rounded-xl p-5 border-2 border-border shadow-sm">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold mb-2">
                <BarChart3 className="w-4 h-4" />
                99th %ile Crowding
              </div>
              <div className="text-4xl font-bold text-foreground">{crowdingPercentile}%</div>
            </div>
            
            <div className="bg-gradient-to-br from-muted to-white rounded-xl p-5 border-2 border-border shadow-sm">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold mb-2">
                <TrendingDown className="w-4 h-4" />
                Skew Status
              </div>
              <div className={`text-4xl font-bold ${
                data.skew > 0 ? 'text-warning' : 'text-success'
              }`}>
                {skewStatus}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-muted to-white rounded-xl p-5 border-2 border-border shadow-sm">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold mb-2">
                <Activity className="w-4 h-4" />
                IV Status
              </div>
              <div className={`text-4xl font-bold ${
                data.ivRank > 50 ? 'text-danger' : data.ivRank < 30 ? 'text-success' : 'text-muted-foreground'
              }`}>
                {ivStatus}
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-white rounded-lg p-4 border border-border shadow-sm">
              <div className="text-xs text-muted-foreground font-semibold mb-1.5">Current Price</div>
              <div className="text-xl font-bold text-foreground">${data.price.toFixed(2)}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-border shadow-sm">
              <div className="text-xs text-muted-foreground font-semibold mb-1.5">IV Rank</div>
              <div className="text-xl font-bold text-foreground">{data.ivRank.toFixed(1)}%</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-border shadow-sm">
              <div className="text-xs text-muted-foreground font-semibold mb-1.5">Skew</div>
              <div className="text-xl font-bold text-foreground">
                {data.skew > 0 ? '+' : ''}{data.skew.toFixed(2)}%
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-border shadow-sm">
              <div className="text-xs text-muted-foreground font-semibold mb-1.5">Put/Call Ratio</div>
              <div className="text-xl font-bold text-foreground">{data.putCallRatio.toFixed(2)}</div>
            </div>
          </div>

          {/* Option Recommendations */}
          {data.optionRecommendations && data.optionRecommendations.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                {isIncome ? 'Covered Call Recommendations' : 'Collar Recommendations'}
              </h3>
              
              {isIncome && (
                <div className="space-y-4">
                  {(data.optionRecommendations as CoveredCallRecommendation[]).map((rec, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl border-2 p-5 transition-all ${
                        rec.recommended
                          ? 'border-success bg-success-light shadow-md'
                          : 'border-border bg-white shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-foreground text-lg">
                            ${rec.strike.toFixed(2)} Call
                          </h4>
                          <span className="text-sm font-semibold text-muted-foreground bg-muted px-2 py-1 rounded">
                            {rec.otmPercent}% OTM
                          </span>
                        </div>
                        {rec.recommended && (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-success-foreground bg-success px-3 py-1.5 rounded-lg shadow-sm">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground font-semibold mb-1">Days to Expiration</div>
                          <div className="font-bold text-foreground text-base">{rec.daysToExpiration}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground font-semibold mb-1">Upside %</div>
                          <div className="font-bold text-success text-base">+{rec.upsidePercent.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground font-semibold mb-1">Option Yield</div>
                          <div className="font-bold text-foreground text-base">{rec.optionYield.toFixed(2)}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground font-semibold mb-1">Annualized Yield</div>
                          <div className="font-bold text-success text-base">{rec.annualizedYield.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground font-semibold mb-1">Premium</div>
                          <div className="font-bold text-foreground text-base">${rec.premium.toFixed(2)}</div>
                        </div>
                        {rec.iv && (
                          <div>
                            <div className="text-muted-foreground font-semibold mb-1">IV</div>
                            <div className="font-bold text-foreground text-base">{rec.iv.toFixed(1)}%</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isProtection && (
                <div className="space-y-4">
                  {(data.optionRecommendations as CollarRecommendation[]).map((rec, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl border-2 p-5 transition-all ${
                        rec.recommended
                          ? 'border-info bg-info-light shadow-md'
                          : 'border-border bg-white shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-foreground text-base">
                            ${rec.putStrike.toFixed(2)} Put / ${rec.callStrike.toFixed(2)} Call
                          </h4>
                        </div>
                        {rec.recommended && (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-info-foreground bg-info px-3 py-1.5 rounded-lg shadow-sm">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <div className="text-muted-foreground font-semibold mb-1">Days to Expiration</div>
                          <div className="font-bold text-foreground text-base">{rec.daysToExpiration}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground font-semibold mb-1">Net Cost</div>
                          <div className={`font-bold text-base ${rec.netCost >= 0 ? 'text-danger' : 'text-success'}`}>
                            {rec.netCost >= 0 ? '+' : ''}${rec.netCost.toFixed(2)} ({rec.netCostPercent >= 0 ? '+' : ''}{rec.netCostPercent.toFixed(2)}%)
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground font-semibold mb-1">Downside Protection</div>
                          <div className="font-bold text-info text-base">-{rec.downsideProtection.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground font-semibold mb-1">Upside Cap</div>
                          <div className="font-bold text-muted-foreground text-base">+{rec.upsideCap.toFixed(1)}%</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3 font-medium">
                        Put: ${rec.putPremium.toFixed(2)} ({rec.putOtmPercent}% OTM) | 
                        Call: ${rec.callPremium.toFixed(2)} ({rec.callOtmPercent}% OTM)
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Marine Layer Take */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-foreground mb-4">Marine Layer Take</h3>
            <div className="bg-info-light border-2 border-info rounded-xl p-5 shadow-sm">
              <p className="text-sm text-foreground leading-relaxed font-medium">
                {data.rationale}
                {data.ivRank > 50 && (
                  <span> Volatility is elevated. We recommend overwriting to capture yield while maintaining upside participation.</span>
                )}
                {data.ivRank < 30 && (
                  <span> Volatility is compressed. Downside hedges are historically cheap. Consider protective puts or collars to limit downside risk.</span>
                )}
                {data.skew > 0 && (
                  <span> Put skew is elevated, indicating expensive downside protection. This favors selling premium strategies.</span>
                )}
                {data.skew < -2 && (
                  <span> Call skew is elevated relative to puts, suggesting cheap downside protection opportunities.</span>
                )}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <a
            href={`mailto:advisors@marinelayer.com?subject=Term Sheet Request - ${data.ticker}&body=Please provide a term sheet for ${data.ticker} (${data.name}) based on the ${data.strategy} strategy.`}
            className="w-full flex items-center justify-center gap-2.5 bg-navy text-white px-6 py-4 rounded-xl font-bold text-base hover:bg-navy-light transition-all shadow-lg hover:shadow-xl"
          >
            <Mail className="w-5 h-5" />
            Request Term Sheet
          </a>
        </div>
      </div>
    </>
  )
}
