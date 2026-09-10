'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft, Plus, Trash2, Pencil, GripVertical, ToggleLeft, ToggleRight,
  Type, AlignLeft, Hash, Mail, Phone, Calendar, List, CheckSquare,
  Circle, Image, Paperclip, Link2, ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import {
  useCatalogFields, useCatalog, useCreateCatalogField,
  useUpdateCatalogField, useDeleteCatalogField, useToggleCatalogFieldStatus,
} from '../../../../../hooks/usePhaseTwo';
import {
  PageHeader, Btn, Modal, ConfirmDialog, StatusBadge,
  EmptyState, PageLoader, useToast, inputClass, selectClass, FormField,
} from '../../../../../components/ui';

const FIELD_TYPES = [
  { value: 'text', label: 'Short Text', icon: Type },
  { value: 'textarea', label: 'Long Text', icon: AlignLeft },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'select', label: 'Dropdown', icon: List },
  { value: 'multi_select', label: 'Multi-select', icon: CheckSquare },
  { value: 'radio', label: 'Radio Buttons', icon: Circle },
  { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { value: 'image', label: 'Image Upload', icon: Image },
  { value: 'file', label: 'File Upload', icon: Paperclip },
  { value: 'url', label: 'URL', icon: Link2 },
];

const FIELD_ICON_MAP = Object.fromEntries(FIELD_TYPES.map((t) => [t.value, t.icon]));

function FieldIcon({ type }) {
  const Icon = FIELD_ICON_MAP[type] || Type;
  return <Icon className="h-4 w-4" />;
}

const DEFAULT_FORM = {
  label: '', name: '', type: 'text', required: false, unique: false,
  description: '', placeholder: '', sortOrder: 0,
  options: '',
  validation: { minLength: '', maxLength: '', min: '', max: '', pattern: '' },
};

