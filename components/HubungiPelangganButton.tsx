'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Customer } from '@/lib/types';

interface HubungiPelangganButtonProps {
  customers: Customer[];
  isLoading: boolean;
}

export default function HubungiPelangganButton({ customers, isLoading }: HubungiPelangganButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (customers.length === 0) {
      setMessage('Tidak ada data untuk diproses');
      return;
    }

    setIsProcessing(true);
    try {
      // Step 1: Export CSV
      const csvContent = customers
        .map(customer => customer.noHp)
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `customer_phones_broadcast_${new Date().getTime()}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Step 2: Add all customers to leads tracker via API
      const leadResults = [];
      for (const customer of customers) {
        try {
          const response = await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phoneNumber: customer.noHp,
              customerData: customer,
              status: 'contacted',
              notes: 'Auto-tagged from broadcast contact',
            }),
          });

          if (response.ok) {
            leadResults.push({ success: true, phone: customer.noHp });
          }
        } catch (error) {
          console.error('[v0] Error adding to leads:', error);
        }
      }

      setShowConfirmation(false);
      setMessage(`Berhasil diekspor. ${leadResults.length} pelanggan ditambahkan ke leads tracker`);
      
      // Clear message after 4 seconds
      setTimeout(() => setMessage(null), 4000);
    } catch (error) {
      console.error('[v0] Error in broadcast:', error);
      setMessage('Gagal memproses broadcast. Silakan coba lagi');
      setShowConfirmation(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={() => customers.length > 0 && setShowConfirmation(true)}
        disabled={isLoading || customers.length === 0}
        className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600 text-white"
      >
        {isProcessing ? 'Memproses...' : `Hubungi Pelanggan (${customers.length})`}
      </Button>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              Lanjutkan hubungi via broadcast?
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              Sistem akan:
              <br />
              • Mengekspor {customers.length} nomor telepon pelanggan
              <br />
              • Menambahkan semua pelanggan ke leads tracker
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowConfirmation(false)}
                disabled={isProcessing}
                className="bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-400 dark:hover:bg-slate-600"
              >
                Batalkan
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isProcessing}
                className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600 text-white"
              >
                {isProcessing ? 'Memproses...' : 'Ya'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {message && (
        <div className="fixed bottom-4 right-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm py-3 px-4 rounded shadow-lg z-40 max-w-xs">
          {message}
        </div>
      )}
    </div>
  );
}
