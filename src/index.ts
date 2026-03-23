import express from "express";
import pool from "./db.js";
import multer from "multer";
import { body, validationResult } from "express-validator";
const upload = multer();
import type { Request, Response } from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "Api is Running" });
});

/* ---------------- TASK CRUD ---------------- */

// GET all tasks
app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM public.tasks ORDER BY id DESC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
});

// GET single task
app.get("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM public.tasks WHERE id = $1",
      [id],
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

// CREATE task
app.post(
  "/tasks/store",
  upload.none(),
  [body("title").trim().notEmpty().withMessage("Title is required")],
  async (req: Request, res: Response) => {
    try {
      const { title, is_active = true } = req.body;

      const result = await pool.query(
        "INSERT INTO public.tasks (title, is_active) VALUES ($1, $2) RETURNING *",
        [title, is_active],
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        // If there are errors, return a 400 Bad Request with the errors
        return res.status(400).json({ errors: errors.array() });
      }
    }
  },
);

// UPDATE task
app.put("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, is_active } = req.body;

    const result = await pool.query(
      `UPDATE public.tasks
       SET title = $1,
           is_active = $2
       WHERE id = $3
       RETURNING *`,
      [title, is_active, id],
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

// DELETE task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM public.tasks WHERE id = $1 RETURNING *",
      [id],
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

/* ------------------------------------------- */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});
