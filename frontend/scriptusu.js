// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'success') {
  const notificacion = document.createElement('div');
  notificacion.className = `notificacion ${tipo}`;
  notificacion.textContent = mensaje;
  
  document.body.appendChild(notificacion);
  
  setTimeout(() => {
    notificacion.classList.add('mostrar');
  }, 100);
  
  setTimeout(() => {
    notificacion.classList.remove('mostrar');
    setTimeout(() => document.body.removeChild(notificacion), 300);
  }, 3000);
}

// Función para mostrar errores de validación
function mostrarErrores(errores) {
  const contenedorErrores = document.getElementById('errores-validacion');
  contenedorErrores.innerHTML = '';
  
  errores.forEach(error => {
    const elementoError = document.createElement('div');
    elementoError.className = 'error-validacion';
    elementoError.textContent = error;
    contenedorErrores.appendChild(elementoError);
  });
}

// Función para validar formulario
function validarFormulario(datos) {
  const errores = [];
  
  if (!datos.dni) errores.push('El DNI es requerido');
  if (!/^\d{8,15}$/.test(datos.dni)) errores.push('El DNI debe contener solo números (8-15 dígitos)');
  
  if (!datos.nombre) errores.push('El nombre es requerido');
  if (datos.nombre.length < 2) errores.push('El nombre debe tener al menos 2 caracteres');
  
  if (!datos.apellidos) errores.push('Los apellidos son requeridos');
  if (datos.apellidos.length < 2) errores.push('Los apellidos deben tener al menos 2 caracteres');
  
  if (!datos.email) errores.push('El email es requerido');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) errores.push('Ingrese un email válido');
  
  return errores;
}

// Función para guardar usuario (POST)
async function guardarUsuario(event) {
  event.preventDefault();
  
  const datos = {
    dni: document.getElementById("dni").value.trim(),
    nombre: document.getElementById("nombre").value.trim(),
    apellidos: document.getElementById("apellidos").value.trim(),
    email: document.getElementById("correo").value.trim()
  };
  
  // Validación
  const errores = validarFormulario(datos);
  if (errores.length > 0) {
    mostrarErrores(errores);
    return;
  }
  
  try {
    const response = await fetch("/.netlify/functions/usuarios", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(datos)
    });
    
    // Verificar tipo de contenido
    const contentType = response.headers.get('content-type');
    let resultado;
    
    if (contentType && contentType.includes('application/json')) {
      resultado = await response.json();
    } else {
      const text = await response.text();
      throw new Error(text || 'Respuesta no válida del servidor');
    }
    
    if (!response.ok) {
      throw new Error(resultado.error || `Error del servidor: ${response.status}`);
    }
    
    mostrarNotificacion(resultado.message || "Usuario registrado exitosamente!");
    document.getElementById("form-usuario").reset();
    mostrarErrores([]);
    
  } catch (error) {
    console.error("Error al guardar usuario:", error);
    mostrarNotificacion(error.message || "Error al registrar usuario", 'error');
  }
}

// Función para buscar usuario (GET)
async function buscarUsuario(event) {
  event.preventDefault();
  
  const dni = document.getElementById("buscar-dni").value.trim();
  
  if (!dni) {
    mostrarNotificacion("Ingrese un DNI para buscar", 'error');
    return;
  }
  
  try {
    const response = await fetch(`/.netlify/functions/usuarios?dni=${encodeURIComponent(dni)}`, {
      method: "GET",
      headers: { "Accept": "application/json" }
    });
    
    // Verificar tipo de contenido
    const contentType = response.headers.get('content-type');
    let resultado;
    
    if (contentType && contentType.includes('application/json')) {
      resultado = await response.json();
    } else {
      const text = await response.text();
      throw new Error(text || 'Respuesta no válida del servidor');
    }
    
    if (!response.ok) {
      throw new Error(resultado.error || `Error del servidor: ${response.status}`);
    }
    
    mostrarUsuario(resultado.usuario);
    
  } catch (error) {
    console.error("Error al buscar usuario:", error);
    mostrarNotificacion(error.message || "Error al buscar usuario", 'error');
    document.getElementById("resultado-usuario").innerHTML = `
      <div class="error">${error.message || "Usuario no encontrado"}</div>
    `;
  }
}

