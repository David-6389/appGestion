// reportes.js - Funciones para reportes y estadísticas
import { estadoApp, mostrarAlerta, formatearMoneda } from './app.js';
import { reportesAPI } from './supabase.js';


// Estado de los reportes
let reporteActual = {
    tipo: 'diario',
    fechaInicio: null,
    fechaFin: null,
    datos: []
};

// Función para cargar la sección de reportes
export function cargarReportes() {
    console.log('Cargando reportes...');
    
    // Establecer fechas por defecto (últimos 30 días)
    const fechaFin = new Date();
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - 30);
    
    document.getElementById('reporteFechaInicio').value = fechaInicio.toISOString().split('T')[0];
    document.getElementById('reporteFechaFin').value = fechaFin.toISOString().split('T')[0];
    
    // Generar reporte inicial
    generarReporte();
}

// Función principal para generar reportes
function generarReporte(tipo = null) {
    if (tipo) {
        reporteActual.tipo = tipo;
        document.getElementById('periodoReporte').value = tipo;
    } else {
        reporteActual.tipo = document.getElementById('periodoReporte').value;
    }
    
    // Obtener fechas del formulario
    reporteActual.fechaInicio = document.getElementById('reporteFechaInicio').value;
    reporteActual.fechaFin = document.getElementById('reporteFechaFin').value;
    
    // Validar fechas
    if (!reporteActual.fechaInicio || !reporteActual.fechaFin) {
        mostrarAlerta('Selecciona un rango de fechas válido', 'warning');
        return;
    }
    
    if (new Date(reporteActual.fechaInicio) > new Date(reporteActual.fechaFin)) {
        mostrarAlerta('La fecha de inicio no puede ser mayor a la fecha fin', 'warning');
        return;
    }
    
    // Procesar datos según el tipo de reporte
    const datosProcesados = procesarDatosReporte();
    reporteActual.datos = datosProcesados;
    
    // Actualizar interfaz
    actualizarTablaReportes(datosProcesados);
    actualizarGraficosReportes(datosProcesados);
    
    mostrarAlerta(`Reporte ${reporteActual.tipo} generado exitosamente`, 'success');
}

// Función para procesar datos según el tipo de reporte
function procesarDatosReporte() {
    const ventasFiltradas = filtrarVentasPorFecha();
    
    switch (reporteActual.tipo) {
        case 'diario':
            return generarReporteDiario(ventasFiltradas);
        case 'mensual':
            return generarReporteMensual(ventasFiltradas);
        case 'anual':
            return generarReporteAnual(ventasFiltradas);
        default:
            return generarReporteDiario(ventasFiltradas);
    }
}

// Función para filtrar ventas por el rango de fechas
function filtrarVentasPorFecha() {
    const fechaInicio = new Date(reporteActual.fechaInicio);
    const fechaFin = new Date(reporteActual.fechaFin);
    fechaFin.setHours(23, 59, 59, 999); // Incluir todo el día
    
    return estadoApp.datos.ventas.filter(venta => {
        const fechaVenta = new Date(venta.fecha_venta);
        return fechaVenta >= fechaInicio && fechaVenta <= fechaFin;
    });
}

// Función para generar reporte diario
function generarReporteDiario(ventas) {
    const grupos = {};
    
    ventas.forEach(venta => {
        if (!venta.fecha_venta) return;

        const fecha = new Date(venta.fecha_venta);
        const clave = fecha.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!grupos[clave]) {
            grupos[clave] = {
                periodo: clave,
                total_ventas: 0,
                cantidad_ventas: 0,
                clientes_unicos: new Set(),
                productos_vendidos: 0
            };
        }
        
        grupos[clave].total_ventas += venta.total;
        grupos[clave].cantidad_ventas += 1;
        if (venta.clientes && venta.clientes.id) {
            grupos[clave].clientes_unicos.add(venta.clientes.id);
        } else if (venta.cliente_id) {
            grupos[clave].clientes_unicos.add(venta.cliente_id);
        }
         if (venta.venta_items && Array.isArray(venta.venta_items)) {
            grupos[clave].productos_vendidos += venta.venta_items.reduce((sum, item) => 
                sum + (item.cantidad || 0), 0
            );
        }
    });
    
    // Convertir Set a count y calcular promedios
    return Object.values(grupos).map(grupo => ({
        ...grupo,
        clientes_atendidos: grupo.clientes_unicos.size,
        promedio_venta: grupo.cantidad_ventas > 0 ? grupo.total_ventas / grupo.cantidad_ventas : 0
    })).sort((a, b) => a.periodo.localeCompare(b.periodo));
}

