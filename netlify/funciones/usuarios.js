var express = require('express');
var cors = require("cors");
var serverless = require('serverless-http');
var app = express();
var usuroutes = require("../../backend/routes/usuariosrutas.js");

// ✅ CONFIGURACIÓN CORRECTA DE MIDDLEWARES
app.use(cors());

// ✅ MIDDLEWARE PERSONALIZADO PARA MANEJAR EL BUFFER
app.use('/.netlify/functions', (req, res, next) => {
  // Si el body es un Buffer, convertirlo a string y parsearlo como JSON
  if (Buffer.isBuffer(req.body) && req.headers['content-type'] === 'application/json') {
    try {
      const bodyString = req.body.toString('utf8');
      console.log('🔍 Buffer convertido a string:', bodyString);
      req.body = JSON.parse(bodyString);
      console.log('✅ JSON parseado correctamente:', req.body);
    } catch (error) {
      console.error('❌ Error al parsear JSON:', error);
      return res.status(400).json({ error: 'JSON inválido' });
    }
  }
  next();
});

// ✅ MIDDLEWARES ESTÁNDAR (como respaldo)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ DEBUGGING (opcional, puedes comentar después)
app.use('/.netlify/functions', (req, res, next) => {
  console.log('🔍 Método:', req.method);
  console.log('🔍 URL:', req.url);
  console.log('🔍 Body final procesado:', req.body);
  console.log('🔍 Body type:', typeof req.body);
  next();
});

// ✅ RUTAS
var router = express.Router();
router.use("/usuarios", usuroutes);
app.use('/.netlify/functions', router);

// ✅ EXPORTAR
exports.handler = serverless(app);