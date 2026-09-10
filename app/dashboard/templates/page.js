'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    Archive,
    Copy,
    Eye,
    Paintbrush,
    Plus,
    Send,
    Trash2,
} from 'lucide-react';

import {
    useArchiveTemplate,
    useDeleteTemplate,
    useDuplicateTemplate,
    usePublishTemplate,
    useTemplates,
} from '../../../hooks/useTemplates';

import {
    Btn,
    EmptyState,
    PageHeader,
    PageLoader,
    SearchInput,
} from '../../../components/ui';

const STATUS_CLASS = {
    draft: 'bg-amber-500/10 text-amber-400',
    published: 'bg-emerald-500/10 text-emerald-400',
    archived: 'bg-slate-500/10 text-slate-400',
};

export default function TemplatesPage() {
    const [search, setSearch] = useState('');

    const { data, isLoading } = useTemplates({ search });

    const deleteTemplate = useDeleteTemplate();
    const duplicateTemplate = useDuplicateTemplate();
    const publishTemplate = usePublishTemplate();
    const archiveTemplate = useArchiveTemplate();

    const templates = data?.data || [];

    const handleDelete = (template) => {
        const confirmed = confirm(`Delete ${template.name}?`);

        if (confirmed) {
            deleteTemplate.mutate({
                id: template._id,
            });
        }
    };

    const handleDuplicate = (id) => {
        duplicateTemplate.mutate({ id });
    };

    const handlePublish = (id) => {
        publishTemplate.mutate({ id });
    };

    const handleArchive = (id) => {
        archiveTemplate.mutate({ id });
    };

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="ID Card Templates"
                description="Reusable card designs connected to your dynamic catalogs"
                actions={
                    <Link href="/dashboard/templates/create">
                        <Btn icon={Plus}>Create template</Btn>
                    </Link>
                }
            />

            <div className="max-w-md">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search templates…"
                />
            </div>

            {!templates.length ? (
                <EmptyState
                    icon={Paintbrush}
                    title="No templates yet"
                    description="Create a draft, then open the visual designer to map catalog fields."
                    action={
                        <Link href="/dashboard/templates/create">
                            <Btn icon={Plus}>Create template</Btn>
                        </Link>
                    }
                />
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
                                <th className="p-4">Template</th>
                                <th className="p-4">Catalog</th>
                                <th className="p-4">Size</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Version</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {templates.map((template) => {
                                const statusClass =
                                    STATUS_CLASS[template.status] ||
                                    'bg-slate-500/10 text-slate-400';

                                return (
                                    <tr
                                        key={template._id}
                                        className="border-b border-slate-800/60"
                                    >
                                        <td className="p-4">
                                            <p className="font-medium text-slate-100">
                                                {template.name}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                {template.organization?.name}
                                            </p>
                                        </td>

                                        <td className="p-4 text-slate-300">
                                            {template.catalog?.name}
                                        </td>

                                        <td className="p-4 text-slate-400">
                                            {template.width} × {template.height} {template.unit}
                                        </td>

                                        <td className="p-4">
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs ${statusClass}`}
                                            >
                                                {template.status}
                                            </span>
                                        </td>

                                        <td className="p-4 text-slate-400">
                                            v{template.version}
                                        </td>

                                        <td className="p-4">
                                            <div className="flex gap-1">
                                                <Link
                                                    href={`/dashboard/templates/${template._id}/designer`}
                                                    className="rounded p-2 text-blue-400 hover:bg-slate-800"
                                                    title="Open Designer"
                                                >
                                                    <Paintbrush size={16} />
                                                </Link>

                                                <Link
                                                    href={`/dashboard/templates/${template._id}/preview`}
                                                    className="rounded p-2 text-slate-300 hover:bg-slate-800"
                                                    title="Preview Template"
                                                >
                                                    <Eye size={16} />
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDuplicate(template._id)
                                                    }
                                                    className="rounded p-2 text-slate-300 hover:bg-slate-800"
                                                    title="Duplicate Template"
                                                >
                                                    <Copy size={16} />
                                                </button>

                                                {template.status !== 'published' && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handlePublish(template._id)
                                                        }
                                                        className="rounded p-2 text-emerald-400 hover:bg-slate-800"
                                                        title="Publish Template"
                                                    >
                                                        <Send size={16} />
                                                    </button>
                                                )}

                                                {template.status !== 'archived' && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleArchive(template._id)
                                                        }
                                                        className="rounded p-2 text-amber-400 hover:bg-slate-800"
                                                        title="Archive Template"
                                                    >
                                                        <Archive size={16} />
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(template)
                                                    }
                                                    className="rounded p-2 text-red-400 hover:bg-slate-800"
                                                    title="Delete Template"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}