// netlify/functions/usuarios.js
const admin = require('firebase-admin');

// Inicializar Firebase Admin (solo una vez)
if (!admin.apps.length) {
    // Opción 1: Usando variables de entorno separadas
    const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        universe_domain: "googleapis.com"
    };

    // Opción 2: Usando JSON completo (recomendado)
    // const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

exports.handler = async (event, context) => {
    // Headers CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    };

    // Manejar preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        console.log('🔍 Método HTTP:', event.httpMethod);
        console.log('🔍 Parámetros:', event.queryStringParameters);
        console.log('🔍 Body:', event.body);

        // MÉTODO POST - Guardar usuario
        if (event.httpMethod === 'POST') {
            console.log('📝 Procesando POST - Guardar usuario');
            
            if (!event.body) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Body requerido' })
                };
            }

            const datos = JSON.parse(event.body);
            console.log('📝 Datos recibidos:', datos);

            // Validaciones
            if (!datos.dni || !datos.nombre || !datos.apellidos || !datos.email) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Todos los campos son obligatorios: dni, nombre, apellidos, email' })
                };
            }

            // Verificar si el usuario ya existe
            const existeUsuario = await db.collection('usuarios').doc(datos.dni).get();
            if (existeUsuario.exists) {
                return {
                    statusCode: 409,
                    headers,
                    body: JSON.stringify({ error: 'El usuario con este DNI ya existe' })
                };
            }

            // Guardar en Firestore
            await db.collection('usuarios').doc(datos.dni).set({
                dni: datos.dni,
                nombre: datos.nombre,
                apellidos: datos.apellidos,
                email: datos.email,
                fechaCreacion: admin.firestore.FieldValue.serverTimestamp()
            });

            console.log('✅ Usuario guardado exitosamente');
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    message: 'Usuario guardado exitosamente',
                    success: true,
                    dni: datos.dni
                })
            };
        }

        // MÉTODO GET - Buscar usuario
        else if (event.httpMethod === 'GET') {
            console.log('🔍 Procesando GET - Buscar usuario');
            
            const iden = event.queryStringParameters?.iden;
            
            if (!iden) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Parámetro "iden" es requerido' })
                };
            }

            console.log('🔍 Buscando usuario con DNI:', iden);

            // Buscar en Firestore
            const docRef = db.collection('usuarios').doc(iden);
            const doc = await docRef.get();

            if (!doc.exists) {
                console.log('❌ Usuario no encontrado');
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'Usuario no encontrado' })
                };
            }

            const userData = doc.data();
            console.log('✅ Usuario encontrado:', userData);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    dni: userData.dni,
                    nombre: userData.nombre,
                    apellidos: userData.apellidos,
                    email: userData.email,
                    fechaCreacion: userData.fechaCreacion
                })
            };
        }

        // Método no permitido
        else {
            return {
                statusCode: 405,
                headers,
                body: JSON.stringify({ error: 'Método no permitido' })
            };
        }

    } catch (error) {
        console.error('❌ Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Error interno del servidor',
                message: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};