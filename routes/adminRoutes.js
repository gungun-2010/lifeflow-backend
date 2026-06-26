import express from "express";

import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser
} from "../controllers/adminController.js";

const router = express.Router();
console.log("✅ adminRoutes.js loaded");

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

console.log("✅ Registering PUT /users/:id");

router.put(
    "/users/:id",
    updateUser
);
// ======================================================
// USER MANAGEMENT
// ======================================================

router.get(
  "/users",
  getAllUsers
);

export default router;