import { apiClient } from './client'

export interface MediaUploadResponse {
  url: string
}

export const mediaApi = {
  /**
   * Upload temporaire sans entité liée (utilisé avant la création d'un produit).
   * Route backend : POST /media/upload
   */
  uploadTemporary: async (file: File): Promise<MediaUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<MediaUploadResponse>(
      '/media/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    return response.data
  },

  /**
   * Upload d'une image pour un produit existant (multipart/form-data).
   * Route backend : POST /media/upload/produit/:productId
   */
  uploadProductImage: async (
    productId: string,
    file: File
  ): Promise<MediaUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<MediaUploadResponse>(
      `/media/upload/produit/${productId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    return response.data
  },

  /**
   * Upload d'une image pour une catégorie existante (multipart/form-data).
   * Route backend : POST /media/upload/categorie/:categoryId
   */
  uploadCategoryImage: async (
    categoryId: string,
    file: File
  ): Promise<MediaUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<MediaUploadResponse>(
      `/media/upload/categorie/${categoryId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    return response.data
  },
}
