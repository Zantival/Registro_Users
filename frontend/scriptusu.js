// Función para guardar usuarios
async function guardar(event) {
    event.preventDefault();
    
    // Validación de campos mejorada
    const campos = {
        dni: document.getElementById("dni").value.trim(),
        nombre: document.getElementById("nombre").value.trim(),
        apellidos: document.getElementById("apellidos").value.trim(),
        email: document.getElementById("correo").value.trim()
    };

    // Validación completa
    if (!Object.values(campos).every(Boolean)) {
        return alert("❌ Todos los campos son obligatorios");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campos.email)) {
        return alert("❌ Por favor ingrese un email válido");
    }

    if (!/^\d+$/.test(campos.dni)) {
        return alert("❌ El DNI debe contener solo números");
    }

    try {
        const response = await fetch("https://registrousers.netlify.app/.netlify/functions/usuarios", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(campos)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || `Error del servidor: ${response.status}`);
        }

        alert(`✅ ${result.message || "Usuario registrado exitosamente!"}`);
        event.target.reset(); // Limpiar formulario
        
    } catch (error) {
        console.error("Error completo:", error);
        alert(`❌ Error: ${error.message}`);
    }
}

// Función para cargar y mostrar datos mejorada
function cargar(resultado) {
    try {
        const datos = typeof resultado === 'string' ? JSON.parse(resultado) : resultado;
        const contenedor = document.getElementById("rta");
        
        if (!datos || typeof datos !== 'object') {
            contenedor.innerHTML = "<div class='error'>No se encontraron datos</div>";
            return;
        }

        contenedor.innerHTML = Object.entries(datos)
            .map(([clave, valor]) => `
                <div class="data-row">
                    <span class="data-key">${clave}:</span>
                    <span class="data-value">${valor || 'N/A'}</span>
                </div>`
            ).join('');
            
    } catch (error) {
        console.error("Error al mostrar datos:", error);
        document.getElementById("rta").innerHTML = `
            <div class="error">
                Error al procesar los datos: ${error.message}
            </div>`;
    }
}

// Función para listar usuarios optimizada
async function listar(event) {
    event.preventDefault();
    
    const ndoc = document.getElementById("numdoc").value.trim();
    if (!ndoc) return alert("❌ Ingrese un número de documento");

    try {
        const response = await fetch(
            `https://registrousers.netlify.app/.netlify/functions/usuarios?dni=${encodeURIComponent(ndoc)}`, 
            {
                method: "GET",
                headers: { "Accept": "application/json" }
            }
        );

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        cargar(await response.json());
        
    } catch (error) {
        console.error("Error al obtener datos:", error);
        document.getElementById("rta").innerHTML = `
            <div class="error">
                Error al cargar datos: ${error.message}
            </div>`;
    }
}

// Inicialización mejorada
document.addEventListener('DOMContentLoaded', () => {
    // Configuración de eventos con delegación
    document.body.addEventListener('submit', (e) => {
        if (e.target.id === 'formGuardar') guardar(e);
    });

    document.body.addEventListener('click', (e) => {
        if (e.target.id === 'btnListar') listar(e);
    });
});