// Función para generar reporte mensual
function generarReporteMensual(ventas) {
    const grupos = {};
    
    ventas.forEach(venta => {
        if (!venta.fecha_venta) return;

        const fecha = new Date(venta.fecha_venta);
        const clave = fecha.toISOString().substring(0, 7); // YYYY-MM
        
        if (!grupos[clave]) {
            grupos[clave] = {
                periodo: clave,
                total_ventas: 0,
                cantidad_ventas: 0,
                clientes_unicos: new Set(),
                productos_vendidos: 0
            };
        }
        
        grupos[clave].total_ventas += venta.total;
        grupos[clave].cantidad_ventas += 1;
         // Manejar diferentes estructuras de cliente
        if (venta.clientes && venta.clientes.id) {
            grupos[clave].clientes_unicos.add(venta.clientes.id);
        } else if (venta.cliente_id) {
            grupos[clave].clientes_unicos.add(venta.cliente_id);
        }
        
        // Contar productos vendidos
        if (venta.venta_items && Array.isArray(venta.venta_items)) {
            grupos[clave].productos_vendidos += venta.venta_items.reduce((sum, item) => 
                sum + (item.cantidad || 0), 0
            );
        }
    });
    
    return Object.values(grupos).map(grupo => ({
        ...grupo,
        clientes_atendidos: grupo.clientes_unicos.size,
        promedio_venta: grupo.cantidad_ventas > 0 ? grupo.total_ventas / grupo.cantidad_ventas : 0
    })).sort((a, b) => a.periodo.localeCompare(b.periodo));
}

// Función para generar reporte anual
function generarReporteAnual(ventas) {
    const grupos = {};
    
    ventas.forEach(venta => {
        if (!venta.fecha_venta) return;

        const fecha = new Date(venta.fecha_venta);
        const clave = fecha.getFullYear().toString(); // YYYY
        
        if (!grupos[clave]) {
            grupos[clave] = {
                periodo: clave,
                total_ventas: 0,
                cantidad_ventas: 0,
                clientes_unicos: new Set(),
                productos_vendidos: 0
            };
        }
        
        grupos[clave].total_ventas += venta.total;
         if (venta.clientes && venta.clientes.id) {
            grupos[clave].clientes_unicos.add(venta.clientes.id);
        } else if (venta.cliente_id) {
            grupos[clave].clientes_unicos.add(venta.cliente_id);
        }
        
        // Contar productos vendidos
        if (venta.venta_items && Array.isArray(venta.venta_items)) {
            grupos[clave].productos_vendidos += venta.venta_items.reduce((sum, item) => 
                sum + (item.cantidad || 0), 0
            );
        }
    });
    
    return Object.values(grupos).map(grupo => ({
        ...grupo,
        clientes_atendidos: grupo.clientes_unicos.size,
        promedio_venta: grupo.cantidad_ventas > 0 ? grupo.total_ventas / grupo.cantidad_ventas : 0
    })).sort((a, b) => a.periodo.localeCompare(b.periodo));
}

// Función para actualizar la tabla de reportes
function actualizarTablaReportes(datos) {
    const tbody = document.getElementById('tablaReportes');
    
    if (datos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    <i class="bi bi-graph-up display-4"></i>
                    <p class="mt-2">No hay datos para el período seleccionado</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = datos.map(item => `
        <tr>
            <td>
                <strong>${formatearPeriodo(item.periodo)}</strong>
            </td>
            <td class="fw-bold text-success">${formatearMoneda(item.total_ventas)}</td>
            <td>
                <span class="badge bg-primary">${item.cantidad_ventas} ventas</span>
            </td>
            <td>${formatearMoneda(item.promedio_venta)}</td>
            <td>
                <span class="badge bg-info">${item.clientes_atendidos} clientes</span>
            </td>
        </tr>
    `).join('');
}

// Función para formatear el período según el tipo de reporte
function formatearPeriodo(periodo) {
    switch (reporteActual.tipo) {
        case 'diario':
            return new Date(periodo).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        case 'mensual':
            const [year, month] = periodo.split('-');
            return new Date(year, month - 1).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long'
            });
        case 'anual':
            return periodo;
        default:
            return periodo;
    }
}

// Función para actualizar los gráficos de reportes
function actualizarGraficosReportes(datos) {
    actualizarGraficoVentasPeriodo(datos);
    actualizarGraficoCategorias();
}

// Función para actualizar el gráfico de ventas por período
function actualizarGraficoVentasPeriodo(datos) {
    const ctx = document.getElementById('chartVentasPeriodo');
    
    if (!ctx) return;
    
    // Destruir gráfico anterior si existe
    if (ctx.chart) {
        ctx.chart.destroy();
    }
    
    const labels = datos.map(item => formatearPeriodo(item.periodo));
    const valores = datos.map(item => item.total_ventas);
    
    ctx.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ventas Totales',
                data: valores,
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `Ventas por Período (${reporteActual.tipo})`
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatearMoneda(value);
                        }
                    }
                }
            }
        }
    });
}

