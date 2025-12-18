import React from 'react';
import './Contact.css';
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from 'react-icons/fa';

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <div className="hero-content">
            <h1>Liên hệ với chúng tôi</h1>
            <p>
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi qua các kênh
              bên dưới
            </p>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="contact-layout">
          {/* Contact Information */}
          <div className="contact-info">
            <div className="info-card">
              <div className="info-icon">
                <FaMapMarkerAlt />
              </div>
              <h3>Địa chỉ</h3>
              <p>Trường Đại Học Công Nghệ Đông Á</p>
              <p>Tào Nhà Polyco, đường Trịnh Văn Bô, quận Nam Từ Liêm, thành phố Hà Nội</p>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <FaPhone />
              </div>
              <h3>Điện thoại</h3>
              <p>Hotline: 1900 1234</p>
              <p>Hỗ trợ: 083.267.2005</p>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <FaEnvelope />
              </div>
              <h3>Email</h3>
              <p>20233698@eaut.edu.vn</p>
              <p>Binhb479@gmail.com</p>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <FaClock />
              </div>
              <h3>Giờ làm việc</h3>
              <p>Thứ 2 - Thứ 6: 8:00 - 18:00</p>
              <p>Thứ 7: 8:00 - 12:00</p>
            </div>

            {/* Social Media */}
            <div className="social-media">
              <h3>Kết nối với chúng tôi</h3>
              <div className="social-links">
                <a href="#" className="social-link">
                  <FaFacebookF />
                </a>
                <a href="#" className="social-link">
                  <FaTwitter />
                </a>
                <a href="#" className="social-link">
                  <FaInstagram />
                </a>
                <a href="#" className="social-link">
                  <FaLinkedinIn />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form">
            <div className="form-header">
              <h2>Gửi tin nhắn cho chúng tôi</h2>
              <p>Điền thông tin của bạn vào form bên dưới, chúng tôi sẽ liên hệ lại sớm nhất</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Họ và tên</label>
                <input type="text" id="name" placeholder="Nhập họ và tên của bạn" required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" placeholder="Nhập email của bạn" required />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Số điện thoại</label>
                  <input type="tel" id="phone" placeholder="Nhập số điện thoại của bạn" required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Tiêu đề</label>
                <input type="text" id="subject" placeholder="Nhập tiêu đề" required />
              </div>

              <div className="form-group">
                <label htmlFor="message">Nội dung</label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Nhập nội dung tin nhắn của bạn"
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary">
                Gửi tin nhắn
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <section className="map-section">
          <iframe
              title="Đại học Công nghệ Đông Á"
              src="https://www.google.com/maps?q=Đại%20học%20Công%20nghệ%20Đông%20Á&output=embed"
              width="100%"
              height="380"
              style={{ border: 0, borderRadius: '12px' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
          />
      </section>
    </div>
  );
};

export default Contact; 