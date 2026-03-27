import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import multer from "multer";
import { JWT_SECRET } from "../config.js";
import { auth } from "../middleware/auth.js";
import type { AuthRequest } from "../types/index.js";

const router = express.Router();
const upload = multer();

router.post(
  "/register",
  upload.none(),
  [
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, password } = req.body;

      const userCheck = await pool.query(
        "SELECT * FROM public.users WHERE username = $1",
        [username],
      );
      if (userCheck.rows.length > 0) {
        return res.status(400).json({ error: "Username already taken" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query(
        "INSERT INTO public.users (username, password) VALUES ($1, $2) RETURNING id, username",
        [username, hashedPassword],
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database Error" });
    }
  },
);

router.post(
  "/login",
  upload.none(),
  [
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, password } = req.body;

      const result = await pool.query(
        "SELECT * FROM public.users WHERE username = $1",
        [username],
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      res.json({ token, user: { id: user.id, username: user.username } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database Error" });
    }
  },
);

// GET CURRENT USER
router.get("/me", auth, async (req: AuthRequest, res: express.Response) => {
  res.json({ user: req.user });
});

// LOGOUT
router.post("/logout", (req: express.Request, res: express.Response) => {
  res.json({ message: "Logout successful. Please clear your token." });
});

export default router;
