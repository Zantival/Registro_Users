const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

// ✅ MIDDLEWARES BÁSICOS
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ MIDDLEWARE DE DEBUGGING
app.use((req, res, next) => {
  console.log('🔍 Método:', req.method);
  console.log('🔍 URL:', req.url);
  console.log('🔍 Query:', req.query);
  console.log('🔍 Body:', req.body);
  next();
});

// ✅ RUTA GET - Para obtener usuarios
app.get('/', (req, res) => {
  try {
    const { iden } = req.query;
    
    if (iden) {
      console.log('✅ Obteniendo usuario con ID:', iden);
      return res.status(200).json({ 
        success: true,
        message: 'Usuario encontrado', 
        data: {
          dni: iden,
          nombre: 'Usuario Test',
          apellidos: 'Apellido Test',
          email: 'test@email.com'
        }
      });
    }
    
    // Sin parámetro iden
    res.status(200).json({ 
      success: true,
      message: 'API usuarios funcionando correctamente' 
    });
    
  } catch (error) {
    console.error('❌ Error en GET:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener usuario',
      details: error.message 
    });
  }
});

// ✅ RUTA POST - Para crear usuarios
app.post('/', (req, res) => {
  try {
    console.log('✅ Creando usuario con datos:', req.body);
    
    const { dni, nombre, apellidos, email } = req.body;
    
    // Validar datos requeridos
    if (!dni || !nombre || !apellidos || !email) {
      return res.status(400).json({ 
        success: false,
        error: 'Faltan datos requeridos',
        required: ['dni', 'nombre', 'apellidos', 'email'],
        received: req.body
      });
    }
    
    // Simular creación exitosa
    res.status(200).json({ 
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        dni,
        nombre,
        apellidos,
        email,
        id: Date.now() // ID temporal
      }
    });
    
  } catch (error) {
    console.error('❌ Error en POST:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al crear usuario',
      details: error.message 
    });
  }
});

// ✅ MANEJO DE RUTAS NO ENCONTRADAS
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Ruta no encontrada',
    method: req.method,
    url: req.url
  });
});

// ✅ MANEJO GLOBAL DE ERRORES
app.use((error, req, res, next) => {
  console.error('❌ Error global:', error);
  res.status(500).json({ 
    success: false,
    error: 'Error interno del servidor',
    message: error.message 
  });
});

// ✅ EXPORTAR
module.exports.handler = serverless(app);