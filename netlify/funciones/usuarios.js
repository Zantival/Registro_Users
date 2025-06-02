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
    console.log('🔍 Body recibido:', event.body); // Imprime directamente event.body
    console.log('🔍 Tipo de body:', typeof event.body);
    console.log('🔍 Body length:', event.body ? event.body.length : 'N/A');

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

      // Parsear JSON con manejo seguro
      let requestBody;
      try {
        console.log('🔍 Intentando parsear JSON...');
        
        // Caso 1: Es un objeto JS nativo (ya parseado)
        if (typeof event.body === 'object' && !Array.isArray(event.body)) {
          requestBody = event.body;
        } 
        // Caso 2: Es un string JSON normal
        else if (typeof event.body === 'string') {
          // Caso especial: viene como string dentro de string
          if (event.body.trim().startsWith("{") || event.body.trim().startsWith("[")) {
            requestBody = JSON.parse(event.body);
          } else {
            // Intentamos doble parseo por si viene escapado
            requestBody = JSON.parse(JSON.parse(`"${event.body}"`));
          }
        } else {
          throw new Error('Tipo de body desconocido: ' + typeof event.body);
        }

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
          body: JSON.stringify({ 
            error: 'Datos inválidos - se esperaba objeto JSON' 
          })
        };
      }

      // Continúa con el resto de la lógica...
    }

    // GET - Consultar usuario
    if (event.httpMethod === 'GET') {
      // Lógica para GET
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