// backend/modelo/firebaseAdmin.js
const admin = require('firebase-admin');

// Configuración usando variables de entorno
const serviceAccount = {
    type: process.env.FIREBASE_TYPE || "service_account", // Añadido
    project_id: process.env.FIREBASE_PROJECT_ID || "registron-de-usuarios",
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Este .replace está bien si la key viene con \\n escapados
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth", // Añadido
    token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",     // Añadido
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs", // Añadido
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL, // Asegúrate de que esta variable sea la que usas
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || "googleapis.com" // Añadido
};

// Inicializar Firebase Admin solo si no está ya inicializado
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            // No es necesario especificar projectId aquí de nuevo si ya está en el serviceAccount
            // projectId: process.env.FIREBASE_PROJECT_ID || "registron-de-usuarios"
        });
        console.log('✅ Firebase Admin inicializado correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar Firebase Admin:', error.message);
        throw error;
    }
} else {
    console.log('✅ Firebase Admin ya estaba inicializado');
}

module.exports = admin;