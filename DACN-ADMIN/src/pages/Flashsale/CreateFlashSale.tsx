import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  DatePicker,
  Switch,
  message,
  Select,
} from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const CreateFlashSale = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [productOptions, setProductOptions] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // ✅ Gọi API lấy danh sách sản phẩm
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const { data } = await axios.get(
          `${import.meta.env.VITE_PUBLIC_API_URL}api/product?limit=9999`
        );
        setProductOptions(data.data || []);
      } catch (error) {
        message.error("Không thể tải danh sách sản phẩm");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // ✅ Tạo flash sale nhiều sản phẩm (POST /api/flashsale/bulk)
  const onFinish = async (values: any) => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");

      if (!token) {
        message.error("Bạn chưa đăng nhập admin (không có token)!");
        return;
      }

      const mappedProducts = (values.products || []).map((id: string) => ({
        product: id,
        salePrice: values.salePrice,
        quantity: values.quantity,
      }));

      const payload = {
        // title giữ để hiển thị UI (BE có thể ignore)
        title: values.title,
        products: mappedProducts,
        discountPercent: values.discountPercent,
        startTime: values.startTime.toISOString(),
        endTime: values.endTime.toISOString(),
        limitQuantity: values.limitQuantity || 0,
        isActive: values.isActive ?? true,
      };

      await axios.post(
        `${import.meta.env.VITE_PUBLIC_API_URL}api/flashsale/bulk`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("✅ Tạo Flash Sale thành công!");
      setTimeout(() => navigate("/dashboard/flashsale"), 1200);
    } catch (err: any) {
      console.error("❌ Lỗi tạo Flash Sale:", err?.response?.data || err.message);
      message.error(err?.response?.data?.message || "Tạo Flash Sale thất bại!");
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-indigo-600 mb-5">Tạo Flash Sale</h2>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Tên Flash Sale"
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input placeholder="Ví dụ: Khuyến mãi cuối tuần" />
          </Form.Item>

          <Form.Item
            label="Chọn sản phẩm tham gia"
            name="products"
            rules={[{ required: true, message: "Vui lòng chọn sản phẩm!" }]}
          >
            <Select
              mode="multiple"
              loading={loadingProducts}
              placeholder="Chọn sản phẩm"
              optionFilterProp="label"
              showSearch
              filterOption={(input, option) =>
                (option?.label as string)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={productOptions.map((product: any) => ({
                label: product.title,
                value: product._id,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Phần trăm giảm giá"
            name="discountPercent"
            rules={[{ required: true, message: "Vui lòng nhập phần trăm!" }]}
          >
            <InputNumber min={1} max={100} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Giá sale (VNĐ)"
            name="salePrice"
            rules={[{ required: true, message: "Vui lòng nhập giá sale!" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Số lượng"
            name="quantity"
            rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Thời gian bắt đầu"
            name="startTime"
            rules={[{ required: true, message: "Vui lòng chọn thời gian!" }]}
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Thời gian kết thúc"
            name="endTime"
            rules={[{ required: true, message: "Vui lòng chọn thời gian!" }]}
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Giới hạn số lượng" name="limitQuantity">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Kích hoạt" name="isActive" valuePropName="checked">
            <Switch defaultChecked />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Tạo Flash Sale
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateFlashSale;
