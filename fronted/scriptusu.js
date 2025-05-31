// Función para guardar usuario
function guardar(event) {
    event.preventDefault();

    let datos = {
        nombre: document.getElementById("nombre").value,
        apellido: document.getElementById("apellido").value,
        correo: document.getElementById("correo").value,
        contraseña: document.getElementById("contrasena").value,
        dni: document.getElementById("dni").value,
    };

    fetch("https://registrousers.netlify.app/.netlify/functions/usuarios", {
        method: "POST",
        body: JSON.stringify(datos),
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        document.getElementById("formularioUsuario").reset(); // Limpia el formulario
    })
    .catch(error => console.error("Error:", error));
}

// Función para buscar usuario por DNI desde campo "dniBuscar"
function listar(event) {
    event.preventDefault();

    let id = document.getElementById("dniBuscar").value;

    fetch(`http://localhost:3001/usuario/detalle?iden=${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Usuario no encontrado");
            }
            return response.json();
        })
        .then(data => {
            document.getElementById("nombre").value = data.nombre || "";
            document.getElementById("apellido").value = data.apellido || "";
            document.getElementById("correo").value = data.correo || "";
            document.getElementById("contrasena").value = data.contraseña || "";
            document.getElementById("dni").value = data.dni || "";
            document.getElementById("mensaje").textContent = "";
        })
        .catch(error => {
            console.error("Error:", error);
            document.getElementById("mensaje").textContent = "No se encontró el usuario";
        });
}
