import express from "express";

import {
  getDashboardStats,
  getAllUsers,
  getUserById
} from "../controllers/adminController.js";

const router = express.Router();

// ======================================================
// ADMIN DASHBOARD
// ======================================================

router.get(
  "/dashboard",
  getDashboardStats
);

router.get(
  "/users/:id",
  getUserById
);

// ======================================================
// USER MANAGEMENT
// ======================================================

router.get(
  "/users",
  getAllUsers
);

export default router;