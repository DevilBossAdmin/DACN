import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../../api/axios.config";
import { useCart } from "../../contexts/CartContext";
import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaMoneyCheckAlt,
  FaBoxOpen,
  FaAngleDown,
} from "react-icons/fa";
import "./Checkout.css";
import { jwtDecode } from "jwt-decode";

type SelectedItem = {
  _id?: string;
  productId?: any; // có thể là string hoặc object
  variantId?: any; // có thể là string hoặc object
  quantity: number;
  price?: number;
  name?: string;
  image?: string;
  categoryId?: string; // <-- cực quan trọng để apply theo danh mục
};

const clamp = (n: number) => (Number.isFinite(n) ? n : 0);

const Checkout = () => {
  const navigate = useNavigate();
  const { fetchCart } = useCart();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  const [voucherCode, setVoucherCode] = useState("");
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      if (decoded?.id) setUserId(decoded.id);
    } catch (err) {
      console.error("Lỗi khi giải mã token:", err);
    }
  }, []);

  useEffect(() => {
    const selected = JSON.parse(localStorage.getItem("selectedCheckoutItems") || "[]");
    setSelectedItems(Array.isArray(selected) ? selected : []);
  }, []);

  const totalPrice = useMemo(() => {
    return selectedItems.reduce((acc, item) => {
      const unit = clamp(item.price ?? item.variantId?.price ?? 0);
      const qty = clamp(item.quantity ?? 0);
      return acc + unit * qty;
    }, 0);
  }, [selectedItems]);

  const finalTotal = useMemo(() => {
    const ft = totalPrice - discount;
    return ft < 0 ? 0 : ft;
  }, [totalPrice, discount]);

  // ✅ categoryIds lấy từ item.categoryId là chính (do selectedCheckoutItems lưu)
  const categoryIds = useMemo(() => {
    const ids = selectedItems
      .map((item) => item.categoryId || item.productId?.categoryId?._id || item.productId?.categoryId)
      .filter(Boolean);
    return Array.from(new Set(ids)) as string[];
  }, [selectedItems]);

  const handleApplyVoucher = async () => {
    const code = voucherCode.trim();
    if (!code) {
      toast.warn("Vui lòng nhập mã giảm giá.");
      return;
    }

    try {
      // ⚠️ nhiều backend trả về discount ở các key khác nhau
      const res = await axios.post("/vouchers/apply", {
        code,
        total: totalPrice,        // giữ total như bạn đang dùng
        categoryIds,              // có danh mục thì backend mới check được
      });

      const d =
        Number(res.data?.discount ?? res.data?.data?.discount ?? res.data?.discountAmount ?? 0) || 0;

      setDiscount(d);
      toast.success(res.data?.message || `Áp dụng mã thành công! Giảm ${d.toLocaleString("vi-VN")}₫`);
    } catch (err: any) {
      console.error(err?.response?.data || err);
      setDiscount(0);
      toast.error(err?.response?.data?.message || "Không áp dụng được mã");
    }
  };

  const handleSubmit = async () => {
    if (!fullName || !phone || !address) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (!userId) {
      toast.error("Không tìm thấy người dùng.");
      return;
    }

    const itemsToCheckout = selectedItems.map((item) => ({
      variantId: item.variantId?._id || item.variantId,
      quantity: item.quantity,
      price: clamp(item.price ?? item.variantId?.price ?? 0),
    }));

    const payload = {
      shippingInfo: { fullName, phone, address },
      paymentMethod,
      totalAmount: finalTotal,
      itemsToCheckout,
      voucherCode: voucherCode.trim(),
    };

    try {
      setLoading(true);
      const res = await axios.post("/orders", payload);
      const orderId = res.data?._id || res.data?.data?._id;

      if (paymentMethod === "VNPay") {
        const paymentRes = await axios.get("/payment/create_payment", {
          params: { amount: finalTotal, orderId },
        });
        window.location.href = paymentRes.data.paymentUrl;
        return;
      }

      toast.success("Đặt hàng thành công!");
      await fetchCart();
      localStorage.removeItem("selectedCheckoutItems");
      navigate(`/orders/${orderId}`);
    } catch (err: any) {
      console.error(err?.response?.data || err);
      toast.error(err?.response?.data?.message || "Đặt hàng thất bại");
      navigate("/cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <h2 className="checkout-title">
        <FaBoxOpen style={{ marginRight: 8 }} /> Xác nhận đơn hàng
      </h2>

      <div className="checkout-content">
        <div className="checkout-left">
          <div className="checkout-form">
            <h3>Thông tin giao hàng</h3>

            <div className="input-group">
              <FaUser />
              <input
                type="text"
                placeholder="Họ tên người nhận"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="input-group">
              <FaPhone />
              <input
                type="text"
                placeholder="Số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="input-group">
              <FaMapMarkerAlt />
              <textarea
                placeholder="Địa chỉ cụ thể"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="input-group select-wrapper">
              <FaMoneyCheckAlt className="icon" />
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="COD">Thanh toán khi nhận hàng</option>
                <option value="VNPay">Thanh toán VNPay</option>
                <option value="Stripe">Thanh toán Stripe</option>
                <option value="Momo">Thanh toán Momo</option>
              </select>
              <FaAngleDown className="select-arrow" />
            </div>
          </div>
        </div>

        <div className="checkout-right">
          <h3>Sản phẩm</h3>

          <div className="cart-items">
            {selectedItems.length > 0 ? (
              selectedItems.map((item: any) => {
                const name = item.name || item.productId?.title || "Sản phẩm";
                const image =
                  item.image ||
                  item.variantId?.imageUrl?.[0] ||
                  item.productId?.imageUrl?.[0] ||
                  "/placeholder.jpg";
                const price = clamp(item.price ?? item.variantId?.price ?? 0);

                return (
                  <div className="cart-item" key={item._id || item.variantId?._id || name}>
                    <img src={image} alt={name} className="cart-item-image" />
                    <div>
                      <p>{name}</p>
                      <small>
                        {item.quantity} x {price.toLocaleString("vi-VN")}₫
                      </small>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>Không có sản phẩm được chọn.</p>
            )}
          </div>

          <div className="flex w-full max-w-md mb-3 mt-3">
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              placeholder="Nhập mã giảm giá"
              className="flex-1 px-4 py-3 text-sm text-gray-700 border border-blue-500 rounded-l-lg focus:outline-none"
            />
            <button
              onClick={handleApplyVoucher}
              className="ml-3 px-6 py-3 bg-blue-600 text-white rounded-r-lg text-sm font-medium hover:bg-blue-700"
            >
              Áp dụng
            </button>
          </div>

          <div className="total-prices w-full mt-4 text-sm space-y-3 p-4 bg-gray-100 rounded-md">
            <div className="flex justify-between">
              <span className="font-medium">Tạm tính:</span>
              <span>{totalPrice.toLocaleString("vi-VN")}₫</span>
            </div>

            <div className="flex justify-between text-green-600">
              <span className="font-medium">Giảm giá:</span>
              <span>-{discount.toLocaleString("vi-VN")}₫</span>
            </div>

            <div className="flex justify-between text-base font-semibold border-t pt-2 mt-2">
              <span>Thành tiền:</span>
              <span>{finalTotal.toLocaleString("vi-VN")}₫</span>
            </div>
          </div>

          <button className="checkout-btn mt-4" onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang xử lý..." : "Đặt hàng"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
