import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Product from "../model/Product.js";

dotenv.config();

/** Fallback tư vấn không AI: tìm theo keyword trong title/name/description */
function fallbackSuggest(products, keyword) {
  const kw = (keyword || "").trim().toLowerCase();

  if (!products?.length) {
    return `Hiện tại shop chưa có sản phẩm để tư vấn. Bạn thử lại sau nhé.`;
  }

  // Nếu không có keyword rõ ràng thì lấy top 3
  let scored = products.map((p) => {
    const title = (p.title || p.name || "").toLowerCase();
    const desc = (p.shortDescription || p.description || "").toLowerCase();

    let score = 0;
    if (kw) {
      if (title.includes(kw)) score += 3;
      if (desc.includes(kw)) score += 1;
    }

    // ưu tiên có giá
    if (p.priceDefault != null) score += 0.2;
    return { p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 3).map(({ p }) => p);

  const lines = top.map((p, idx) => {
    const name = p.title || p.name || "Không tên";
    const price =
      p.priceDefault != null
        ? `${Number(p.priceDefault).toLocaleString("vi-VN")} VND`
        : "Giá liên hệ";
    const link = `http://localhost:5173/product/${p._id}`;
    const short = p.shortDescription || p.description || "";
    const brief = short ? short.slice(0, 140) : "Không có mô tả";

    return `${idx + 1}. **${name}** (${price})\n- ${brief}\n- Link: ${link}`;
  });

  return `Mình gợi ý một vài sản phẩm phù hợp với "${keyword}":\n\n${lines.join(
    "\n\n"
  )}\n\nBạn muốn laptop theo nhu cầu nào (học tập / gaming / đồ hoạ) và tầm giá bao nhiêu?`;
}

export const chatTuvan = async (req, res) => {
  try {
    // ✅ đảm bảo nhận được body
    const { message } = req.body || {};
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Thiếu message hoặc message không hợp lệ" });
    }

    // ✅ lấy sản phẩm (chỉ lấy 10 để prompt ngắn)
    const products = await Product.find({ deletedAt: null }).limit(10);

    // ✅ nếu không có key Gemini => fallback luôn
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const reply = fallbackSuggest(products, message);
      return res.json({ reply });
    }

    // ✅ tạo prompt từ danh sách sản phẩm
    const productList = (products || [])
      .map((p) => {
        const name = p.title || p.name || "Không tên";
        const price =
          p.priceDefault != null
            ? `${Number(p.priceDefault).toLocaleString("vi-VN")} VND`
            : "Giá liên hệ";
        const desc = p.shortDescription || p.description || "Không có mô tả";
        const link = `http://localhost:5173/product/${p._id}`;
        // tránh prompt quá dài
        const descShort = String(desc).slice(0, 160);
        return `- ${name} | ${price}\n  ${descShort}\n  Link: ${link}`;
      })
      .join("\n\n");

    const prompt = `
Bạn là nhân viên tư vấn sản phẩm của shop (tiếng Việt).
Chỉ được tư vấn dựa trên danh sách sản phẩm dưới đây.

DANH SÁCH SẢN PHẨM:
${productList || "(Chưa có sản phẩm trong kho)"}

KHÁCH HỎI: "${message.trim()}"

YÊU CẦU TRẢ LỜI:
- Gợi ý 1–3 sản phẩm phù hợp nhất
- Mỗi sản phẩm: nêu 1–2 lý do ngắn + kèm Link
- Trả lời thân thiện, rõ ràng, không bịa sản phẩm không có trong danh sách
`;

    // ✅ gọi Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 400,
      },
    });

    const reply = result?.response?.text?.();
    if (!reply) {
      // nếu Gemini trả rỗng, fallback
      const fb = fallbackSuggest(products, message);
      return res.json({ reply: fb });
    }

    return res.json({ reply });
  } catch (error) {
    // ✅ không để FE mù thông tin
    console.error("❌ chatTuvan error:", error);

    // fallback DB để “luôn dùng được”
    try {
      const { message } = req.body || {};
      const products = await Product.find({ deletedAt: null }).limit(10);
      const reply = fallbackSuggest(products, message || "");
      return res.json({ reply });
    } catch (e2) {
      return res.status(500).json({ error: error?.message || "Lỗi khi gọi AI tư vấn" });
    }
  }
};