// Función para mostrar usuario en la UI
function mostrarUsuario(usuario) {
  const contenedor = document.getElementById("resultado-usuario");
  
  if (!usuario) {
    contenedor.innerHTML = '<div class="error">Usuario no encontrado</div>';
    return;
  }
  
  contenedor.innerHTML = `
    <div class="usuario-card">
      <h3>Información del Usuario</h3>
      <p><strong>DNI:</strong> ${usuario.dni}</p>
      <p><strong>Nombre:</strong> ${usuario.nombre}</p>
      <p><strong>Apellidos:</strong> ${usuario.apellidos}</p>
      <p><strong>Email:</strong> ${usuario.email}</p>
      <p><strong>Registrado el:</strong> ${new Date(usuario.fechaRegistro).toLocaleString()}</p>
      
      <div class="acciones-usuario">
        <button onclick="editarUsuario('${usuario.dni}')">Editar</button>
        <button onclick="eliminarUsuario('${usuario.dni}')" class="eliminar">Eliminar</button>
      </div>
    </div>
  `;
}

// Función para editar usuario (PUT)
async function editarUsuario(dni) {
  const nuevoNombre = prompt("Nuevo nombre:", "");
  const nuevoApellidos = prompt("Nuevos apellidos:", "");
  const nuevoEmail = prompt("Nuevo email:", "");
  
  if (!nuevoNombre && !nuevoApellidos && !nuevoEmail) {
    mostrarNotificacion("No se realizaron cambios", 'info');
    return;
  }
  
  try {
    const response = await fetch("/.netlify/functions/usuarios", {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        dni,
        nombre: nuevoNombre,
        apellidos: nuevoApellidos,
        email: nuevoEmail
      })
    });
    
    const resultado = await response.json();
    
    if (!response.ok) {
      throw new Error(resultado.error || `Error del servidor: ${response.status}`);
    }
    
    mostrarNotificacion(resultado.message || "Usuario actualizado exitosamente!");
    buscarUsuario({ preventDefault: () => {} }); // Refrescar búsqueda
    
  } catch (error) {
    console.error("Error al editar usuario:", error);
    mostrarNotificacion(error.message || "Error al editar usuario", 'error');
  }
}

// Función para eliminar usuario (DELETE)
async function eliminarUsuario(dni) {
  if (!confirm(`¿Está seguro que desea eliminar al usuario con DNI ${dni}?`)) {
    return;
  }
  
  try {
    const response = await fetch(`/.netlify/functions/usuarios?dni=${encodeURIComponent(dni)}`, {
      method: "DELETE",
      headers: { "Accept": "application/json" }
    });
    
    const resultado = await response.json();
    
    if (!response.ok) {
      throw new Error(resultado.error || `Error del servidor: ${response.status}`);
    }
    
    mostrarNotificacion(resultado.message || "Usuario eliminado exitosamente!");
    document.getElementById("resultado-usuario").innerHTML = '';
    document.getElementById("buscar-dni").value = '';
    
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    mostrarNotificacion(error.message || "Error al eliminar usuario", 'error');
  }
}

// Inicialización de eventos
document.addEventListener('DOMContentLoaded', () => {
  // Formulario de registro
  const formRegistro = document.getElementById("form-usuario");
  if (formRegistro) {
    formRegistro.addEventListener("submit", guardarUsuario);
  }
  
  // Formulario de búsqueda
  const formBusqueda = document.getElementById("form-busqueda");
  if (formBusqueda) {
    formBusqueda.addEventListener("submit", buscarUsuario);
  }
  
  // Limpiar errores al empezar a escribir
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      if (document.getElementById('errores-validacion').innerHTML !== '') {
        document.getElementById('errores-validacion').innerHTML = '';
      }
    });
  });
});