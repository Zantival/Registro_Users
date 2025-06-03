function guardar(){
    let apellidos='';
    let datoingresado = document.getElementById("correo").value;
 
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    event.preventDefault();

    // ✅ DEBUGGING: Ver qué valores se están capturando
    console.log("🔍 DEBUGGING - Valores capturados:");
    console.log("DNI:", document.getElementById("dni").value);
    console.log("Nombre:", document.getElementById("nombre").value);
    console.log("Apellidos:", document.getElementById("apellidos").value);
    console.log("Email:", document.getElementById("correo").value);
 
    let raw = JSON.stringify({
      "dni": document.getElementById("dni").value,
      "nombre": document.getElementById("nombre").value,
      "apellidos": document.getElementById("apellidos").value,
      "email": document.getElementById("correo").value
    });

    // ✅ DEBUGGING: Ver el JSON que se va a enviar
    console.log("🔍 JSON a enviar:", raw);
    console.log("🔍 Objeto parseado:", JSON.parse(raw));
 
    let requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };
 
    console.log("🔍 Enviando petición...");
    fetch("https://desarrolloseguro.netlify.app/.netlify/functions/usuarios", requestOptions)
      .then((response) => {
        console.log("🔍 Status de respuesta:", response.status);
        return response.text();
      })
      .then((result) => {
        console.log("🔍 Respuesta del servidor:", result);
        if (result.includes("exitosamente")) {
          alert("✅ Usuario guardado correctamente!");
        } else {
          alert("❌ Error: " + result);
        }
      })
      .catch((error) => {
        console.error("❌ Error en la petición:", error);
        alert("❌ Error de conexión: " + error.message);
      });  
}
 
function cargar(resultado){
    let transformado = JSON.parse(resultado);
    var salida="";
    var elemento="";
 
    for (const [clave, valor] of Object.entries(transformado)) {
        //console.log(`${clave}: ${valor}`);
        salida = "Clave=" + clave +  " Valor=" + valor + "<br>" + salida;
    }
    document.getElementById("rta").innerHTML = salida;
}
 
function listar(){
    event.preventDefault();
    const requestOptions = {
      method: "GET",
      redirect: "follow"
    };
    let ndoc = document.getElementById("numdoc").value;
    
    //usuarios?id=user124
         //https://desarrolloseguro.netlify.app/.netlify/functions/usuarios
    fetch("https://desarrolloseguro.netlify.app/.netlify/functions/usuarios?iden="+ndoc, requestOptions)
      .then((response) =>
        response.text())
      .then((result) =>
        cargar(result))
      .catch((error) =>
        console.error(error));
}