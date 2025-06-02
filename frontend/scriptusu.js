// Función para guardar usuarios
async function guardar(event) {
    event.preventDefault();
    
    // Validación de campos
    const dni = document.getElementById("dni").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const apellidos = document.getElementById("apellidos").value.trim();
    const email = document.getElementById("correo").value.trim();

    // Verificar que todos los campos estén llenos
    if (!dni || !nombre || !apellidos || !email) {
        alert("❌ Todos los campos son obligatorios");
        return;
    }

    // Validar formato de email simple
    if (!email.includes('@') || !email.includes('.')) {
        alert("❌ Por favor ingrese un email válido");
        return;
    }

    // Mostrar datos en consola para depuración
    console.log("📤 Datos a enviar:", { dni, nombre, apellidos, email });

    try {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const response = await fetch("https://registrousers.netlify.app/.netlify/functions/usuarios", {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify({
                dni: dni,
                nombre: nombre,
                apellidos: apellidos,
                email: email
            }),
            redirect: "follow"
        });

        console.log("📥 Estado de la respuesta:", response.status);

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Error desconocido del servidor");
        }

        console.log("✅ Respuesta del servidor:", result);
        alert("✔️ Usuario registrado exitosamente!");
        
        // Opcional: Limpiar el formulario después del éxito
        document.getElementById("dni").value = "";
        document.getElementById("nombre").value = "";
        document.getElementById("apellidos").value = "";
        document.getElementById("correo").value = "";

    } catch (error) {
        console.error("❌ Error en la petición:", error);
        alert(`❌ Error al registrar usuario: ${error.message}`);
    }
}

// Función para cargar y mostrar datos
function cargar(resultado) {
    try {
        let transformado = JSON.parse(resultado);
        let salida = "";

        for (const [clave, valor] of Object.entries(transformado)) {
            salida += `<div><strong>${clave}:</strong> ${valor}</div>`;
        }

        document.getElementById("rta").innerHTML = salida || "No se encontraron datos";
    } catch (error) {
        console.error("❌ Error al procesar respuesta:", error);
        document.getElementById("rta").innerHTML = "❌ Error al mostrar los datos";
    }
}

// Función para listar usuarios
async function listar(event) {
    event.preventDefault();
    
    const ndoc = document.getElementById("numdoc").value.trim();
    
    if (!ndoc) {
        alert("❌ Por favor ingrese un número de documento");
        return;
    }

    try {
        const response = await fetch(`https://registrousers.netlify.app/.netlify/functions/usuarios?iden=${ndoc}`, {
            method: "GET",
            redirect: "follow"
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const result = await response.text();
        cargar(result);
    } catch (error) {
        console.error("❌ Error al obtener datos:", error);
        document.getElementById("rta").innerHTML = "❌ Error al cargar los datos";
    }
}

// Asignar eventos (esto debe estar en tu código principal)
document.addEventListener('DOMContentLoaded', function() {
    // Asumiendo que tienes un formulario con id "formGuardar"
    const formGuardar = document.getElementById("formGuardar");
    if (formGuardar) {
        formGuardar.addEventListener("submit", guardar);
    }

    // Asumiendo que tienes un botón con id "btnListar"
    const btnListar = document.getElementById("btnListar");
    if (btnListar) {
        btnListar.addEventListener("click", listar);
    }
});