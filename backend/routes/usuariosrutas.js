const express = require("express");
const router = express.Router();
const usuariosmodel = require("../modelo/usuariosmodelo.js");

// Middleware para validar ID
const validarId = (req, res, next) => {
  const { iden } = req.params;
  if (!iden || !/^[a-zA-Z0-9-_]+$/.test(iden)) {
    return res.status(400).json({ error: "ID inválido" });
  }
  next();
};

// Middleware para validar datos de usuario
const validarUsuario = (req, res, next) => {
  if (req.method === 'POST' && (!req.body || Object.keys(req.body).length === 0)) {
    return res.status(400).json({ error: "Datos de usuario requeridos" });
  }
  next();
};

// Configuración de rutas
router.route("/")
  .get(usuariosmodel.consultarDetalle) // GET /usuarios/
  .post(validarUsuario, usuariosmodel.ingresar); // POST /usuarios/

router.route("/:iden")
  .all(validarId) // Aplica a todos los métodos para esta ruta
  .get(usuariosmodel.consultarDetalle) // GET /usuarios/:iden
  //.put(usuariosmodel.actualizar)
  //.delete(usuariosmodel.borrar);

// Manejo de errores centralizado
router.use((err, req, res, next) => {
  console.error("Error en rutas de usuarios:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

module.exports = router;