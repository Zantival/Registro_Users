console.log('🚀 Script cargado correctamente');

// Función para guardar usuario
async function guardar() {
    try {
        // Prevenir comportamiento por defecto del formulario
        if (event) {
            event.preventDefault();
        }

        console.log("🔍 DEBUGGING - Iniciando proceso de guardado");

        // Capturar valores de los campos
        const dni = document.getElementById("dni").value.trim();
        const nombre = document.getElementById("nombre").value.trim();
        const apellidos = document.getElementById("apellidos").value.trim();
        const email = document.getElementById("correo").value.trim();

        // ✅ DEBUGGING: Ver qué valores se están capturando
        console.log("🔍 DEBUGGING - Valores capturados:");
        console.log("DNI:", dni);
        console.log("Nombre:", nombre);
        console.log("Apellidos:", apellidos);
        console.log("Email:", email);

        // Validaciones básicas en el frontend
        if (!dni || !nombre || !email) {
            alert("❌ Por favor completa todos los campos obligatorios (DNI, Nombre, Email)");
            return;
        }

        // Validación básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("❌ Por favor ingresa un email válido");
            return;
        }

        // Crear objeto de datos
        const userData = {
            dni: dni,
            nombre: nombre,
            apellidos: apellidos,
            email: email
        };

        // ✅ DEBUGGING: Ver el JSON que se va a enviar
        console.log("🔍 JSON a enviar:", JSON.stringify(userData));
        console.log("🔍 Objeto parseado:", userData);

        // Mostrar mensaje de carga
        const messageDiv = document.getElementById("message");
        if (messageDiv) {
            messageDiv.textContent = "⏳ Guardando usuario...";
            messageDiv.style.color = "blue";
        }

        console.log("🔍 Enviando petición...");

        // Realizar petición fetch
        const response = await fetch("/.netlify/functions/usuarios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData)
        });

        console.log("🔍 Status de respuesta:", response.status);
        console.log("🔍 Response OK:", response.ok);

        // Obtener la respuesta como texto primero para debug
        const responseText = await response.text();
        console.log("🔍 Respuesta del servidor (raw):", responseText);

        // Intentar parsear como JSON
        let result;
        try {
            result = JSON.parse(responseText);
            console.log("🔍 Respuesta parseada:", result);
        } catch (parseError) {
            console.error("❌ Error al parsear respuesta:", parseError);
            throw new Error(`Respuesta no válida del servidor: ${responseText}`);
        }

        // Verificar si la respuesta fue exitosa
        if (response.ok) {
            console.log("✅ Usuario guardado exitosamente");
            
            // Mostrar mensaje de éxito
            if (messageDiv) {
                messageDiv.textContent = "✅ Usuario guardado correctamente!";
                messageDiv.style.color = "green";
            }
            
            alert("✅ Usuario guardado correctamente!");
            
            // Limpiar formulario
            limpiarFormulario();
            
        } else {
            // Error del servidor
            console.error("❌ Error del servidor:", result);
            
            if (messageDiv) {
                messageDiv.textContent = `❌ Error: ${result.error || 'Error desconocido'}`;
                messageDiv.style.color = "red";
            }
            
            alert(`❌ Error: ${result.error || 'Error desconocido'}`);
        }

    } catch (error) {
        console.error("❌ Error en la petición:", error);
        
        const messageDiv = document.getElementById("message");
        if (messageDiv) {
            messageDiv.textContent = `❌ Error de conexión: ${error.message}`;
            messageDiv.style.color = "red";
        }
        
        alert(`❌ Error de conexión: ${error.message}`);
    }
}

// Función para limpiar el formulario
function limpiarFormulario() {
    const campos = ['dni', 'nombre', 'apellidos', 'correo'];
    campos.forEach(campo => {
        const elemento = document.getElementById(campo);
        if (elemento) {
            elemento.value = '';
        }
    });
    console.log("🧹 Formulario limpiado");
}

