# DEVinSales API

- [Tecnologias](#tech)
- [Como Utilizar](#settings)

<a id="tech"></a>

Este projeto serve para testar os conhecimentos em NodeJS com Express e utilizando Sequelize para trabalhar com banco de dados.

## Tecnologias

O projeto desenvolvido utiliza as seguintes tecnologias:

- [NodeJS](https://nodejs.org/en/)
- [Express](https://expressjs.com/)
- [Bcrypt](https://github.com/kelektiv/node.bcrypt.js/)
- [Sequelize](https://sequelize.org/)
- [Postgres](https://www.postgresql.org/)
- [Swagger](https://swagger.io/)
- [Morgan] (https://www.npmjs.com/package/morgan)
- [Winston] (https://www.npmjs.com/package/winston)
- [Sentry] (https://sentry.io)
<a id="settings"></a>

# Como Utilizar

### **Pré-requisitos**

- Possuir o NodeJS e o Postgres instalado na sua máquina.

```bash
# Clone o Repositório
$ git clone https://github.com/sabrinamaral/devinsales_p1m3.git
```

```bash
# Entre na pasta projeto
$ cd devinsales_p1m3
```

```bash
# Já dentro da pasta do projeto.
# Instale as bibliotecas utlizadas no projeto.
$ yarn ou npm install
```

```bash
# Criar um arquivo .env a partir do arquivo com as seguintes variáveis de ambiente:
$ DATABASE_URL=postgresql://user:password@host:port/database
$ SECRET=senha
$ NODE_ENV=development
$ SENTRY=dsn da sua conta Sentry
```

```bash
# Criar o Database utilizando o Sequelize
$ yarn sequelize db:create
# ou
$ npx sequelize-cli db:create
```

```bash
# Para criar as tabelas no postgres
$ yarn migrate:up
# ou
$ npm run migrate:up
```

```bash
# Para deletar as tabelas no postgres
$ yarn migrate:down
# ou
$ npm run migrate:down
```

```bash
# Para popular os dados nas tabelas do postgres com as seeders
$ yarn seeders:up
# ou
$ npm run seeders:up
```

```bash
# Para deletas os dados das tabelas do postgres
$ yarn seeders:down
# ou
$ npm run seeders:down
```

```bash
# Executar o programa.
$ yarn dev
# ou
$ npm run dev
```

```bash
# Executar o programa.
$ yarn swagger-autogen
# ou
$ npm run swagger-autogen
```
