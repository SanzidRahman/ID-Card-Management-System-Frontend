'use client';
import { Users, ShieldCheck, UserPlus } from 'lucide-react';
import { PageHeader, EmptyState, Btn } from '../../../components/ui';
import { useAuth } from '../../../providers/AuthProvider';

export default function UsersPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  if (!isSuperAdmin) {
    return (
      <div className="space-y-8">
        <PageHeader title="Users & Roles" description="Manage system users and permissions" />
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-200">Access Restricted</h3>
          <p className="mt-2 text-sm text-slate-500">User management is available to Super Admins only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Users & Roles"
        description="Manage system users and their access levels"
        actions={<Btn icon={UserPlus}>Invite User</Btn>}
      />
      <EmptyState
        icon={Users}
        title="User management coming soon"
        description="Full user administration panel will be available shortly"
      />
    </div>
  );
}
