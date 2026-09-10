'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader, PageLoader, selectClass } from '@/components/ui';
import IDCardRenderer from '@/components/id-card/IDCardRenderer';
import { useCreatePreviewCard, useTemplate } from '@/hooks/useTemplates';
import { useRecords } from '@/hooks/usePhaseTwo';


export default function PreviewPage() {
    const { id } = useParams();

    const [recordId, setRecordId] = useState('');

    // Fetch template
    const { data: templateResponse, isLoading } = useTemplate(id);

    const template = templateResponse?.data;

    // Fetch records for the selected catalog
    const { data: recordsResponse } = useRecords(
        template?.catalog
            ? {
                catalog: template.catalog._id || template.catalog,
                limit: 20,
            }
            : {},
        Boolean(template)
    );

    const records = recordsResponse?.data || [];

    // Find selected record
    const selectedRecord = records.find(
        (record) => record._id === recordId
    );

    // Create preview verification card
    const createPreviewCard = useCreatePreviewCard();

    if (isLoading) {
        return <PageLoader />;
    }

    const handleCreatePreviewCard = () => {
        if (!recordId) return;

        createPreviewCard.mutate({
            templateId: id,
            recordId,
        });
    };

    return (
        <div className="space-y-5">
            {/* Page Header */}
            <PageHeader
                title={`Preview — ${template?.name}`}
                description="Preview uses real catalog data without modifying the template."
            />

            {/* Record Selector */}
            <div className="max-w-lg">
                <select
                    value={recordId}
                    onChange={(event) => setRecordId(event.target.value)}
                    className={selectClass}
                >
                    <option value="">Select a preview record</option>

                    {records.map((record) => (
                        <option
                            key={record._id}
                            value={record._id}
                        >
                            {Object.values(record.data || {})
                                .slice(0, 3)
                                .join(' · ')}
                        </option>
                    ))}
                </select>

                {recordId && (
                    <button
                        type="button"
                        onClick={handleCreatePreviewCard}
                        className="mt-2 text-sm text-blue-400"
                    >
                        Create secure preview verification card
                    </button>
                )}
            </div>

            {/* Front Side */}
            <div className="overflow-auto rounded-2xl bg-slate-900/40 p-8">
                <IDCardRenderer
                    template={template}
                    record={selectedRecord}
                    className="mx-auto"
                />
            </div>

            {/* Back Side */}
            {template?.back && (
                <>
                    <h3 className="font-semibold text-slate-200">
                        Back
                    </h3>

                    <div className="overflow-auto rounded-2xl bg-slate-900/40 p-8">
                        <IDCardRenderer
                            template={template}
                            side="back"
                            record={selectedRecord}
                            className="mx-auto"
                        />
                    </div>
                </>
            )}
        </div>
    );
}