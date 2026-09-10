'use client';
import { Image } from 'lucide-react';
import { PageHeader, EmptyState } from '../../../components/ui';

export default function MediaPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Media Library" description="Manage uploaded images and files" />
      <EmptyState
        icon={Image}
        title="Media library coming soon"
        description="Uploaded logos, photos, and documents will appear here"
      />
    </div>
  );
}
