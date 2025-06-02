const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

// Configuración de middlewares
app.use(cors({
  origin: ['https://registrousers.netlify.app', 'http://localhost:*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base de datos temporal (en memoria)
let usuariosDB = [];

// Rutas
const router = express.Router();

// POST - Crear nuevo usuario
router.post('/usuarios', (req, res) => {
  try {
    const { dni, nombre, apellidos, email } = req.body;

    // Validación de campos
    if (!dni || !nombre || !apellidos || !email) {
      return res.status(400).json({ 
        error: "Todos los campos son requeridos",
        campos: { dni, nombre, apellidos, email }
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = usuariosDB.find(u => u.dni === dni);
    if (usuarioExistente) {
      return res.status(409).json({ 
        error: "El usuario ya existe",
        usuario: usuarioExistente
      });
    }

    // Crear nuevo usuario
    const nuevoUsuario = {
      id: Date.now().toString(),
      dni,
      nombre,
      apellidos,
      email,
      fechaRegistro: new Date().toISOString()
    };

    usuariosDB.push(nuevoUsuario);

    return res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      usuario: nuevoUsuario
    });

  } catch (error) {
    console.error("Error en POST /usuarios:", error);
    return res.status(500).json({ 
      error: "Error interno del servidor",
      detalle: error.message
    });
  }
});

// GET - Obtener usuario por DNI
router.get('/usuarios', (req, res) => {
  try {
    const { dni } = req.query;

    if (!dni) {
      return res.status(400).json({ 
        error: "El parámetro 'dni' es requerido" 
      });
    }

    const usuario = usuariosDB.find(u => u.dni === dni);

    if (!usuario) {
      return res.status(404).json({ 
        error: "Usuario no encontrado",
        dniBuscado: dni
      });
    }

    return res.json({
      success: true,
      usuario
    });

  } catch (error) {
    console.error("Error en GET /usuarios:", error);
    return res.status(500).json({ 
      error: "Error interno del servidor",
      detalle: error.message
    });
  }
});

// PUT - Actualizar usuario
router.put('/usuarios', (req, res) => {
  try {
    const { dni, nombre, apellidos, email } = req.body;

    if (!dni) {
      return res.status(400).json({ 
        error: "El campo 'dni' es requerido para actualizar" 
      });
    }

    const usuarioIndex = usuariosDB.findIndex(u => u.dni === dni);

    if (usuarioIndex === -1) {
      return res.status(404).json({ 
        error: "Usuario no encontrado",
        dniBuscado: dni
      });
    }

    // Actualizar solo los campos proporcionados
    if (nombre) usuariosDB[usuarioIndex].nombre = nombre;
    if (apellidos) usuariosDB[usuarioIndex].apellidos = apellidos;
    if (email) usuariosDB[usuarioIndex].email = email;

    return res.json({
      success: true,
      message: "Usuario actualizado exitosamente",
      usuario: usuariosDB[usuarioIndex]
    });

  } catch (error) {
    console.error("Error en PUT /usuarios:", error);
    return res.status(500).json({ 
      error: "Error interno del servidor",
      detalle: error.message
    });
  }
});

// DELETE - Eliminar usuario
router.delete('/usuarios', (req, res) => {
  try {
    const { dni } = req.query;

    if (!dni) {
      return res.status(400).json({ 
        error: "El parámetro 'dni' es requerido" 
      });
    }

    const usuarioIndex = usuariosDB.findIndex(u => u.dni === dni);

    if (usuarioIndex === -1) {
      return res.status(404).json({ 
        error: "Usuario no encontrado",
        dniBuscado: dni
      });
    }

    const [usuarioEliminado] = usuariosDB.splice(usuarioIndex, 1);

    return res.json({
      success: true,
      message: "Usuario eliminado exitosamente",
      usuario: usuarioEliminado
    });

  } catch (error) {
    console.error("Error en DELETE /usuarios:", error);
    return res.status(500).json({ 
      error: "Error interno del servidor",
      detalle: error.message
    });
  }
});

// Configuración base de la ruta
app.use('/.netlify/functions/usuarios', router);

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error("Error global no manejado:", err);
  res.status(500).json({ 
    error: "Error interno del servidor",
    detalle: err.message
  });
});

// Exportar para Netlify
module.exports.handler = serverless(app);