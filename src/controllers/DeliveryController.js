const logger = require("../config/logger");
const Permission = require("../models/Permission");
const { validateErrors } = require("../utils/functions");

module.exports = {
  async findDeliveries(req, res) {
    // #swagger.tags = ['Deliveries']
    // #swagger.description = 'Endpoint para buscar deliveries conforme critério query params'
    try {
      const { address_id, sale_id } = req.query;
      await Permission.create({ description });
      logger.info(`Delivery found`);
      return res.status(200).send({ message: "Ok" });
    } catch (error) {
      const message = validateErrors(error);
      logger.error(message);
      return res.status(400).send(message);
    }
  },
};
