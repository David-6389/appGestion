// clientes.js - Funciones para la gestión de clientes
import { estadoApp, mostrarAlerta, formatearFecha } from './app.js';
import { clientesAPI } from './supabase.js';

// Variable para controlar el modo de edición
let clienteEditandoId = null;

// Función para cargar la sección de clientes
export async function cargarClientes() {
    console.log('Cargando clientes desde Supabase...');
    //await actualizarTablaClientes();
    try {
        const clientes = await clientesAPI.obtenerTodos();
        estadoApp.datos.clientes = clientes;
        actualizarTablaClientes();
        configurarModalCliente();
    } catch (error) {
        console.error('Error cargando clientes:', error);
        mostrarAlerta('Error al cargar clientes: ' + error.message, 'danger');
    }
}

// Función para actualizar la tabla de clientes
function actualizarTablaClientes() {
    const tbody = document.getElementById('tablaClientes');
    
    if (estadoApp.datos.clientes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bi bi-people display-4"></i>
                    <p class="mt-2">No hay clientes registrados</p>
                    <button class="btn btn-primary" onclick="mostrarModalCliente()">
                        <i class="bi bi-plus"></i> Agregar Primer Cliente
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = estadoApp.datos.clientes.map(cliente => `
        <tr>
            <td>${cliente.nombre}</td>
            <td>${cliente.email}</td>
            <td>${cliente.telefono || '-'}</td>
            <td><span class="badge ${getBadgeClassForTipo(cliente.tipo)}">${cliente.tipo || 'N/A'}</span></td>
            <td>${formatearFecha(cliente.fecha_registro)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editarCliente('${cliente.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarCliente('${cliente.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Función para obtener la clase de la insignia según el tipo de cliente
function getBadgeClassForTipo(tipo) {
    switch (tipo) {
        case 'Master':
            return 'bg-primary';
        case 'Revenda':
            return 'bg-info text-dark';
        default:
            return 'bg-secondary';
    }
}

// Función para mostrar el modal de cliente
export function mostrarModalCliente() {
    // Limpiar el formulario
    document.getElementById('formCliente').reset();
    document.getElementById('tituloModalCliente').textContent = 'Nuevo Cliente';
    clienteEditandoId = null;

    // Asegurarse de que 'Master' esté seleccionado por defecto para nuevos clientes
    document.getElementById('tipoMaster').checked = true;

    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('modalCliente'));
    modal.show();
}

// Variable para controlar el modo de edición
//let clienteEditandoId = null;

// Función para editar un cliente
export async function editarCliente(clienteId) {
    console.log('Editando cliente:', clienteId);
    try {
        // Buscar el cliente
        const cliente = estadoApp.datos.clientes.find(c => c.id === clienteId);
        
        if (cliente) {
            // Guardar ID del cliente que se está editando
            clienteEditandoId = clienteId;
            
            // Llenar el formulario con los datos del cliente
            document.getElementById('clienteNombre').value = cliente.nombre;
            document.getElementById('clienteEmail').value = cliente.email;
            document.getElementById('clienteTelefono').value = cliente.telefono || '';

            // Establecer el tipo de cliente
            if (cliente.tipo === 'Revenda') {
                document.getElementById('tipoRevenda').checked = true;
            } else {
                // Por defecto o si es 'Master'
                document.getElementById('tipoMaster').checked = true;
            }
            
            // Cambiar título del modal
            document.getElementById('tituloModalCliente').textContent = 'Editar Cliente';
            
            // Mostrar modal
            const modal = new bootstrap.Modal(document.getElementById('modalCliente'));
            modal.show();
        } else {
            mostrarAlerta('Cliente no encontrado', 'danger');
        }
    } catch (error) {
        console.error('Error editando cliente:', error);
        mostrarAlerta('Error al cargar datos del cliente: ' + error.message, 'danger');
    }
}

// Función para guardar un cliente
export async function guardarCliente() {
    const formulario = document.getElementById('formCliente');
    
    // Validar formulario
    if (!formulario.checkValidity()) {
        formulario.reportValidity();
        return;
    }
    
    // Obtener datos del formulario
    const datosCliente = {
        nombre: document.getElementById('clienteNombre').value,
        email: document.getElementById('clienteEmail').value,
        telefono: document.getElementById('clienteTelefono').value,
        tipo: document.querySelector('input[name="tipoCliente"]:checked').value,
        user_id: estadoApp.datos.usuario.id, // <-- AÑADIR ID DEL USUARIO
        fecha_registro: new Date().toISOString()
    };
    
    // Validar email único (excepto para el cliente que se está editando)
    const emailExistente = estadoApp.datos.clientes.find(cliente => 
        cliente.email === datosCliente.email && cliente.id !== clienteEditandoId
    );
    if (emailExistente) {
        mostrarAlerta('Ya existe un cliente con este email', 'warning');
        return;
    }
     try {
        if (clienteEditandoId) {
            // No actualizamos la fecha de registro al editar
            delete datosCliente.fecha_registro;
            // Tampoco el user_id
            delete datosCliente.user_id;
            // Modo edición - Actualizar cliente existente
            await clientesAPI.actualizar(clienteEditandoId, datosCliente);
            mostrarAlerta('Cliente actualizado exitosamente', 'success');
        } else {
            // Modo nuevo - Crear nuevo cliente (la fecha ya está incluida)
            await clientesAPI.crear(datosCliente);
            mostrarAlerta('Cliente guardado exitosamente', 'success');
        }
        
        // Recargar clientes desde Supabase
        await cargarClientes();
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalCliente'));
        modal.hide();
        
    } catch (error) {
        console.error('Error guardando cliente:', error);
        mostrarAlerta('Error al guardar cliente: ' + error.message, 'danger');
    }
}
 
// Función para eliminar cliente (mejorada)
export async function eliminarCliente(clienteId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
        return;
    }
    
    try {
        await clientesAPI.eliminar(clienteId);
        mostrarAlerta('Cliente eliminado exitosamente', 'success');
        
        // Recargar clientes desde Supabase
        await cargarClientes();
        
    } catch (error) {
        console.error('Error eliminando cliente:', error);
        mostrarAlerta('Error al eliminar cliente: ' + error.message, 'danger');
    }
}

// Función para resetear el modal cuando se cierra
function configurarModalCliente() {
    const modal = document.getElementById('modalCliente');
    
    modal.addEventListener('hidden.bs.modal', function () {
        // Limpiar el formulario
        document.getElementById('formCliente').reset();
        document.getElementById('tituloModalCliente').textContent = 'Nuevo Cliente';

        // Resetear radio buttons
        document.getElementById('tipoMaster').checked = true;
        
        // Resetear estado de edición
        clienteEditandoId = null;
    });
}

// Función para filtrar clientes (placeholder)
export function filtrarClientes() {
    const filtroNombre = document.getElementById('filtroNombre').value.toLowerCase();
    const filtroEmail = document.getElementById('filtroEmail').value.toLowerCase();
    
    let clientesFiltrados = estadoApp.datos.clientes;
    
    // Aplicar filtros
    if (filtroNombre) {
        clientesFiltrados = clientesFiltrados.filter(cliente => 
            cliente.nombre.toLowerCase().includes(filtroNombre)
        );
    }
    
    if (filtroEmail) {
        clientesFiltrados = clientesFiltrados.filter(cliente => 
            cliente.email.toLowerCase().includes(filtroEmail)
        );
    }
    
    // Actualizar tabla con clientes filtrados
    const tbody = document.getElementById('tablaClientes');
    
    if (clientesFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    <i class="bi bi-search display-4"></i>
                    <p class="mt-2">No se encontraron clientes</p>
                    <button class="btn btn-outline-primary" onclick="limpiarFiltrosClientes()">
                        <i class="bi bi-arrow-clockwise"></i> Limpiar filtros
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = clientesFiltrados.map(cliente => `
        <tr>
            <td>${cliente.nombre}</td>
            <td>${cliente.email}</td>
            <td>${cliente.telefono || '-'}</td>
            <td><span class="badge ${getBadgeClassForTipo(cliente.tipo)}">${cliente.tipo || 'N/A'}</span></td>
            <td>${formatearFecha(cliente.fecha_registro)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editarCliente('${cliente.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarCliente('${cliente.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Función para limpiar filtros de clientes
export function limpiarFiltrosClientes() {
    document.getElementById('filtroNombre').value = '';
    document.getElementById('filtroEmail').value = '';
    
    actualizarTablaClientes();
    mostrarAlerta('Filtros limpiados', 'info');
}

// Exportar funciones al scope global para el HTML
window.mostrarModalCliente = mostrarModalCliente;
window.editarCliente = editarCliente;
window.guardarCliente = guardarCliente;
window.eliminarCliente = eliminarCliente;
window.filtrarClientes = filtrarClientes;
window.limpiarFiltrosClientes = limpiarFiltrosClientes;