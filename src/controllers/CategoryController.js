const Category = require("../models/Category");

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
      } else {
        await Category.create(nameWithNoSpace);
      }
      // não está salvando no banco ???
      // ??????????????????????????????

      return res.status(201).send({ name: nameWithNoSpace });
    } catch (error) {
      logger.error(error.message);
      res.status(400).send({ message: error.message });
    }
  },
};
