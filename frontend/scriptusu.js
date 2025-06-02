// ✅ FUNCIÓN GUARDAR - Optimizada
function guardar() {
    // Prevenir envío del formulario
    if (event) event.preventDefault();
    
    // ✅ DEBUGGING: Ver qué valores se están capturando
    console.log("🔍 DEBUGGING - Valores capturados:");
    console.log("DNI:", document.getElementById("dni").value);
    console.log("Nombre:", document.getElementById("nombre").value);
    console.log("Apellidos:", document.getElementById("apellidos").value);
    console.log("Email:", document.getElementById("correo").value);
    
    // Validar que todos los campos estén llenos
    const dni = document.getElementById("dni").value;
    const nombre = document.getElementById("nombre").value;
    const apellidos = document.getElementById("apellidos").value;
    const email = document.getElementById("correo").value;
    
    if (!dni || !nombre || !apellidos || !email) {
        alert("❌ Por favor, llena todos los campos");
        return;
    }
    
    // Crear el objeto de datos
    const userData = {
        "dni": dni,
        "nombre": nombre,
        "apellidos": apellidos,
        "email": email
    };
    
    // ✅ DEBUGGING: Ver el JSON que se va a enviar
    const raw = JSON.stringify(userData);
    console.log("🔍 JSON a enviar:", raw);
    console.log("🔍 Objeto parseado:", userData);
    
    // Configurar headers
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    
    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };
    
    console.log("🔍 Enviando petición...");
    
    fetch("https://registrousers.netlify.app/.netlify/functions/usuarios", requestOptions)
        .then((response) => {
            console.log("🔍 Status de respuesta:", response.status);
            console.log("🔍 Response OK:", response.ok);
            return response.json(); // Cambiar a .json() en lugar de .text()
        })
        .then((result) => {
            console.log("🔍 Respuesta del servidor:", result);
            
            // Verificar si la respuesta indica éxito
            if (result.success) {
                alert("✅ Usuario guardado correctamente!");
                console.log("✅ Datos guardados:", result.data);
                
                // Limpiar formulario después de éxito
                document.getElementById("dni").value = "";
                document.getElementById("nombre").value = "";
                document.getElementById("apellidos").value = "";
                document.getElementById("correo").value = "";
            } else {
                alert("❌ Error: " + (result.error || "Error desconocido"));
                console.error("❌ Error del servidor:", result);
            }
        })
        .catch((error) => {
            console.error("❌ Error en la petición:", error);
            alert("❌ Error de conexión: " + error.message);
        });
}

// ✅ FUNCIÓN CARGAR - Mejorada para manejar la nueva respuesta
function cargar(resultado) {
    console.log("🔍 Procesando resultado:", resultado);
    
    try {
        let transformado;
        
        // Si resultado ya es un objeto, usarlo directamente
        if (typeof resultado === 'object') {
            transformado = resultado;
        } else {
            // Si es string, parsearlo
            transformado = JSON.parse(resultado);
        }
        
        console.log("✅ Objeto transformado:", transformado);
        
        var salida = "";
        
        // Si hay datos en la respuesta, mostrarlos
        if (transformado.success && transformado.data) {
            const datos = transformado.data;
            salida += "<h3>✅ Usuario encontrado:</h3>";
            
            for (const [clave, valor] of Object.entries(datos)) {
                salida += `<strong>${clave.toUpperCase()}:</strong> ${valor}<br>`;
            }
        } else if (transformado.success) {
            salida = "<h3>✅ " + transformado.message + "</h3>";
        } else {
            salida = "<h3>❌ " + (transformado.error || "Error desconocido") + "</h3>";
        }
        
        document.getElementById("rta").innerHTML = salida;
        
    } catch (error) {
        console.error("❌ Error procesando resultado:", error);
        document.getElementById("rta").innerHTML = "<h3>❌ Error procesando respuesta</h3>";
    }
}

// ✅ FUNCIÓN LISTAR - Optimizada
function listar() {
    if (event) event.preventDefault();
    
    const ndoc = document.getElementById("numdoc").value;
    
    if (!ndoc) {
        alert("❌ Por favor, ingresa el número de documento");
        return;
    }
    
    console.log("🔍 Buscando usuario con documento:", ndoc);
    
    const requestOptions = {
        method: "GET",
        redirect: "follow"
    };
    
    fetch(`https://registrousers.netlify.app/.netlify/functions/usuarios?iden=${ndoc}`, requestOptions)
        .then((response) => {
            console.log("🔍 Status respuesta listar:", response.status);
            return response.json(); // Cambiar a .json()
        })
        .then((result) => {
            console.log("✅ Resultado listar:", result);
            cargar(result);
        })
        .catch((error) => {
            console.error("❌ Error listando:", error);
            document.getElementById("rta").innerHTML = "<h3>❌ Error de conexión: " + error.message + "</h3>";
        });
}

// ✅ FUNCIÓN DE PRUEBA - Para debugging
function probarConexion() {
    console.log("🔍 Probando conexión a la API...");
    
    fetch("https://registrousers.netlify.app/.netlify/functions/usuarios")
        .then(response => response.json())
        .then(data => {
            console.log("✅ Conexión exitosa:", data);
            alert("✅ API funcionando: " + data.message);
        })
        .catch(error => {
            console.error("❌ Error de conexión:", error);
            alert("❌ Error de conexión: " + error.message);
        });
}

// ✅ Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ scriptusu.js cargado correctamente');
    
    // Agregar event listeners si existen los elementos
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', guardar);
    }
    
    const listBtn = document.getElementById('listBtn');
    if (listBtn) {
        listBtn.addEventListener('click', listar);
    }
    
    // Hacer las funciones disponibles globalmente
    window.guardar = guardar;
    window.listar = listar;
    window.cargar = cargar;
    window.probarConexion = probarConexion;
});