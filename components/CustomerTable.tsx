'use client';

import { Customer } from '@/app/api/customers/route';

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
}

export default function CustomerTable({ customers, isLoading }: CustomerTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600 dark:text-slate-400">Memuat data...</div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600 dark:text-slate-400">Tidak ada data pelanggan</div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const maskPhoneNumber = (phone: string) => {
    // Keep first 5 chars, mask the rest
    if (phone.length <= 5) return phone;
    return phone.substring(0, 5) + 'x'.repeat(phone.length - 5);
  };

  const getCollateralBadge = (type: string) => {
    const colors: Record<string, string> = {
      'Elektronik': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      'Emas': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      'BPKB': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    };
    return colors[type] || colors['Elektronik'];
  };

  return (
    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Nama</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">No HP</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Credit Score</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Tipe Jaminan</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">Highest Loan</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Percentile</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">High Value</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">VIP</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer, index) => (
            <tr
              key={index}
              className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
            >
              <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">{customer.nama}</td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-400" title={customer.noHp}>
                {maskPhoneNumber(customer.noHp)}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold">
                  {customer.creditScore}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCollateralBadge(customer.typeCollateral)}`}>
                  {customer.typeCollateral}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-slate-900 dark:text-white font-medium">
                {formatCurrency(customer.highestLoan)}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  customer.percentileLoan === 'top 10%'
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300'
                }`}>
                  {customer.percentileLoan}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                {customer.highValue ? (
                  <span className="inline-block w-5 h-5 rounded bg-green-500 text-white flex items-center justify-center text-xs">✓</span>
                ) : (
                  <span className="text-slate-400">–</span>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                {customer.vip ? (
                  <span className="inline-block w-5 h-5 rounded bg-amber-500 text-white flex items-center justify-center text-xs">✓</span>
                ) : (
                  <span className="text-slate-400">–</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
