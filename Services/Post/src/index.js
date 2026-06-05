const express = require('express');
const app = express();
const port = 3000;

// Route de test qui sera appelée via la Gateway
app.get('/', (req, res) => {
  res.send('[Post Service] : Démarrage...');
});

app.listen(port, () => {
  console.log(`Service Post démarré sur le port ${port}`);
});