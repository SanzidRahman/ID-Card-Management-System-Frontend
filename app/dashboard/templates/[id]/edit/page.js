'use client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useTemplate, useUpdateTemplate } from '@/hooks/useTemplates';
import { useCatalogFields } from '@/hooks/usePhaseTwo';
import { Btn, FormField, inputClass, PageHeader, PageLoader, selectClass } from '@/components/ui';
import { CARD_PRESETS } from '@/lib/cardDimensions';

export default function EditTemplatePage() {
  const { id } = useParams();
  const { data: result, isLoading } = useTemplate(id);
  const template = result?.data;
  const { data: fieldsData } = useCatalogFields(template?.catalog?._id || template?.catalog);
  const fields = fieldsData?.data || [];

  if (isLoading || !template) return <PageLoader />;
  return <EditTemplateForm key={template._id} id={id} template={template} fields={fields} />;
}

function EditTemplateForm({ id, template, fields }) {
  const router = useRouter();
  const update = useUpdateTemplate();
  const [form, setForm] = useState(() => ({
    name: template.name || '',
    description: template.description || '',
    orientation: template.orientation || 'landscape',
    width: template.width || 85.6,
    height: template.height || 53.98,
    unit: template.unit || 'mm',
    publicFields: template.publicFields || [],
  }));

  const change = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const togglePublicField = (name) => {
    const cur = form.publicFields || [];
    change('publicFields', cur.includes(name) ? cur.filter(x => x !== name) : [...cur, name]);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    update.mutate(
      { id, ...form, width: Number(form.width), height: Number(form.height) },
      { onSuccess: () => router.push(`/dashboard/templates/${id}`) }
    );
  };

  const applyPreset = (key) => {
    const p = CARD_PRESETS[key];
    if (p) change('width', p.width), change('height', p.height);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/templates/${id}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title="Edit template metadata" description="Update name, description, dimensions, and verification settings." />
      </div>

      <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
        <FormField label="Template name" required>
          <input required value={form.name} onChange={e => change('name', e.target.value)} className={inputClass} placeholder="Standard Student Card" />
        </FormField>

        <FormField label="Description">
          <textarea rows={3} value={form.description} onChange={e => change('description', e.target.value)} className={inputClass} placeholder="Optional description…" />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Orientation">
            <select value={form.orientation} onChange={e => change('orientation', e.target.value)} className={selectClass}>
              <option value="landscape">Landscape</option>
              <option value="portrait">Portrait</option>
            </select>
          </FormField>
          <FormField label="Quick preset">
            <select onChange={e => applyPreset(e.target.value)} className={selectClass} defaultValue="">
              <option value="">Apply preset…</option>
              {Object.entries(CARD_PRESETS).map(([k, p]) => <option key={k} value={k}>{p.name}</option>)}
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Width">
            <input type="number" min="1" step="0.01" value={form.width} onChange={e => change('width', e.target.value)} className={inputClass} />
          </FormField>
          <FormField label="Height">
            <input type="number" min="1" step="0.01" value={form.height} onChange={e => change('height', e.target.value)} className={inputClass} />
          </FormField>
          <FormField label="Unit">
            <select value={form.unit} onChange={e => change('unit', e.target.value)} className={selectClass}>
              <option value="mm">mm</option>
              <option value="px">px</option>
            </select>
          </FormField>
        </div>

        {/* Public fields for QR verification */}
        {fields.length > 0 && (
          <FormField label="Public verification fields" hint="These fields will be visible on the public verification page when someone scans the QR code.">
            <div className="grid grid-cols-2 gap-2 mt-2">
              {fields.map(f => (
                <label key={f._id} className="flex items-center gap-2.5 cursor-pointer rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2 hover:border-slate-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.publicFields.includes(f.name)}
                    onChange={() => togglePublicField(f.name)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-blue-500"
                  />
                  <span className="text-sm text-slate-300">{f.label}</span>
                  <span className="ml-auto text-xs text-slate-500">{f.type}</span>
                </label>
              ))}
            </div>
          </FormField>
        )}

        {update.error && <p className="text-sm text-red-400">{update.error.displayMessage}</p>}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href={`/dashboard/templates/${id}`}>
            <Btn variant="secondary">Cancel</Btn>
          </Link>
          <Btn type="submit" loading={update.isPending}>Save changes</Btn>
        </div>
      </form>
    </div>
  );
}
