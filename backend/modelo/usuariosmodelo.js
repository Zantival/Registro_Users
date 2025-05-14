const admin = require("firebase-admin");

class UsuariosController {
    constructor() {}

    async consultarDetalle(req, res) {
        try {
            let iden = req.query.iden;
            const userDoc = await admin.firestore().collection('users').doc(iden).get();

            if (!userDoc.exists) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            const userData = userDoc.data();
            res.status(200).json(userData);
        } catch (error) {
            console.error('Error consultando detalle:', error);
            res.status(500).json({ message: 'Error del servidor' });
        }
    }

    async ingresar(req, res) {
        try {
            const user = req.body;
            if (!user.dni) {
                return res.status(400).json({ message: "Falta el campo 'dni'" });
            }

            await admin.firestore().collection('users').doc(user.dni).set(user);
            res.status(200).json({ message: "Usuario registrado correctamente" });
        } catch (error) {
            console.error('Error ingresando usuario:', error);
            res.status(500).json({ message: "Error del servidor" });
        }
    }
}

module.exports = new UsuariosController();
