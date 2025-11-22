// ventas.js - Funciones para la gestión de ventas
import { estadoApp, formatearMoneda, formatearFecha, mostrarAlerta, actualizarEstadisticas } from './app.js';
import { ventasAPI, productosAPI  } from './supabase.js';

// Estado temporal para la venta en curso
let ventaEnCurso = {
    clienteId: null,
    productos: [],
    subtotal: 0,
    iva: 0,
    total: 0
};

// Función para cargar la sección de ventas
export async function cargarVentas() {
    console.log('Cargando ventas desde Supabase...');
    try {
        const ventas = await ventasAPI.obtenerTodas();
        estadoApp.datos.ventas = ventas;
        actualizarTablaVentas();
        cargarSelectClientes();
    } catch (error) {
        console.error('Error cargando ventas:', error);
        mostrarAlerta('Error al cargar ventas: ' + error.message, 'danger');
    }
}

// Función para actualizar la tabla de ventas
function actualizarTablaVentas() {
    const tbody = document.getElementById('tablaVentas');
    
    if (estadoApp.datos.ventas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bi bi-cart display-4"></i>
                    <p class="mt-2">No hay ventas registradas</p>
                    <button class="btn btn-primary" onclick="mostrarModalVenta()">
                        <i class="bi bi-plus"></i> Registrar Primera Venta
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = estadoApp.datos.ventas.map(venta => `
        <tr>
            <td>${formatearFecha(venta.fecha_venta)}</td>
            <td>
                <strong>${venta.clientes ? venta.clientes.nombre : '-'}</strong>
                <br><small class="text-muted">${venta.clientes ? venta.clientes.email : '-'}</small>
            </td>
            <td>
                <small>
                    ${(venta.venta_items || []).map(item => 
                        `${item.cantidad} x ${item.productos ? item.productos.nombre : '-'}`
                    ).join('<br>')}
                </small>
            </td>
            <td>${formatearMoneda(venta.total)}</td>
            <td>
                <span class="badge bg-success">Completada</span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-info" onclick="verDetalleVentaModal('${venta.id}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarVenta('${venta.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function editarProductoVenta(index) {
    const producto = ventaEnCurso.productos[index];
    
    // Mostrar modal de edición
    const modalHTML = `
        <div class="modal fade" id="modalEditarProductoVenta" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-warning text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-pencil"></i> Editar Producto en Venta
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Producto</label>
                            <input type="text" class="form-control" value="${producto.nombre}" disabled>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <label class="form-label">Cantidad</label>
                                <input type="number" class="form-control" id="editarCantidad" 
                                       value="${producto.cantidad}" min="1">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Precio Unitario</label>
                                <div class="input-group">
                                    <span class="input-group-text">$</span>
                                    <input type="number" class="form-control" id="editarPrecio" 
                                           value="${producto.precio}" step="0.01" min="0.01">
                                </div>
                            </div>
                        </div>
                        ${producto.precioOriginal ? `
                        <div class="mt-2">
                            <small class="text-muted">
                                Precio original: ${formatearMoneda(producto.precioOriginal)}
                            </small>
                        </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="guardarEdicionProductoVenta(${index})">
                            <i class="bi bi-check"></i> Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal anterior si existe
    const modalAnterior = document.getElementById('modalEditarProductoVenta');
    if (modalAnterior) {
        modalAnterior.remove();
    }
    
    // Agregar nuevo modal al DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalEditarProductoVenta'));
    modal.show();
}


function guardarEdicionProductoVenta(index) {
    const cantidad = parseInt(document.getElementById('editarCantidad').value) || 1;
    const precio = parseFloat(document.getElementById('editarPrecio').value) || 0;
    
    if (cantidad <= 0) {
        mostrarAlerta('La cantidad debe ser mayor a 0', 'warning');
        return;
    }
    
    if (precio <= 0) {
        mostrarAlerta('El precio debe ser mayor a 0', 'warning');
        return;
    }
    
    // Actualizar producto
    ventaEnCurso.productos[index].cantidad = cantidad;
    ventaEnCurso.productos[index].precio = precio;
    ventaEnCurso.productos[index].subtotal = cantidad * precio;
    
    // Actualizar resumen
    actualizarResumenVenta();
    
    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarProductoVenta'));
    modal.hide();
    
    mostrarAlerta('Producto actualizado en la venta', 'success');
}

// Función para cargar el select de clientes
function cargarSelectClientes() {
    const select = document.getElementById('ventaCliente');
    const selectFiltro = document.getElementById('filtroClienteVenta');
    
    const opciones = '<option value="">Seleccionar cliente...</option>' +
        estadoApp.datos.clientes.map(cliente => 
            `<option value="${cliente.id}">${cliente.nombre} - ${cliente.email}</option>`
        ).join('');
    
    select.innerHTML = opciones;
    selectFiltro.innerHTML = '<option value="">Todos los clientes</option>' + 
        estadoApp.datos.clientes.map(cliente => 
            `<option value="${cliente.id}">${cliente.nombre}</option>`
        ).join('');
}

// Función para cargar el select de productos
function cargarSelectProductos() {
    const select = document.getElementById('productoSelect');
    
    const opciones = '<option value="">Seleccionar producto...</option>' +
        estadoApp.datos.productos.filter(producto => producto.stock > 0)
        .map(producto => 
            `<option value="${producto.id}" 
                     data-precio="${producto.precio}" 
                     data-stock="${producto.stock}"
                     data-nombre="${producto.nombre}">
                ${producto.nombre} - ${formatearMoneda(producto.precio)} (Stock: ${producto.stock})
            </option>`
        ).join('');
    
    select.innerHTML = opciones;
}

// Función para mostrar el modal de venta
function mostrarModalVenta() {
    // Reiniciar la venta en curso
    ventaEnCurso = {
        clienteId: null,
        productos: [],
        subtotal: 0,
        iva: 0,
        total: 0
    };
    
    // Limpiar formularios
    document.getElementById('ventaCliente').value = '';
    document.getElementById('productoSelect').value = '';
    document.getElementById('productoCantidad').value = '1';
    
    // Cargar selects
    cargarSelectClientes();
    cargarSelectProductos();
    
    // Actualizar resumen
    actualizarResumenVenta();
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalVenta'));
    modal.show();
}

window.mostrarModalVenta = mostrarModalVenta;

// Función para agregar producto a la venta
function agregarProductoVenta() {
    const select = document.getElementById('productoSelect');
    const cantidadInput = document.getElementById('productoCantidad');
    const precioInput = document.getElementById('productoPrecioVenta');
    
    const productoId = select.value;
    const cantidad = parseInt(cantidadInput.value) || 1;
    const precioPersonalizado = parseFloat(precioInput.value) || 0;

    if (!productoId) {
        mostrarAlerta('Selecciona un producto', 'warning');
        return;
    }
    
    if (cantidad <= 0) {
        mostrarAlerta('La cantidad debe ser mayor a 0', 'warning');
        return;
    }
    
    // Obtener datos del producto seleccionado
    const productoSeleccionado = estadoApp.datos.productos.find(p => p.id === productoId);
    const option = select.options[select.selectedIndex];
    const precioOriginal = parseFloat(option.dataset.precio);
    const stock = parseInt(option.dataset.stock);
    const nombre = option.dataset.nombre;
    // Aca uso el precio que quiero, si no, uso el original
    const precioFinal = precioPersonalizado > 0 ? precioPersonalizado : precioOriginal;

    // Verificar stock disponible
    if (cantidad > stock) {
        mostrarAlerta(`Stock insuficiente. Solo hay ${stock} unidades disponibles`, 'danger');
        return;
    }
    
    // Verificar si el producto ya está en la venta
    const productoExistente = ventaEnCurso.productos.find(p => p.productoId === productoId);
    
    if (productoExistente) {
        // Actualizar cantidad si ya existe
        const nuevaCantidad = productoExistente.cantidad + cantidad;
        
        if (nuevaCantidad > stock) {
            mostrarAlerta(`No puedes agregar más de ${stock} unidades de este producto`, 'danger');
            return;
        }
        
        productoExistente.cantidad = nuevaCantidad;
        productoExistente.precio = precioFinal;
        productoExistente.subtotal = nuevaCantidad * precioFinal;
    } else {
        // Agregar nuevo producto a la venta
        ventaEnCurso.productos.push({
            productoId: productoId,
            nombre: nombre,
            precio: precioFinal,
            precioOriginal: precioOriginal,
            cantidad: cantidad,
            subtotal: cantidad * precioFinal
        });
    }
    
    // Actualizar resumen
    actualizarResumenVenta();
    
    // Limpiar selección
    select.value = '';
    cantidadInput.value = '1';
    precioInput.value = '';

    mostrarAlerta('Producto agregado a la venta', 'success');
}

// Función para actualizar el resumen de la venta
function actualizarResumenVenta() {
    const listaProductos = document.getElementById('listaProductosVenta');
    const subtotalElement = document.getElementById('subtotalVenta');
    const ivaElement = document.getElementById('ivaVenta');
    const totalElement = document.getElementById('totalVenta');
    
    // Calcular totales
    ventaEnCurso.subtotal = ventaEnCurso.productos.reduce((sum, producto) => sum + producto.subtotal, 0);
    ventaEnCurso.iva = ventaEnCurso.subtotal * 0.21; // 21% IVA
    ventaEnCurso.total = ventaEnCurso.subtotal + ventaEnCurso.iva;
    
    // Actualizar lista de productos
    if (ventaEnCurso.productos.length === 0) {
        listaProductos.innerHTML = '<p class="text-muted text-center">No hay productos agregados</p>';
    } else {
        listaProductos.innerHTML = ventaEnCurso.productos.map((producto, index) => {
            // Mostrar si el precio fue modificado
            const precioModificado = producto.precioOriginal && producto.precio !== producto.precioOriginal;
            const badgePrecio = precioModificado ? 
                `<span class="badge bg-warning ms-2" title="Precio original: ${formatearMoneda(producto.precioOriginal)}">Modificado</span>` : 
                '';
            
            return `
                <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                    <div class="flex-grow-1">
                        <strong>${producto.nombre}</strong>
                        ${badgePrecio}
                        <br>
                        <small class="text-muted">
                            ${producto.cantidad} × ${formatearMoneda(producto.precio)}
                            ${precioModificado ? `<br><small class="text-warning">Original: ${formatearMoneda(producto.precioOriginal)}</small>` : ''}
                        </small>
                    </div>
                    <div class="text-end">
                        <div class="fw-bold">${formatearMoneda(producto.subtotal)}</div>
                        <div class="btn-group btn-group-sm mt-1">
                            <button class="btn btn-outline-primary" onclick="editarProductoVenta(${index})">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="removerProductoVenta(${index})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Actualizar totales
    subtotalElement.textContent = formatearMoneda(ventaEnCurso.subtotal);
    ivaElement.textContent = formatearMoneda(ventaEnCurso.iva);
    totalElement.textContent = formatearMoneda(ventaEnCurso.total);
}

// Función para remover producto de la venta
function removerProductoVenta(index) {
    ventaEnCurso.productos.splice(index, 1);
    actualizarResumenVenta();
    mostrarAlerta('Producto removido de la venta', 'info');
}

// Función para guardar la venta
async function guardarVenta() {
    const clienteId = document.getElementById('ventaCliente').value;
    
    // Validaciones
    if (!clienteId) {
        mostrarAlerta('Selecciona un cliente', 'warning');
        return;
    }
    
    if (ventaEnCurso.productos.length === 0) {
        mostrarAlerta('Agrega al menos un producto a la venta', 'warning');
        return;
    }
    
    try {
        // Preparar datos para Supabase
        const ventaData = {
            venta: {
                cliente_id: clienteId,
                subtotal: ventaEnCurso.subtotal,
                iva: ventaEnCurso.iva,
                total: ventaEnCurso.total,
                user_id: estadoApp.datos.usuario.id, // <-- AÑADIR ID DEL USUARIO
                estado: 'completada'
            },
            items: ventaEnCurso.productos.map(p => ({
                producto_id: p.productoId,
                cantidad: p.cantidad,
                precio_unitario: p.precio
            }))
        };
        
        // Guardar en Supabase
        const ventaCreada = await ventasAPI.crear(ventaData);
        
        // Actualizar stock en productos
        for (const item of ventaEnCurso.productos) {
            const producto = estadoApp.datos.productos.find(p => p.id === item.productoId);
            if (producto) {
                const nuevoStock = producto.stock - item.cantidad;
                await productosAPI.actualizarStock(item.productoId, nuevoStock);
            }
        }
        
        // Recargar datos desde Supabase
        estadoApp.datos.ventas = await ventasAPI.obtenerTodas();
        estadoApp.datos.productos = await productosAPI.obtenerTodos();
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalVenta'));
        modal.hide();
        
        // Actualizar interfaz
        actualizarTablaVentas();
        actualizarEstadisticas();
        
        // Mostrar mensaje de éxito
        mostrarAlerta(`Venta registrada exitosamente por ${formatearMoneda(ventaEnCurso.total)}`, 'success');
        
    } catch (error) {
        console.error('Error guardando venta:', error);
        mostrarAlerta('Error al guardar venta: ' + error.message, 'danger');
    }
}

// Función para actualizar stock de productos después de una venta
function actualizarStockProductos(productosVendidos) {
    productosVendidos.forEach(productoVendido => {
        const producto = estadoApp.datos.productos.find(p => p.id === productoVendido.productoId);
        if (producto) {
            producto.stock -= productoVendido.cantidad;
            if (producto.stock < 0) producto.stock = 0;
        }
    });
}

// Función para filtrar ventas por fecha
function filtrarVentas() {
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    const clienteId = document.getElementById('filtroClienteVenta').value;
    
    let ventasFiltradas = estadoApp.datos.ventas;
    
    // Aplicar filtros
    if (fechaInicio) {
        ventasFiltradas = ventasFiltradas.filter(venta => 
            new Date(venta.fecha_venta) >= new Date(fechaInicio)
        );
    }
    
    if (fechaFin) {
        const fechaFinObj = new Date(fechaFin);
        fechaFinObj.setHours(23, 59, 59, 999); // Incluir todo el día
        ventasFiltradas = ventasFiltradas.filter(venta => 
            new Date(venta.fecha_venta) <= fechaFinObj
        );
    }
    
    if (clienteId) {
        ventasFiltradas = ventasFiltradas.filter(venta => {
            // Manejar diferentes estructuras de cliente
            if (venta.clientes && venta.clientes.id === clienteId) {
                return true;
            } else if (venta.cliente_id === clienteId) {
                return true;
            }
            return false;
        });
    }
    
    // Actualizar tabla con ventas filtradas
    const tbody = document.getElementById('tablaVentas');
    
    if (ventasFiltradas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bi bi-search display-4"></i>
                    <p class="mt-2">No se encontraron ventas</p>
                    <button class="btn btn-outline-primary" onclick="limpiarFiltrosVentas()">
                        <i class="bi bi-arrow-clockwise"></i> Limpiar filtros
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = ventasFiltradas.map(venta => `
        <tr>
            <td>${formatearFecha(venta.fecha_venta)}</td>
            <td>
                <strong>${venta.clientes ? venta.clientes.nombre : 'Cliente no disponible'}</strong>
                <br><small class="text-muted">${venta.clientes ? venta.clientes.email : '-'}</small>
            </td>
            <td>
                <small>
                    ${(venta.venta_items || []).map(item => 
                        `${item.cantidad} x ${item.productos ? item.productos.nombre : 'Producto'} - ${formatearMoneda(item.precio_unitario)}`
                    ).join('<br>')}
                </small>
            </td>
            <td>${formatearMoneda(venta.total)}</td>
            <td>
                <span class="badge ${venta.estado === 'completada' ? 'bg-success' : venta.estado === 'pendiente' ? 'bg-warning' : 'bg-danger'}">
                    ${venta.estado}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-info" onclick="verDetalleVenta('${venta.id}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarVenta('${venta.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Función para limpiar filtros de ventas
function limpiarFiltrosVentas() {
    document.getElementById('fechaInicio').value = '';
    document.getElementById('fechaFin').value = '';
    document.getElementById('filtroClienteVenta').value = '';
    
    actualizarTablaVentas();
    mostrarAlerta('Filtros limpiados', 'info');
}

// Función para ver detalle de venta (placeholder)
function verDetalleVentaModal(ventaId) {
    try {
        const venta = estadoApp.datos.ventas.find(v => v.id === ventaId);
        
        if (!venta) {
            mostrarAlerta('Venta no encontrada', 'danger');
            return;
        }

        // Crear contenido del modal
        const clienteNombre = venta.clientes ? venta.clientes.nombre : 'Cliente no disponible';
        const clienteEmail = venta.clientes ? venta.clientes.email : '-';
        
        const productosHTML = (venta.venta_items || []).map(item => {
            const productoNombre = item.productos ? item.productos.nombre : 'Producto no disponible';
            return `
                <tr>
                    <td>${productoNombre}</td>
                    <td class="text-center">${item.cantidad}</td>
                    <td class="text-end">${formatearMoneda(item.precio_unitario)}</td>
                    <td class="text-end">${formatearMoneda(item.subtotal)}</td>
                </tr>
            `;
        }).join('');

        const modalHTML = `
            <div class="modal fade" id="modalDetalleVenta" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="bi bi-receipt"></i> Detalle de Venta
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <strong>Cliente:</strong><br>
                                    ${clienteNombre}<br>
                                    <small class="text-muted">${clienteEmail}</small>
                                </div>
                                <div class="col-md-6">
                                    <strong>Fecha:</strong><br>
                                    ${formatearFecha(venta.fecha_venta)}<br>
                                    <span class="badge bg-success">${venta.estado || 'completada'}</span>
                                </div>
                            </div>
                            
                            <div class="table-responsive">
                                <table class="table table-sm table-bordered">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Producto</th>
                                            <th width="80" class="text-center">Cantidad</th>
                                            <th width="120" class="text-end">Precio Unitario</th>
                                            <th width="120" class="text-end">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${productosHTML || '<tr><td colspan="4" class="text-center text-muted">No hay productos</td></tr>'}
                                    </tbody>
                                    <tfoot class="table-light">
                                        <tr>
                                            <td colspan="3" class="text-end"><strong>Subtotal:</strong></td>
                                            <td class="text-end"><strong>${formatearMoneda(venta.subtotal)}</strong></td>
                                        </tr>
                                        <tr>
                                            <td colspan="3" class="text-end"><strong>IVA:</strong></td>
                                            <td class="text-end"><strong>${formatearMoneda(venta.iva)}</strong></td>
                                        </tr>
                                        <tr>
                                            <td colspan="3" class="text-end"><strong>Total:</strong></td>
                                            <td class="text-end"><strong class="text-success">${formatearMoneda(venta.total)}</strong></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            
                            ${venta.notas ? `
                            <div class="mt-3">
                                <strong>Notas:</strong><br>
                                <p class="text-muted">${venta.notas}</p>
                            </div>
                            ` : ''}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remover modal anterior si existe
        const modalAnterior = document.getElementById('modalDetalleVenta');
        if (modalAnterior) {
            modalAnterior.remove();
        }

        // Agregar nuevo modal al DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('modalDetalleVenta'));
        modal.show();

    } catch (error) {
        console.error('Error mostrando detalle de venta:', error);
        mostrarAlerta('Error al mostrar el detalle de la venta', 'danger');
    }
}

// Función para eliminar venta
async function eliminarVenta(ventaId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta venta?\nEsta acción no se puede deshacer.')) {
        return;
    }
    
   try {
        // 1. Primero obtenemos los detalles de la venta para revertir el stock
        const venta = await ventasAPI.obtenerPorId(ventaId);
        
        if (!venta) {
            mostrarAlerta('Venta no encontrada', 'danger');
            return;
        }

        console.log('Venta encontrada:', venta);

        // 2. Revertir el stock de los productos
        if (venta.venta_items && venta.venta_items.length > 0) {
            for (const item of venta.venta_items) {
                const producto = estadoApp.datos.productos.find(p => p.id === item.producto_id);
                if (producto) {
                    const nuevoStock = producto.stock + item.cantidad;
                    await productosAPI.actualizarStock(item.producto_id, nuevoStock);
                    console.log(`Stock revertido para ${producto.nombre}: +${item.cantidad} unidades`);
                }
            }
        } else {
            console.log('No hay items para revertir stock');
        }

        // 3. Eliminar la venta de Supabase
        await ventasAPI.eliminar(ventaId);
        
        // 4. Actualizar el estado local
        const index = estadoApp.datos.ventas.findIndex(v => v.id === ventaId);
        if (index !== -1) {
            estadoApp.datos.ventas.splice(index, 1);
        }

        // 5. Recargar datos desde Supabase para asegurar consistencia
        estadoApp.datos.ventas = await ventasAPI.obtenerTodas();
        estadoApp.datos.productos = await productosAPI.obtenerTodos();

        // 6. Actualizar interfaz
        actualizarTablaVentas();
        actualizarEstadisticas();

        mostrarAlerta('Venta eliminada exitosamente', 'success');
        
    } catch (error) {
        console.error('Error eliminando venta:', error);
        mostrarAlerta('Error al eliminar venta: ' + error.message, 'danger');
    }
}

// Función mejorada para actualizar estadísticas del dashboard
function actualizarEstadisticasDashboard() {
    try {
        const hoy = new Date().toISOString().split('T')[0];
        const inicioMes = new Date();
        inicioMes.setDate(1);
        const inicioMesStr = inicioMes.toISOString().split('T')[0];
        
        // Calcular ventas de hoy
        const ventasHoy = estadoApp.datos.ventas
            .filter(v => v.fecha_venta && v.fecha_venta.startsWith(hoy))
            .reduce((sum, v) => sum + (v.total || 0), 0);
        
        // Calcular ingresos del mes
        const ingresosMes = estadoApp.datos.ventas
            .filter(v => v.fecha_venta && v.fecha_venta >= inicioMesStr)
            .reduce((sum, v) => sum + (v.total || 0), 0);
        
        // Actualizar elementos del DOM
        const ventasHoyElement = document.getElementById('ventasHoy');
        const ingresosMesElement = document.getElementById('ingresosMes');
        const totalClientesElement = document.getElementById('totalClientes');
        const totalProductosElement = document.getElementById('totalProductos');
        
        if (ventasHoyElement) ventasHoyElement.textContent = formatearMoneda(ventasHoy);
        if (ingresosMesElement) ingresosMesElement.textContent = formatearMoneda(ingresosMes);
        if (totalClientesElement) totalClientesElement.textContent = estadoApp.datos.clientes.length;
        if (totalProductosElement) totalProductosElement.textContent = estadoApp.datos.productos.length;
        
    } catch (error) {
        console.error('Error actualizando estadísticas:', error);
    }
}


window.mostrarModalVenta = mostrarModalVenta;
window.agregarProductoVenta = agregarProductoVenta;
window.removerProductoVenta = removerProductoVenta;
window.guardarVenta = guardarVenta;
window.filtrarVentas = filtrarVentas;
window.limpiarFiltrosVentas = limpiarFiltrosVentas;
window.verDetalleVentaModal = verDetalleVentaModal;
window.eliminarVenta = eliminarVenta;
window.actualizarStockProductos = actualizarStockProductos;
window.editarProductoVenta = editarProductoVenta;
window.guardarEdicionProductoVenta = guardarEdicionProductoVenta;
window.actualizarEstadisticasDashboard = actualizarEstadisticasDashboard;