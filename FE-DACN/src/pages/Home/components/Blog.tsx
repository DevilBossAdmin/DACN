// src/pages/Home/components/Blog.tsx
import React from 'react';

const blogPosts = [
  {
    id: 1,
    title: "Đâu là điểm khác biệt giữa chip A18 và A18 Pro trên iPhone 16 series?",
    thumbnail: "/assets/news/iPhone-16Pro.jpg",
    date: "12/07/2025",
    url: "https://www.thegioididong.com/tin-tuc/so-sanh-chip-apple-a18-va-apple-a18-pro-dau-la-diem-khac-biet-1569986",
  },
  {
    id: 2,
    title: "So sánh Samsung Galaxy S25 Ultra và Samsung Galaxy S24 Ultra: Bản nâng cấp đáng giá hay chỉ là bước đi an toàn?",
    thumbnail: "/assets/news/s24-ultra.webp",
    date: "11/07/2025",
    url: "https://www.thegioididong.com/tin-tuc/so-sanh-samsung-galaxy-s25-ultra-va-samsung-galaxy-s24-ultra-1574872",
  },
  {
    id: 3,
    title: "TOP smartphone Android tầm trung mạnh nhất tháng 5: OnePlus Ace 3V tiếp tục dẫn đầu",
    thumbnail: "/assets/news/top5.jpg",
    date: "10/07/2025",
    url: "https://www.thegioididong.com/tin-tuc/top-10-smartphone-tam-trung-manh-nhat-thang-5-oneplus-ace-3v-dan-dau-1566562",
  },
];


const BlogSection: React.FC = () => {
  return (
    // THÊM id để có thể kéo scroll tới đúng section
    <section id="tech-news-section" style={{ marginTop: 40 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <h2 style={{ fontSize: 24 }}>📰 Tin tức công nghệ</h2>

        {/* 
          Sửa lại: thay vì /blog (route trắng), dùng anchor tới chính section này.
          Khi đang ở trang Home mà click vào "Xem tất cả" → cuộn xuống đúng phần này.
        */}
        <a href="https://www.thegioididong.com/tin-tuc" style={{ color: '#1890ff' }}>
          Xem tất cả
        </a>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}
      >
        {blogPosts.map((post) => (
          <div
            key={post.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: 8,
              overflow: 'hidden',
              backgroundColor: '#fff',
              cursor: 'pointer',
            }}
            // TRƯỚC ĐÂY: window.location.href = `/blog/${post.slug}`
            // BÂY GIỜ: mở link MXH ở tab mới
            onClick={() => window.open(post.url, '_blank')}
          >
            <img
              src={post.thumbnail}
              alt={post.title}
              style={{ width: '100%', height: 160, objectFit: 'cover' }}
            />
            <div style={{ padding: 12 }}>
              <div style={{ fontSize: 14, color: '#888', marginBottom: 6 }}>
                {post.date}
              </div>
              <h3 style={{ fontSize: 16 }}>{post.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BlogSection;
