const Category = require("../models/Category");
const Product = require("../models/Product");
const logger = require("../config/logger");

module.exports = {
  async createCategory(req, res) {
    const { name } = req.body;
    const nameWithNoSpace = name ? name.trim() : null;
    try {
      if (!nameWithNoSpace) {
        throw new Error("You must provide a category name.");
      }
      if (nameWithNoSpace === Number) {
        throw new Error("The category name must be a string.");
      }
      if (nameWithNoSpace.length < 3) {
        throw new Error("The category name must have at least 3 characters.");
      }

      if (nameWithNoSpace) {
        const name_Db = await Category.findOne({
          where: {
            name: nameWithNoSpace,
          },
        });

        if (name_Db) {
          throw new Error(`There is already a category named ${name_Db.name}`);
        }

        await Category.create({ name: nameWithNoSpace });
      }

      return res.status(201).send({ name: nameWithNoSpace });
    } catch (error) {
      logger.error(error.message);
      res.status(400).send({ message: error.message });
    }
  },
  async filterCategory(req, res) {
    const { name } = req.query;
    try {
      const existsCategory = await Category.findOne({
        where: { name: name },
      });
      if (!existsCategory) {
        throw new Error("There is no category with the name searched.");
      }

      const productsIncludedInCategory = await Product.findAll({
        where: { category_id: existsCategory.id },
      });
      if (productsIncludedInCategory.length === 0) {
        throw new Error(`The list is empty.`);
      }
      const result = productsIncludedInCategory.map((product) => {
        return { produto: product.name, preco: product.suggested_price };
      });

      res.status(200).send({ result });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  },
};
