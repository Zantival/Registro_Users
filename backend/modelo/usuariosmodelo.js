class UsuariosController {
  constructor() {}

  async consultarDetalle(req, res) {
    try {
      const admin = require('./firebaseAdmin');
      let iden = req.query.iden;
      const userDoc = await admin.firestore().collection('users').doc(iden).get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: 'Usuario no encontrado: ' + iden });
      }

      const userData = userDoc.data();
      return res.status(200).json(userData);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }

  async ingresar(req, res) {
    try {
      console.log("✅ Datos recibidos procesados:", req.body);

      // Validación básica
      if (typeof req.body !== 'object' || req.body === null || Array.isArray(req.body)) {
        return res.status(400).send('Datos inválidos. Se esperaba un objeto plano.');
      }

      const admin = require('./firebaseAdmin');

      // Crear objeto limpio con los datos
      const userData = {
        dni: req.body.dni || '',
        nombre: req.body.nombre || '',
        apellidos: req.body.apellidos || '',
        email: req.body.email || '',
        fechaCreacion: new Date().toISOString()
      };

      // Validación de campos requeridos
      if (!userData.dni || !userData.nombre || !userData.email) {
        console.log("❌ Campos faltantes:", { dni: userData.dni, nombre: userData.nombre, email: userData.email });
        return res.status(400).send('Faltan campos requeridos: dni, nombre, email');
      }

      console.log("✅ Guardando usuario:", userData);

      // Guardar en Firestore
      const docRef = await admin.firestore().collection('users').add(userData);

      console.log("✅ Usuario guardado con ID:", docRef.id);
      res.status(200).json({ 
        message: "Usuario agregado exitosamente", 
        id: docRef.id 
      });

    } catch (err) {
      console.error("❌ Error:", err);
      res.status(500).send(err.message);
    }
  }
}

module.exports = new UsuariosController();