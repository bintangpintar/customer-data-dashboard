'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Customer } from '@/app/api/customers/route';

interface AddToLeadsButtonProps {
  customers: Customer[];
  isLoading?: boolean;
}

export default function AddToLeadsButton({ customers, isLoading = false }: AddToLeadsButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAddToLeads = async () => {
    if (customers.length === 0) {
      setMessage('Tidak ada customer yang dipilih');
      return;
    }

    setIsProcessing(true);
    try {
      // For each customer, create a lead entry via leads API
      const results = [];
      for (const customer of customers) {
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: customer.noHp,
            customerData: customer,
          }),
        });

        if (response.ok) {
          results.push({ success: true, phone: customer.noHp });
        }
      }

      const successCount = results.filter((r) => r.success).length;
      setMessage(`${successCount} customer berhasil ditambahkan ke Leads Tracker`);

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('[v0] Error adding to leads:', error);
      setMessage('Gagal menambahkan ke Leads Tracker');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={handleAddToLeads}
        disabled={isLoading || isProcessing || customers.length === 0}
        className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white"
      >
        {isProcessing ? 'Menambahkan...' : `Add to Leads (${customers.length})`}
      </Button>
      {message && (
        <div className="absolute top-full mt-2 right-0 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm py-2 px-3 rounded whitespace-nowrap z-50">
          {message}
        </div>
      )}
    </div>
  );
}
