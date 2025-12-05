import express from "express";
import cors from "cors";
import dotenv from "dotenv";

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
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use("/api", router);

setupSwagger(app);

// ✅ dùng PORT trong .env, fallback 8888
const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}/api`);
  console.log(`📚 Swagger Docs: http://localhost:${PORT}/api-docs`);
});