// Función para cargar y mostrar datos de usuario
function cargar(resultado) {
    try {
        console.log("🔍 Cargando resultado:", resultado);
        
        let transformado;
        if (typeof resultado === 'string') {
            transformado = JSON.parse(resultado);
        } else {
            transformado = resultado;
        }
        
        let salida = "";
        
        // Verificar si hay error en la respuesta
        if (transformado.error) {
            salida = `<div style="color: red;">❌ Error: ${transformado.error}</div>`;
        } else {
            // Mostrar datos del usuario
            for (const [clave, valor] of Object.entries(transformado)) {
                salida += `<div><strong>${clave}:</strong> ${valor}</div>`;
            }
        }
        
        const rtaElement = document.getElementById("rta");
        if (rtaElement) {
            rtaElement.innerHTML = salida;
        }
        
        console.log("✅ Datos cargados en la interfaz");
        
    } catch (error) {
        console.error("❌ Error al cargar datos:", error);
        const rtaElement = document.getElementById("rta");
        if (rtaElement) {
            rtaElement.innerHTML = `<div style="color: red;">❌ Error al procesar datos: ${error.message}</div>`;
        }
    }
}

// Función para listar/buscar usuario
async function listar() {
    try {
        // Prevenir comportamiento por defecto
        if (event) {
            event.preventDefault();
        }

        console.log("🔍 Iniciando búsqueda de usuario");

        const ndoc = document.getElementById("numdoc").value.trim();
        
        if (!ndoc) {
            alert("❌ Por favor ingresa un número de documento");
            return;
        }

        console.log("🔍 Buscando usuario con ID:", ndoc);

        // Mostrar mensaje de carga
        const rtaElement = document.getElementById("rta");
        if (rtaElement) {
            rtaElement.innerHTML = "⏳ Buscando usuario...";
        }

        const response = await fetch(`/.netlify/functions/usuarios?iden=${encodeURIComponent(ndoc)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        console.log("🔍 Status de búsqueda:", response.status);

        const responseText = await response.text();
        console.log("🔍 Respuesta de búsqueda:", responseText);

        if (response.ok) {
            cargar(responseText);
        } else {
            // Manejar errores
            let errorData;
            try {
                errorData = JSON.parse(responseText);
            } catch {
                errorData = { error: responseText };
            }
            
            if (rtaElement) {
                rtaElement.innerHTML = `<div style="color: red;">❌ ${errorData.error || 'Usuario no encontrado'}</div>`;
            }
            
            console.log("❌ Usuario no encontrado o error:", errorData);
        }

    } catch (error) {
        console.error("❌ Error en la búsqueda:", error);
        
        const rtaElement = document.getElementById("rta");
        if (rtaElement) {
            rtaElement.innerHTML = `<div style="color: red;">❌ Error de conexión: ${error.message}</div>`;
        }
    }
}

// Función para verificar conexión (opcional - para testing)
async function probarConexion() {
    try {
        console.log("🔍 Probando conexión con el servidor...");
        
        const response = await fetch("/.netlify/functions/usuarios", {
            method: "OPTIONS"
        });
        
        console.log("🔍 Status de conexión:", response.status);
        
        if (response.ok) {
            console.log("✅ Conexión exitosa con el servidor");
            return true;
        } else {
            console.log("❌ Problema de conexión");
            return false;
        }
        
    } catch (error) {
        console.error("❌ Error de conexión:", error);
        return false;
    }
}

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM cargado completamente");
    
    // Opcional: probar conexión al cargar
    // probarConexion();
    
    // Agregar event listeners a los formularios si existen
    const formGuardar = document.getElementById("formGuardar");
    if (formGuardar) {
        formGuardar.addEventListener("submit", guardar);
    }
    
    const formBuscar = document.getElementById("formBuscar");
    if (formBuscar) {
        formBuscar.addEventListener("submit", listar);
    }
    
    console.log("✅ Event listeners configurados");
});

console.log('✅ Script scriptusu.js cargado completamente');