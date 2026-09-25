const express = require("express");

const router = express.Router();

const {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
} = require("../controllers/categoryController");

const verifyToken = require("../middlewares/verifyToken");

const authorizeRole = require("../middlewares/authorizeRole");

const upload = require("../configs/multer");

router.get("/", getAllCategories);

router.get("/:id", getCategoryById);

router.post(
  "/",
  verifyToken,
  authorizeRole("admin"),
  upload.single("icon"),
  createCategory,
);

router.put(
  "/:id",
  verifyToken,
  authorizeRole("admin"),
  upload.single("icon"),
  updateCategory,
);

router.delete("/:id", verifyToken, authorizeRole("admin"), deleteCategory);

module.exports = router;
