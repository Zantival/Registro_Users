// netlify/funciones/usuarios.js
const admin = require('../../backend/modelo/firebaseAdmin.js');
const db = admin.firestore();

exports.handler = async (event, context) => {
    console.log('🚀 Función iniciada');
    console.log('🔍 Evento completo:', JSON.stringify(event, null, 2));

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        console.log('📋 Manejando preflight OPTIONS');
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS preflight' })
        };
    }

    try {
        console.log('🔍 Método HTTP:', event.httpMethod);
        console.log('🔍 Path completo:', event.path); // Muestra la ruta completa
        console.log('🔍 Body recibido:', event.body);

        // Determinar la "acción" basada en la ruta
        // Si el path es '/.netlify/functions/usuarios/guardar', queremos 'guardar'
        // Si es '/.netlify/functions/usuarios/detalle', queremos 'detalle'
        // Extraemos la última parte de la URL
        const pathParts = event.path.split('/');
        const action = pathParts[pathParts.length - 1]; // Obtiene 'guardar' o 'detalle'
        console.log('🔍 Acción detectada (última parte de la ruta):', action);

        // --- Lógica para POST /usuarios/guardar ---
        if (event.httpMethod === 'POST' && action === 'guardar') {
            console.log('📝 Procesando POST request para guardar usuario');

            if (!event.body) {
                console.error('❌ No hay body en la petición POST');
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'No se recibió body en la petición' })
                };
            }

            let datosUsuario;
            try {
                datosUsuario = JSON.parse(event.body);
                console.log('✅ Body parseado correctamente:', datosUsuario);
            } catch (parseError) {
                console.error('❌ Error al parsear JSON del body:', parseError.message);
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'JSON inválido', details: parseError.message })
                };
            }

            // Lógica para guardar usuario en Firestore
            await db.collection('usuarios').add(datosUsuario);
            console.log('✅ Usuario guardado correctamente');
            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({ message: 'Usuario registrado correctamente' })
            };
        }

        // --- Lógica para GET /usuarios/detalle ---
        if (event.httpMethod === 'GET' && action === 'detalle') {
            console.log('🔎 Procesando GET request para detalle de usuario');
            const dni = event.queryStringParameters ? event.queryStringParameters.iden : null;

            if (!dni) {
                console.error('❌ DNI no proporcionado para la búsqueda');
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ message: 'Por favor, ingresa un DNI.' })
                };
            }

            try {
                const usuarioSnapshot = await db.collection('usuarios').where('dni', '==', dni).limit(1).get();
                if (usuarioSnapshot.empty) {
                    console.log('🤷‍♂️ Usuario no encontrado con DNI:', dni);
                    return {
                        statusCode: 404,
                        headers,
                        body: JSON.stringify({ message: 'Usuario no encontrado' })
                    };
                }
                const usuario = usuarioSnapshot.docs[0].data();
                console.log('✅ Usuario encontrado:', usuario);
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(usuario)
                };
            } catch (queryError) {
                console.error('❌ Error al buscar usuario en Firestore:', queryError);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ message: 'Error al buscar usuario', error: queryError.message })
                };
            }
        }

        // --- Manejo de métodos y rutas no permitidas ---
        console.log(`🚫 Método o ruta no permitida: ${event.httpMethod} ${event.path}`);
        return {
            statusCode: 405, // Method Not Allowed
            headers,
            body: JSON.stringify({ error: `Método o ruta no permitida: ${event.httpMethod} ${event.path}` })
        };

    } catch (error) {
        console.error('💥 Error crítico en función:', error);
        console.error('💥 Stack trace:', error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Error interno del servidor',
                message: error.message,
                debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};