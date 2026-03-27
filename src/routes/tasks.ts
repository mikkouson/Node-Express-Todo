import express from "express";
import { body, validationResult } from "express-validator";
import pool from "../db.js";
import multer from "multer";
import { auth } from "../middleware/auth.js";
import type { AuthRequest } from "../types/index.js";
import type { Response } from "express";

const router = express.Router();
const upload = multer();

router.get("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await pool.query(
      "SELECT * FROM public.tasks WHERE user_id = $1 ORDER BY id DESC",
      [userId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
});

router.get("/:id", auth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const result = await pool.query(
      "SELECT * FROM public.tasks WHERE id = $1 AND user_id = $2",
      [id, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
});

router.post(
  "/store",
  auth,
  upload.none(),
  [body("title").trim().notEmpty().withMessage("Title is required")],
  async (req: AuthRequest, res: Response) => {
    try {
      const { title, is_active = true } = req.body;
      const userId = req.user?.id;

      const result = await pool.query(
        "INSERT INTO public.tasks (title, is_active, user_id) VALUES ($1, $2, $3) RETURNING *",
        [title, is_active, userId],
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      res.status(500).json({ error: "Database Error" });
    }
  },
);

router.put("/:id", auth, upload.none(), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, is_active } = req.body;
    const userId = req.user?.id;

    const existing = await pool.query(
      `select * from public.tasks where id = $1 and user_id = $2`,
      [id, userId],
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "task not found" });
    }
    const result = await pool.query(
      `update public.tasks set title  = $1, is_active = $2 where id = $3 and user_id = $4 and (title is distinct from $1 or is_active is distinct from $2) returning *`,
      [title, is_active, id, userId],
    );

    if (result.rows.length === 0) {
      return res.status(200).json(existing.rows[0]);
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "database error" });
  }
});

router.delete("/:id", auth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const result = await pool.query(
      "DELETE FROM public.tasks WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
});

export default router;
