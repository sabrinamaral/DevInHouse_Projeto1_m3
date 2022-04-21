const State = require("../models/State");
const City = require("../models/City");
const { validateErrors } = require("../utils/functions");
const { ACCENT, UNNACENT } = require("../utils/constants/accents");
const { Op, where, fn, col } = require("sequelize");
const Logger = require("../config/logger");

module.exports = {
  async index(req, res) {
    /*
      #swagger.tags = ['Estado']
      #swagger.description = 'Endpoint que retorna os estados com base no nome fornecido via query, ou então todos os estados caso nenhuma query seja passada'
      #swagger.parameters['name'] = {
        in: 'query',
        description: 'Filtro que identifica o nome integral ou parcial dos estados que serão retornados',
        type: 'array',
        collectionFormat: 'multi',
      }
      #swagger.parameters['initials'] = {
        in: 'query',
        description: 'Filtro que identifica as iniciais integral ou parcial dos estados que serão retornados',
        type: 'array',
        collectionFormat: 'multi',
      }
    */
    try {
      const names = [req.query.name];
      const initials = [req.query.initials];

      if (names[0] !== undefined || initials[0] !== undefined) {
        const states = await Promise.all(
          initials
            .flat()
            .map(async (initial) => {
              return await State.findAll({
                where: { initials: { [Op.iLike]: `%${initial}%` } },
              });
            })
            .concat(
              names.flat().map(async (name) => {
                return await State.findAll({
                  where: where(
                    fn(
                      "translate",
                      fn("lower", col("State.name")),
                      ACCENT,
                      UNNACENT
                    ),
                    {
                      [Op.iLike]: `%${name
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")}%`,
                    }
                  ),
                });
              })
            )
        );

        const filteredStates = [
          ...new Map(
            states.flat().map((state) => [state["id"], state])
          ).values(),
        ];
        if (filteredStates.length === 0) {
          Logger.info(`no content`);
          return res.status(204).send();
        } else {
          Logger.info(`filter performed successfully!`);
          return res.status(200).send(filteredStates);
        }
      } else {
        const states = await State.findAll();
        if (states.length === 0) {
          Logger.info(`empty list`);
          return res.status(204).send();
        } else {
          Logger.info(`search performed successfully!`);
          return res.status(200).send({ states });
        }
      }
    } catch (error) {
      const message = validateErrors(error);
      Logger.error(error.message);
      return res.status(400).send(message);
    }
  },

  async getStateById(req, res) {
    /*
    #swagger.tags = ['Estado']
    #swagger.description = 'Endpoint que retorna um estado de acordo com o state_id fornecido'
    #swagger.parameters['state_id'] = {
      description: 'ID do estado que será buscado',
      type: 'number',
      required: 'true',
    }
  */

    try {
      const { state_id } = req.params;

      if (isNaN(state_id)) {
        Logger.error(`The 'state_id' param must be an integer`);
        return res
          .status(400)
          .send({ message: "The 'state_id' param must be an integer" });
      }

      const state = await State.findAll({
        where: { id: { [Op.eq]: state_id } },
      });

      if (state.length === 0) {
        Logger.error(`Couldn't find any state with the given 'state_id`);
        return res.status(404).send({
          message: "Couldn't find any state with the given 'state_id'",
        });
      } else {
        Logger.info(`search by ID performed successfully!`);
        return res.status(200).send(state[0]);
      }
    } catch (error) {
      const message = validateErrors(error);
      Logger.error(error.message);
      return res.status(400).send(message);
    }
  },

  async getCitiesByStateID(req, res) {
    /* 
   #swagger.tags = ['Estado']
   #swagger.description = 'Endpoint para buscar cidade(s) por estado'
   */
    try {
      const { state_id } = req.params;
      const { name } = req.query;

      const state = await State.findOne({
        where: {
          id: state_id,
        },
      });

      if (!state) {
        Logger.error(`state not found`);
        return res.status(404).json({ message: "state not found." });
      }

      const query = {
        state_id,
      };

      if (name) {
        query.name = where(
          fn("translate", fn("lower", col("City.name")), ACCENT, UNNACENT),
          {
            [Op.iLike]: `%${name
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")}%`,
          }
        );
      }

      const cities = await City.findAll({
        where: query,
        attributes: ["id", "name"],
        include: [
          {
            model: State,
            as: "state",
            attributes: ["id", "name", "initials"],
          },
        ],
      });

      if (!cities.length) {
        Logger.info(`no content`);
        return res.status(204).json({});
      }
      Logger.info("search performed successfully!");
      return res.status(200).json({ cities });
    } catch (error) {
      const message = validateErrors(error);
      Logger.error(error.message);
      return res.status(400).send(message);
    }
  },
  async postStateIdCity(req, res) {
    // #swagger.tags = ['Estado']
    // #swagger.description = 'O Endpoint verifica se o Estado já existe e se existe alguma outra cidade criada no Estado com o mesmo nome. Caso não exista, cria-se uma nova Cidade. Nesse endpoint o usuário deve ter permissão WRITE.'
    /*#swagger.parameters['state_id'] = {
      in: 'path',
      description: 'Id do Estado' ,
      type: 'number'
    }
    #swagger.parameters['obj'] = {
      in: 'body',
      required: true,
      schema: {
        $ref: '#/definitions/AddCity'
      }
    }
     #swagger.responses[201] = { 
               schema: { $ref: "#/definitions/ResState" },
        } 
      
     #swagger.responses[403] = {
        description: 'O usuário não tem permissão(Forbidden)'
      } 
     #swagger.responses[404] = {
        description: 'O Estado não existe no Banco de Dados(No found)'
      } 
     #swagger.responses[400] = {
        description: 'Já existe uma cidade com este nome para o Estado(Bad Request)'
      } 
     */

    try {
      const { state_id } = req.params;
      const { name } = req.body;

      const state = await State.findByPk(state_id);

      if (!state) {
        Logger.error(`State not found.`);
        return res
          .status(404)
          .send({ message: "O Estado não existe no Banco de Dados" });
      }

      const city = await City.findOne({
        where: {
          name: where(
            fn("translate", fn("lower", col("City.name")), ACCENT, UNNACENT),
            {
              [Op.iLike]: `%${name
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")}%`,
            }
          ),
          state_id: state.id,
        },
      });

      if (city) {
        Logger.error(
          `There is already a city with the name of ${name} in the state of ${state.name}`
        );
        return res.status(400).send({
          message: `Já existe uma cidade com nome de ${name} no Estado de ${state.name}`,
        });
      }

      const newCity = await City.create({
        name,
        state_id,
      });
      Logger.info(`City ${newCity.name} created successfully!`);
      return res.status(201).send({ city: newCity.id });
    } catch (error) {
      const message = validateErrors(error);
      Logger.error(message);
      return res.status(403).send(message);
    }
  },
};
