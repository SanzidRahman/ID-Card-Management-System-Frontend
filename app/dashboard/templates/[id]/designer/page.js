'use client';

import IDCardDesigner from '@/components/id-card-designer/IDCardDesigner';
import { PageHeader, PageLoader } from '@/components/ui';
import { useCatalogFields } from '@/hooks/usePhaseTwo';
import { useTemplate, useUpdateTemplate } from '@/hooks/useTemplates';
import { useParams } from 'next/navigation';

export default function DesignerPage() {
    const { id } = useParams();

    const { data: result, isLoading } = useTemplate(id);

    const template = result?.data;

    const catalogId =
        typeof template?.catalog === 'string'
            ? template.catalog
            : template?.catalog?._id;

    const { data: fields } = useCatalogFields(catalogId);

    const update = useUpdateTemplate();

    if (isLoading) {
        return <PageLoader />;
    }

    if (!template) {
        return null;
    }

    const handleSave = (design) => {
        update.mutate({
            id,
            ...design,
        });
    };

    return (
        <div className="space-y-5">
            <PageHeader
                title={`Designer — ${template.name}`}
                description="Changes stay local until you save the draft."
            />

            <IDCardDesigner
                template={template}
                fields={fields?.data || []}
                saving={update.isPending}
                onSave={handleSave}
            />
        </div>
    );
}