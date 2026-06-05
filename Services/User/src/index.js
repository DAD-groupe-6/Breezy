const express = require('express');
const app = express();
const port = 3000;

// Route de test qui sera appelée via la Gateway
app.get('/', (req, res) => {
  res.send('[User Service] : Service fonctionnel');
});

app.listen(port, () => {
  console.log(`Service User démarré sur le port ${port}`);
});