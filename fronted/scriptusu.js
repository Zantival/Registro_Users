function guardar(event) {
    event.preventDefault();

    let datos = {
        nombre: document.getElementById("nombre").value,
        apellido: document.getElementById("apellido").value,
        correo: document.getElementById("correo").value,
        contraseña: document.getElementById("contrasena").value,
        dni: document.getElementById("dni").value,
    };

    fetch("http://localhost:3000/usuario/guardar", {
        method: "POST",
        body: JSON.stringify(datos),
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => console.error("Error:", error));
}

function listar(event) {
    event.preventDefault();

    let id = document.getElementById("dni").value;

    fetch(`http://localhost:3000/usuario/detalle?iden=${id}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("nombre").value = data.nombre || "";
            document.getElementById("apellido").value = data.apellido || "";
            document.getElementById("correo").value = data.correo || "";
            document.getElementById("contrasena").value = data.contraseña || "";
        })
        .catch(error => {
            console.error("Error:", error);
            alert("No se encontró el usuario");
        });
}
