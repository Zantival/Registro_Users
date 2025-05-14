const express = require("express");
const router = express.Router();
const usuariosController = require('../modelo/usuariosmodelo');

router.get("/detalle", usuariosController.consultarDetalle);
router.post("/guardar", usuariosController.ingresar);

module.exports = router;
