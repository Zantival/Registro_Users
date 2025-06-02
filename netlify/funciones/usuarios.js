const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

// ✅ MIDDLEWARES BÁSICOS
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ DEBUGGING - Middleware para ver qué llega
app.use((req, res, next) => {
  console.log('🔍 Método:', req.method);
  console.log('🔍 URL:', req.url);
  console.log('🔍 Body:', req.body);
  console.log('🔍 Headers:', req.headers);
  next();
});

// ✅ RUTAS DIRECTAS (sin archivo externo por ahora)
app.get('/', (req, res) => {
  res.json({ message: 'Función usuarios funcionando' });
});

// Ruta para obtener usuario por ID
app.get('/', (req, res) => {
  const { iden } = req.query;
  console.log('🔍 Obteniendo usuario con ID:', iden);
  
  // Aquí iría tu lógica para obtener el usuario
  res.json({ 
    message: 'Usuario obtenido', 
    id: iden,
    data: { /* tus datos aquí */ }
  });
});

// Ruta para crear usuario
app.post('/', (req, res) => {
  console.log('🔍 Creando usuario:', req.body);
  
  // Validar datos requeridos
  const { dni, nombre, apellidos, email } = req.body;
  
  if (!dni || !nombre || !apellidos || !email) {
    return res.status(400).json({ 
      error: 'Faltan datos requeridos',
      required: ['dni', 'nombre', 'apellidos', 'email']
    });
  }
  
  // Aquí iría tu lógica para guardar el usuario
  res.json({ 
    message: 'Usuario creado exitosamente',
    data: req.body
  });
});

// ✅ MANEJO DE ERRORES
app.use((error, req, res, next) => {
  console.error('❌ Error en la función:', error);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: error.message 
  });
});

// ✅ EXPORTAR
module.exports.handler = serverless(app);