exports.handler = async (event, context) => {
  // Configurar timeout más corto
  context.callbackWaitsForEmptyEventLoop = false;
  
  console.log('🔍 Iniciando función...');
  console.log('🔍 Método:', event.httpMethod);
  console.log('🔍 Path:', event.path);
  
  try {
    const method = event.httpMethod;
    const queryParams = event.queryStringParameters || {};
    
    // Headers básicos para todas las respuestas
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };
    
    // MANEJAR OPTIONS primero (para CORS)
    if (method === 'OPTIONS') {
      console.log('✅ Respondiendo OPTIONS');
      return {
        statusCode: 200,
        headers,
        body: ''
      };
    }
    
    // MANEJAR GET
    if (method === 'GET') {
      console.log('✅ Procesando GET');
      const { iden } = queryParams;
      
      const response = {
        success: true,
        message: iden ? `Usuario: ${iden}` : 'API funcionando',
        timestamp: new Date().toISOString()
      };
      
      console.log('✅ Enviando respuesta GET:', response);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response)
      };
    }
    
    // MANEJAR POST
    if (method === 'POST') {
      console.log('✅ Procesando POST');
      console.log('🔍 Body recibido:', event.body);
      
      let data = {};
      if (event.body) {
        try {
          data = JSON.parse(event.body);
          console.log('✅ JSON parseado:', data);
        } catch (e) {
          console.log('❌ Error parseando JSON:', e.message);
        }
      }
      
      const response = {
        success: true,
        message: 'POST recibido',
        received: data,
        timestamp: new Date().toISOString()
      };
      
      console.log('✅ Enviando respuesta POST:', response);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response)
      };
    }
    
    // Método no soportado
    console.log('❌ Método no soportado:', method);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        error: `Método ${method} no permitido`
      })
    };
    
  } catch (error) {
    console.error('❌ Error capturado:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};