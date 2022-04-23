const Address = require("../models/Address");
const Deliveries = require("../models/Deliveries");
const City = require("../models/City");
const State = require("../models/State");
const { validateErrors } = require("../utils/functions");
const { Op } = require("sequelize");
const logger = require("../config/logger");

module.exports = {
  async index(req, res) {
    /*
    #swagger.tags = ['Endereços']
    #swagger.description = 'Endpoint que retorna os endereços com base nos dados fornecidos via query, ou então todos os endereços caso nenhuma query seja passada'

    #swagger.parameters['city_id'] = {
             in: 'query',
             description: 'Filtro que identifica o id da cidade desejada',
             type: 'number',
             collectionFormat: 'multi',
    }
    #swagger.parameters['street'] = {
             in: 'query',
             description: 'Filtro que identifica o nome da rua que será retornada',
             type: 'string',
             collectionFormat: 'multi',
    }
    #swagger.parameters['cep'] = {
             in: 'query',
             description: 'Filtro que identifica o cep que será retornada',
             type: 'string',
             collectionFormat: 'multi',
    }
    */

    try {
      const { city_id, street, cep } = req.query;

      const query = {};

      if (city_id) {
        query.city_id = {
          [Op.eq]: city_id,
        };
      }
      if (street) {
        query.street = {
          [Op.like]: `%${street}%`,
        };
      }
      if (cep) {
        query.cep = {
          [Op.eq]: cep,
        };
      }

      const address = await Address.findAll({
        where: query,
        attributes: ["id", "street", "cep"],
        include: [
          {
            association: "cities",
            attributes: ["id", "name"],
            include: [
              {
                association: "state",
                attributes: ["id", "name", "initials"],
              },
            ],
          },
        ],
      });

      if (address.length === 0) {
        // #swagger.responses[204] = { description: 'No Content' }
        logger.info(`Addresses list empty.`);
        return res.status(204).send();
      } else {
        /* #swagger.responses[200] = { 
          description: 'Endereço encontrado com sucesso!',
          schema: { $ref: "#/definitions/GetAddress" }
        } */
        logger.info(`Address found successfully.`);
        return res
          .status(200)
          .json({ message: "Endereço encontrado com sucesso!", address });
      }
    } catch (error) {
      const message = validateErrors(error);
      // #swagger.responses[403] = { description: 'Você não tem autorização para este recurso!' }
      logger.error(`You don't have permission to access this content.`);
      return res.status(403).send(message);
    }
  },

  async update(req, res) {
    /*
    #swagger.tags = ['Endereços']
    #swagger.description = 'Endpoint que faz a alteração de um endereço com base nos dados passados pelo body'

    #swagger.parameters['address_id'] = {
         in: 'path',
         description: 'ID do endereço a ser alterado',
         type: 'number',
         required: true,
    }
    #swagger.parameters['address'] = {
         in: 'body',
         description: 'Dados para alteração do endereço',
         type: 'object',
         schema: { $ref: "#/definitions/PatchAddress" }
    }
    */

    try {
      const { address_id } = req.params;
      const { street, number, complement, cep } = req.body;

      const address = await Address.findByPk(address_id);

      if (!address) {
        // #swagger.responses[404] = { description: 'Endereço não localizado!' }
        logger.error("Address not found.");
        return res.status(404).json({ message: "Endereço não localizado!" });
      }

      if (!street && !number && !complement && !cep) {
        // #swagger.responses[400] = { description: 'É necessário passar pelo menos um dado para alteração!' }
        logger.error(`You have to fill in at least one field for the update`);
        return res.status(400).json({
          message: "É necessário passar pelo menos um dado para alteração!",
        });
      }

      Address.update(
        {
          street: street ? street : address.street,
          number: number ? number : address.number,
          complement: complement ? complement : address.complement,
          cep: cep ? cep : address.cep,
        },
        {
          where: {
            id: address_id,
          },
        }
      );

      // #swagger.responses[200] = { description: 'Endereço alterado com sucesso!' }
      logger.info(`Address updated successfully`);
      return res.status(200).json({ message: `Address updated successfully` });
    } catch (error) {
      const message = validateErrors(error);
      // #swagger.responses[403] = { description: 'Você não tem autorização para este recurso!' }
      logger.error(message);
      return res.status(403).send(message);
    }
  },

  async delete(req, res) {
    // #swagger.tags = ['Endereços']
    // #swagger.description = 'Endpoint para deletar endereço cadastrado. O id do endereço deve ser enviado por params.'

    try {
      const { address_id } = req.params;

      const address = await Address.findByPk(address_id);

      if (!address) {
        //#swagger.responses[404] = {description: 'Not Found'}
        logger.error(`Address not found.`);
        return res.status(404).send({ message: `Address not found.` });
      }

      const deliveryUsing = await Deliveries.findAll({
        where: {
          address_id: address_id,
        },
      });

      if (deliveryUsing.length > 0) {
        //#swagger.response[400] = {description: 'Bad Request'}
        logger.error(
          `This address is being used, therefore cannot be deleted.`
        );
        return res
          .status(400)
          .send({
            message: `This address is being used, therefore cannot be deleted.`,
          });
      }

      await address.destroy();
      //#swagger.response[204] = {description: 'No Content' }
      logger.info(`Address deleted successfully.`);
      return res.status(204).send();
    } catch (error) {
      const message = validateErrors(error);
      logger.error(message);
      return res.status(400).send({ message: message });
    }
  },

  async insertNewAddress(req, res) {
    /*
     #swagger.tags = ['Endereços']
     #swagger.description = 'Endpoint para adicionar um novo endereço ao banco de dados'
     #swagger.consumes = ['application/json']
     #swagger.parameters['state_id'] = {
       in: 'path',
       description: 'Filtro que identifica o id do estado no qual o endereço está localizado',
       type: 'integer',
     }
     #swagger.parameters['city_id'] = {
       in: 'path',
       description: 'Filtro que identifica o id da cidade na qual o endereço está localizado',
       type: 'integer',
     }
     #swagger.parameters['obj'] = { 
       in: 'body', 
       required: 'true',
       '@schema': { 
         "required": ["street", "number", "cep"], 
         "properties": { 
           "street": { 
               "required": true,
               "type": "string",
               "example": "Rua Florianopolis", 
           },
           "number": {
               "required": true,
               "type": "number",
               "example": 123,
           },
           "cep": {
               "required": true,
               "type": "string",
               "example": "89229780", 
           },
           "complement": {
               "required": false,
               "type": "string",
               "example": "Apto. 302", 
           },
         } 
       } 
     } 
   */

    try {
      const { state_id, city_id } = req.params;
      const addressData = req.body;

      if (isNaN(state_id) || isNaN(city_id)) {
        logger.error("The 'state_id' and 'city_id' params must be integers");
        return isNaN(state_id)
          ? isNaN(city_id)
            ? res.status(400).send({
                message: "The 'state_id' and 'city_id' params must be integers",
              })
            : res
                .status(400)
                .send({ message: "The 'state_id' param must be an integer" })
          : res
              .status(400)
              .send({ message: "The 'city_id' param must be an integer" });
      }

      const state = await State.findAll({
        where: { id: { [Op.eq]: state_id } },
      });

      if (state.length === 0) {
        logger.error("Couldn't find any state with the given 'state_id'");
        return res.status(404).send({
          message: "Couldn't find any state with the given 'state_id'",
        });
      }

      const city = await City.findAll({
        where: { id: { [Op.eq]: city_id } },
      });

      if (city.length === 0) {
        logger.error("Couldn't find any city with the given 'city_id'");
        return res
          .status(404)
          .send({ message: "Couldn't find any city with the given 'city_id'" });
      }
      if (city[0].state_id !== state[0].id) {
        logger.error(
          "The 'city_id' returned a city that doesn't match with the given 'state_id'"
        );
        return res.status(400).send({
          message:
            "The 'city_id' returned a city that doesn't match with the given 'state_id'",
        });
      }
      const addressObjKeys = ["street", "number", "cep"];
      if (addressObjKeys.every((key) => key in addressData)) {
        if (typeof addressData.street !== "string") {
          logger.error("The 'street' param must be a string");
          return res
            .status(400)
            .send({ message: "The 'street' param must be a string" });
        } else if (addressData.street.length === 0) {
          logger.error("The 'street' param cannot be empty");
          return res
            .status(400)
            .send({ message: "The 'street' param cannot be empty" });
        }
        if (isNaN(addressData.number)) {
          logger.error("The 'number' param must be a number");
          return res
            .status(400)
            .send({ message: "The 'number' param must be a number" });
        }
        if (typeof addressData.cep !== "string") {
          logger.error("The 'street' param must be a string");
          return res
            .status(400)
            .send({ message: "The 'street' param must be a string" });
        } else if (addressData.cep.length < 8 || addressData.cep.length > 9) {
          logger.error("The 'cep' param is invalid");
          return res
            .status(400)
            .send({ message: "The 'cep' param is invalid" });
        } else if (addressData.cep.length === 8 && isNaN(addressData.cep)) {
          logger.error("The 'cep' param format is invalid");
          return res
            .status(400)
            .send({ message: "The 'cep' param format is invalid" });
        } else if (addressData.cep.length === 9) {
          if (addressData.cep[5] !== "-") {
            logger.error("The 'cep' param format is invalid");
            return res
              .status(400)
              .send({ message: "The 'cep' param format is invalid" });
          } else {
            addressData.cep = addressData.cep.replace("-", "");
          }
        }
      } else {
        logger.error(
          "The 'street', 'number' and 'cep' params are required in the req body"
        );
        return res.status(400).send({
          message:
            "The 'street', 'number' and 'cep' params are required in the req body",
        });
      }

      const checkDuplicate = await Address.findAll({
        where: {
          [Op.and]: [
            {
              street: {
                [Op.iLike]: `${addressData.street}`,
              },
              number: {
                [Op.eq]: addressData.number,
              },
              cep: {
                [Op.iLike]: `${addressData.cep}`,
              },
              city_id: {
                [Op.eq]: `${city[0].id}`,
              },
            },
          ],
        },
      });

      if (checkDuplicate.length) {
        logger.error("This address already exists");
        return res.status(200).send({
          message: "This address already exists",
          address_id: checkDuplicate[0].id,
        });
      }

      const newAddress = addressData.hasOwnProperty("complement")
        ? {
            city_id: city[0].id,
            street: addressData.street,
            number: addressData.number,
            complement: addressData.complement,
            cep: addressData.cep,
          }
        : {
            city_id: city[0].id,
            street: addressData.street,
            number: addressData.number,
            complement: "",
            cep: addressData.cep,
          };

      const address = await Address.create(newAddress);
      logger.info("Address registered successfully");
      return res.status(201).send({ address_id: address.id });
    } catch (error) {
      const message = validateErrors(error);
      logger.error(message);
      return res.status(400).send(message);
    }
  },
};
