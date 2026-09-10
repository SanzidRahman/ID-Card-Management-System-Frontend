'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import {
  FolderOpen, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Settings, ChevronRight, Database
} from 'lucide-react';
import {
  useCatalogs, useCreateCatalog, useUpdateCatalog,
  useDeleteCatalog, useToggleCatalogStatus, useOrganizations,
} from '../../../hooks/usePhaseTwo';
import {
  PageHeader, Btn, Modal, ConfirmDialog, StatusBadge,
  EmptyState, PageLoader, SearchInput, useToast,
  inputClass, selectClass, FormField, Pagination,
} from '../../../components/ui';

function CatalogForm({ onSubmit, defaultValues = {}, loading, orgs = [] }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Organization" required error={errors.organization?.message}>
          <select {...register('organization', { required: 'Organization is required' })} className={selectClass}>
            <option value="">Select organization</option>
            {orgs.map((o) => <option key={o._id} value={o._id}>{o.name}</option>)}
          </select>
        </FormField>
        <FormField label="Catalog Name" required error={errors.name?.message}>
          <input
            {...register('name', { required: 'Name is required' })}
            placeholder="e.g. Students, Employees"
            className={inputClass}
          />
        </FormField>
        <FormField label="Description" className="sm:col-span-2">
          <textarea
            {...register('description')}
            rows={2}
            placeholder="Optional description…"
            className={inputClass + ' resize-none'}
          />
        </FormField>
      </div>
      <div className="flex justify-end pt-2">
        <Btn type="submit" loading={loading} icon={Plus}>Save Catalog</Btn>
      </div>
    </form>
  );
}

function CatalogCard({ catalog, onEdit, onDelete, onToggle }) {
  return (
    <article className="group relative rounded-2xl border border-slate-800 bg-slate-900/30 p-5 hover:border-slate-700 hover:bg-slate-900/50 transition-all flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
          <FolderOpen className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Btn size="sm" variant="ghost" icon={Pencil} onClick={() => onEdit(catalog)} />
          <Btn size="sm" variant="ghost" onClick={() => onToggle(catalog)}>
            {catalog.isActive
              ? <ToggleRight className="h-4 w-4 text-emerald-400" />
              : <ToggleLeft className="h-4 w-4 text-slate-500" />}
          </Btn>
          <Btn size="sm" variant="ghost" icon={Trash2} onClick={() => onDelete(catalog)} className="hover:text-red-400" />
        </div>
      </div>

      <div className="mt-3 flex-1">
        <h3 className="font-semibold text-slate-100">{catalog.name}</h3>
        {catalog.description && (
          <p className="mt-1 text-xs text-slate-500 line-clamp-2">{catalog.description}</p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
        <div className="space-y-1">
          {catalog.organization?.name && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-600" />
              {catalog.organization.name}
            </p>
          )}
          <StatusBadge active={catalog.isActive} />
        </div>
        <Link
          href={`/dashboard/catalogs/${catalog._id}/fields`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-medium text-blue-400 hover:bg-slate-700 hover:border-slate-600 transition-all"
        >
          <Settings className="h-3 w-3" />
          Fields
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </article>
  );
}

export default function CatalogsPage() {
  const [search, setSearch] = useState('');
  const [orgFilter, setOrgFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editCatalog, setEditCatalog] = useState(null);
  const [deleteCatalog, setDeleteCatalog] = useState(null);
  const { success, error } = useToast();

  const { data: orgsData } = useOrganizations({ limit: 100 });
  const orgs = orgsData?.data || [];

  const { data, isLoading } = useCatalogs({
    search,
    page,
    limit: 12,
    ...(orgFilter && { organization: orgFilter }),
  });
  const catalogs = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const createMut = useCreateCatalog();
  const updateMut = useUpdateCatalog();
  const deleteMut = useDeleteCatalog();
  const toggleMut = useToggleCatalogStatus();

  const handleCreate = async (formData) => {
    try {
      await createMut.mutateAsync(formData);
      success('Catalog created');
      setShowCreate(false);
    } catch (err) {
      error(err.displayMessage || 'Failed to create catalog');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await updateMut.mutateAsync({ id: editCatalog._id, ...formData });
      success('Catalog updated');
      setEditCatalog(null);
    } catch (err) {
      error(err.displayMessage || 'Failed to update catalog');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMut.mutateAsync({ id: deleteCatalog._id });
      success('Catalog deleted');
      setDeleteCatalog(null);
    } catch (err) {
      error(err.displayMessage || 'Failed to delete catalog');
    }
  };

  const handleToggle = async (catalog) => {
    try {
      await toggleMut.mutateAsync({ id: catalog._id });
      success(`Catalog ${catalog.isActive ? 'deactivated' : 'activated'}`);
    } catch (err) {
      error(err.displayMessage || 'Toggle failed');
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Catalogs"
        description="Define data groups like Students, Employees, Visitors"
        actions={<Btn icon={Plus} onClick={() => setShowCreate(true)}>New Catalog</Btn>}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 max-w-sm">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search catalogs…" />
        </div>
        <select
          value={orgFilter}
          onChange={(e) => { setOrgFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
        >
          <option value="">All Organizations</option>
          {orgs.map((o) => <option key={o._id} value={o._id}>{o.name}</option>)}
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <PageLoader />
      ) : catalogs.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No catalogs found"
          description="Create your first catalog and define its custom fields"
          action={<Btn icon={Plus} onClick={() => setShowCreate(true)}>Create Catalog</Btn>}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catalogs.map((catalog) => (
              <CatalogCard
                key={catalog._id}
                catalog={catalog}
                onEdit={setEditCatalog}
                onDelete={setDeleteCatalog}
                onToggle={handleToggle}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Catalog" size="md">
        <CatalogForm onSubmit={handleCreate} loading={createMut.isPending} orgs={orgs} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editCatalog} onClose={() => setEditCatalog(null)} title="Edit Catalog" size="md">
        {editCatalog && (
          <CatalogForm
            onSubmit={handleUpdate}
            loading={updateMut.isPending}
            orgs={orgs}
            defaultValues={{
              name: editCatalog.name,
              description: editCatalog.description || '',
              organization: editCatalog.organization?._id || editCatalog.organization || '',
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteCatalog}
        onClose={() => setDeleteCatalog(null)}
        onConfirm={handleDelete}
        loading={deleteMut.isPending}
        danger
        title="Delete Catalog"
        description={`Delete "${deleteCatalog?.name}"? All associated fields may also be affected.`}
      />
    </div>
  );
}
