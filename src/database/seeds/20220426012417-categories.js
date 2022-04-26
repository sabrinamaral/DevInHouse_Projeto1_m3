"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("categories", [
      {
        name: "technology",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "home",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "beauty",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "health",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "books",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("categories", null, {});
  },
};
