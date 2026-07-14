'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import LeadsPipeline from '@/components/LeadsPipeline';
import { Button } from '@/components/ui/button';

interface Lead {
  phoneNumber: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'cancel' | 'contacted';
  events: any[];
  lastEvent: string;
  lastEventTime: number;
  customerData?: any;
}

export default function LeadsTrackerPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [targetCount, setTargetCount] = useState(12);
  const [showTargetInput, setShowTargetInput] = useState(false);
  const [newTarget, setNewTarget] = useState('12');

  // Load leads from leads storage
  const loadLeads = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/leads');
      const data = await response.json();

      // Use leads array directly
      const leadsArray = data.leads || [];
      setLeads(leadsArray);
      console.log('[v0] Leads loaded:', leadsArray.length);
    } catch (error) {
      console.error('[v0] Error loading leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load leads on mount
  useEffect(() => {
    loadLeads();
    // Refresh leads every 10 seconds to check for webhook updates
    const interval = setInterval(loadLeads, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle adding customer leads (called from Pelanggan page)
  const addCustomerLead = (customerData: any) => {
    const phoneNumber = customerData.noHp;

    // Check if lead already exists
    const existingLead = leads.find((lead) => lead.phoneNumber === phoneNumber);

    if (existingLead) {
      // Update existing lead
      setLeads(
        leads.map((lead) =>
          lead.phoneNumber === phoneNumber
            ? { ...lead, customerData }
            : lead
        )
      );
    } else {
      // Create new lead
      const newLead: Lead = {
        phoneNumber,
        status: 'pending',
        events: [],
        lastEvent: 'created',
        lastEventTime: Date.now() / 1000,
        customerData,
      };
      setLeads([...leads, newLead]);
    }
  };

  // Handle status change
  const handleStatusChange = async (phoneNumber: string, newStatus: string) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, status: newStatus }),
      });

      if (response.ok) {
        setLeads(
          leads.map((lead) =>
            lead.phoneNumber === phoneNumber
              ? { ...lead, status: newStatus as any }
              : lead
          )
        );
      }
    } catch (error) {
      console.error('[v0] Error updating lead status:', error);
    }
  };

  // Handle target update
  const handleUpdateTarget = () => {
    const target = parseInt(newTarget, 10);
    if (target > 0) {
      setTargetCount(target);
      setShowTargetInput(false);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="bg-slate-900 dark:bg-black border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-white">PawnCRM AI</h1>
          <p className="text-slate-400 text-sm mt-1">Cabang: Pulo Ribung</p>
        </div>
      </header>

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title and Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Leads Tracker</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              Kelola dan pantau status kontak leads pelanggan Anda
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={loadLeads}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
            >
              {isLoading ? 'Memuat...' : 'Refresh'}
            </Button>
            {!showTargetInput ? (
              <Button
                onClick={() => setShowTargetInput(true)}
                className="bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white"
              >
                Target: {targetCount}
              </Button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white w-20"
                />
                <Button
                  onClick={handleUpdateTarget}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Set
                </Button>
                <Button
                  onClick={() => setShowTargetInput(false)}
                  className="bg-slate-600 hover:bg-slate-700 text-white"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Webhook Endpoint:</strong> POST /api/webhook - Kirim event message.sent, message.failed, atau message.ack
            untuk memperbarui status leads secara otomatis.
          </p>
        </div>

        {/* Leads Pipeline */}
        <LeadsPipeline leads={leads} onStatusChange={handleStatusChange} targetCount={targetCount} />

        {/* Export Leads Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => {
              // Export leads as JSON for now
              const dataStr = JSON.stringify(leads, null, 2);
              const dataBlob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `leads-${new Date().toISOString().split('T')[0]}.json`;
              link.click();
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Export Leads
          </Button>
        </div>
      </div>
    </main>
  );
}
