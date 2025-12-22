    import Category from "../model/Category.js";
import { categorySchema } from "../validate/Category.js";
import ProductGroup from "../model/ProductGroup.js";
import Product from "../model/Product.js";


export const getCategory = async (req, res) => {
  try {
    // Lấy query parameters từ URL
    let {
      offset = "0",
      limit = "10",
      sortBy = "createdAt",   // sắp xếp theo thời gian tạo
      order = "desc",         // mặc định giảm dần
      name,                   // lọc theo tên nếu có
    } = req.query;
    // Ép kiểu
    const offsetNumber = parseInt(offset, 10);
    const limitNumber = parseInt(limit, 10);
    const sortOrder = order === "desc" ? -1 : 1;

    // Tạo bộ lọc nếu có lọc theo name
    const filter = { deletedAt: null }; // 👉 Chỉ lấy danh mục chưa bị xoá

    if (name) {
      // Dùng regex cho tìm kiếm gần đúng, không phân biệt hoa thường
      filter.name = { $regex: name, $options: "i" };
    }

    // Truy vấn danh sách danh mục có phân trang và sắp xếp
    const categories = await Category.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(offsetNumber)
      .limit(limitNumber);

    // Đếm tổng số danh mục (phục vụ phân trang)
    const total = await Category.countDocuments(filter);

    // Trả kết quả
    res.status(200).json({
      success: true,
      data: categories,
      pagination: {
        total,
        offset: offsetNumber,
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Lấy danh mục theo ID
export const getCategorybyId = async (req, res) => {
  const id = req.params.id;
  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Tạo danh mục mới
export const createCategory = async (req, res) => {
  try {
    const { error } = categorySchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors });
    }

    const newCategory = new Category(req.body);
    const saved = await newCategory.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Lỗi backend:", err);
    res.status(500).json({ message: "Lỗi server", error: err });
  }
};
// ✅ Xoá danh mục theo ID
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Tìm danh mục cần xoá
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    // 2. Không cho xoá danh mục mặc định
    if (category.name === "Điện thoại") {
      return res.status(400).json({ message: "Không thể xoá danh mục mặc định" });
    }

    // 3. Tìm danh mục mặc định
    const defaultCategory = await Category.findOne({ name: "Điện thoại", deletedAt: null });
    if (!defaultCategory) {
      return res.status(500).json({ message: "Không tìm thấy danh mục mặc định 'Sản Phẩm'" });
    }

    // 4. Chuyển toàn bộ sản phẩm của danh mục này sang danh mục mặc định
    const updatedProducts = await Product.updateMany(
      { categoryId: id },
      { $set: { categoryId: defaultCategory._id } }
    );

    // 5. Xoá mềm danh mục
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true }
    );

    return res.status(200).json({
      message: "Đã xoá mềm danh mục và chuyển sản phẩm về danh mục mặc định",
      category: updatedCategory,
      transferredProducts: updatedProducts.modifiedCount, // Số lượng sản phẩm đã chuyển
    });
  } catch (error) {
    console.error("❌ Lỗi xoá mềm danh mục:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const getDeletedCategories = async (req, res) => {
  try {
    const categories = await Category.find({ deletedAt: { $ne: null } });
    res.json({ data: categories });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
// [PUT] /categories/:id/restore -> khôi phục
export const restoreCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Chỉ tìm những category đã bị xoá mềm
    const category = await Category.findOneAndUpdate(
      { _id: id, deletedAt: { $ne: null } }, // Chỉ khôi phục nếu đã bị xoá mềm
      { deletedAt: null },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục đã xoá" });
    }

    res.status(200).json({ message: "Đã khôi phục danh mục thành công", category });
  } catch (err) {
    console.error("❌ Lỗi khôi phục:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// [DELETE] /categories/:id/force -> xoá vĩnh viễn
export const forceDeleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục để xoá" });
    }
    res.json({ message: "Đã xoá vĩnh viễn", category });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const updateCategory = async (req, res) => {
  const id = req.params.id;
  try {
    const { error } = categorySchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors });
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getProductGroupsByCategoryId = async (req, res) => {
  const { id } = req.params;

  try {
    const groups = await ProductGroup.find({ categoryId: id, deletedAt: null });

    res.status(200).json({
      success: true,
      data: groups,
    });
  } catch (error) {
    console.error("Lỗi khi lấy ProductGroup theo categoryId:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
export const getProductsByCategoryId = async (req, res) => {
  const { id } = req.params;

  try {
    const products = await Product.find({
      categoryId: new mongoose.Types.ObjectId(id),
      deletedAt: null,
    })
      .populate("categoryId")
      .populate("groupId")
      .populate({
        path: "variants",
        match: { deletedAt: null },
        populate: {
          path: "attributes.attributeId attributes.attributeValueId",
        },
      });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo categoryId:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};