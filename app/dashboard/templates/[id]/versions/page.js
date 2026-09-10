'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import { useTemplate, useTemplateVersions } from '@/hooks/useTemplates';
import { Card, PageHeader, PageLoader } from '@/components/ui';

export default function VersionsPage() {
  const { id } = useParams();
  const { data: result, isLoading: loadingTemplate } = useTemplate(id);
  const { data: vData, isLoading: loadingVersions } = useTemplateVersions(id);
  const template = result?.data;
  const versions = vData?.data || [];
  const currentVersion = vData?.currentVersion;

  if (loadingTemplate || loadingVersions) return <PageLoader />;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/templates/${id}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader
          title="Version history"
          description={`${template?.name} · Current version: v${currentVersion}`}
        />
      </div>

      {/* Current version card */}
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-200">v{currentVersion} — Current</p>
            <p className="text-xs text-slate-500">This is the active template that the designer uses</p>
          </div>
          <Link href={`/dashboard/templates/${id}/designer`} className="ml-auto text-sm text-blue-400 hover:underline">
            Open Designer
          </Link>
        </div>
      </Card>

      {/* Past versions */}
      {versions.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 px-6 py-14 text-center text-slate-500 text-sm">
          No previous versions yet. Versions are created each time a published template is edited and saved.
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-400">Previous versions (snapshots)</h3>
          {versions.map((v) => (
            <Card key={v._id} className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-400 text-sm font-bold">
                  v{v.version}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-200">Version {v.version}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Snapshot saved on {new Date(v.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {v.createdBy && (
                    <p className="text-xs text-slate-500">by {v.createdBy.name}</p>
                  )}
                </div>
                <div className="flex flex-shrink-0 items-center gap-3 text-xs text-slate-500">
                  <span>{v.snapshot?.front?.elements?.length ?? 0} front elements</span>
                  {v.snapshot?.hasBack && <span>· {v.snapshot?.back?.elements?.length ?? 0} back elements</span>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
