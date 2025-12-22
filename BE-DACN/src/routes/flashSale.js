import express from "express";
import { createFlashSale, getAllFlashSales, createFlashSaleBulk } from "../controllers/flashSale.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Admin tạo flash sale
router.post("/", authenticate, requireAdmin, createFlashSale);

// Admin tạo flash sale nhiều sản phẩm
router.post("/bulk", authenticate, requireAdmin, createFlashSaleBulk);

// Lấy tất cả flash sale
router.get("/", getAllFlashSales);

export default router;