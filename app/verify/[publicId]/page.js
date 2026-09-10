'use client';

import { useParams } from 'next/navigation';
import { CheckCircle2, ShieldAlert, XCircle } from 'lucide-react';

import { useVerifyCard } from '../../../hooks/useTemplates';

export default function VerifyPage() {
    const { publicId } = useParams();
    const { data, isLoading } = useVerifyCard(publicId);

    const result = data?.data;
    const status = result?.status;
    const isValid = result?.valid;

    if (isLoading) {
        return (
            <main className="grid min-h-screen place-items-center bg-slate-950 text-slate-300">
                Verifying card…
            </main>
        );
    }

    const cardConfig = {
        valid: {
            title: 'Valid ID Card',
            icon: <CheckCircle2 className="h-12 w-12 text-emerald-400" />,
        },
        expired: {
            title: 'Expired ID Card',
            icon: <ShieldAlert className="h-12 w-12 text-amber-400" />,
        },
        revoked: {
            title: 'Revoked ID Card',
            icon: <XCircle className="h-12 w-12 text-red-400" />,
        },
        invalid: {
            title: 'Invalid ID Card',
            icon: <XCircle className="h-12 w-12 text-red-400" />,
        },
    };

    const cardStatus = isValid
        ? cardConfig.valid
        : cardConfig[status] || cardConfig.invalid;

    return (
        <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-slate-100">
            <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center shadow-2xl">
                <div className="mx-auto mb-4 w-fit">{cardStatus.icon}</div>

                <h1 className="text-2xl font-bold">{cardStatus.title}</h1>

                <p className="mt-2 text-sm text-slate-400">
                    {result?.message || 'This card could not be verified.'}
                </p>

                {result?.organization && (
                    <div className="mt-6 border-t border-slate-800 pt-5">
                        <p className="text-xs uppercase tracking-wider text-slate-500">
                            Organization
                        </p>

                        <p className="mt-1 font-semibold">
                            {result.organization.name}
                        </p>
                    </div>
                )}

                {isValid && (
                    <div className="mt-5 space-y-3 text-left">
                        {Object.entries(result.holder || {}).map(([key, value]) => (
                            <div
                                key={key}
                                className="flex justify-between gap-4 border-b border-slate-800 pb-2 text-sm"
                            >
                                <span className="capitalize text-slate-500">
                                    {key.replace(/([A-Z])/g, ' $1')}
                                </span>

                                <span className="max-w-[60%] text-right text-slate-200">
                                    {String(value)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}