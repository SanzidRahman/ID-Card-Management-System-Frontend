'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '../../lib/api';
import {
  Building2,
  FolderOpen,
  Database,
  Paintbrush,
  CreditCard,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      try {
        const response = await api.get('/stats');
        return response.data.data;
      } catch (err) {
        // Return fallback mockup stats if endpoint isn't fully set up yet
        return {
          organizations: 0,
          catalogs: 0,
          records: 0,
          templates: 0,
          generatedCards: 0,
          activeCards: 0,
          expiredCards: 0,
        };
      }
    },
    initialData: {
      organizations: 0,
      catalogs: 0,
      records: 0,
      templates: 0,
      generatedCards: 0,
      activeCards: 0,
      expiredCards: 0,
    },
  });

  const stats = [
    {
      name: 'Total Organizations',
      value: data?.organizations ?? 0,
      icon: Building2,
      color: 'from-blue-600 to-indigo-600',
    },
    {
      name: 'Total Catalogs',
      value: data?.catalogs ?? 0,
      icon: FolderOpen,
      color: 'from-indigo-600 to-purple-600',
    },
    {
      name: 'Total Records',
      value: data?.records ?? 0,
      icon: Database,
      color: 'from-emerald-600 to-teal-600',
    },
    {
      name: 'Active ID Cards',
      value: data?.activeCards ?? 0,
      icon: CreditCard,
      color: 'from-pink-600 to-rose-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-900 border border-slate-900/50"></div>
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-slate-900 border border-slate-900/50 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-900/20 p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Identity Management Suite
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Configure catalogs, map dynamic variables onto responsive canvases, and bulk-print credentials securely.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-radial-gradient from-blue-500 to-transparent pointer-events-none"></div>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 backdrop-blur-sm flex items-center justify-between"
            >
              <div>
                <span className="text-xs text-slate-500 font-medium block mb-1">
                  {stat.name}
                </span>
                <span className="text-2xl font-bold tracking-tight text-white">
                  {stat.value}
                </span>
              </div>
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-tr ${stat.color} flex items-center justify-center text-white shadow-lg shadow-black/30`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Action shortcuts & activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick action card list */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-white tracking-tight">
            Quick Actions
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/dashboard/organizations"
              className="group rounded-2xl border border-slate-900 bg-slate-900/30 p-6 hover:bg-slate-900/50 hover:border-blue-900/35 transition-all text-left flex flex-col justify-between"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                  <Building2 className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                  Create Organization
                </h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Establish a new profile, upload custom logos, and declare base styles.
                </p>
              </div>
              <span className="mt-6 text-xs font-semibold text-blue-400 flex items-center gap-1.5 self-start group-hover:gap-2.5 transition-all">
                Add Organization <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            <Link
              href="/dashboard/catalogs"
              className="group rounded-2xl border border-slate-900 bg-slate-900/30 p-6 hover:bg-slate-900/50 hover:border-blue-900/35 transition-all text-left flex flex-col justify-between"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                  Setup New Catalog
                </h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Define custom member catalogs (e.g. Visitors) with dynamic property maps.
                </p>
              </div>
              <span className="mt-6 text-xs font-semibold text-blue-400 flex items-center gap-1.5 self-start group-hover:gap-2.5 transition-all">
                Configure Catalog <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            <Link
              href="/dashboard/records"
              className="group rounded-2xl border border-slate-900 bg-slate-900/30 p-6 hover:bg-slate-900/50 hover:border-blue-900/35 transition-all text-left flex flex-col justify-between"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <Database className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                  CSV Bulk Upload
                </h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Import list profiles in bulk from spreadsheet exports directly to catalogs.
                </p>
              </div>
              <span className="mt-6 text-xs font-semibold text-blue-400 flex items-center gap-1.5 self-start group-hover:gap-2.5 transition-all">
                Import CSV <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            <Link
              href="/dashboard/templates"
              className="group rounded-2xl border border-slate-900 bg-slate-900/30 p-6 hover:bg-slate-900/50 hover:border-blue-900/35 transition-all text-left flex flex-col justify-between"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                  <Paintbrush className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                  ID Card Designer
                </h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Open the canvas layout editor, map text variables, shapes, and barcode lines.
                </p>
              </div>
              <span className="mt-6 text-xs font-semibold text-blue-400 flex items-center gap-1.5 self-start group-hover:gap-2.5 transition-all">
                Launch Designer <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
        </div>

        {/* Activity feed / details */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white tracking-tight">
            Security Overview
          </h3>
          <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-900 pb-4">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              <div>
                <span className="text-xs text-slate-400 font-semibold block">System Status</span>
                <span className="text-xs text-slate-500">All connections operational</span>
              </div>
            </div>
            <div className="text-xs text-slate-500 space-y-3">
              <p>Configure organizations and catalogs, and design templates to generate secure identity credentials.</p>
              <p>Every generated card automatically includes a public verification page linked via QR Code.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
