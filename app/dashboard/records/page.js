'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Database, Plus, Pencil, Trash2, Search, Download, Upload,
  FileText, RefreshCw, Filter, MoreVertical, ChevronDown,
  AlertCircle, CheckCircle, X, Trash, RotateCcw
} from 'lucide-react';
import {
  useRecords, useCatalogs, useCatalogFields, useOrganizations,
  useCreateRecord, useUpdateRecord, useDeleteRecord,
  useTrashedRecords, useRestoreRecord, usePermanentDeleteRecord,
  useBulkDeleteRecords, exportRecordsCsv, downloadCsvTemplate, importRecordsCsv,
} from '../../../hooks/usePhaseTwo';
import DynamicForm from '../../../components/DynamicForm';
import {
  PageHeader, Btn, Modal, ConfirmDialog, StatusBadge,
  EmptyState, PageLoader, SearchInput, useToast, selectClass,
  Pagination, Table,
} from '../../../components/ui';

// ─── Import Result Drawer ─────────────────────────────────────────────────────

function ImportResultsModal({ results, onClose }) {
  if (!results) return null;
  const { success, errors } = results;
  return (
    <Modal open title="CSV Import Results" onClose={onClose} size="lg">
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{success}</p>
            <p className="text-xs text-emerald-500 mt-1">Imported</p>
          </div>
          <div className="flex-1 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{errors?.length || 0}</p>
            <p className="text-xs text-red-500 mt-1">Failed</p>
          </div>
        </div>
        {errors?.length > 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-900">
                <tr><th className="px-4 py-2 text-left text-xs text-slate-500">Row</th><th className="px-4 py-2 text-left text-xs text-slate-500">Error</th></tr>
              </thead>
              <tbody>
                {errors.map((e, i) => (
                  <tr key={i} className="border-t border-slate-800">
                    <td className="px-4 py-2 text-slate-400 font-mono">{e.row}</td>
                    <td className="px-4 py-2 text-red-400 text-xs">{e.error || e.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Record Form Modal ────────────────────────────────────────────────────────

function RecordFormModal({ open, onClose, fields, onSubmit, submitting, title, initialValues }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="xl">
      <DynamicForm
        fields={fields}
        onSubmit={onSubmit}
        submitting={submitting}
        initialValues={initialValues}
        submitLabel={title?.includes('Edit') ? 'Update Record' : 'Create Record'}
      />
    </Modal>
  );
}

// ─── Trash Tab ────────────────────────────────────────────────────────────────

function TrashTab({ catalogId, fields }) {
  const { data, isLoading, refetch } = useTrashedRecords(catalogId ? { catalog: catalogId } : {});
  const restoreMut = useRestoreRecord();
  const permanentMut = usePermanentDeleteRecord();
  const [permanentDelete, setPermanentDelete] = useState(null);
  const { success, error } = useToast();

  const records = data?.data || [];

  const handleRestore = async (id) => {
    try {
      await restoreMut.mutateAsync({ id });
      success('Record restored');
    } catch (err) {
      error(err.displayMessage || 'Restore failed');
    }
  };

  const handlePermanent = async () => {
    try {
      await permanentMut.mutateAsync({ id: permanentDelete });
      success('Record permanently deleted');
      setPermanentDelete(null);
    } catch (err) {
      error(err.displayMessage || 'Delete failed');
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{records.length} deleted record{records.length !== 1 ? 's' : ''}</p>
        <Btn size="sm" variant="ghost" icon={RefreshCw} onClick={refetch}>Refresh</Btn>
      </div>

      {records.length === 0 ? (
        <EmptyState icon={Trash} title="Trash is empty" description="Deleted records will appear here" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                {fields.slice(0, 5).map((f) => (
                  <th key={f._id} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{f.label}</th>
                ))}
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Deleted</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  {fields.slice(0, 5).map((f) => (
                    <td key={f._id} className="px-4 py-3 text-slate-300 text-xs">
                      {Array.isArray(record.data?.[f.name])
                        ? record.data[f.name].join(', ')
                        : record.data?.[f.name] || '—'}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {record.deletedAt ? new Date(record.deletedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Btn size="sm" variant="success" icon={RotateCcw} onClick={() => handleRestore(record._id)}>
                        Restore
                      </Btn>
                      <Btn size="sm" variant="danger" icon={Trash2} onClick={() => setPermanentDelete(record._id)}>
                        Delete
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!permanentDelete}
        onClose={() => setPermanentDelete(null)}
        onConfirm={handlePermanent}
        loading={permanentMut.isPending}
        danger
        title="Permanently Delete Record"
        description="This action cannot be undone. The record will be permanently removed from the database."
      />
    </div>
  );
}

// ─── Main Records Page ────────────────────────────────────────────────────────

export default function RecordsPage() {
  const [catalog, setCatalog] = useState('');
  const [orgFilter, setOrgFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState('records'); // 'records' | 'trash'
  const [showCreate, setShowCreate] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);
  const { success, error } = useToast();

  const { data: orgsData } = useOrganizations({ limit: 100 });
  const orgs = orgsData?.data || [];

  const { data: catalogsData } = useCatalogs({ limit: 100, ...(orgFilter && { organization: orgFilter }) });
  const catalogs = catalogsData?.data || [];

  const { data: fieldsData } = useCatalogFields(catalog);
  const fields = fieldsData?.data || [];

  const enabled = Boolean(catalog);
  const { data, isLoading } = useRecords({ catalog, search, page, limit: 25 }, enabled);
  const records = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const createMut = useCreateRecord();
  const updateMut = useUpdateRecord();
  const deleteMut = useDeleteRecord();
  const bulkDeleteMut = useBulkDeleteRecords();

  const selectedCatalog = catalogs.find((c) => c._id === catalog);

  const handleCreate = async (formData) => {
    try {
      const payload = formData instanceof FormData
        ? (() => { formData.append('catalog', catalog); formData.append('organization', selectedCatalog?.organization?._id || selectedCatalog?.organization || ''); return formData; })()
        : { catalog, organization: selectedCatalog?.organization?._id || selectedCatalog?.organization, data: formData };
      await createMut.mutateAsync(payload);
      success('Record created');
      setShowCreate(false);
    } catch (err) {
      error(err.displayMessage || 'Failed to create record');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      const payload = formData instanceof FormData
        ? (() => { formData.append('id', editRecord._id); return formData; })()
        : { id: editRecord._id, data: formData };
      await updateMut.mutateAsync(payload);
      success('Record updated');
      setEditRecord(null);
    } catch (err) {
      error(err.displayMessage || 'Failed to update record');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMut.mutateAsync({ id: deleteRecord._id });
      success('Record moved to trash');
      setDeleteRecord(null);
    } catch (err) {
      error(err.displayMessage || 'Delete failed');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteMut.mutateAsync(selectedIds);
      success(`${selectedIds.length} records deleted`);
      setSelectedIds([]);
      setShowBulkDelete(false);
    } catch (err) {
      error(err.displayMessage || 'Bulk delete failed');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelectedIds(selectedIds.length === records.length ? [] : records.map((r) => r._id));
  };

  const handleExport = async () => {
    try {
      await exportRecordsCsv(catalog);
      success('CSV exported');
    } catch (err) {
      error('Export failed');
    }
  };

  const handleTemplate = async () => {
    try {
      await downloadCsvTemplate(catalog);
    } catch (err) {
      error('Could not download template');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !catalog) return;
    setImporting(true);
    try {
      const res = await importRecordsCsv(catalog, selectedCatalog?.organization?._id || selectedCatalog?.organization, file);
      setImportResults(res.data?.data || res.data);
    } catch (err) {
      error(err.displayMessage || 'Import failed');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const displayColumns = fields.slice(0, 6);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Records"
        description="Create, manage, and export dynamic records"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {catalog && (
              <>
                <Btn size="sm" variant="secondary" icon={FileText} onClick={handleTemplate}>CSV Template</Btn>
                <Btn size="sm" variant="secondary" icon={Download} onClick={handleExport}>Export CSV</Btn>
                <label>
                  <Btn size="sm" variant="secondary" icon={Upload} loading={importing} onClick={() => fileInputRef.current?.click()}>
                    Import CSV
                  </Btn>
                  <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
                </label>
              </>
            )}
            {catalog && (
              <Btn icon={Plus} onClick={() => setShowCreate(true)}>New Record</Btn>
            )}
          </div>
        }
      />

      {/* Filters row */}
      <div className="flex flex-wrap gap-3">
        <select
          value={orgFilter}
          onChange={(e) => { setOrgFilter(e.target.value); setCatalog(''); setPage(1); }}
          className="rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-500"
        >
          <option value="">All Organizations</option>
          {orgs.map((o) => <option key={o._id} value={o._id}>{o.name}</option>)}
        </select>

        <select
          value={catalog}
          onChange={(e) => { setCatalog(e.target.value); setPage(1); setSelectedIds([]); }}
          className="rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-500"
        >
          <option value="">Select Catalog</option>
          {catalogs.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        {catalog && (
          <div className="flex-1 min-w-48 max-w-sm">
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search records…" />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-800">
        <button
          onClick={() => setTab('records')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === 'records' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Database className="inline h-4 w-4 mr-1.5" />Records
        </button>
        <button
          onClick={() => setTab('trash')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === 'trash' ? 'border-red-500 text-red-400' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Trash className="inline h-4 w-4 mr-1.5" />Trash
        </button>
      </div>

      {tab === 'trash' ? (
        <TrashTab catalogId={catalog} fields={fields} />
      ) : (
        <>
          {/* Bulk action bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl bg-blue-600/10 border border-blue-600/20 px-4 py-3">
              <span className="text-sm text-blue-300 font-medium">{selectedIds.length} selected</span>
              <Btn size="sm" variant="danger" icon={Trash2} onClick={() => setShowBulkDelete(true)}>
                Delete Selected
              </Btn>
              <Btn size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
                <X className="h-4 w-4" /> Clear
              </Btn>
            </div>
          )}

          {!catalog ? (
            <EmptyState
              icon={Database}
              title="Select a catalog to view records"
              description="Choose an organization and catalog from the filters above"
            />
          ) : isLoading ? (
            <PageLoader />
          ) : records.length === 0 ? (
            <EmptyState
              icon={Database}
              title="No records found"
              description={search ? 'Try a different search term' : 'Create your first record for this catalog'}
              action={<Btn icon={Plus} onClick={() => setShowCreate(true)}>Create Record</Btn>}
            />
          ) : (
            <>
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/50">
                      <th className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === records.length && records.length > 0}
                          onChange={toggleAll}
                          className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-500"
                        />
                      </th>
                      {displayColumns.map((f) => (
                        <th key={f._id} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {f.label}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(record._id)}
                            onChange={() => toggleSelect(record._id)}
                            className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-500"
                          />
                        </td>
                        {displayColumns.map((f) => (
                          <td key={f._id} className="px-4 py-3 text-slate-300 text-sm max-w-[180px]">
                            {f.type === 'image' && record.data?.[f.name] ? (
                              <img src={record.data[f.name]} alt={f.label} className="h-8 w-8 rounded-lg object-cover" />
                            ) : Array.isArray(record.data?.[f.name]) ? (
                              <span className="truncate block">{record.data[f.name].join(', ')}</span>
                            ) : (
                              <span className="truncate block">{record.data?.[f.name] ?? '—'}</span>
                            )}
                          </td>
                        ))}
                        <td className="px-4 py-3">
                          <StatusBadge active={record.status === 'active'} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Btn
                              size="sm" variant="ghost" icon={Pencil}
                              onClick={() => setEditRecord(record)}
                            />
                            <Btn
                              size="sm" variant="ghost" icon={Trash2}
                              onClick={() => setDeleteRecord(record)}
                              className="hover:text-red-400"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </>
      )}

      {/* Create Record Modal */}
      <RecordFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        fields={fields}
        onSubmit={handleCreate}
        submitting={createMut.isPending}
        title="Create New Record"
      />

      {/* Edit Record Modal */}
      <RecordFormModal
        open={!!editRecord}
        onClose={() => setEditRecord(null)}
        fields={fields}
        onSubmit={handleUpdate}
        submitting={updateMut.isPending}
        title="Edit Record"
        initialValues={editRecord?.data || {}}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteRecord}
        onClose={() => setDeleteRecord(null)}
        onConfirm={handleDelete}
        loading={deleteMut.isPending}
        danger
        title="Delete Record"
        description="Move this record to the trash? You can restore it later."
      />

      {/* Bulk Delete Confirm */}
      <ConfirmDialog
        open={showBulkDelete}
        onClose={() => setShowBulkDelete(false)}
        onConfirm={handleBulkDelete}
        loading={bulkDeleteMut.isPending}
        danger
        title="Delete Selected Records"
        description={`Move ${selectedIds.length} records to trash? You can restore them later.`}
      />

      {/* Import Results */}
      <ImportResultsModal results={importResults} onClose={() => setImportResults(null)} />
    </div>
  );
}
