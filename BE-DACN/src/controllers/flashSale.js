import mongoose from "mongoose";
import FlashSale from "../model/flashSale.js";
import Product from "../model/Product.js";

export const createFlashSale = async (req, res) => {
  try {
    const { product, salePrice, quantity, discountPercent, startTime, endTime, limitQuantity, isActive } = req.body;

    if (!product || !salePrice || !quantity || !discountPercent || !startTime || !endTime) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    if (!mongoose.Types.ObjectId.isValid(product)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }

    const existedProduct = await Product.findById(product);
    if (!existedProduct) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // Kiểm tra trùng flash sale cùng product trong cùng khoảng thời gian
    const overlapped = await FlashSale.findOne({
      product,
      startTime: { $lte: new Date(endTime) },
      endTime: { $gte: new Date(startTime) },
      isActive: true,
    });

    if (overlapped) {
      return res.status(400).json({ message: "Sản phẩm đã có flash sale trong thời gian này" });
    }

    const flashSale = await FlashSale.create({
      product,
      salePrice,
      quantity,
      discountPercent,
      startTime,
      endTime,
      limitQuantity: limitQuantity || 0,
      isActive: isActive ?? true,
    });

    res.status(201).json({ message: "Tạo flash sale thành công", data: flashSale });
  } catch (error) {
    console.error("❌ Lỗi tạo flash sale:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

export const getAllFlashSales = async (req, res) => {
  try {
    const flashSales = await FlashSale.find().populate({
      path: "product",
      // FE đang dùng: title, priceDefault, imageUrl (+ vài field hay dùng)
      select: "title priceDefault imageUrl slug capacity",
    });

    // lọc record bị mất liên kết product (tránh FE render rỗng)
    const safeFlashSales = flashSales.filter((fs) => fs.product);

    res.status(200).json({ success: true, data: safeFlashSales });
  } catch (error) {
    console.error("❌ Lỗi lấy flash sale:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ✅ Tạo flash sale nhiều sản phẩm trong 1 lần gọi (phục vụ Admin chọn nhiều sản phẩm)
export const createFlashSaleBulk = async (req, res) => {
  try {
    const {
      products, // [{ product, salePrice, quantity }]
      discountPercent,
      startTime,
      endTime,
      limitQuantity,
      isActive,
    } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Danh sách sản phẩm flash sale không hợp lệ" });
    }

    if (discountPercent === undefined || !startTime || !endTime) {
      return res.status(400).json({ message: "Thiếu discountPercent/startTime/endTime" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    const docsToCreate = [];

    for (const item of products) {
      const { product, salePrice, quantity } = item || {};

      if (!product || salePrice === undefined || quantity === undefined) {
        return res.status(400).json({ message: "Mỗi sản phẩm phải có product/salePrice/quantity" });
      }

      if (!mongoose.Types.ObjectId.isValid(product)) {
        return res.status(400).json({ message: `ID sản phẩm không hợp lệ: ${product}` });
      }

      const existedProduct = await Product.findById(product);
      if (!existedProduct) {
        return res.status(404).json({ message: `Sản phẩm không tồn tại: ${product}` });
      }

      // Kiểm tra trùng flash sale cùng product trong cùng khoảng thời gian
      const overlapped = await FlashSale.findOne({
        product,
        startTime: { $lte: end },
        endTime: { $gte: start },
        isActive: true,
      });

      if (overlapped) {
        return res.status(400).json({
          message: `Sản phẩm đã có flash sale trong thời gian này: ${existedProduct.title || product}`,
        });
      }

      docsToCreate.push({
        product,
        salePrice,
        quantity,
        discountPercent,
        startTime: start,
        endTime: end,
        limitQuantity: limitQuantity || 0,
        isActive: isActive ?? true,
      });
    }

    const created = await FlashSale.insertMany(docsToCreate);
    return res.status(201).json({ message: "Tạo flash sale thành công", data: created });
  } catch (error) {
    console.error("❌ Lỗi tạo flash sale bulk:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
