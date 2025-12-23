import { useState, useEffect, useCallback } from "react";
import axios from "axios";

interface Banner {
  _id?: string;
  id?: number;
  title?: string;
  image: string;
  description?: string;
  link?: string;
  isActive?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ✅ nên dùng env, fallback localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8888/api";

// Lấy origin BE để ghép ảnh /uploads/...
const BE_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export const useBannerSync = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeImage = (img?: string) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) return `${BE_ORIGIN}${img}`;     // ✅ /uploads/... -> http://localhost:8888/uploads/...
    return `${BE_ORIGIN}/${img}`;
  };

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/banners`);

      // ✅ Backend trả: { data, total, page, limit }
      const allBanners: Banner[] = response.data?.data || [];

      const activeBanners = allBanners
        .filter((banner) => banner.isActive === true)
        .map((b) => ({ ...b, image: normalizeImage(b.image) }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      setBanners(activeBanners);
    } catch (err) {
      setError("Không thể tải banner");
      console.error("Error fetching banners:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  useEffect(() => {
    const interval = setInterval(fetchBanners, 30000);
    return () => clearInterval(interval);
  }, [fetchBanners]);

  useEffect(() => {
    const handleBannerUpdate = () => fetchBanners();
    window.addEventListener("banners-updated", handleBannerUpdate);
    return () => window.removeEventListener("banners-updated", handleBannerUpdate);
  }, [fetchBanners]);

  return { banners, loading, error, refetch: fetchBanners };
};
