'use client';
import { Settings, User, Bell, Shield, Database, Globe } from 'lucide-react';
import { PageHeader, Card, inputClass, FormField, Btn } from '../../../components/ui';
import { useAuth } from '../../../providers/AuthProvider';
import { useState } from 'react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: Database },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title="Settings" description="Manage your account and system preferences" />

      <div className="flex gap-8 flex-col lg:flex-row">
        {/* Sidebar nav */}
        <nav className="flex lg:flex-col gap-1 lg:w-48 flex-shrink-0">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-left w-full transition-all ${
                  activeSection === s.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />{s.label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {activeSection === 'profile' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-5">
              <h3 className="font-semibold text-slate-200">Profile Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Full Name">
                  <input defaultValue={user?.name} className={inputClass} />
                </FormField>
                <FormField label="Email Address">
                  <input defaultValue={user?.email} type="email" className={inputClass} disabled />
                </FormField>
              </div>
              <div className="flex justify-end">
                <Btn>Save Changes</Btn>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-5">
              <h3 className="font-semibold text-slate-200">Change Password</h3>
              <div className="space-y-4 max-w-sm">
                <FormField label="Current Password">
                  <input type="password" placeholder="••••••••" className={inputClass} />
                </FormField>
                <FormField label="New Password">
                  <input type="password" placeholder="••••••••" className={inputClass} />
                </FormField>
                <FormField label="Confirm New Password">
                  <input type="password" placeholder="••••••••" className={inputClass} />
                </FormField>
              </div>
              <div className="flex justify-end">
                <Btn>Update Password</Btn>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-4">
              <h3 className="font-semibold text-slate-200">Notification Preferences</h3>
              {['Email notifications for new records', 'System alerts', 'Weekly summary reports'].map((item) => (
                <label key={item} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                  <span className="text-sm text-slate-300">{item}</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-500" />
                </label>
              ))}
            </div>
          )}

          {activeSection === 'system' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-4">
              <h3 className="font-semibold text-slate-200">System Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-500">Version</span>
                  <span className="text-slate-300 font-mono">v1.0.0-phase2</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-500">Environment</span>
                  <span className="text-slate-300 font-mono">{process.env.NODE_ENV || 'development'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">API Base URL</span>
                  <span className="text-slate-300 font-mono text-xs">{process.env.NEXT_PUBLIC_API_URL || '/api'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
