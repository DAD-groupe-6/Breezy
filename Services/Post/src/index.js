const express = require('express');
const app = express();
const port = 3000;
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Post Service',
      version: '1.0.0',
      description: 'Documentation du service de post',
    },
    servers: [
      {
        url: 'http://localhost/api/v1/post',
      },
    ],
  },
  apis: ['./*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Route de test qui sera appelée via la Gateway
app.get('/', (req, res) => {
  res.send('[Post Service] : Service fonctionnel');
});

app.listen(port, () => {
  console.log(`Service Post démarré sur le port ${port}`);
});