// Función para actualizar el gráfico de categorías
function actualizarGraficoCategorias() {
    const ctx = document.getElementById('chartCategorias');
    
    if (!ctx) return;
    
    // Destruir gráfico anterior si existe
    if (ctx.chart) {
        ctx.chart.destroy();
    }
    
    // Calcular ventas por categoría
    const ventasFiltradas = filtrarVentasPorFecha();
    const ventasPorCategoria = calcularVentasPorCategoria(ventasFiltradas);
    
    const labels = Object.keys(ventasPorCategoria);
    const valores = Object.values(ventasPorCategoria);
    
    if (labels.length === 0 || valores.reduce((sum, val) => sum + val, 0) === 0) {
        // Mostrar mensaje de no datos
        ctx.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="bi bi-pie-chart display-4"></i>
                <p class="mt-2">No hay datos de categorías para el período seleccionado</p>
            </div>
        `;
        return;
    }
    
    ctx.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: [
                    '#3498db', '#2ecc71', '#e74c3c', '#f39c12',
                    '#9b59b6', '#1abc9c', '#34495e', '#e67e22',
                    '#16a085', '#27ae60', '#2980b9', '#8e44ad'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Distribución por Categorías'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Función para calcular ventas por categoría
function calcularVentasPorCategoria(ventas) {
    const categorias = {};
    
    ventas.forEach(venta => {
        try {
            // Verificar que la venta tenga items
            if (!venta.venta_items || !Array.isArray(venta.venta_items)) {
                return;
            }
            venta.venta_items.forEach(item => {
                try {
                    let categoria = 'Sin categoría';
                    let subtotal = 0;
                    
                    // Determinar categoría
                    if (item.productos && item.productos.categoria) {
                        categoria = item.productos.categoria;
                    }
                    
                    // Calcular subtotal
                    if (item.subtotal) {
                        subtotal = Number(item.subtotal);
                    } else if (item.precio_unitario && item.cantidad) {
                        subtotal = Number(item.precio_unitario) * Number(item.cantidad);
                    }
                    
                    // Acumular en la categoría
                    if (!categorias[categoria]) {
                        categorias[categoria] = 0;
                    }
                    categorias[categoria] += subtotal;
                    
                } catch (itemError) {
                    console.warn('Error procesando item de venta:', itemError);
                }
            });
            
        } catch (ventaError) {
            console.warn('Error procesando venta para categorías:', ventaError);
        }
    });
    
    return categorias;
}

// Función para cambiar el período del reporte
function cambiarPeriodoReporte() {
    const periodo = document.getElementById('periodoReporte').value;
    
    // Ajustar fechas según el período seleccionado
    const fechaFin = new Date();
    let fechaInicio = new Date();
    
    switch (periodo) {
        case 'diario':
            fechaInicio.setDate(fechaInicio.getDate() - 7); // Últimos 7 días
            break;
        case 'mensual':
            fechaInicio.setMonth(fechaInicio.getMonth() - 6); // Últimos 6 meses
            break;
        case 'anual':
            fechaInicio.setFullYear(fechaInicio.getFullYear() - 3); // Últimos 3 años
            break;
    }
    
    document.getElementById('reporteFechaInicio').value = fechaInicio.toISOString().split('T')[0];
    document.getElementById('reporteFechaFin').value = fechaFin.toISOString().split('T')[0];
    
    // Regenerar reporte
    generarReporte();
}

// Función para exportar reporte a Excel (simulado)
function exportarReporte() {
    if (reporteActual.datos.length === 0) {
        mostrarAlerta('No hay datos para exportar', 'warning');
        return;
    }
    
    // Simular exportación
    const contenido = generarContenidoExportacion();
    
    // Crear y descargar archivo (simulación)
    const blob = new Blob([contenido], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${reporteActual.tipo}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    mostrarAlerta('Reporte exportado exitosamente', 'success');
}

// Función para generar contenido de exportación
function generarContenidoExportacion() {
    let contenido = 'Período,Total Ventas,Cantidad Ventas,Promedio Venta,Clientes Atendidos,Productos Vendidos\n';
    
    reporteActual.datos.forEach(item => {
        contenido += `"${formatearPeriodo(item.periodo)}",${item.total_ventas},${item.cantidad_ventas},${item.promedio_venta},${item.clientes_atendidos},${item.productos_vendidos}\n`;
    });
    
    return contenido;
}

// Función para generar reporte rápido (desde los botones del header)
function generarReporteRapido(tipo) {
    // Establecer fechas según el tipo
    const fechaFin = new Date();
    let fechaInicio = new Date();
    
    switch (tipo) {
        case 'diario':
            fechaInicio.setDate(fechaInicio.getDate() - 7);
            break;
        case 'mensual':
            fechaInicio.setMonth(fechaInicio.getMonth() - 6);
            break;
        case 'anual':
            fechaInicio.setFullYear(fechaInicio.getFullYear() - 3);
            break;
    }
    
    document.getElementById('reporteFechaInicio').value = fechaInicio.toISOString().split('T')[0];
    document.getElementById('reporteFechaFin').value = fechaFin.toISOString().split('T')[0];
    document.getElementById('periodoReporte').value = tipo;
    
    generarReporte(tipo);
}

window.generarReporte = generarReporte;
window.generarReporteRapido = generarReporteRapido;
window.cambiarPeriodoReporte = cambiarPeriodoReporte;
window.exportarReporte = exportarReporte;