require("dotenv").config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const morgan = require('morgan');
const sequelize = require('./config/database.config');
const userRoutes = require('./routes/user.route');
const followRoutes = require('./routes/follow.route');
const logger = require('./logger');
const { connectPublisher } = require("./messaging/publisher");

const app = express();
const port = process.env.API_PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API User Service',
      version: '1.0.0',
      description: "Documentation du service d'User",
    },
    servers: [
      {
        url: 'http://localhost/api/v1/user',
      },
    ],
  },
  apis: ['./*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/v1/user/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/user', followRoutes);

async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info("Connected to DB");
    await sequelize.sync({ alter: true });
    logger.info("Synchronized tables");
    await connectPublisher();
    app.listen(port, () => {
      logger.info(`User service → http://localhost:${port}`);
    });
  } catch (err) {
    logger.error(`Erreur BDD : ${err.message}`);
  }
}

startServer();