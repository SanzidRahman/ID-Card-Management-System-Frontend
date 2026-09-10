'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Building2, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search, X, Upload, Globe, Mail, Phone } from 'lucide-react';
import {
  useOrganizations,
  useCreateOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
  useToggleOrganizationStatus,
} from '../../../hooks/usePhaseTwo';
import {
  PageHeader, Btn, Modal, ConfirmDialog, StatusBadge,
  EmptyState, PageLoader, SearchInput, useToast, inputClass, FormField, ColorDot, Pagination
} from '../../../components/ui';

const DEFAULT_FORM = {
  name: '', description: '', email: '', phone: '', website: '',
  address: '', primaryColor: '#2563eb', secondaryColor: '#0f172a', logo: null,
};

function OrgForm({ onSubmit, defaultValues = DEFAULT_FORM, loading }) {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({ defaultValues });
  const [logoPreview, setLogoPreview] = useState(defaultValues.logo || null);

  const handleLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setValue('logo', file);
    setLogoPreview(URL.createObjectURL(file));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Logo */}
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/60 overflow-hidden flex items-center justify-center">
          {logoPreview ? (
            <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
          ) : (
            <Building2 className="h-6 w-6 text-slate-500" />
          )}
        </div>
        <div>
          <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors">
            <Upload className="h-3.5 w-3.5" />
            Upload Logo
            <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
          </label>
          <p className="mt-1 text-xs text-slate-500">PNG, JPG up to 2MB</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Organization Name" required error={errors.name?.message}>
          <input {...register('name', { required: 'Name is required' })} placeholder="e.g. Lincoln High School" className={inputClass} />
        </FormField>
        <FormField label="Email" error={errors.email?.message}>
          <input {...register('email', { pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })} type="email" placeholder="contact@school.edu" className={inputClass} />
        </FormField>
        <FormField label="Phone" error={errors.phone?.message}>
          <input {...register('phone')} placeholder="+1 555 000 0000" className={inputClass} />
        </FormField>
        <FormField label="Website" error={errors.website?.message}>
          <input {...register('website')} placeholder="https://school.edu" className={inputClass} />
        </FormField>
        <FormField label="Address" className="sm:col-span-2">
          <input {...register('address')} placeholder="123 Main St, City, Country" className={inputClass} />
        </FormField>
        <FormField label="Description">
          <textarea {...register('description')} rows={2} placeholder="Short description…" className={inputClass + ' resize-none'} />
        </FormField>
        <FormField label="Brand Colors">
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">Primary</label>
              <input {...register('primaryColor')} type="color" className="h-10 w-14 rounded-lg cursor-pointer border border-slate-700 bg-slate-800 p-0.5" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">Secondary</label>
              <input {...register('secondaryColor')} type="color" className="h-10 w-14 rounded-lg cursor-pointer border border-slate-700 bg-slate-800 p-0.5" />
            </div>
          </div>
        </FormField>
      </div>

      <div className="flex justify-end pt-2">
        <Btn type="submit" loading={loading} icon={Plus}>
          Save Organization
        </Btn>
      </div>
    </form>
  );
}