function FieldForm({ onSubmit, defaultValues = DEFAULT_FORM, loading }) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({ defaultValues });
  const fieldType = watch('type');
  const needsOptions = ['select', 'multi_select', 'radio'].includes(fieldType);
  const needsLength = ['text', 'textarea', 'email', 'phone', 'url'].includes(fieldType);
  const needsRange = fieldType === 'number';

  const autoSlug = (label) => {
    const slug = label
      .trim()
      .replace(/\s+(.)/g, (_, c) => c.toUpperCase())
      .replace(/[^a-zA-Z0-9]/g, '');
    setValue('name', slug.charAt(0).toLowerCase() + slug.slice(1));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Field Label" required error={errors.label?.message}>
          <input
            {...register('label', { required: 'Label is required' })}
            onChange={(e) => {
              register('label').onChange(e);
              autoSlug(e.target.value);
            }}
            placeholder="e.g. Full Name"
            className={inputClass}
          />
        </FormField>
        <FormField label="Field Key (auto)" required error={errors.name?.message} hint="Used as data key in records">
          <input
            {...register('name', { required: 'Key is required', pattern: { value: /^[a-zA-Z][a-zA-Z0-9]*$/, message: 'Camel case, no spaces' } })}
            placeholder="e.g. fullName"
            className={inputClass}
          />
        </FormField>
        <FormField label="Field Type" required>
          <select {...register('type')} className={selectClass}>
            {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </FormField>
        <FormField label="Placeholder Text">
          <input {...register('placeholder')} placeholder="Hint shown inside field…" className={inputClass} />
        </FormField>
        <FormField label="Description / Help Text" className="sm:col-span-2">
          <input {...register('description')} placeholder="Help text shown below field" className={inputClass} />
        </FormField>
      </div>

      {needsOptions && (
        <FormField
          label="Options (comma-separated)"
          required
          error={errors.options?.message}
          hint="e.g. Grade 1, Grade 2, Grade 3"
        >
          <input {...register('options', { required: needsOptions ? 'At least one option' : false })} placeholder="Option A, Option B, Option C" className={inputClass} />
        </FormField>
      )}

      {/* Validation */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Validation Rules</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {needsLength && (
            <>
              <FormField label="Min Length">
                <input {...register('validation.minLength')} type="number" min={0} placeholder="0" className={inputClass} />
              </FormField>
              <FormField label="Max Length">
                <input {...register('validation.maxLength')} type="number" min={0} placeholder="255" className={inputClass} />
              </FormField>
            </>
          )}
          {needsRange && (
            <>
              <FormField label="Min Value">
                <input {...register('validation.min')} type="number" placeholder="0" className={inputClass} />
              </FormField>
              <FormField label="Max Value">
                <input {...register('validation.max')} type="number" placeholder="9999" className={inputClass} />
              </FormField>
            </>
          )}
          <FormField label="Regex Pattern" hint="Custom pattern validation">
            <input {...register('validation.pattern')} placeholder="e.g. ^[A-Z]{3}\\d{4}$" className={inputClass} />
          </FormField>
        </div>
      </div>

      {/* Flags */}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" {...register('required')} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-500" />
          <span className="text-sm text-slate-300 font-medium">Required field</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" {...register('unique')} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-500" />
          <span className="text-sm text-slate-300 font-medium">Must be unique</span>
        </label>
      </div>

      <div className="flex justify-end pt-2">
        <Btn type="submit" loading={loading} icon={Plus}>Save Field</Btn>
      </div>
    </form>
  );
}

function FieldRow({ field, index, onEdit, onDelete, onToggle }) {
  const Icon = FIELD_ICON_MAP[field.type] || Type;
  return (
    <div className="group flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/30 px-4 py-3 hover:border-slate-700 hover:bg-slate-900/50 transition-all">
      <div className="text-slate-600 cursor-grab">
        <GripVertical className="h-4 w-4" />
      </div>
      <span className="text-slate-600 text-xs font-mono w-5 text-center">{index + 1}</span>
      <div className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 flex-shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-slate-200 text-sm">{field.label}</span>
          <code className="rounded px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 font-mono">{field.name}</code>
          <span className="rounded px-1.5 py-0.5 text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize">{field.type.replace('_', ' ')}</span>
          {field.required && <span className="rounded px-1.5 py-0.5 text-[10px] bg-red-500/10 text-red-400 border border-red-500/20">Required</span>}
          {field.unique && <span className="rounded px-1.5 py-0.5 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">Unique</span>}
        </div>
        {field.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{field.description}</p>}
      </div>
      <StatusBadge active={field.isActive} />
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Btn size="sm" variant="ghost" icon={Pencil} onClick={() => onEdit(field)} />
        <Btn size="sm" variant="ghost" onClick={() => onToggle(field)}>
          {field.isActive ? <ToggleRight className="h-4 w-4 text-emerald-400" /> : <ToggleLeft className="h-4 w-4 text-slate-500" />}
        </Btn>
        <Btn size="sm" variant="ghost" icon={Trash2} onClick={() => onDelete(field)} className="hover:text-red-400" />
      </div>
    </div>
  );
}

export default function FieldsPage() {
  const { id: catalogId } = useParams();
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editField, setEditField] = useState(null);
  const [deleteField, setDeleteField] = useState(null);
  const { success, error } = useToast();

  const { data: catalogData } = useCatalog(catalogId);
  const { data, isLoading } = useCatalogFields(catalogId);
  const fields = data?.data || [];
  const catalog = catalogData?.data;

  const createMut = useCreateCatalogField(catalogId);
  const updateMut = useUpdateCatalogField();
  const deleteMut = useDeleteCatalogField();
  const toggleMut = useToggleCatalogFieldStatus();

  const parseOptions = (optionsStr) => {
    if (!optionsStr) return [];
    return optionsStr.split(',').map((v) => v.trim()).filter(Boolean).map((v) => ({ label: v, value: v.toLowerCase().replace(/\s+/g, '_') }));
  };

  const preparePayload = (data) => {
    const payload = { ...data };
    if (data.options) payload.options = parseOptions(data.options);
    else payload.options = [];
    // Clean validation
    const v = {};
    if (data.validation?.minLength) v.minLength = Number(data.validation.minLength);
    if (data.validation?.maxLength) v.maxLength = Number(data.validation.maxLength);
    if (data.validation?.min !== '') v.min = Number(data.validation.min);
    if (data.validation?.max !== '') v.max = Number(data.validation.max);
    if (data.validation?.pattern) v.pattern = data.validation.pattern;
    payload.validation = v;
    payload.sortOrder = fields.length + 1;
    return payload;
  };

  const handleCreate = async (formData) => {
    try {
      await createMut.mutateAsync(preparePayload(formData));
      success('Field created');
      setShowCreate(false);
    } catch (err) {
      error(err.displayMessage || 'Failed to create field');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await updateMut.mutateAsync({ id: editField._id, ...preparePayload(formData) });
      success('Field updated');
      setEditField(null);
    } catch (err) {
      error(err.displayMessage || 'Failed to update field');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMut.mutateAsync({ id: deleteField._id });
      success('Field deleted');
      setDeleteField(null);
    } catch (err) {
      error(err.displayMessage || 'Failed to delete field');
    }
  };

  const handleToggle = async (field) => {
    try {
      await toggleMut.mutateAsync({ id: field._id });
      success(`Field ${field.isActive ? 'disabled' : 'enabled'}`);
    } catch (err) {
      error(err.displayMessage || 'Toggle failed');
    }
  };

  const getEditDefaults = (field) => ({
    label: field.label || '',
    name: field.name || '',
    type: field.type || 'text',
    required: field.required || false,
    unique: field.unique || false,
    description: field.description || '',
    placeholder: field.placeholder || '',
    sortOrder: field.sortOrder || 0,
    options: (field.options || []).map((o) => o.label).join(', '),
    validation: {
      minLength: field.validation?.minLength || '',
      maxLength: field.validation?.maxLength || '',
      min: field.validation?.min ?? '',
      max: field.validation?.max ?? '',
      pattern: field.validation?.pattern || '',
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/catalogs" className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader
          title={catalog ? `${catalog.name} — Fields` : 'Catalog Fields'}
          description="Define the data schema for this catalog's records"
          actions={<Btn icon={Plus} onClick={() => setShowCreate(true)}>Add Field</Btn>}
        />
      </div>

      {/* Type legend */}
      <div className="flex flex-wrap gap-2">
        {FIELD_TYPES.map((t) => {
          const Icon = t.icon;
          return (
            <span key={t.value} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 px-2 py-1 text-xs text-slate-400">
              <Icon className="h-3 w-3" />{t.label}
            </span>
          );
        })}
      </div>

      {/* Field list */}
      {isLoading ? (
        <PageLoader />
      ) : fields.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No fields yet"
          description="Add your first field to define what data this catalog collects"
          action={<Btn icon={Plus} onClick={() => setShowCreate(true)}>Add First Field</Btn>}
        />
      ) : (
        <div className="space-y-2">
          {fields.map((field, i) => (
            <FieldRow
              key={field._id}
              field={field}
              index={i}
              onEdit={(f) => setEditField(f)}
              onDelete={setDeleteField}
              onToggle={handleToggle}
            />
          ))}
          <p className="pt-2 text-xs text-slate-500 text-right">{fields.length} field{fields.length !== 1 ? 's' : ''} defined</p>
        </div>
      )}

      {/* Modals */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Field" size="lg">
        <FieldForm onSubmit={handleCreate} loading={createMut.isPending} />
      </Modal>

      <Modal open={!!editField} onClose={() => setEditField(null)} title="Edit Field" size="lg">
        {editField && (
          <FieldForm
            onSubmit={handleUpdate}
            loading={updateMut.isPending}
            defaultValues={getEditDefaults(editField)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteField}
        onClose={() => setDeleteField(null)}
        onConfirm={handleDelete}
        loading={deleteMut.isPending}
        danger
        title="Delete Field"
        description={`Delete the field "${deleteField?.label}"? Existing record data for this field will remain but this field will no longer appear in forms.`}
      />
    </div>
  );
}
