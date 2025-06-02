// backend/modelo/firebaseAdmin.js
const admin = require('firebase-admin');
// Importa el JSON directamente (TEMPORALMENTE para depuración)
const serviceAccount = require('./serviceAccountKey.json'); // Ajusta la ruta si es necesario

console.log('DEBUG: firebaseAdmin.js loaded');
console.log('DEBUG: serviceAccount object values from JSON:', {
    projectId: serviceAccount.project_id,
    privateKeyId: serviceAccount.private_key_id ? 'SET' : 'NOT SET',
    privateKey: serviceAccount.private_key ? 'SET' : 'NOT SET', // Debería ser SET
    clientEmail: serviceAccount.client_email,
    clientId: serviceAccount.client_id,
    clientCertUrl: serviceAccount.client_x509_cert_url
});

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('✅ Firebase Admin inicializado correctamente (usando JSON directo)');
    } catch (error) {
        console.error('❌ Error al inicializar Firebase Admin:', error.message);
        console.error('❌ Stack trace de error de inicialización:', error.stack);
        throw error;
    }
} else {
    console.log('✅ Firebase Admin ya estaba inicializado');
}

module.exports = admin;