function OrgCard({ org, onEdit, onDelete, onToggle }) {
  return (
    <article className="group rounded-2xl border border-slate-800 bg-slate-900/30 p-5 hover:border-slate-700 hover:bg-slate-900/50 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {org.logo ? (
            <img src={org.logo} alt={org.name} className="h-12 w-12 rounded-xl object-cover border border-slate-700 flex-shrink-0" />
          ) : (
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${org.primaryColor || '#2563eb'}, ${org.secondaryColor || '#0f172a'})` }}
            >
              {org.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-100 truncate">{org.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <ColorDot color={org.primaryColor || '#2563eb'} />
              <ColorDot color={org.secondaryColor || '#0f172a'} />
              <StatusBadge active={org.isActive} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <Btn size="sm" variant="ghost" icon={Pencil} onClick={() => onEdit(org)} />
          <Btn size="sm" variant="ghost" onClick={() => onToggle(org)}>
            {org.isActive ? <ToggleRight className="h-4 w-4 text-emerald-400" /> : <ToggleLeft className="h-4 w-4 text-slate-500" />}
          </Btn>
          <Btn size="sm" variant="ghost" icon={Trash2} onClick={() => onDelete(org)} className="hover:text-red-400" />
        </div>
      </div>

      <div className="mt-4 space-y-1.5 text-xs text-slate-500">
        {org.email && (
          <div className="flex items-center gap-1.5">
            <Mail className="h-3 w-3" />{org.email}
          </div>
        )}
        {org.phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="h-3 w-3" />{org.phone}
          </div>
        )}
        {org.website && (
          <div className="flex items-center gap-1.5">
            <Globe className="h-3 w-3" />
            <a href={org.website} target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors truncate">{org.website}</a>
          </div>
        )}
        {org.description && <p className="pt-1 text-slate-500 line-clamp-2">{org.description}</p>}
      </div>
    </article>
  );
}

export default function OrganizationsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editOrg, setEditOrg] = useState(null);
  const [deleteOrg, setDeleteOrg] = useState(null);
  const { success, error } = useToast();

  const { data, isLoading } = useOrganizations({ search, page, limit: 12 });
  const createMut = useCreateOrganization();
  const updateMut = useUpdateOrganization();
  const deleteMut = useDeleteOrganization();
  const toggleMut = useToggleOrganizationStatus();

  const orgs = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const handleCreate = async (formData) => {
    try {
      await createMut.mutateAsync(formData);
      success('Organization created successfully');
      setShowCreate(false);
    } catch (err) {
      error(err.displayMessage || 'Failed to create organization');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await updateMut.mutateAsync({ id: editOrg._id, ...formData });
      success('Organization updated');
      setEditOrg(null);
    } catch (err) {
      error(err.displayMessage || 'Failed to update organization');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMut.mutateAsync({ id: deleteOrg._id });
      success('Organization deleted');
      setDeleteOrg(null);
    } catch (err) {
      error(err.displayMessage || 'Failed to delete organization');
    }
  };

  const handleToggle = async (org) => {
    try {
      await toggleMut.mutateAsync({ id: org._id });
      success(`Organization ${org.isActive ? 'deactivated' : 'activated'}`);
    } catch (err) {
      error(err.displayMessage || 'Failed to toggle status');
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Organizations"
        description="Manage institutions, schools, and companies"
        actions={
          <Btn icon={Plus} onClick={() => setShowCreate(true)}>
            New Organization
          </Btn>
        }
      />

      {/* Search */}
      <div className="max-w-md">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search organizations…" />
      </div>

      {/* List */}
      {isLoading ? (
        <PageLoader />
      ) : orgs.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No organizations yet"
          description="Create your first organization to start managing ID cards"
          action={<Btn icon={Plus} onClick={() => setShowCreate(true)}>Create Organization</Btn>}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orgs.map((org) => (
              <OrgCard
                key={org._id}
                org={org}
                onEdit={setEditOrg}
                onDelete={setDeleteOrg}
                onToggle={handleToggle}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Organization" size="lg">
        <OrgForm onSubmit={handleCreate} loading={createMut.isPending} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editOrg} onClose={() => setEditOrg(null)} title="Edit Organization" size="lg">
        {editOrg && (
          <OrgForm
            onSubmit={handleUpdate}
            loading={updateMut.isPending}
            defaultValues={{
              name: editOrg.name || '',
              description: editOrg.description || '',
              email: editOrg.email || '',
              phone: editOrg.phone || '',
              website: editOrg.website || '',
              address: editOrg.address || '',
              primaryColor: editOrg.primaryColor || '#2563eb',
              secondaryColor: editOrg.secondaryColor || '#0f172a',
              logo: null,
            }}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteOrg}
        onClose={() => setDeleteOrg(null)}
        onConfirm={handleDelete}
        loading={deleteMut.isPending}
        danger
        title="Delete Organization"
        description={`Are you sure you want to delete "${deleteOrg?.name}"? This action cannot be undone and may affect associated catalogs and records.`}
      />
    </div>
  );
}
