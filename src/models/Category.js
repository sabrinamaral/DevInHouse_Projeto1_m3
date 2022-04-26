const { DataTypes, Model } = require("sequelize");

class Category extends Model {
  static init(sequelize) {
    super.init(
      {
        name: {
          type: DataTypes.STRING,
          unique: true,
          validate: {
            len: {
              args: [3, 15],
              msg: "A categoria deve conter entre 3 e 15 caractéres.",
            },
          },
        },
      },
      { sequelize }
    );
  }
  static associate(models) {
    this.hasMany(models.Product, {
      foreignKey: "category_id",
      as: "products",
    });
  }
}

module.exports = Category;
