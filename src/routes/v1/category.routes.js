const express = require("express");
const categoryRoutes = express.Router();

const CategoryController = require("../../controllers/CategoryController");

const { onlyCanAccessWith } = require("../../middlewares/auth");
const { READ, WRITE } = require("../../utils/constants/permissions");

categoryRoutes.post(
  "/products/category",
  onlyCanAccessWith([WRITE]),
  CategoryController.createCategory
);

categoryRoutes.get(
  "/products/category",
  onlyCanAccessWith([WRITE]),
  CategoryController.filterCategory
);

module.exports = categoryRoutes;
