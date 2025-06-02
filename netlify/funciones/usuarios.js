const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const app = express();

// Configuración mejorada de middlewares
app.use(cors({
    origin: ['https://registrousers.netlify.app', 'http://localhost:*'],
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Manejo de body parsing optimizado
app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));

app.use(express.urlencoded({ extended: true }));

// Middleware de logging para desarrollo
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        console.log('Headers:', req.headers);
        console.log('Body:', req.body);
        next();
    });
}

// Simulación de base de datos (reemplazar con tu conexión real)
const usuariosDB = [];

// Rutas mejoradas
const router = express.Router();

// POST para crear usuarios
router.post('/usuarios', async (req, res) => {
    try {
        const { dni, nombre, apellidos, email } = req.body;

        // Validación de backend
        if (!dni || !nombre || !apellidos || !email) {
            return res.status(400).json({ error: "Todos los campos son requeridos" });
        }

        // Verificar si el usuario ya existe
        if (usuariosDB.some(u => u.dni === dni)) {
            return res.status(409).json({ error: "El usuario ya existe" });
        }

        // Crear nuevo usuario
        const nuevoUsuario = { dni, nombre, apellidos, email, fechaRegistro: new Date() };
        usuariosDB.push(nuevoUsuario);

        res.status(201).json({
            message: "Usuario registrado exitosamente",
            usuario: nuevoUsuario
        });

    } catch (error) {
        console.error("Error en POST /usuarios:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// GET para buscar usuarios
router.get('/usuarios', (req, res) => {
    try {
        const { dni } = req.query;

        if (!dni) {
            return res.status(400).json({ error: "Parámetro 'dni' requerido" });
        }

        const usuario = usuariosDB.find(u => u.dni === dni);

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json(usuario);

    } catch (error) {
        console.error("Error en GET /usuarios:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Manejo de errores centralizado
app.use((err, req, res, next) => {
    console.error("Error no manejado:", err);
    res.status(500).json({ error: "Algo salió mal en el servidor" });
});

// Configuración de rutas base
app.use('/.netlify/functions/usuarios', router);

// Exportar handler para Netlify
module.exports.handler = serverless(app);