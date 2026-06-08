const express = require('express');
const app = express();
const port = 3000;
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const morgan = require('morgan');
const logger = require('./logger');

app.use(morgan('dev'));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API User Service',
      version: '1.0.0',
      description: 'Documentation du service d\'User',
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

// Route de test qui sera appelée via la Gateway
app.get('/', (req, res) => {
  res.send('[User Service] : Service fonctionnel');
});

app.listen(port, () => {
  console.log(`Service User démarré sur le port ${port}`);
});