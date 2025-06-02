const admin = require('firebase-admin');

// Configuración de Firebase Admin
const initializeFirebase = () => {
  if (!admin.apps.length) {
    try {
      console.log('🔍 Inicializando Firebase...');
      
      // Verificar que las variables de entorno existen
      if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT no está definido');
      }
      
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      
      console.log('✅ Firebase Admin inicializado correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar Firebase:', error.message);
      throw error;
    }
  }
  return admin;
};

exports.handler = async (event, context) => {
  console.log('🚀 Función iniciada');
  console.log('🔍 Evento completo:', JSON.stringify(event, null, 2));
  
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Manejar preflight OPTIONS
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
    console.log('🔍 Headers recibidos:', event.headers);
    console.log('🔍 Body recibido:', event.body);
    console.log('🔍 Tipo de body:', typeof event.body);
    console.log('🔍 Body length:', event.body ? event.body.length : 'N/A');

    // GET - Consultar usuario
    if (event.httpMethod === 'GET') {
      console.log('📖 Procesando GET request');
      
      const iden = event.queryStringParameters?.iden;
      console.log('🔍 ID solicitado:', iden);
      
      if (!iden) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Parámetro iden requerido' })
        };
      }

      const firebaseAdmin = initializeFirebase();
      const db = firebaseAdmin.firestore();
      const userDoc = await db.collection('users').doc(iden).get();
      
      if (!userDoc.exists) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Usuario no encontrado: ' + iden })
        };
      }

      console.log('✅ Usuario encontrado');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(userDoc.data())
      };
    }

    // POST - Crear usuario
    if (event.httpMethod === 'POST') {
      console.log('📝 Procesando POST request');
      
      // Verificar si hay body
      if (!event.body) {
        console.error('❌ No hay body en la petición');
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'No se recibió body en la petición',
            debug: {
              method: event.httpMethod,
              headers: event.headers,
              hasBody: !!event.body
            }
          })
        };
      }

      // Parsear JSON
      let requestBody;
      try {
        console.log('🔍 Intentando parsear JSON...');
        requestBody = JSON.parse(event.body);
        console.log('✅ JSON parseado correctamente:', requestBody);
      } catch (parseError) {
        console.error('❌ Error al parsear JSON:', parseError.message);
        console.error('❌ Body que causó el error:', event.body);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'JSON inválido', 
            received: event.body,
            parseError: parseError.message 
          })
        };
      }

      // Validación básica
      if (!requestBody || typeof requestBody !== 'object') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Datos inválidos - se esperaba objeto JSON' })
        };
      }

      // Crear objeto limpio
      const userData = {
        dni: requestBody.dni || '',
        nombre: requestBody.nombre || '',
        apellidos: requestBody.apellidos || '',
        email: requestBody.email || '',
        fechaCreacion: new Date().toISOString()
      };

      console.log('🔍 Datos procesados:', userData);

      // Validar campos requeridos
      if (!userData.dni || !userData.nombre || !userData.email) {
        console.log('❌ Campos faltantes:', userData);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Faltan campos requeridos: dni, nombre, email',
            received: userData 
          })
        };
      }

      console.log('✅ Validación pasada, guardando en Firebase...');

      // Inicializar Firebase y guardar
      const firebaseAdmin = initializeFirebase();
      const db = firebaseAdmin.firestore();
      const docRef = await db.collection('users').add(userData);
      
      console.log('✅ Usuario guardado con ID:', docRef.id);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          message: "Usuario agregado exitosamente", 
          id: docRef.id,
          data: userData
        })
      };
    }

    // Método no permitido
    console.log('❌ Método no permitido:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido: ' + event.httpMethod })
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