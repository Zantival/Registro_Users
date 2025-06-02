function guardar(event) {
    // Prevenir el comportamiento por defecto del formulario
    event.preventDefault();
    
    let apellidos = '';
    let datoingresado = document.getElementById("correo").value;
    
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    
    // ✅ DEBUGGING: Ver qué valores se están capturando
    console.log("🔍 DEBUGGING - Valores capturados:");
    console.log("DNI:", document.getElementById("dni").value);
    console.log("Nombre:", document.getElementById("nombre").value);
    console.log("Apellidos:", document.getElementById("apellidos").value);
    console.log("Email:", document.getElementById("correo").value);
    
    // Validar que los campos no estén vacíos
    const dni = document.getElementById("dni").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const apellidos_val = document.getElementById("apellidos").value.trim();
    const email = document.getElementById("correo").value.trim();
    
    if (!dni || !nombre || !apellidos_val || !email) {
        alert("❌ Por favor, complete todos los campos");
        return;
    }
    
    // Crear el objeto de datos
    let raw = JSON.stringify({
        "dni": dni,
        "nombre": nombre,
        "apellidos": apellidos_val,
        "email": email
    });
    
    // ✅ DEBUGGING: Ver el JSON que se va a enviar
    console.log("🔍 JSON a enviar:", raw);
    console.log("🔍 Objeto parseado:", JSON.parse(raw));
    
    let requestOptions = {
        method: "POST",
        headers: myHeaders,  // ← FALTABA LA COMA AQUÍ
        body: raw,
        redirect: "follow"
    };
    
    console.log("🔍 Enviando petición...");
    
    // ← CORREGIR LA URL (tenía doble //)
    fetch("https://registrousers.netlify.app/.netlify/functions/usuarios", requestOptions)
        .then((response) => {
            console.log("🔍 Status de respuesta:", response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then((result) => {
            console.log("🔍 Respuesta del servidor:", result);
            if (result.includes("exitosamente") || result.includes("éxito")) {
                alert("✅ Usuario guardado correctamente!");
                // Limpiar el formulario después de guardar
                document.getElementById("dni").value = "";
                document.getElementById("nombre").value = "";
                document.getElementById("apellidos").value = "";
                document.getElementById("correo").value = "";
            } else {
                alert("❌ Error: " + result);
            }
        })
        .catch((error) => {
            console.error("❌ Error en la petición:", error);
            alert("❌ Error de conexión: " + error.message);
        });
}

function cargar(resultado) {
    try {
        let transformado = JSON.parse(resultado);
        var salida = "";
        var elemento = "";
        
        for (const [clave, valor] of Object.entries(transformado)) {
            //console.log(`${clave}: ${valor}`);
            salida = "Clave=" + clave + " Valor=" + valor + "<br>" + salida;
        }
        document.getElementById("rta").innerHTML = salida;
    } catch (error) {
        console.error("Error al parsear JSON:", error);
        document.getElementById("rta").innerHTML = "Error al procesar la respuesta: " + resultado;
    }
}

function listar(event) {
    event.preventDefault();
    
    const requestOptions = {
        method: "GET",
        redirect: "follow"
    };
    
    let ndoc = document.getElementById("numdoc").value.trim();
    
    // Validar que se haya ingresado un número de documento
    if (!ndoc) {
        alert("❌ Por favor, ingrese un número de documento");
        return;
    }
    
    //usuarios?id=user124
    //https://desarrolloseguro.netlify.app/.netlify/functions/usuarios
    
    // ← CORREGIR LA URL (tenía doble //)
    fetch("https://registrousers.netlify.app/.netlify/functions/usuarios?iden=" + encodeURIComponent(ndoc), requestOptions)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then((result) => {
            console.log("🔍 Respuesta recibida:", result);
            cargar(result);
        })
        .catch((error) => {
            console.error("❌ Error:", error);
            document.getElementById("rta").innerHTML = "❌ Error: " + error.message;
        });
}

// Event listeners para cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Asignar eventos a los formularios
    const formGuardar = document.getElementById("formGuardar");
    if (formGuardar) {
        formGuardar.addEventListener('submit', guardar);
    }
    
    const formListar = document.getElementById("formListar");
    if (formListar) {
        formListar.addEventListener('submit', listar);
    }
    
    // Si tienes botones individuales en lugar de formularios
    const btnGuardar = document.getElementById("btnGuardar");
    if (btnGuardar) {
        btnGuardar.addEventListener('click', guardar);
    }
    
    const btnListar = document.getElementById("btnListar");
    if (btnListar) {
        btnListar.addEventListener('click', listar);
    }
});