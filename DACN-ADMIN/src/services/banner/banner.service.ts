import axios from 'axios';
import type { Banner, CreateBannerRequest, UpdateBannerRequest } from '../../types/banner/banner.type';

const API_BASE_URL = 'http://localhost:8888/api';

export const bannerService = {
  // Lấy tất cả banners
  getBanners: async (): Promise<Banner[]> => {
    const response = await axios.get(`${API_BASE_URL}/banners`);
    const { data } = response.data;       // backend trả { data, total, page, limit }
    return Array.isArray(data) ? data : [];
  },

  // Lấy banner theo ID
  getBannerById: async (id: string): Promise<Banner> => {
    const response = await axios.get(`${API_BASE_URL}/banners/${id}`);
    return response.data.data;            // backend trả { data: {...} }
  },

  // Tạo banner mới
  createBanner: async (data: CreateBannerRequest): Promise<Banner> => {
    const response = await axios.post(`${API_BASE_URL}/banners`, data);
    return response.data.data;            // backend trả { data: {...} }
  },

  // Cập nhật banner
  updateBanner: async (id: string, data: UpdateBannerRequest): Promise<Banner> => {
    const response = await axios.put(`${API_BASE_URL}/banners/${id}`, data);
    return response.data.data;            // backend trả { data: {...} }
  },

  // Xóa banner
  deleteBanner: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/banners/${id}`);
  },

  // Lấy banners active
  getActiveBanners: async (): Promise<Banner[]> => {
    const response = await axios.get(`${API_BASE_URL}/banners`);
    const { data } = response.data;
    const banners = Array.isArray(data) ? data : [];
    return banners.filter((banner: Banner) => banner.isActive);
  },
};
