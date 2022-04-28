const express = require("express");
const productsRoutes = express.Router();

const ProductController = require("../../controllers/ProductController");
const CategoryController = require("../../controllers/CategoryController");

const { onlyCanAccessWith } = require("../../middlewares/auth");
const {
  READ,
  UPDATE,
  DELETE,
  WRITE,
} = require("../../utils/constants/permissions");

productsRoutes.get(
  "/products",
  onlyCanAccessWith([READ]),
  ProductController.index
);
productsRoutes.put(
  "/products/:product_id",
  onlyCanAccessWith([UPDATE]),
  ProductController.putUpdate
);

productsRoutes.post(
  "/products",
  onlyCanAccessWith([WRITE]),
  ProductController.store
);

productsRoutes.delete(
  "/products/:id",
  onlyCanAccessWith([DELETE]),
  ProductController.delete
);

productsRoutes.patch(
  "/products/:id",
  onlyCanAccessWith([UPDATE]),
  ProductController.update
);

productsRoutes.post(
  "/products/category",
  onlyCanAccessWith([WRITE]),
  CategoryController.createCategory
);

module.exports = productsRoutes;
