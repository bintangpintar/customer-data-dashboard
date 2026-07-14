'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Customer } from '@/app/api/customers/route';

interface ExportButtonProps {
  customers: Customer[];
  isLoading: boolean;
}

export default function ExportButton({ customers, isLoading }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (customers.length === 0) {
      alert('Tidak ada data untuk diekspor');
      return;
    }

    setIsExporting(true);
    try {
      // Create CSV with only phone numbers
      const csvContent = customers
        .map(customer => customer.noHp)
        .join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `customer_phones_${new Date().getTime()}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert(`${customers.length} nomor telepon berhasil diekspor`);
    } catch (error) {
      console.error('[v0] Export error:', error);
      alert('Gagal mengekspor data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isLoading || customers.length === 0 || isExporting}
      className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
    >
      {isExporting ? 'Mengekspor...' : `Ekspor (${customers.length} data)`}
    </Button>
  );
}
