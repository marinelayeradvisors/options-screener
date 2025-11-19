'use client'

import { useState, useEffect } from 'react'
import { MarketData } from './types'
import DataTable from './components/DataTable'
import SpotlightCard from './components/SpotlightCard'
import { TrendingUp, Shield, Layers, RefreshCw } from 'lucide-react'

export default function Home() {
  const [data, setData] = useState<MarketData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'income' | 'protection'>('all')
  const [selectedTicker, setSelectedTicker] = useState<MarketData | null>(null)

  const loadData = async () => {
    try {
      const res = await fetch('/market_data.json?' + new Date().getTime()) // Cache bust
      const json = await res.json()
      setData(json)
      setLoading(false)
      setRefreshing(false)
    } catch (err) {
      console.error('Failed to load market data:', err)
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  const filteredCount = filter === 'all' 
    ? data.length 
    : filter === 'income'
    ? data.filter(d => d.strategy === 'Income Generator').length
    : data.filter(d => d.strategy === 'Cheap Protection').length

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-navy text-white shadow-lg">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Layers className="w-8 h-8" />
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Marine Layer Advisors</h1>
          </div>
          <p className="text-blue-200 text-base sm:text-lg font-medium">Opportunity Radar</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Refresh */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              aria-pressed={filter === 'all'}
              className={`px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm ${
                filter === 'all'
                  ? 'bg-navy text-white shadow-md scale-105'
                  : 'bg-white text-foreground hover:bg-gray-50 border border-border'
              }`}
            >
              All Opportunities
            </button>
            <button
              onClick={() => setFilter('income')}
              aria-pressed={filter === 'income'}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm ${
                filter === 'income'
                  ? 'bg-success text-white shadow-md scale-105'
                  : 'bg-white text-foreground hover:bg-gray-50 border border-border'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Income Generator
            </button>
            <button
              onClick={() => setFilter('protection')}
              aria-pressed={filter === 'protection'}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm ${
                filter === 'protection'
                  ? 'bg-info text-white shadow-md scale-105'
                  : 'bg-white text-foreground hover:bg-gray-50 border border-border'
              }`}
            >
              <Shield className="w-4 h-4" />
              Cheap Protection
            </button>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all shadow-sm bg-white text-foreground hover:bg-gray-50 border border-border disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reload market data from server"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
          
          {/* Results Count */}
          {!loading && data.length > 0 && (
            <div className="mt-4 text-sm font-medium text-muted-foreground">
              Showing <span className="text-foreground font-semibold">{filteredCount}</span> {filteredCount === 1 ? 'opportunity' : 'opportunities'}
            </div>
          )}
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-border p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-muted border-t-navy"></div>
            <p className="mt-4 text-muted-foreground font-medium">Loading market data...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-border p-12 text-center">
            <p className="text-muted-foreground">No market data available. Please run the Python script to generate data.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
            <DataTable
              data={data}
              filter={filter}
              onRowClick={setSelectedTicker}
            />
          </div>
        )}
      </main>

      {/* Spotlight Card */}
      <SpotlightCard
        data={selectedTicker}
        onClose={() => setSelectedTicker(null)}
      />
    </div>
  )
}
