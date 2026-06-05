const express = require('express');
const app = express();
const port = 3000;

// Route de test qui sera appelée via la Gateway
app.get('/', (req, res) => {
  res.send('[Auth Service] : Démarrage...');
});

app.listen(port, () => {
  console.log(`Service Auth démarré sur le port ${port}`);
});