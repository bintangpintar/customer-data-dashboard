'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Customer } from '@/app/api/customers/route';

interface ImportButtonProps {
  onImportComplete: (newCustomers: Customer[]) => void;
  isLoading: boolean;
}

export default function ImportButton({ onImportComplete, isLoading }: ImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const parseCSVLine = (str: string): string[] => {
    const result: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const nextChar = str[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const parseCSV = (csvText: string): Customer[] => {
    const lines = csvText.split('\n').slice(1);
    const customers: Customer[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const values = parseCSVLine(line);
        if (values.length < 59) continue;

        const nama = values[1]?.trim();
        const noHp = values[10]?.trim();
        const vip = values[2]?.trim().toLowerCase() === 'true';
        const highValue = values[3]?.trim().toLowerCase() === 'true';
        const creditScore = parseInt(values[50] || '70', 10);
        const highestLoanStr = values[51] || '0';
        const highestLoan = parseInt(highestLoanStr.replace(/[^0-9]/g, ''), 10) || 0;
        const percentileLoan = values[54]?.trim().toLowerCase().includes('top') ? 'top 10%' : 'bottom 75%';
        const emas = values[55]?.trim().toLowerCase() === 'true';
        const elektronik = values[56]?.trim().toLowerCase() === 'true';

        const lastGadaiItem = values[57]?.trim().toUpperCase() || '';
        let typeCollateral: 'Elektronik' | 'Emas' | 'BPKB' = 'Elektronik';
        if (lastGadaiItem.includes('BPKB') || lastGadaiItem.includes('KENDARAAN')) {
          typeCollateral = 'BPKB';
        } else if (emas) {
          typeCollateral = 'Emas';
        }

        if (nama && noHp) {
          customers.push({
            nama,
            noHp,
            creditScore: Math.min(100, Math.max(0, creditScore)),
            typeCollateral,
            highestLoan: Math.max(highestLoan, 0),
            percentileLoan,
            highValue,
            vip,
          });
        }
      } catch (error) {
        continue;
      }
    }

    return customers;
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Check file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
      alert('File terlalu besar. Ukuran maksimal: 100MB');
      return;
    }

    setIsImporting(true);
    try {
      const text = await file.text();
      const newCustomers = parseCSV(text);

      if (newCustomers.length === 0) {
        alert('Tidak ada data pelanggan yang valid dalam file');
        return;
      }

      onImportComplete(newCustomers);
      alert(`${newCustomers.length} pelanggan berhasil diimpor`);
    } catch (error) {
      console.error('[v0] Import error:', error);
      alert('Gagal mengimpor data. Pastikan file adalah CSV yang valid');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleImport}
        style={{ display: 'none' }}
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading || isImporting}
        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
      >
        {isImporting ? 'Mengimpor...' : 'Impor Data'}
      </Button>
    </>
  );
}
