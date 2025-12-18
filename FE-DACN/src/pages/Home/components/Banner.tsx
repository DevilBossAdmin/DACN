import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/swiper-bundle.css";
import {
  FaMobileAlt,
  FaTags,
  FaEnvelope,
  FaStore,
  FaBuilding,
  FaRegNewspaper,
  FaSyncAlt,
  FaBolt,
  FaHome,
  FaChevronRight,
} from "react-icons/fa";

import { useBannerSync } from "../../../hooks/useBannerSync";
import { Link } from "react-router-dom";

interface BannerSectionProps {
  selectedMenu: string;
  setSelectedMenu: React.Dispatch<React.SetStateAction<string>>;
}

interface BannerItem {
  _id?: string;
  id?: number;
  image: string;
  link: string;
  title?: string;
}

const localBanners: BannerItem[] = [
  { id: 1, image: "/assets/banner/galaxy_z7.jpg", link: "#", title: "GALAXY Z7 SERIES" },
  { id: 2, image: "/assets/banner/iPhone-16Pro.jpg", link: "#", title: "IPHONE 16 PRO MAX" },
  { id: 3, image: "/assets/banner/reno14.jpg", link: "#", title: "OPPO RENO14" },
  { id: 4, image: "/assets/banner/xiaomi.jpg", link: "#", title: "XIAOMI" },
  { id: 5, image: "/assets/banner/pova-14.webp", link: "#", title: "TECNO POVA 7" },
];

const sideBanners: BannerItem[] = [
  { id: 101, image: "/assets/side/lenovo-loq.jpg", link: "#" },
  { id: 102, image: "/assets/side/macbook-air.webp", link: "#" },
  { id: 103, image: "/assets/side/HP-Pavilion.jpeg", link: "#" },
];

const leftMenu = [
  { id: 0, name: "Trang chủ", icon: <FaHome />, link: "/" },
  { id: 1, name: "Điện thoại", icon: <FaMobileAlt />, link: "/products" },
  { id: 2, name: "Hãng điện thoại", icon: <FaBuilding />, link: "/dien-thoai" },
  { id: 3, name: "Mã giảm giá", icon: <FaTags />, link: "/vouchers" },
  { id: 4, name: "Liên hệ với chúng tôi", icon: <FaEnvelope />, link: "/contact" },
  { id: 5, name: "Thông tin cửa hàng", icon: <FaStore />, link: "/services" },
  { id: 6, name: "Tin công nghệ", icon: <FaRegNewspaper />, link: "/#tech-news-section" },
  { id: 7, name: "Thu cũ đổi mới", icon: <FaSyncAlt />, link: "/services" },
  { id: 8, name: "Sản phẩm đang sale", icon: <FaBolt />, link: "/products" },
];

const BannerSection: React.FC<BannerSectionProps> = ({
  selectedMenu,
  setSelectedMenu,
}) => {
  const swiperRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { banners: apiBanners } = useBannerSync();

  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:8888/api/category?limit=1000");
        const data = await res.json();
        setCategories(data.data || []);
      } catch (error) {
        console.error("❌ Lỗi khi lấy danh mục:", error);
      }
    };

    if (selectedMenu === "Điện thoại") fetchCategories();
  }, [selectedMenu]);

  const displayBanners: BannerItem[] = (() => {
    const raw = (apiBanners?.length ? apiBanners : localBanners) as BannerItem[];
    const valid = raw.filter((b) => b.image && b.image.trim() !== "");
    return valid.length ? valid : localBanners;
  })();

  const handleSlideChange = (swiper: any) => setActiveIndex(swiper.realIndex);

  // chiều rộng thanh gạch đỏ, để nếu sau này số banner thay đổi vẫn chuẩn
  const underlineWidth =
    displayBanners.length > 0 ? `${100 / displayBanners.length}%` : "20%";

  return (
    <section className="w-full mb-10">
      <div className="grid grid-cols-12 gap-4">
        {/* MENU TRÁI */}
        <aside className="hidden md:block md:col-span-2">
          <div className="h-[440px] bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="px-3 py-2 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase">
                DANH MỤC NỔI BẬT
              </span>
            </div>
            <div className="flex-1 overflow-auto">
              <ul className="py-2 space-y-1">
                {leftMenu.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={item.link}
                      onClick={() => setSelectedMenu(item.name)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition
                        ${
                          selectedMenu === item.name
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                        }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-base">{item.icon}</span>
                        <span>{item.name}</span>
                      </span>
                      {(item.name === "Điện thoại" || item.name === "Hãng điện thoại") && (
                        <FaChevronRight className="text-gray-400 text-xs" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* BANNER GIỮA */}
        <div className="col-span-12 md:col-span-7">
          {/* khung giữa cao = 440px như 2 bên */}
          <div className="h-[440px] flex flex-col overflow-hidden rounded-2xl shadow-sm border border-gray-100 bg-white">
            {selectedMenu === "Điện thoại" ? (
              // Mega menu điện thoại
              <div className="flex-1 p-5 overflow-auto">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Danh mục điện thoại
                </h3>

                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500">Đang tải danh mục...</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map((cate) => (
                      <a
                        key={cate._id}
                        href={`/products?category=${cate._id}`}
                        className="block px-3 py-2 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-sm border border-transparent hover:border-blue-200 transition"
                      >
                        {cate.name}
                      </a>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setSelectedMenu("")}
                  className="mt-5 inline-flex items-center text-sm text-blue-600 hover:underline"
                >
                  ← Quay lại trang chủ
                </button>
              </div>
            ) : (
              <>
                {/* SLIDER – chiếm 360px */}
                <div className="h-[360px] px-4">
                  <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    slidesPerView={1}
                    navigation
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 3500 }}
                    loop={displayBanners.length > 1}
                    onSlideChange={handleSlideChange}
                    onSwiper={(swiper) => (swiperRef.current = swiper)}
                    className="h-full"
                  >
                    {displayBanners.map((banner) => (
                      <SwiperSlide key={banner._id || banner.id}>
                         <div className="w-full h-full flex items-center justify-center">
                         <img
                         src={banner.image}
                         alt={banner.title}
                        className="max-h-[320px] object-contain p-4"
                         />
                          </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>

                {/* ✅ TABS DƯỚI BANNER – GIỮ NGUYÊN KIỂU CŨ */}
                <div className="h-[80px] bg-gray-50 px-4 py-3 border-t border-gray-200 relative">
                  <div className="grid grid-cols-5 text-center h-full items-center">
                    {displayBanners.map((banner, index) => (
                      <button
                        key={banner._id || banner.id || index}
                        onClick={() => swiperRef.current?.slideToLoop(index)}
                        className={`font-medium text-[13px] md:text-sm transition relative
                          ${
                            activeIndex === index
                              ? "text-red-600 font-semibold"
                              : "text-gray-800 hover:text-red-500"
                          }`}
                      >
                        {banner.title || `Banner ${index + 1}`}
                      </button>
                    ))}
                  </div>

                  {/* gạch đỏ bên dưới tab đang active */}
                  <div
                    className="absolute bottom-0 left-0 h-[3px] bg-red-500 rounded-t-full transition-all duration-300"
                    style={{
                      width: underlineWidth,
                      transform: `translateX(${activeIndex * 100}%)`,
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* BANNER PHẢI */}
        <aside className="col-span-12 md:col-span-3">
          <div className="h-[440px] flex flex-col gap-3">
            {sideBanners.map((banner) => (
              <a
                key={banner.id}
                href={banner.link}
                className="flex-1 rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <img src={banner.image} className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
};

export default BannerSection;
