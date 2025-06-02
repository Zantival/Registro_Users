const admin = require('firebase-admin');

// Configuración de Firebase Admin
const initializeFirebase = () => {
  if (!admin.apps.length) {
    try {
      // Opción 1: Usar JSON completo de variable de entorno
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      
      console.log('✅ Firebase Admin inicializado');
    } catch (error) {
      console.error('❌ Error al inicializar Firebase:', error.message);
      throw error;
    }
  }
  return admin;
};

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Manejar preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    console.log('🔍 Método HTTP:', event.httpMethod);
    console.log('🔍 Headers:', event.headers);
    console.log('🔍 Datos recibidos:', event.body);
    console.log('🔍 Tipo de body:', typeof event.body);
    console.log('🔍 Body es null?', event.body === null);
    console.log('🔍 Body es undefined?', event.body === undefined);

    const firebaseAdmin = initializeFirebase();
    const db = firebaseAdmin.firestore();

    // GET - Consultar usuario
    if (event.httpMethod === 'GET') {
      const iden = event.queryStringParameters?.iden;
      
      if (!iden) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Parámetro iden requerido' })
        };
      }

      const userDoc = await db.collection('users').doc(iden).get();
      
      if (!userDoc.exists) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Usuario no encontrado: ' + iden })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(userDoc.data())
      };
    }

    // POST - Crear usuario
    if (event.httpMethod === 'POST') {
      console.log('🔍 event.body recibido:', event.body);
      console.log('🔍 Tipo de event.body:', typeof event.body);
      
      if (!event.body) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'No se recibieron datos en el body' })
        };
      }

      let requestBody;
      try {
        requestBody = JSON.parse(event.body);
      } catch (parseError) {
        console.error('❌ Error al parsear JSON:', parseError.message);
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
      
      console.log('✅ Datos procesados:', requestBody);

      // Validación básica
      if (!requestBody || typeof requestBody !== 'object') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Datos inválidos' })
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

      console.log('✅ Guardando usuario:', userData);

      // Guardar en Firestore
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
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' })
    };

  } catch (error) {
    console.error('❌ Error en función:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};