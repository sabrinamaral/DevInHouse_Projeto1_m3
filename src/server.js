const express = require("express");
const app = express();
const PORT = process.env.PORT || 3333;
const routes = require("./routes");
require("./database");
const swaggerUI = require("swagger-ui-express");
const swaggerFile = require("./swagger.json");
const logger = require("./config/logger");
const morgan = require("morgan");
const morganLog = require("./config/morgan");
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");

app.use(express.json());
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
app.use(morgan("combined", { stream: morganLog }));
app.use(routes);
app.use(Sentry.Handlers.errorHandler());

Sentry.init({
  dsn: process.env.SENTRY,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],
  tracesSampleRate: 1.0,
});

app.use("/api/v1/docs", swaggerUI.serve, swaggerUI.setup(swaggerFile));
logger.info("aplicação online");

app.listen(PORT, () => console.log(`Executando na porta ${PORT}`));
