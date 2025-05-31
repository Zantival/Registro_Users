const admin = require('./modelo/firebaseAdmin.js');
const express = require('express');
const cors = require('cors');

const app = express();
const usuariosrutas = require('../backend/routes/usuariosrutas.js');

app.use(cors());
app.use(express.json());

app.use('/usuario', usuariosrutas);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});