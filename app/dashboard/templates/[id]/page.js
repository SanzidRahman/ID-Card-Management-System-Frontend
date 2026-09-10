'use client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Archive, ArrowLeft, Clock, Copy, ExternalLink, Paintbrush, Send, Settings, Trash2, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { useArchiveTemplate, useDeleteTemplate, useDuplicateTemplate, usePublishTemplate, useTemplate } from '@/hooks/useTemplates';
import { Btn, Card, PageHeader, PageLoader } from '@/components/ui';

const statusConfig = {
  draft:     { label: 'Draft',     color: 'text-amber-400',   bg: 'bg-amber-500/10',   icon: FileText },
  published: { label: 'Published', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle },
  archived:  { label: 'Archived',  color: 'text-slate-400',   bg: 'bg-slate-500/10',   icon: Archive },
};

export default function TemplateDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: result, isLoading } = useTemplate(id);
  const template = result?.data;
  const del = useDeleteTemplate();
  const dup = useDuplicateTemplate();
  const pub = usePublishTemplate();
  const arc = useArchiveTemplate();

  if (isLoading) return <PageLoader />;
  if (!template) return (
    <div className="py-20 text-center text-slate-400">
      <AlertCircle className="mx-auto mb-3 h-10 w-10 opacity-40" />
      Template not found.
    </div>
  );

  const s = statusConfig[template.status] || statusConfig.draft;
  const StatusIcon = s.icon;

  const handleDelete = async () => {
    if (!confirm(`Permanently delete "${template.name}"? This cannot be undone.`)) return;
    del.mutate({ id }, { onSuccess: () => router.push('/dashboard/templates') });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/templates" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader
          title={template.name}
          description={template.description || `${template.orientation} · ${template.width} × ${template.height} ${template.unit} · v${template.version}`}
          actions={
            <div className="flex flex-wrap gap-2">
              <Link href={`/dashboard/templates/${id}/designer`}>
                <Btn icon={Paintbrush}>Open Designer</Btn>
              </Link>
              <Link href={`/dashboard/templates/${id}/preview`}>
                <Btn variant="secondary" icon={ExternalLink}>Preview</Btn>
              </Link>
            </div>
          }
        />
      </div>

      {/* Status bar */}
      <div className={`flex items-center gap-3 rounded-xl ${s.bg} border border-slate-700/50 px-5 py-3`}>
        <StatusIcon className={`h-5 w-5 ${s.color}`} />
        <span className={`text-sm font-medium ${s.color}`}>{s.label}</span>
        <span className="text-xs text-slate-500 ml-auto">Version {template.version}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Info Card */}
        <Card className="p-6 space-y-4 lg:col-span-2">
          <h3 className="font-semibold text-slate-200">Template details</h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ['Organization', template.organization?.name],
              ['Catalog', template.catalog?.name],
              ['Orientation', template.orientation],
              ['Dimensions', `${template.width} × ${template.height} ${template.unit}`],
              ['Unit', template.unit?.toUpperCase()],
              ['Has back side', template.hasBack ? 'Yes' : 'No'],
              ['Created by', template.createdBy?.name],
              ['Created', template.createdAt ? new Date(template.createdAt).toLocaleDateString() : '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="mt-0.5 text-slate-200">{value || '—'}</dd>
              </div>
            ))}
          </dl>

          {template.publicFields?.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Public verification fields</p>
              <div className="flex flex-wrap gap-1.5">
                {template.publicFields.map(f => (
                  <span key={f} className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300">{f}</span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Actions Card */}
        <Card className="p-6 space-y-3">
          <h3 className="font-semibold text-slate-200">Actions</h3>
          <Link href={`/dashboard/templates/${id}/edit`} className="flex w-full items-center gap-3 rounded-xl p-3 text-sm text-slate-300 hover:bg-slate-800 transition-colors">
            <Settings className="h-4 w-4 text-slate-500" />
            Edit metadata
          </Link>
          <Link href={`/dashboard/templates/${id}/designer`} className="flex w-full items-center gap-3 rounded-xl p-3 text-sm text-slate-300 hover:bg-slate-800 transition-colors">
            <Paintbrush className="h-4 w-4 text-blue-400" />
            Open visual designer
          </Link>
          <button
            onClick={() => dup.mutate({ id })}
            disabled={dup.isPending}
            className="flex w-full items-center gap-3 rounded-xl p-3 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <Copy className="h-4 w-4 text-slate-500" />
            Duplicate
          </button>
          {template.status !== 'published' && (
            <button
              onClick={() => pub.mutate({ id })}
              disabled={pub.isPending}
              className="flex w-full items-center gap-3 rounded-xl p-3 text-sm text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            >
              <Send className="h-4 w-4" />
              {pub.isPending ? 'Publishing…' : 'Publish template'}
            </button>
          )}
          {template.status !== 'archived' && (
            <button
              onClick={() => arc.mutate({ id })}
              disabled={arc.isPending}
              className="flex w-full items-center gap-3 rounded-xl p-3 text-sm text-amber-400 hover:bg-amber-500/10 transition-colors"
            >
              <Archive className="h-4 w-4" />
              Archive
            </button>
          )}
          <Link href={`/dashboard/templates/${id}/versions`} className="flex w-full items-center gap-3 rounded-xl p-3 text-sm text-slate-300 hover:bg-slate-800 transition-colors">
            <Clock className="h-4 w-4 text-slate-500" />
            Version history
          </Link>
          <div className="border-t border-slate-800 pt-2 mt-2">
            <button
              onClick={handleDelete}
              disabled={del.isPending}
              className="flex w-full items-center gap-3 rounded-xl p-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              {del.isPending ? 'Deleting…' : 'Delete template'}
            </button>
          </div>
        </Card>
      </div>

      {/* Error display */}
      {pub.error && <p className="text-sm text-red-400">{pub.error.displayMessage}</p>}
    </div>
  );
}
