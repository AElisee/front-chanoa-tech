import { apiClient } from './client'

export interface MediaUploadResponse {
  url: string
}

function authHeaders(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const mediaApi = {
  uploadTemporary: async (file: File, token?: string): Promise<MediaUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post<MediaUploadResponse>(
      '/media/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data', ...authHeaders(token) } },
    )
    return response.data
  },

  uploadProductImage: async (
    productId: string,
    file: File,
    token?: string,
  ): Promise<MediaUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post<MediaUploadResponse>(
      `/media/upload/produit/${productId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data', ...authHeaders(token) } },
    )
    return response.data
  },

  uploadCategoryImage: async (
    categoryId: string,
    file: File,
    token?: string,
  ): Promise<MediaUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post<MediaUploadResponse>(
      `/media/upload/categorie/${categoryId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data', ...authHeaders(token) } },
    )
    return response.data
  },
}
