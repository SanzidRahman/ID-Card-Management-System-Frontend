'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// ─── Generic helpers ────────────────────────────────────────────────────────

const useCollection = (key, url, params = {}, enabled = true) =>
  useQuery({
    queryKey: [key, params],
    queryFn: async () => (await api.get(url, { params })).data,
    enabled,
  });

const useSingle = (key, url, enabled = true) =>
  useQuery({
    queryKey: [key],
    queryFn: async () => (await api.get(url)).data,
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

// ─── Organizations ──────────────────────────────────────────────────────────

export const useOrganizations = (params = {}) =>
  useCollection('organizations', '/organizations', params);

export const useOrganization = (id) =>
  useSingle(['organization', id], `/organizations/${id}`, Boolean(id));

export const useCreateOrganization = () =>
  useMut('organizations', (data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => v != null && fd.append(k, v));
    return api.post('/organizations', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  });

export const useUpdateOrganization = () =>
  useMut(['organizations', 'organization'], ({ id, ...data }) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => v != null && fd.append(k, v));
    return api.patch(`/organizations/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  });

export const useDeleteOrganization = () =>
  useMut('organizations', ({ id }) => api.delete(`/organizations/${id}`));

export const useToggleOrganizationStatus = () =>
  useMut('organizations', ({ id }) => api.patch(`/organizations/${id}/status`));

// ─── Catalogs ───────────────────────────────────────────────────────────────

export const useCatalogs = (params = {}) =>
  useCollection('catalogs', '/catalogs', params);

export const useCatalog = (id) =>
  useSingle(['catalog', id], `/catalogs/${id}`, Boolean(id));

export const useCreateCatalog = () =>
  useMut('catalogs', (data) => api.post('/catalogs', data));

export const useUpdateCatalog = () =>
  useMut(['catalogs', 'catalog'], ({ id, ...data }) => api.patch(`/catalogs/${id}`, data));

export const useDeleteCatalog = () =>
  useMut('catalogs', ({ id }) => api.delete(`/catalogs/${id}`));

export const useToggleCatalogStatus = () =>
  useMut('catalogs', ({ id }) => api.patch(`/catalogs/${id}/status`));

// ─── Catalog Fields ─────────────────────────────────────────────────────────

export const useCatalogFields = (catalogId) =>
  useCollection('catalog-fields', `/catalogs/${catalogId}/fields`, {}, Boolean(catalogId));

export const useCreateCatalogField = (catalogId) =>
  useMut('catalog-fields', (data) => api.post(`/catalogs/${catalogId}/fields`, data));

export const useUpdateCatalogField = () =>
  useMut('catalog-fields', ({ id, ...data }) => api.patch(`/catalog-fields/${id}`, data));

export const useDeleteCatalogField = () =>
  useMut('catalog-fields', ({ id }) => api.delete(`/catalog-fields/${id}`));

export const useToggleCatalogFieldStatus = () =>
  useMut('catalog-fields', ({ id }) => api.patch(`/catalog-fields/${id}/status`));

export const useReorderCatalogFields = () =>
  useMut('catalog-fields', (fields) => api.patch('/catalog-fields/reorder', { fields }));

// ─── Records ────────────────────────────────────────────────────────────────

export const useRecords = (params = {}, enabled = true) =>
  useCollection('records', '/records', params, enabled);

export const useRecord = (id) =>
  useSingle(['record', id], `/records/${id}`, Boolean(id));

export const useTrashedRecords = (params = {}) =>
  useCollection('records-trash', '/records/trash', params);

export const useCreateRecord = () =>
  useMut('records', (data) => {
    // Support FormData (when image fields present)
    if (data instanceof FormData) {
      return api.post('/records', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.post('/records', data);
  });

export const useUpdateRecord = () =>
  useMut(['records', 'record'], ({ id, ...data }) => {
    if (data instanceof FormData) {
      data.append('_method', 'PATCH');
      return api.patch(`/records/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.patch(`/records/${id}`, data);
  });

export const useDeleteRecord = () =>
  useMut(['records', 'records-trash'], ({ id }) => api.delete(`/records/${id}`));

export const useRestoreRecord = () =>
  useMut(['records', 'records-trash'], ({ id }) => api.patch(`/records/${id}/restore`));

export const usePermanentDeleteRecord = () =>
  useMut('records-trash', ({ id }) => api.delete(`/records/${id}/permanent`));

export const useBulkDeleteRecords = () =>
  useMut('records', (ids) => api.post('/records/bulk-delete', { ids }));

export const useBulkStatusRecords = () =>
  useMut('records', ({ ids, status }) => api.patch('/records/bulk-status', { ids, status }));

// CSV template download helper (not a hook, just a function)
export const downloadCsvTemplate = async (catalogId) => {
  const res = await api.get(`/catalogs/${catalogId}/csv-template`, { responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `template-${catalogId}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportRecordsCsv = async (catalogId) => {
  const res = await api.get('/records/export', { params: { catalogId }, responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `records-${catalogId}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importRecordsCsv = (catalogId, organization, file) => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('catalog', catalogId);
  fd.append('organization', organization);
  return api.post('/records/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
