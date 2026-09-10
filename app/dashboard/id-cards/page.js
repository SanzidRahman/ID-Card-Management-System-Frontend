'use client';
import { CreditCard, ArrowRight } from 'lucide-react';
import { PageHeader } from '../../../components/ui';

export default function IDCardsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="ID Cards" description="Generate and manage printed identity cards" />
      <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-8 text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-400">
          <CreditCard className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-200">ID Card Generation — Phase 4</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
          Bulk card generation, PDF/PNG rendering, and print layout configuration will be available in Phase 4.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {['Single Card Preview', 'Bulk Generation', 'PDF Export', 'PNG Export', 'Print Layout', 'QR Verification'].map((f) => (
            <span key={f} className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs text-slate-400">{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
