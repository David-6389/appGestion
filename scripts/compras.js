// compras.js - Gestión de compras y stock
import { estadoApp, mostrarAlerta, formatearMoneda, formatearFecha } from './app.js';
import { comprasAPI, productosAPI } from './supabase.js';

// Estado temporal para la compra en curso
let compraEnCurso = {
    proveedor: '',
    numeroFactura: '',
    productos: [],
    subtotal: 0,
    iva: 0,
    total: 0
};

// Función para cargar la sección de compras
export async function cargarCompras() {
    console.log('Cargando compras desde Supabase...');
    try {
        const compras = await comprasAPI.obtenerTodas();
        estadoApp.datos.compras = compras;
        actualizarTablaCompras();
        configurarModalCompra();
    } catch (error) {
        console.error('Error cargando compras:', error);
        mostrarAlerta('Error al cargar compras: ' + error.message, 'danger');
    }
}

// Función para actualizar la tabla de compras
function actualizarTablaCompras() {
    const tbody = document.getElementById('tablaCompras');
    
    if (!estadoApp.datos.compras || estadoApp.datos.compras.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="bi bi-box-seam display-4"></i>
                    <p class="mt-2">No hay compras registradas</p>
                    <button class="btn btn-primary" onclick="mostrarModalCompra()">
                        <i class="bi bi-plus"></i> Registrar Primera Compra
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = estadoApp.datos.compras.map(compra => `
        <tr>
            <td>${formatearFecha(compra.fecha_compra)}</td>
            <td>
                <strong>${compra.proveedor}</strong>
                ${compra.numero_factura ? `<br><small class="text-muted">Factura: ${compra.numero_factura}</small>` : ''}
            </td>
            <td>
                <small>
                    ${(compra.compra_items || []).map(item => 
                        `${item.cantidad} x ${item.productos ? item.productos.nombre : 'Producto'}`
                    ).join('<br>')}
                </small>
            </td>
            <td>${formatearMoneda(compra.subtotal)}</td>
            <td>${formatearMoneda(compra.iva)}</td>
            <td>${formatearMoneda(compra.total)}</td>
            <td>
                <span class="badge ${compra.estado === 'completada' ? 'bg-success' : compra.estado === 'pendiente' ? 'bg-warning' : 'bg-danger'}">
                    ${compra.estado}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-info" onclick="verDetalleCompra('${compra.id}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarCompra('${compra.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Función para mostrar el modal de compra
export function mostrarModalCompra() {
    // Reiniciar la compra en curso
    compraEnCurso = {
        proveedor: '',
        numeroFactura: '',
        productos: [],
        subtotal: 0,
        iva: 0,
        total: 0
    };
    
    // Limpiar formularios
    document.getElementById('compraProveedor').value = '';
    document.getElementById('compraNumeroFactura').value = '';
    document.getElementById('productoSelectCompra').value = '';
    document.getElementById('productoCantidadCompra').value = '1';
    document.getElementById('productoPrecioCompra').value = '';
    
    // Cargar select de productos
    cargarSelectProductosCompra();
    
    // Actualizar resumen
    actualizarResumenCompra();
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalCompra'));
    modal.show();
}

// Función para cargar el select de productos en compras
function cargarSelectProductosCompra() {
    const select = document.getElementById('productoSelectCompra');
    
    const opciones = '<option value="">Seleccionar producto...</option>' +
        estadoApp.datos.productos.map(producto => 
            `<option value="${producto.id}" data-nombre="${producto.nombre}">
                ${producto.nombre} (Stock: ${producto.stock})
            </option>`
        ).join('');
    
    select.innerHTML = opciones;
}

// Función para agregar producto a la compra
function agregarProductoCompra() {
    const select = document.getElementById('productoSelectCompra');
    const cantidadInput = document.getElementById('productoCantidadCompra');
    const precioInput = document.getElementById('productoPrecioCompra');
    
    const productoId = select.value;
    const cantidad = parseInt(cantidadInput.value) || 1;
    const precio = parseFloat(precioInput.value) || 0;
    
    if (!productoId) {
        mostrarAlerta('Selecciona un producto', 'warning');
        return;
    }
    
    if (cantidad <= 0) {
        mostrarAlerta('La cantidad debe ser mayor a 0', 'warning');
        return;
    }
    
    if (precio <= 0) {
        mostrarAlerta('El precio debe ser mayor a 0', 'warning');
        return;
    }
    
    // Obtener datos del producto seleccionado
    const productoSeleccionado = estadoApp.datos.productos.find(p => p.id === productoId);
    const nombre = productoSeleccionado ? productoSeleccionado.nombre : 'Producto';
    
    // Verificar si el producto ya está en la compra
    const productoExistente = compraEnCurso.productos.find(p => p.productoId === productoId);
    
    if (productoExistente) {
        // Actualizar si ya existe
        productoExistente.cantidad = cantidad;
        productoExistente.precioUnitario = precio;
        productoExistente.subtotal = cantidad * precio;
    } else {
        // Agregar nuevo producto a la compra
        compraEnCurso.productos.push({
            productoId: productoId,
            nombre: nombre,
            cantidad: cantidad,
            precioUnitario: precio,
            subtotal: cantidad * precio
        });
    }
    
    // Actualizar resumen
    actualizarResumenCompra();
    
    // Limpiar selección
    select.value = '';
    cantidadInput.value = '1';
    precioInput.value = '';
    
    mostrarAlerta('Producto agregado a la compra', 'success');
}

// Función para actualizar el resumen de la compra
function actualizarResumenCompra() {
    const listaProductos = document.getElementById('listaProductosCompra');
    const subtotalElement = document.getElementById('subtotalCompra');
    const ivaElement = document.getElementById('ivaCompra');
    const totalElement = document.getElementById('totalCompra');
    
    // Calcular totales
    compraEnCurso.subtotal = compraEnCurso.productos.reduce((sum, producto) => sum + producto.subtotal, 0);
    compraEnCurso.iva = compraEnCurso.subtotal * 0.21; // 21% IVA
    compraEnCurso.total = compraEnCurso.subtotal + compraEnCurso.iva;
    
    // Actualizar lista de productos
    if (compraEnCurso.productos.length === 0) {
        listaProductos.innerHTML = '<p class="text-muted text-center">No hay productos agregados</p>';
    } else {
        listaProductos.innerHTML = compraEnCurso.productos.map((producto, index) => `
            <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                <div class="flex-grow-1">
                    <strong>${producto.nombre}</strong><br>
                    <small class="text-muted">
                        ${producto.cantidad} × ${formatearMoneda(producto.precioUnitario)}
                    </small>
                </div>
                <div class="text-end">
                    <div class="fw-bold">${formatearMoneda(producto.subtotal)}</div>
                    <button class="btn btn-sm btn-outline-danger mt-1" onclick="removerProductoCompra(${index})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Actualizar totales
    subtotalElement.textContent = formatearMoneda(compraEnCurso.subtotal);
    ivaElement.textContent = formatearMoneda(compraEnCurso.iva);
    totalElement.textContent = formatearMoneda(compraEnCurso.total);
}

// Función para remover producto de la compra
function removerProductoCompra(index) {
    compraEnCurso.productos.splice(index, 1);
    actualizarResumenCompra();
    mostrarAlerta('Producto removido de la compra', 'info');
}

// Función para guardar la compra
async function guardarCompra() {
    const proveedor = document.getElementById('compraProveedor').value;
    const numeroFactura = document.getElementById('compraNumeroFactura').value;
    
    // Validaciones
    if (!proveedor.trim()) {
        mostrarAlerta('Ingresa el nombre del proveedor', 'warning');
        return;
    }
    
    if (compraEnCurso.productos.length === 0) {
        mostrarAlerta('Agrega al menos un producto a la compra', 'warning');
        return;
    }
    
    try {
        // Preparar datos para Supabase
        const compraData = {
            compra: {
                proveedor: proveedor.trim(),
                numero_factura: numeroFactura.trim() || null,
                subtotal: compraEnCurso.subtotal,
                iva: compraEnCurso.iva,
                total: compraEnCurso.total,
                estado: 'completada'
            },
            items: compraEnCurso.productos.map(p => ({
                producto_id: p.productoId,
                cantidad: p.cantidad,
                precio_unitario: p.precioUnitario
            }))
        };
        
        // Guardar en Supabase
        const compraCreada = await comprasAPI.crear(compraData);
        
        // Actualizar stock de productos
        for (const item of compraEnCurso.productos) {
            const producto = estadoApp.datos.productos.find(p => p.id === item.productoId);
            if (producto) {
                const nuevoStock = producto.stock + item.cantidad;
                await productosAPI.actualizarStock(item.productoId, nuevoStock);
            }
        }
        
        // Recargar datos desde Supabase
        estadoApp.datos.compras = await comprasAPI.obtenerTodas();
        estadoApp.datos.productos = await productosAPI.obtenerTodos();
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalCompra'));
        modal.hide();
        
        // Actualizar interfaz
        actualizarTablaCompras();
        
        // Mostrar mensaje de éxito
        mostrarAlerta(`Compra registrada exitosamente por ${formatearMoneda(compraEnCurso.total)}`, 'success');
        
    } catch (error) {
        console.error('Error guardando compra:', error);
        mostrarAlerta('Error al guardar compra: ' + error.message, 'danger');
    }
}

// Función para ver detalle de compra
function verDetalleCompra(compraId) {
    try {
        const compra = estadoApp.datos.compras.find(c => c.id === compraId);
        
        if (!compra) {
            mostrarAlerta('Compra no encontrada', 'danger');
            return;
        }

        const productosDetalle = (compra.compra_items || []).map(item => {
            const productoNombre = item.productos ? item.productos.nombre : 'Producto no disponible';
            return `- ${item.cantidad} x ${productoNombre} (${formatearMoneda(item.precio_unitario)}) = ${formatearMoneda(item.subtotal)}`;
        }).join('\n');

        const detalle = `
DETALLE DE COMPRA
=================
Proveedor: ${compra.proveedor}
${compra.numero_factura ? `Factura: ${compra.numero_factura}` : ''}
Fecha: ${formatearFecha(compra.fecha_compra)}
Estado: ${compra.estado}
Subtotal: ${formatearMoneda(compra.subtotal)}
IVA: ${formatearMoneda(compra.iva)}
Total: ${formatearMoneda(compra.total)}

PRODUCTOS:
${productosDetalle || 'No hay productos registrados'}

${compra.notas ? `Notas: ${compra.notas}` : ''}
        `.trim();

        alert(detalle);

    } catch (error) {
        console.error('Error mostrando detalle de compra:', error);
        mostrarAlerta('Error al mostrar el detalle de la compra', 'danger');
    }
}

// Función para eliminar compra
async function eliminarCompra(compraId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta compra? Esta acción revertirá el stock.')) {
        return;
    }
    
    try {
        // Obtener detalles de la compra para revertir stock
        const compra = await comprasAPI.obtenerPorId(compraId);
        
        if (!compra) {
            mostrarAlerta('Compra no encontrada', 'danger');
            return;
        }

        // Revertir el stock de los productos
        for (const item of compra.compra_items || []) {
            const producto = estadoApp.datos.productos.find(p => p.id === item.producto_id);
            if (producto) {
                const nuevoStock = producto.stock - item.cantidad;
                await productosAPI.actualizarStock(item.producto_id, nuevoStock);
            }
        }

        // Eliminar la compra de Supabase
        await comprasAPI.eliminar(compraId);
        
        // Actualizar estado local
        const index = estadoApp.datos.compras.findIndex(c => c.id === compraId);
        if (index !== -1) {
            estadoApp.datos.compras.splice(index, 1);
        }

        // Recargar datos para consistencia
        estadoApp.datos.compras = await comprasAPI.obtenerTodas();
        estadoApp.datos.productos = await productosAPI.obtenerTodos();

        // Actualizar interfaz
        actualizarTablaCompras();

        mostrarAlerta('Compra eliminada exitosamente', 'success');
        
    } catch (error) {
        console.error('Error eliminando compra:', error);
        mostrarAlerta('Error al eliminar compra: ' + error.message, 'danger');
    }
}

// Función para configurar el modal
function configurarModalCompra() {
    const modal = document.getElementById('modalCompra');
    
    modal.addEventListener('hidden.bs.modal', function () {
        // Limpiar el formulario
        document.getElementById('formCompra').reset();
        compraEnCurso = {
            proveedor: '',
            numeroFactura: '',
            productos: [],
            subtotal: 0,
            iva: 0,
            total: 0
        };
    });
}

// Exportar funciones al scope global para el HTML
window.mostrarModalCompra = mostrarModalCompra;
window.agregarProductoCompra = agregarProductoCompra;
window.removerProductoCompra = removerProductoCompra;
window.guardarCompra = guardarCompra;
window.verDetalleCompra = verDetalleCompra;
window.eliminarCompra = eliminarCompra;