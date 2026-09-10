'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
    useCatalogs,
    useOrganizations,
} from '../../../../hooks/usePhaseTwo';

import { useCreateTemplate } from '../../../../hooks/useTemplates';

import { CARD_PRESETS } from '../../../../lib/cardDimensions';

import {
    Btn,
    FormField,
    PageHeader,
    selectClass,
    inputClass,
} from '../../../../components/ui';

const INITIAL_FORM = {
    name: '',
    catalog: '',
    preset: 'CR80',
    orientation: 'landscape',
    width: 85.6,
    height: 53.98,
    unit: 'mm',
    description: '',
};

export default function CreateTemplatePage() {
    const router = useRouter();

    const [organization, setOrganization] = useState('');
    const [form, setForm] = useState(INITIAL_FORM);

    const { data: organizationsData } = useOrganizations();

    const { data: catalogsData } = useCatalogs(
        organization ? { organization } : {}
    );

    const createTemplate = useCreateTemplate();

    const organizations = organizationsData?.data || [];
    const catalogs = catalogsData?.data || [];

    const handleChange = (field, value) => {
        setForm((currentForm) => ({
            ...currentForm,
            [field]: value,
        }));
    };

    const handleOrganizationChange = (event) => {
        const organizationId = event.target.value;

        setOrganization(organizationId);

        handleChange('catalog', '');
    };

    const handlePresetChange = (presetKey) => {
        const preset = CARD_PRESETS[presetKey];

        if (!preset) return;

        setForm((currentForm) => ({
            ...currentForm,
            preset: presetKey,
            width: preset.width,
            height: preset.height,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        createTemplate.mutate(
            {
                ...form,
                organization,
                width: Number(form.width),
                height: Number(form.height),
            },
            {
                onSuccess: (response) => {
                    const templateId = response?.data?.data?._id;

                    if (templateId) {
                        router.push(
                            `/dashboard/templates/${templateId}/designer`
                        );
                    }
                },
            }
        );
    };

    return (
        <div className="max-w-2xl space-y-6">
            <PageHeader
                title="Create ID card template"
                description="Create a draft and then design both sides visually."
            />

            <form
                onSubmit={handleSubmit}
                className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/30 p-6"
            >
                {/* Organization */}
                <FormField label="Organization" required>
                    <select
                        required
                        value={organization}
                        onChange={handleOrganizationChange}
                        className={selectClass}
                    >
                        <option value="">Select organization</option>

                        {organizations.map((organization) => (
                            <option
                                key={organization._id}
                                value={organization._id}
                            >
                                {organization.name}
                            </option>
                        ))}
                    </select>
                </FormField>

                {/* Catalog */}
                <FormField label="Catalog" required>
                    <select
                        required
                        disabled={!organization}
                        value={form.catalog}
                        onChange={(event) =>
                            handleChange('catalog', event.target.value)
                        }
                        className={selectClass}
                    >
                        <option value="">Select catalog</option>

                        {catalogs.map((catalog) => (
                            <option
                                key={catalog._id}
                                value={catalog._id}
                            >
                                {catalog.name}
                            </option>
                        ))}
                    </select>
                </FormField>

                {/* Template Name */}
                <FormField label="Template name" required>
                    <input
                        required
                        value={form.name}
                        onChange={(event) =>
                            handleChange('name', event.target.value)
                        }
                        className={inputClass}
                        placeholder="Standard Student Card"
                    />
                </FormField>

                {/* Card Preset */}
                <FormField label="Card size">
                    <select
                        value={form.preset}
                        onChange={(event) =>
                            handlePresetChange(event.target.value)
                        }
                        className={selectClass}
                    >
                        {Object.entries(CARD_PRESETS).map(
                            ([presetKey, preset]) => (
                                <option
                                    key={presetKey}
                                    value={presetKey}
                                >
                                    {preset.name}
                                </option>
                            )
                        )}
                    </select>
                </FormField>

                {/* Dimensions & Orientation */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FormField label="Width">
                        <input
                            type="number"
                            min="1"
                            step="0.01"
                            value={form.width}
                            onChange={(event) =>
                                handleChange('width', event.target.value)
                            }
                            className={inputClass}
                        />
                    </FormField>

                    <FormField label="Height">
                        <input
                            type="number"
                            min="1"
                            step="0.01"
                            value={form.height}
                            onChange={(event) =>
                                handleChange('height', event.target.value)
                            }
                            className={inputClass}
                        />
                    </FormField>

                    <FormField label="Orientation">
                        <select
                            value={form.orientation}
                            onChange={(event) =>
                                handleChange(
                                    'orientation',
                                    event.target.value
                                )
                            }
                            className={selectClass}
                        >
                            <option value="landscape">
                                Landscape
                            </option>

                            <option value="portrait">
                                Portrait
                            </option>
                        </select>
                    </FormField>
                </div>

                {/* Description */}
                <FormField label="Description">
                    <textarea
                        value={form.description}
                        onChange={(event) =>
                            handleChange('description', event.target.value)
                        }
                        className={inputClass}
                        rows={4}
                        placeholder="Optional description for this template"
                    />
                </FormField>

                {/* Error */}
                {createTemplate.error && (
                    <p className="text-sm text-red-400">
                        {createTemplate.error.displayMessage ||
                            'Failed to create template.'}
                    </p>
                )}

                {/* Submit */}
                <div className="flex justify-end">
                    <Btn
                        type="submit"
                        loading={createTemplate.isPending}
                    >
                        Create draft & open designer
                    </Btn>
                </div>
            </form>
        </div>
    );
}