import express from "express";
import { chatTuvan } from "../controllers/ChatGPT.js";

const router = express.Router();

/**
 * POST /api/chat/tuvan
 * body: { message: string }
 */
router.post("/tuvan", chatTuvan);

router.get("/ping", (req, res) => {
  res.json({ ok: true, message: "chat route alive" });
});

export default router;
