// productos.js - Funciones para la gestión de productos
import { estadoApp, formatearMoneda, formatearFecha, mostrarAlerta } from './app.js';
import { productosAPI } from './supabase.js';

let productoEditandoId = null;

// Función para cargar la sección de productos
export function cargarProductos() {
    console.log('Cargando productos...');
    actualizarTablaProductos();
}

// Función para actualizar la tabla de productos
function actualizarTablaProductos() {
    const tbody = document.getElementById('tablaProductos');
    
    if (estadoApp.datos.productos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="bi bi-box display-4"></i>
                    <p class="mt-2">No hay productos registrados</p>
                    <button class="btn btn-primary" onclick="mostrarModalProducto()">
                        <i class="bi bi-plus"></i> Agregar Primer Producto
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = estadoApp.datos.productos.map(producto => `
        <tr>
            <td>
                <strong>${producto.nombre}</strong>
                ${producto.unidad_medida ? `<br><small class="text-muted">${producto.unidad_medida}</small>` : ''}
            </td>
            <td>${producto.descripcion || '-'}</td>
            <td>${formatearMoneda(producto.precio)}</td>
            <td>
                <span class="badge ${producto.stock > 0 ? 'bg-success' : 'bg-danger'}">
                    ${producto.stock} ${producto.unidad_medida || 'unidades'}
                </span>
            </td>
            <td>
                ${producto.categoria ? 
                    `<span class="badge bg-info">${producto.categoria}</span>` : 
                    '-'
                }
            </td>
            <td>${formatearFecha(producto.fecha_creacion)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editarProducto('${producto.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarProducto('${producto.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Función para mostrar el modal de producto
function mostrarModalProducto(productoId = null) {
    const formulario = document.getElementById('formProducto');
    const titulo = document.getElementById('tituloModalProducto');
    
    // Limpiar el formulario
    formulario.reset();
    
    if (productoId) {
        // Modo edición
        titulo.textContent = 'Editar Producto';
        // Aquí cargaríamos los datos del producto
        console.log('Editando producto:', productoId);
    } else {
        // Modo nuevo
        titulo.textContent = 'Nuevo Producto';
    }
    
    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('modalProducto'));
    modal.show();
}

// Función para guardar un producto
async function guardarProducto() {
    const formulario = document.getElementById('formProducto');
    if (!formulario.checkValidity()) {
        formulario.reportValidity();
        return;
    }

    const producto = {
        nombre: document.getElementById('productoNombre').value,
        descripcion: document.getElementById('productoDescripcion').value,
        categoria: document.getElementById('productoCategoria').value,
        precio: parseFloat(document.getElementById('productoPrecio').value),
        stock: parseInt(document.getElementById('productoStock').value) || 0,
        unidad_medida: document.getElementById('productoUnidad').value,
        fecha_creacion: new Date().toISOString()
    };

    if (producto.precio <= 0) {
        mostrarAlerta('El precio debe ser mayor a 0', 'warning');
        return;
    }
    if (producto.stock < 0) {
        mostrarAlerta('El stock no puede ser negativo', 'warning');
        return;
    }

    // Guardar en Supabase
    try {
        const productoGuardado = await productosAPI.crear(producto);
        estadoApp.datos.productos.push(productoGuardado);

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalProducto'));
        modal.hide();

        // Actualizar tabla
        actualizarTablaProductos();

        mostrarAlerta('Producto guardado exitosamente', 'success');
        console.log('Producto guardado:', productoGuardado);
    } catch (error) {
        mostrarAlerta('Error al guardar el producto', 'danger');
        console.error(error);
    }
}

// Función para editar un producto (placeholder)
function editarProducto(productoId) {
    console.log('Editando producto:', productoId);
    
    // Buscar el producto
    const producto = estadoApp.datos.productos.find(p => p.id === productoId);
    
    if (producto) {
        // Llenar el formulario con los datos del producto
        document.getElementById('productoNombre').value = producto.nombre;
        document.getElementById('productoDescripcion').value = producto.descripcion || '';
        document.getElementById('productoCategoria').value = producto.categoria || '';
        document.getElementById('productoPrecio').value = producto.precio;
        document.getElementById('productoStock').value = producto.stock;
        document.getElementById('productoUnidad').value = producto.unidad || '';
        
        // Mostrar modal en modo edición
        mostrarModalProducto(productoId);
    } else {
        mostrarAlerta('Producto no encontrado', 'danger');
    }
}

// Función para eliminar un producto
function eliminarProducto(productoId) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        // Buscar índice del producto
        const index = estadoApp.datos.productos.findIndex(p => p.id === productoId);
        
        if (index !== -1) {
            // Eliminar producto
            estadoApp.datos.productos.splice(index, 1);
            
            // Actualizar tabla
            actualizarTablaProductos();
            
            // Mostrar mensaje de éxito
            mostrarAlerta('Producto eliminado exitosamente', 'success');
        } else {
            mostrarAlerta('Producto no encontrado', 'danger');
        }
    }
}

// Función para filtrar productos
function filtrarProductos() {
    const filtroNombre = document.getElementById('filtroProductoNombre').value.toLowerCase();
    const filtroCategoria = document.getElementById('filtroCategoria').value;
    const filtroStock = document.getElementById('filtroStock').value;
    
    let productosFiltrados = estadoApp.datos.productos;
    
    // Aplicar filtros
    if (filtroNombre) {
        productosFiltrados = productosFiltrados.filter(producto => 
            producto.nombre.toLowerCase().includes(filtroNombre)
        );
    }
    
    if (filtroCategoria) {
        productosFiltrados = productosFiltrados.filter(producto => 
            producto.categoria === filtroCategoria
        );
    }
    
    if (filtroStock === 'disponible') {
        productosFiltrados = productosFiltrados.filter(producto => producto.stock > 0);
    } else if (filtroStock === 'agotado') {
        productosFiltrados = productosFiltrados.filter(producto => producto.stock === 0);
    }
    
    // Actualizar tabla con productos filtrados
    const tbody = document.getElementById('tablaProductos');
    
    if (productosFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="bi bi-search display-4"></i>
                    <p class="mt-2">No se encontraron productos</p>
                    <button class="btn btn-outline-primary" onclick="limpiarFiltrosProductos()">
                        <i class="bi bi-arrow-clockwise"></i> Limpiar filtros
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = productosFiltrados.map(producto => `
        <tr>
            <td>
                <strong>${producto.nombre}</strong>
                ${producto.unidad ? `<br><small class="text-muted">${producto.unidad}</small>` : ''}
            </td>
            <td>${producto.descripcion || '-'}</td>
            <td>${formatearMoneda(producto.precio)}</td>
            <td>
                <span class="badge ${producto.stock > 0 ? 'bg-success' : 'bg-danger'}">
                    ${producto.stock} ${producto.unidad || 'unidades'}
                </span>
            </td>
            <td>
                ${producto.categoria ? 
                    `<span class="badge bg-info">${producto.categoria}</span>` : 
                    '-'
                }
            </td>
            <td>${formatearFecha(producto.fecha_creacion)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editarProducto('${producto.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarProducto('${producto.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Función para limpiar filtros de productos
function limpiarFiltrosProductos() {
    document.getElementById('filtroProductoNombre').value = '';
    document.getElementById('filtroCategoria').value = '';
    document.getElementById('filtroStock').value = '';
    
    actualizarTablaProductos();
    mostrarAlerta('Filtros limpiados', 'info');
}

window.mostrarModalProducto = mostrarModalProducto;
window.guardarProducto = guardarProducto;
window.editarProducto = editarProducto;
window.eliminarProducto = eliminarProducto;
window.filtrarProductos = filtrarProductos;
window.limpiarFiltrosProductos = limpiarFiltrosProductos;