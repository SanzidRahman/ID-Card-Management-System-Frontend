'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// ─── Generic helpers (same pattern as usePhaseTwo.js) ────────────────────────

const useCol = (key, url, params = {}, enabled = true) =>
  useQuery({
    queryKey: [key, params],
    queryFn: async () => (await api.get(url, { params })).data,
    enabled,
  });

const useMut = (queryKeys, fn) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      const keys = Array.isArray(queryKeys) ? queryKeys : [queryKeys];
      keys.forEach((k) => client.invalidateQueries({ queryKey: [k] }));
    },
  });
};

// ─── Templates ──────────────────────────────────────────────────────────────

export const useTemplates = (params = {}) =>
  useCol('id-card-templates', '/id-card-templates', params);

export const useTemplate = (id) =>
  useQuery({
    queryKey: ['id-card-template', id],
    queryFn: async () => (await api.get(`/id-card-templates/${id}`)).data,
    enabled: Boolean(id),
  });

export const useCreateTemplate = () =>
  useMut('id-card-templates', (data) => api.post('/id-card-templates', data));

export const useUpdateTemplate = () =>
  useMut(['id-card-templates', 'id-card-template'], ({ id, ...data }) =>
    api.patch(`/id-card-templates/${id}`, data)
  );

export const useDeleteTemplate = () =>
  useMut('id-card-templates', ({ id }) => api.delete(`/id-card-templates/${id}`));

export const useDuplicateTemplate = () =>
  useMut('id-card-templates', ({ id }) => api.post(`/id-card-templates/${id}/duplicate`));

export const usePublishTemplate = () =>
  useMut(['id-card-templates', 'id-card-template'], ({ id }) =>
    api.post(`/id-card-templates/${id}/publish`)
  );

export const useArchiveTemplate = () =>
  useMut(['id-card-templates', 'id-card-template'], ({ id }) =>
    api.post(`/id-card-templates/${id}/archive`)
  );

export const useChangeTemplateStatus = () =>
  useMut(['id-card-templates', 'id-card-template'], ({ id, status }) =>
    api.patch(`/id-card-templates/${id}/status`, { status })
  );

export const useTemplateVersions = (id) =>
  useQuery({
    queryKey: ['template-versions', id],
    queryFn: async () => (await api.get(`/id-card-templates/${id}/versions`)).data,
    enabled: Boolean(id),
  });

export const useCreatePreviewCard = () =>
  useMut('preview-cards', ({ templateId, recordId }) =>
    api.post(`/id-card-templates/${templateId}/preview-card`, { recordId })
  );

// ─── Verification (public, no auth) ─────────────────────────────────────────

export const useVerifyCard = (publicId) =>
  useQuery({
    queryKey: ['verify-card', publicId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/verify/${publicId}`
      );
      return res.json();
    },
    enabled: Boolean(publicId),
    retry: false,
  });
