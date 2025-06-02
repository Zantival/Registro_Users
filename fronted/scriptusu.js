// Función para guardar usuario
function guardar(event) {
    event.preventDefault();
    
    // Validar que todos los campos estén llenos
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const contraseña = document.getElementById("contrasena").value.trim();
    const dni = document.getElementById("dni").value.trim();
    
    // Verificar campos obligatorios
    if (!nombre || !apellido || !correo || !contraseña || !dni) {
        alert("Por favor, complete todos los campos");
        return;
    }
    
    // Validar formato de correo básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        alert("Por favor, ingrese un correo válido");
        return;
    }
    
    let datos = {
        nombre: nombre,
        apellido: apellido,
        correo: correo,
        contraseña: contraseña,
        dni: dni
    };
    
    // Mostrar indicador de carga
    const mensajeElement = document.getElementById("mensaje");
    if (mensajeElement) {
        mensajeElement.textContent = "Guardando usuario...";
    }
    
    fetch("https://registrousers.netlify.app/.netlify/functions/guardar", {
        method: "POST",
        body: JSON.stringify(datos),
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        alert(data.message || "Usuario guardado exitosamente");
        document.getElementById("formularioUsuario").reset();
        if (mensajeElement) {
            mensajeElement.textContent = "Usuario guardado correctamente";
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Error al guardar el usuario: " + error.message);
        if (mensajeElement) {
            mensajeElement.textContent = "Error al guardar el usuario";
        }
    });
}

// Función para buscar usuario por DNI desde campo "dniBuscar"
function listar(event) {
    event.preventDefault();
    
    const id = document.getElementById("dniBuscar").value.trim();
    
    // Validar que se haya ingresado un DNI
    if (!id) {
        alert("Por favor, ingrese un DNI para buscar");
        return;
    }
    
    // Mostrar indicador de carga
    const mensajeElement = document.getElementById("mensaje");
    if (mensajeElement) {
        mensajeElement.textContent = "Buscando usuario...";
    }
    
    fetch(`https://registrousers.netlify.app/.netlify/functions/buscar?id=${encodeURIComponent(id)}`)
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Usuario no encontrado");
                } else {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
            }
            return response.json();
        })
        .then(data => {
            // Verificar que los elementos existan antes de asignar valores
            const nombreEl = document.getElementById("nombre");
            const apellidoEl = document.getElementById("apellido");
            const correoEl = document.getElementById("correo");
            const contrasenaEl = document.getElementById("contrasena");
            const dniEl = document.getElementById("dni");
            
            if (nombreEl) nombreEl.value = data.nombre || "";
            if (apellidoEl) apellidoEl.value = data.apellido || "";
            if (correoEl) correoEl.value = data.correo || "";
            if (contrasenaEl) contrasenaEl.value = data.contraseña || "";
            if (dniEl) dniEl.value = data.dni || "";
            
            if (mensajeElement) {
                mensajeElement.textContent = "Usuario encontrado y cargado";
            }
        })
        .catch(error => {
            console.error("Error:", error);
            
            // Limpiar campos en caso de error
            const campos = ["nombre", "apellido", "correo", "contrasena", "dni"];
            campos.forEach(campo => {
                const elemento = document.getElementById(campo);
                if (elemento) elemento.value = "";
            });
            
            if (mensajeElement) {
                mensajeElement.textContent = error.message;
            }
            
            alert(error.message);
        });
}

// Función para limpiar el formulario
function limpiarFormulario() {
    const formulario = document.getElementById("formularioUsuario");
    if (formulario) {
        formulario.reset();
    }
    
    const mensajeElement = document.getElementById("mensaje");
    if (mensajeElement) {
        mensajeElement.textContent = "";
    }
}

// Event listeners para cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Asignar evento al formulario de guardar
    const formulario = document.getElementById("formularioUsuario");
    if (formulario) {
        formulario.addEventListener('submit', guardar);
    }
    
    // Asignar evento al formulario de búsqueda
    const formularioBuscar = document.getElementById("formularioBuscar");
    if (formularioBuscar) {
        formularioBuscar.addEventListener('submit', listar);
    }
    
    // Botón de limpiar (opcional)
    const btnLimpiar = document.getElementById("btnLimpiar");
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarFormulario);
    }
});