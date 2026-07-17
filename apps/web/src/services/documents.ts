import { apiService } from '@/lib/api/client';
import { API_CONFIG } from '@/lib/api/endpoints';

export interface DocumentDTO {
  id: string;
  name: string;
  type?: string;
  size?: number;
  url?: string;
  shipmentId?: string;
  userId?: string;
  createdAt?: string;
}

export const DocumentsService = {
  async list(shipmentId: string) {
    const { success, data, error } = await apiService.request<{ documents: DocumentDTO[] }>({
      method: 'GET',
      url: '/documents',
      params: { shipmentId },
    });
    if (!success || !data) throw new Error(error || 'Failed to load documents');
    return data.documents;
  },

  async upload(shipmentId: string, file: File, onProgress?: (e: any) => void) {
    const form = new FormData();
    form.append('shipmentId', shipmentId);
    form.append('file', file);
    const { success, data, error } = await apiService.uploadForm<{ document: DocumentDTO }>(
      '/documents/upload',
      form,
      onProgress,
    );
    if (!success || !data) throw new Error(error || 'Failed to upload document');
    return data.document;
  },

  async delete(id: string) {
    const { success, error } = await apiService.request<{ message: string }>({
      method: 'DELETE',
      url: `/documents/${id}`,
    });
    if (!success) throw new Error(error || 'Failed to delete document');
  },

  downloadUrl(doc: DocumentDTO) {
    return `${API_CONFIG.baseURL}/documents/${doc.id}/download`;
  },
};