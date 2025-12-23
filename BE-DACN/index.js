import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import connectDB from "./src/configs/db.js";
import router from "./src/routes/index.js";
import setupSwagger from "./src/configs/swaggerConfig.js";

dotenv.config();

const app = express();

// ✅ CORS cho nhiều FE
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://fe-client.yourdomain.com",
  "https://fe-client.yourdomain.com",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ QUAN TRỌNG: Public thư mục uploads để ảnh banner load được
app.use("/uploads", express.static(path.join(process.cwd(), "src", "uploads")));

connectDB();

app.use("/api", router);

setupSwagger(app);

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}/api`);
  console.log(`📚 Swagger Docs: http://localhost:${PORT}/api-docs`);
});
