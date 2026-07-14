'use client';

import { useState, useEffect, useMemo } from 'react';
import FilterPanel, { FilterState } from '@/components/FilterPanel';
import CustomerTable from '@/components/CustomerTable';
import ExportButton from '@/components/ExportButton';
import ImportButton from '@/components/ImportButton';
import { Button } from '@/components/ui/button';
import { Customer } from '@/app/api/customers/route';

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data.data || []);
    } catch (error) {
      console.error('[v0] Failed to fetch customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Apply filters to customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      // Credit Score filter
      if (customer.creditScore < filters.creditScoreMin || customer.creditScore > filters.creditScoreMax) {
        return false;
      }

      // Collateral Type filter
      if (filters.collateralTypes.length > 0 && !filters.collateralTypes.includes(customer.typeCollateral)) {
        return false;
      }

      // Highest Loan filter
      if (customer.highestLoan < filters.highestLoanMin || customer.highestLoan > filters.highestLoanMax) {
        return false;
      }

      // Percentile filter
      if (filters.percentile.length > 0 && !filters.percentile.includes(customer.percentileLoan)) {
        return false;
      }

      // High Value filter
      if (filters.highValue !== null && customer.highValue !== filters.highValue) {
        return false;
      }

      // VIP filter
      if (filters.vip !== null && customer.vip !== filters.vip) {
        return false;
      }

      return true;
    });
  }, [customers, filters]);

  const handleReset = () => {
    setFilters({
      creditScoreMin: 0,
      creditScoreMax: 100,
      collateralTypes: [],
      highestLoanMin: 0,
      highestLoanMax: 100000000,
      percentile: [],
      highValue: null,
      vip: null,
    });
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="bg-slate-900 dark:bg-black border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">PawnCRM AI</h1>
              <p className="text-slate-400 text-sm mt-1">Cabang: Pulo Ribung</p>
            </div>
            <nav className="hidden md:flex gap-6">
              <a href="#" className="text-slate-300 hover:text-white text-sm font-medium">
                Dashboard
              </a>
              <a href="#" className="text-slate-300 hover:text-white text-sm font-medium">
                Pelanggan
              </a>
              <a href="#" className="text-slate-300 hover:text-white text-sm font-medium">
                CRM Pesan
              </a>
              <a href="#" className="text-slate-300 hover:text-white text-sm font-medium">
                Leads Tracker
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Search & Actions Bar */}
        <div className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="Cari nama, HP, atau barang..."
            className="flex-1 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-slate-900 dark:text-white text-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100">
              Semua
            </button>
            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium">
              VIP
            </button>
            <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-sm font-medium">
              Power
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <FilterPanel
          onFilterChange={setFilters}
          onReset={handleReset}
        />

        {/* Results Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Data Pelanggan</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Total: {customers.length} | Ditampilkan: {filteredCustomers.length}
            </p>
          </div>
          <div className="flex gap-2">
            <ImportButton 
              onImportComplete={(newCustomers) => setCustomers([...customers, ...newCustomers])}
              isLoading={isLoading}
            />
            <Button
              onClick={fetchCustomers}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
            >
              {isLoading ? 'Memuat...' : 'Refresh'}
            </Button>
            <ExportButton customers={filteredCustomers} isLoading={isLoading} />
          </div>
        </div>

        {/* Customer Table */}
        <CustomerTable customers={filteredCustomers} isLoading={isLoading} />
      </div>
    </main>
  );
}
