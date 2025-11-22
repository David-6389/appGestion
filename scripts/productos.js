// productos.js - Funciones para la gestión de productos
import { estadoApp, formatearMoneda, formatearFecha, mostrarAlerta } from './app.js';
import { productosAPI } from './supabase.js';

let productoEditandoId = null;

// Función para cargar la sección de productos
export async function cargarProductos() {
    console.log('Cargando productos desde Supabase...');
    try {
        const productos = await productosAPI.obtenerTodos();
        estadoApp.datos.productos = productos;
        actualizarTablaProductos();
    } catch (error) {
        console.error('Error cargando productos:', error);
        mostrarAlerta('Error al cargar productos: ' + error.message, 'danger');
    }
}

// Función para actualizar la tabla de productos
function actualizarTablaProductos() {
    const tbody = document.getElementById('tablaProductos');
    console.log('📊 Productos en estado:', estadoApp.datos.productos);
    
    if (!tbody) {
        console.error('❌ No se encontró el elemento tablaProductos');
        return;
    }

    if (!estadoApp.datos.productos || estadoApp.datos.productos.length === 0) {
        console.log('📭 No hay productos para mostrar');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
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
    
    console.log('🎨 Renderizando', estadoApp.datos.productos.length, 'productos en la tabla');
    
    // Crear el HTML de la tabla
    const html = estadoApp.datos.productos.map(producto => `
        <tr>
            <td>
                <strong>${producto.nombre}</strong>
                ${producto.unidad_medida ? `<br><small class="text-muted">${producto.unidad_medida}</small>` : ''}
            </td>
            <td>${producto.descripcion || '-'}</td>
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
    
    // Asignar el HTML al tbody
    tbody.innerHTML = html;
    console.log('✅ Tabla actualizada correctamente con', estadoApp.datos.productos.length, 'productos');
}

// Función para mostrar el modal de producto
export function mostrarModalProducto(productoId = null) {
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
export async function guardarProducto() {
    const formulario = document.getElementById('formProducto');
    
    // Valido el formulario
    if (!formulario.checkValidity()) {
        formulario.reportValidity();
        return;
    }

    const producto = {
        nombre: document.getElementById('productoNombre').value,
        descripcion: document.getElementById('productoDescripcion').value,
        categoria: document.getElementById('productoCategoria').value,
        stock: parseInt(document.getElementById('productoStock').value) || 0,
        unidad_medida: document.getElementById('productoUnidad').value,
        activo: true,
        user_id: estadoApp.datos.usuario.id, // <-- AÑADIR ID DEL USUARIO
        fecha_creacion: new Date().toISOString()
    };

    if (producto.stock < 0) {
        mostrarAlerta('El stock no puede ser negativo', 'warning');
        return;
    }
    console.log('📦 Datos del producto a guardar:', producto);

    // Guardar en Supabase
    try {
        let productoGuardado;
        
        if (productoEditandoId) {
            // Modo edición
            delete producto.fecha_creacion;
            delete producto.user_id;
            productoGuardado = await productosAPI.actualizar(productoEditandoId, producto);
            
            // Actualizar en el estado local
            const index = estadoApp.datos.productos.findIndex(p => p.id === productoEditandoId);
            if (index !== -1) {
                estadoApp.datos.productos[index] = productoGuardado;
            }
            
            mostrarAlerta('Producto actualizado exitosamente', 'success');
        } else {
            // Modo nuevo - SOLUCIÓN MEJORADA
            productoGuardado = await productosAPI.crear(producto);
            console.log('✅ Producto creado:', productoGuardado);
            
            // SOLUCIÓN: Agregar al inicio del array y forzar actualización
            estadoApp.datos.productos = [productoGuardado, ...estadoApp.datos.productos];
            
            mostrarAlerta('Producto guardado exitosamente', 'success');
        }
        
        // ACTUALIZAR LA TABLA INMEDIATAMENTE
        actualizarTablaProductos();
        console.log('🔄 Tabla actualizada. Productos en estado:', estadoApp.datos.productos.length);
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalProducto'));
        modal.hide();
        
    } catch (error) {
        console.error('Error guardando producto:', error);
        mostrarAlerta('Error al guardar producto: ' + error.message, 'danger');
    }
}

// Función para editar un producto (placeholder)
export async function editarProducto(productoId) {
    console.log('Editando producto:', productoId);
    
     try {
        // Buscar el producto en los datos cargados
        const producto = estadoApp.datos.productos.find(p => p.id === productoId);
        
        if (producto) {
            // Llenar el formulario con los datos del producto (SIN PRECIO)
            document.getElementById('productoNombre').value = producto.nombre;
            document.getElementById('productoDescripcion').value = producto.descripcion || '';
            document.getElementById('productoCategoria').value = producto.categoria || '';
            document.getElementById('productoStock').value = producto.stock;
            document.getElementById('productoUnidad').value = producto.unidad_medida || 'unidad';
            
            // Mostrar modal en modo edición
            mostrarModalProducto(productoId);
        } else {
            mostrarAlerta('Producto no encontrado', 'danger');
        }
    } catch (error) {
        console.error('Error editando producto:', error);
        mostrarAlerta('Error al cargar datos del producto: ' + error.message, 'danger');
    }
}

// Función para eliminar un producto
export function eliminarProducto(productoId) {
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
export function filtrarProductos() {
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
export function limpiarFiltrosProductos() {
    document.getElementById('filtroProductoNombre').value = '';
    document.getElementById('filtroCategoria').value = '';
    document.getElementById('filtroStock').value = '';
    
    actualizarTablaProductos();
    mostrarAlerta('Filtros limpiados', 'info');
}