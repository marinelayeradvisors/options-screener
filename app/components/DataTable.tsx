'use client'

import { useState } from 'react'
import { MarketData } from '../types'
import { TrendingUp, Shield, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

interface DataTableProps {
  data: MarketData[]
  filter: 'all' | 'income' | 'protection'
  onRowClick: (data: MarketData) => void
}

type SortField = 'ticker' | 'name' | 'price' | 'ivRank'
type SortDirection = 'asc' | 'desc'

export default function DataTable({ data, filter, onRowClick }: DataTableProps) {
  const [sortField, setSortField] = useState<SortField>('ivRank')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const filteredData = filter === 'all' 
    ? data 
    : filter === 'income'
    ? data.filter(d => d.strategy === 'Income Generator')
    : data.filter(d => d.strategy === 'Cheap Protection')

  const sortedData = [...filteredData].sort((a, b) => {
    let aVal: string | number = a[sortField]
    let bVal: string | number = b[sortField]
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-navy" />
      : <ArrowDown className="w-4 h-4 text-navy" />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-border-strong bg-muted">
            <th className="text-left py-4 px-6">
              <button
                onClick={() => handleSort('ticker')}
                className="flex items-center gap-2 font-semibold text-foreground hover:text-navy transition-colors"
              >
                Ticker
                <SortIcon field="ticker" />
              </button>
            </th>
            <th className="text-left py-4 px-6">
              <button
                onClick={() => handleSort('name')}
                className="flex items-center gap-2 font-semibold text-foreground hover:text-navy transition-colors"
              >
                Company
                <SortIcon field="name" />
              </button>
            </th>
            <th className="text-right py-4 px-6">
              <button
                onClick={() => handleSort('price')}
                className="flex items-center gap-2 font-semibold text-foreground hover:text-navy transition-colors ml-auto"
              >
                Price
                <SortIcon field="price" />
              </button>
            </th>
            <th className="text-right py-4 px-6">
              <button
                onClick={() => handleSort('ivRank')}
                className="flex items-center gap-2 font-semibold text-foreground hover:text-navy transition-colors ml-auto"
              >
                IV Rank
                <SortIcon field="ivRank" />
              </button>
            </th>
            <th className="text-left py-4 px-6 font-semibold text-foreground">
              Strategy
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item) => (
            <tr
              key={item.ticker}
              onClick={() => onRowClick(item)}
              className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors group"
            >
              <td className="py-4 px-6">
                <span className="font-bold text-foreground text-lg group-hover:text-navy transition-colors">
                  {item.ticker}
                </span>
              </td>
              <td className="py-4 px-6">
                <span className="text-sm text-muted-foreground font-medium">{item.name}</span>
              </td>
              <td className="py-4 px-6 text-right">
                <span className="font-semibold text-foreground">${item.price.toFixed(2)}</span>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center gap-3 justify-end">
                  <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.ivRank > 70
                          ? 'bg-danger'
                          : item.ivRank > 50
                          ? 'bg-warning'
                          : item.ivRank > 30
                          ? 'bg-yellow-400'
                          : 'bg-success'
                      }`}
                      style={{ width: `${Math.min(100, item.ivRank)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-foreground w-14 text-right tabular-nums">
                    {item.ivRank.toFixed(1)}%
                  </span>
                </div>
              </td>
              <td className="py-4 px-6">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                    item.strategy === 'Income Generator'
                      ? 'bg-success-light text-success-foreground'
                      : item.strategy === 'Cheap Protection'
                      ? 'bg-info-light text-info-foreground'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {item.strategy === 'Income Generator' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : item.strategy === 'Cheap Protection' ? (
                    <Shield className="w-4 h-4" />
                  ) : null}
                  {item.strategy}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
