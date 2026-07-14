import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, X } from 'lucide-react';

interface LeadEvent {
  event: string;
  status: string;
  timestamp: number;
  message: string;
}

interface Lead {
  phoneNumber: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'cancel' | 'contacted';
  events: LeadEvent[];
  lastEvent: string;
  lastEventTime: number;
  customerData?: any;
}

interface LeadsPipelineProps {
  leads: Lead[];
  onStatusChange: (phoneNumber: string, newStatus: string) => void;
  targetCount?: number;
}

export default function LeadsPipeline({ leads, onStatusChange, targetCount = 12 }: LeadsPipelineProps) {
  const [expandedLead, setExpandedLead] = useState<string | null>(null);

  // Count contacted leads
  const contactedCount = leads.filter(
    (lead) => lead.status === 'read' || lead.status === 'delivered' || lead.status === 'contacted'
  ).length;

  const maskPhoneNumber = (phone: string) => {
    if (phone.length <= 5) return phone;
    return phone.substring(0, 5) + 'x'.repeat(phone.length - 5);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'read':
        return 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'cancel':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'contacted':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      sent: 'Terkirim',
      delivered: 'Tersampaikan',
      read: 'Dibaca',
      failed: 'Gagal',
      cancel: 'Dibatalkan',
      pending: 'Menunggu',
      contacted: 'Terhubung',
    };
    return labels[status] || status;
  };

  // Group leads by pipeline
  const customerLeads = leads.filter((lead) => lead.status === 'pending');
  const contactedLeads = leads.filter(
    (lead) => lead.status === 'read' || lead.status === 'delivered' || lead.status === 'contacted'
  );
  const cancelledLeads = leads.filter((lead) => lead.status === 'cancel');

  return (
    <div className="space-y-6">
      {/* Target Achievement */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">Target Kontak</h3>
        <p className="text-3xl font-bold">
          {contactedCount} <span className="text-lg font-normal">/ {targetCount}</span>
        </p>
        <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${(contactedCount / targetCount) * 100}%` }}
          />
        </div>
        <p className="text-sm text-white/80 mt-2">
          {((contactedCount / targetCount) * 100).toFixed(0)}% target tercapai
        </p>
      </div>

      {/* Pipelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Leads Pipeline */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <h4 className="font-semibold mb-4 text-amber-700 dark:text-amber-400">
            Customer Leads ({customerLeads.length})
          </h4>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {customerLeads.map((lead) => (
              <div
                key={lead.phoneNumber}
                className="bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 rounded p-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() =>
                  setExpandedLead(
                    expandedLead === lead.phoneNumber ? null : lead.phoneNumber
                  )
                }
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {lead.customerData?.nama || 'Unknown'}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {maskPhoneNumber(lead.phoneNumber)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(lead.phoneNumber, 'cancel');
                    }}
                    className="text-slate-500 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>

                {expandedLead === lead.phoneNumber && (
                  <div className="mt-3 pt-3 border-t border-amber-200 dark:border-slate-600 space-y-2">
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="text-slate-600 dark:text-slate-400">Credit Score:</span>{' '}
                        <span className="font-medium">
                          {lead.customerData?.creditScore || '-'}
                        </span>
                      </p>
                      <p>
                        <span className="text-slate-600 dark:text-slate-400">Collateral:</span>{' '}
                        <span className="font-medium">
                          {lead.customerData?.typeCollateral || '-'}
                        </span>
                      </p>
                      <p>
                        <span className="text-slate-600 dark:text-slate-400">Highest Loan:</span>{' '}
                        <span className="font-medium">
                          {lead.customerData?.highestLoan
                            ? `Rp ${lead.customerData.highestLoan.toLocaleString('id-ID')}`
                            : '-'}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusChange(lead.phoneNumber, 'contacted');
                      }}
                      className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded"
                    >
                      Tandai Terhubung
                    </button>
                  </div>
                )}
              </div>
            ))}
            {customerLeads.length === 0 && (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                Tidak ada customer leads
              </p>
            )}
          </div>
        </div>

        {/* Contacted Pipeline */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <h4 className="font-semibold mb-4 text-green-700 dark:text-green-400">
            Contacted ({contactedLeads.length})
          </h4>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {contactedLeads.map((lead) => (
              <div
                key={lead.phoneNumber}
                className="bg-green-50 dark:bg-slate-800 border border-green-200 dark:border-slate-700 rounded p-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() =>
                  setExpandedLead(
                    expandedLead === lead.phoneNumber ? null : lead.phoneNumber
                  )
                }
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {lead.customerData?.nama || 'Unknown'}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {maskPhoneNumber(lead.phoneNumber)}
                    </p>
                    <span
                      className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        lead.status
                      )}`}
                    >
                      {getStatusLabel(lead.status)}
                    </span>
                  </div>
                </div>

                {expandedLead === lead.phoneNumber && (
                  <div className="mt-3 pt-3 border-t border-green-200 dark:border-slate-600 space-y-2">
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="text-slate-600 dark:text-slate-400">Credit Score:</span>{' '}
                        <span className="font-medium">
                          {lead.customerData?.creditScore || '-'}
                        </span>
                      </p>
                      <p>
                        <span className="text-slate-600 dark:text-slate-400">Latest Event:</span>{' '}
                        <span className="font-medium">{lead.lastEvent}</span>
                      </p>
                      <p>
                        <span className="text-slate-600 dark:text-slate-400">Events:</span>
                      </p>
                      <div className="bg-white dark:bg-slate-700 rounded p-2 max-h-32 overflow-y-auto text-xs">
                        {lead.events.slice(-5).map((event, idx) => (
                          <div key={idx} className="text-slate-600 dark:text-slate-400 mb-1">
                            {getStatusLabel(event.status)} -{' '}
                            {new Date(event.timestamp * 1000).toLocaleTimeString('id-ID')}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {contactedLeads.length === 0 && (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                Tidak ada lead terhubung
              </p>
            )}
          </div>
        </div>

        {/* Cancelled Pipeline */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <h4 className="font-semibold mb-4 text-slate-700 dark:text-slate-400">
            Cancelled ({cancelledLeads.length})
          </h4>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {cancelledLeads.map((lead) => (
              <div
                key={lead.phoneNumber}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-3 opacity-75"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {lead.customerData?.nama || 'Unknown'}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {maskPhoneNumber(lead.phoneNumber)}
                    </p>
                    <button
                      onClick={() => onStatusChange(lead.phoneNumber, 'pending')}
                      className="mt-2 text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                    >
                      Pulihkan
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {cancelledLeads.length === 0 && (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                Tidak ada lead dibatalkan
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
