'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export interface FilterState {
  creditScoreMin: number;
  creditScoreMax: number;
  collateralTypes: ('Elektronik' | 'Emas' | 'BPKB')[];
  highestLoanMin: number;
  highestLoanMax: number;
  percentile: ('top 10%' | 'bottom 75%')[];
  highValue: boolean | null;
  vip: boolean | null;
}

interface FilterPanelProps {
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
}

export default function FilterPanel({ onFilterChange, onReset }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>({
    creditScoreMin: 0,
    creditScoreMax: 100,
    collateralTypes: [],
    highestLoanMin: 0,
    highestLoanMax: 100000000,
    percentile: [],
    highValue: null,
    vip: null,
  });

  const handleCreditScoreMinChange = (value: string) => {
    const newFilters = { ...filters, creditScoreMin: parseInt(value) || 0 };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCreditScoreMaxChange = (value: string) => {
    const newFilters = { ...filters, creditScoreMax: parseInt(value) || 100 };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCollateralTypeChange = (type: 'Elektronik' | 'Emas' | 'BPKB') => {
    let newTypes = [...filters.collateralTypes];
    if (newTypes.includes(type)) {
      newTypes = newTypes.filter(t => t !== type);
    } else {
      newTypes.push(type);
    }
    const newFilters = { ...filters, collateralTypes: newTypes };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleHighestLoanMinChange = (value: string) => {
    const newFilters = { ...filters, highestLoanMin: parseInt(value) || 0 };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleHighestLoanMaxChange = (value: string) => {
    const newFilters = { ...filters, highestLoanMax: parseInt(value) || 100000000 };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePercentileChange = (value: 'top 10%' | 'bottom 75%') => {
    let newPercentile = [...filters.percentile];
    if (newPercentile.includes(value)) {
      newPercentile = newPercentile.filter(p => p !== value);
    } else {
      newPercentile.push(value);
    }
    const newFilters = { ...filters, percentile: newPercentile };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleHighValueChange = (checked: boolean | null) => {
    const newFilters = { ...filters, highValue: checked };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleVipChange = (checked: boolean | null) => {
    const newFilters = { ...filters, vip: checked };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      creditScoreMin: 0,
      creditScoreMax: 100,
      collateralTypes: [],
      highestLoanMin: 0,
      highestLoanMax: 100000000,
      percentile: [],
      highValue: null,
      vip: null,
    };
    setFilters(resetFilters);
    onReset();
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Filter Lanjutan</h2>

      {/* Credit Score Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Credit Score Min
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={filters.creditScoreMin}
            onChange={(e) => handleCreditScoreMinChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded text-slate-900 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Credit Score Max
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={filters.creditScoreMax}
            onChange={(e) => handleCreditScoreMaxChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded text-slate-900 dark:text-white text-sm"
          />
        </div>
      </div>

      {/* Collateral Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Tipe Jaminan
        </label>
        <div className="flex gap-3">
          {(['Elektronik', 'Emas', 'BPKB'] as const).map((type) => (
            <label key={type} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.collateralTypes.includes(type)}
                onChange={() => handleCollateralTypeChange(type)}
                className="rounded border-slate-300"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Highest Loan Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Highest Loan Min
          </label>
          <input
            type="number"
            min="0"
            value={filters.highestLoanMin}
            onChange={(e) => handleHighestLoanMinChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded text-slate-900 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Highest Loan Max
          </label>
          <input
            type="number"
            min="0"
            value={filters.highestLoanMax}
            onChange={(e) => handleHighestLoanMaxChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded text-slate-900 dark:text-white text-sm"
          />
        </div>
      </div>

      {/* Percentile */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Loan Value Percentile
        </label>
        <div className="flex gap-3">
          {(['top 10%', 'bottom 75%'] as const).map((value) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.percentile.includes(value)}
                onChange={() => handlePercentileChange(value)}
                className="rounded border-slate-300"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">{value}</span>
            </label>
          ))}
        </div>
      </div>

      {/* High Value Checkbox */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.highValue === true}
            onChange={(e) => handleHighValueChange(e.target.checked ? true : null)}
            className="rounded border-slate-300"
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">High Value</span>
        </label>
      </div>

      {/* VIP Checkbox */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.vip === true}
            onChange={(e) => handleVipChange(e.target.checked ? true : null)}
            className="rounded border-slate-300"
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">VIP</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black"
          onClick={() => {
            // Filters are already applied via onChange
          }}
        >
          Terapkan Filter
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleReset}
        >
          Reset Semua
        </Button>
      </div>
    </div>
  );
}
