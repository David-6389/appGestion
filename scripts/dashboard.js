// dashboard.js - Funciones específicas del Dashboard
import { estadoApp, formatearMoneda, mostrarAlerta } from './app.js';

// Función para cargar el dashboard
export function cargarDashboard() {
    console.log('Cargando dashboard...');
    actualizarEstadisticas('hoy'); // Cargar con 'hoy' por defecto
    actualizarVistasDashboard('hoy');
    configurarMenuSandwich();
    configurarBotonesDashboard();
}

// Función para configurar los botones del dashboard
function configurarBotonesDashboard() {
    // Asignar eventos a los botones
    const btnHoy = document.querySelector('.btn-group .btn:nth-child(1)');
    const btnSemana = document.querySelector('.btn-group .btn:nth-child(2)');
    const btnMes = document.querySelector('.btn-group .btn:nth-child(3)');
    
    if (btnHoy) btnHoy.onclick = () => filtrarDashboard('hoy');
    if (btnSemana) btnSemana.onclick = () => filtrarDashboard('semana');
    if (btnMes) btnMes.onclick = () => filtrarDashboard('mes');
}

// Función para configurar el menú sandwich en resoluciones móviles
function configurarMenuSandwich() {
    const sandwichBtn = document.getElementById('sandwich-btn');
    const dashboardFilters = document.getElementById('dashboard-filters');

    if (sandwichBtn && dashboardFilters) {
        sandwichBtn.addEventListener('click', () => {
            dashboardFilters.classList.toggle('is-active');
        });
    }

    // Opcional: cerrar el menú al hacer clic en una opción
    dashboardFilters?.addEventListener('click', () => dashboardFilters.classList.remove('is-active'));
}

// Función para filtrar el dashboard por período
function filtrarDashboard(periodo) {
    console.log(`Filtrando dashboard para: ${periodo}`);
    
    // Remover clase active de todos los botones
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Agregar clase active al botón seleccionado
    const botones = {
        'hoy': 0,
        'semana': 1,
        'mes': 2
    };
    
    const botonSeleccionado = document.querySelectorAll('.btn-group .btn')[botones[periodo]];
    if (botonSeleccionado) {
        botonSeleccionado.classList.add('active');
    }
    
    // Actualizar estadísticas y gráficos según el período
    actualizarEstadisticas(periodo);
    actualizarVistasDashboard(periodo);

    // mostrarAlerta(`Dashboard actualizado: ${periodo}`, 'info');
}

// Función para actualizar las estadísticas del dashboard (MEJORADA)
function actualizarEstadisticas(periodo = 'hoy') {
    try {
        const { ventasHoy, ingresosMes, totalVentasPeriodo, promedioVenta } = calcularEstadisticasPorPeriodo(periodo);
        
        // Actualizar elementos del DOM
        const ventasHoyElement = document.getElementById('ventasHoy');
        const ingresosMesElement = document.getElementById('ingresosMes');
        const totalClientesElement = document.getElementById('totalClientes');
        const totalProductosElement = document.getElementById('totalProductos');
        
        if (ventasHoyElement) {
            if (periodo === 'hoy') {
                ventasHoyElement.textContent = formatearMoneda(ventasHoy);
                const label = ventasHoyElement.previousElementSibling;
                if (label) label.textContent = 'VENTAS HOY';
            } else if (periodo === 'semana') {
                ventasHoyElement.textContent = formatearMoneda(totalVentasPeriodo);
                // Cambiar el label temporalmente
                const label = ventasHoyElement.previousElementSibling;
                if (label) label.textContent = 'VENTAS ESTA SEMANA';
            } else if (periodo === 'mes') {
                ventasHoyElement.textContent = formatearMoneda(ingresosMes);
                // Cambiar el label temporalmente
                const label = ventasHoyElement.previousElementSibling;
                if (label) label.textContent = 'VENTAS ESTE MES';
            }
        }
        
        if (ingresosMesElement) ingresosMesElement.textContent = formatearMoneda(ingresosMes);
        if (totalClientesElement) totalClientesElement.textContent = estadoApp.datos.clientes.length;
        if (totalProductosElement) totalProductosElement.textContent = estadoApp.datos.productos.length;
        
    } catch (error) {
        console.error('Error actualizando estadísticas:', error);
    }
}

// Función para calcular estadísticas por período
function calcularEstadisticasPorPeriodo(periodo) {
    const hoy = new Date();
    let fechaInicio = new Date();
    
    switch (periodo) {
        case 'hoy':
            fechaInicio.setHours(0, 0, 0, 0);
            break;
        case 'semana':
            fechaInicio.setDate(hoy.getDate() - 7);
            break;
        case 'mes':
            fechaInicio.setDate(1); // Primer día del mes
            break;
        default:
            fechaInicio.setHours(0, 0, 0, 0);
    }
    
    // Filtrar ventas por período
    const ventasFiltradas = estadoApp.datos.ventas.filter(venta => {
        if (!venta.fecha_venta) return false;
        const fechaVenta = new Date(venta.fecha_venta);
        return fechaVenta >= fechaInicio && fechaVenta <= hoy;
    });
    
    // Calcular estadísticas
    const ventasHoy = ventasFiltradas.reduce((sum, venta) => sum + (venta.total || 0), 0);
    const totalVentasPeriodo = ventasFiltradas.reduce((sum, venta) => sum + (venta.total || 0), 0);
    
    // Calcular ingresos del mes (siempre del mes completo)
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);
    const ingresosMes = estadoApp.datos.ventas
        .filter(venta => venta.fecha_venta && new Date(venta.fecha_venta) >= inicioMes)
        .reduce((sum, venta) => sum + (venta.total || 0), 0);
    
    const promedioVenta = ventasFiltradas.length > 0 ? totalVentasPeriodo / ventasFiltradas.length : 0;
    
    return {
        ventasHoy,
        ingresosMes,
        totalVentasPeriodo,
        promedioVenta,
        cantidadVentas: ventasFiltradas.length
    };
}

// Función para actualizar las vistas del dashboard (Top Clientes y Gráfico)
function actualizarVistasDashboard(periodo = 'hoy') {
    const datos = generarDatosDashboard(periodo);

    // Actualizar título
    const titulo = document.getElementById('tituloTopClientes');
    if (titulo) {
        titulo.textContent = `Top Clientes (${getTituloPeriodo(periodo)})`;
    }

    // Renderizar tabla de Top Clientes
    renderTablaTopClientes(datos.topClientes);

    // Actualizar gráfico de productos populares
    const ctxProductos = document.getElementById('chartProductosPopulares');
    if (ctxProductos) {
        if (ctxProductos.chart) {
            ctxProductos.chart.destroy();
        }
        ctxProductos.chart = new Chart(ctxProductos, {
            type: 'doughnut',
            data: {
                labels: datos.productosPopulares.labels,
                datasets: [{
                    data: datos.productosPopulares.valores,
                    backgroundColor: [
                        '#3498db', '#2ecc71', '#e74c3c', '#f39c12',
                        '#9b59b6', '#1abc9c', '#34495e'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    title: {
                        display: true,
                        text: `Productos Más Vendidos (${getTituloPeriodo(periodo)})`
                    }
                }
            }
        });
    }
}

// Función para generar los datos del dashboard (Top Clientes y Productos)
function generarDatosDashboard(periodo) {
    const hoy = new Date();
    let fechaInicio = new Date();
    
    switch (periodo) {
        case 'hoy':
            fechaInicio.setHours(0, 0, 0, 0);
            break;
        case 'semana':
            fechaInicio.setDate(hoy.getDate() - 7);
            break;
        case 'mes':
            fechaInicio.setDate(1);
            break;
    }

    const ventasFiltradas = estadoApp.datos.ventas.filter(venta => {
        if (!venta.fecha_venta) return false;
        const fechaVenta = new Date(venta.fecha_venta);
        return fechaVenta >= fechaInicio && fechaVenta <= hoy;
    });

    // Calcular Top Clientes
    const clientesAgrupados = {};
    ventasFiltradas.forEach(venta => {
        if (!venta.clientes) return;
        const clienteId = venta.clientes.id;
        if (!clientesAgrupados[clienteId]) {
            clientesAgrupados[clienteId] = {
                nombre: venta.clientes.nombre,
                totalComprado: 0,
                productos: {}
            };
        }
        clientesAgrupados[clienteId].totalComprado += venta.total;
        (venta.venta_items || []).forEach(item => {
            if (!item.productos) return;
            const prodId = item.productos.id;
            if (!clientesAgrupados[clienteId].productos[prodId]) {
                clientesAgrupados[clienteId].productos[prodId] = {
                    nombre: item.productos.nombre,
                    cantidad: 0
                };
            }
            clientesAgrupados[clienteId].productos[prodId].cantidad += item.cantidad;
        });
    });

    const topClientes = Object.values(clientesAgrupados)
        .sort((a, b) => b.totalComprado - a.totalComprado)
        .slice(0, 10);

    // Calcular Productos Populares
    const productosAgrupados = {};
    ventasFiltradas.forEach(venta => {
        (venta.venta_items || []).forEach(item => {
            if (!item.productos) return;
            if (!productosAgrupados[item.productos.nombre]) {
                productosAgrupados[item.productos.nombre] = 0;
            }
            productosAgrupados[item.productos.nombre] += item.cantidad;
        });
    });

    const productosPopularesArray = Object.entries(productosAgrupados)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    const productosPopulares = {
        labels: productosPopularesArray.map(([nombre]) => nombre),
        valores: productosPopularesArray.map(([, cantidad]) => cantidad)
    };

    return {
        topClientes,
        productosPopulares
    };
}

// Función para calcular ventas reales por período
function calcularVentasReales(periodo) {
    const hoy = new Date();
    let fechaInicio = new Date();
    let labels = [];
    let valores = [];
    
    switch (periodo) {
        case 'hoy':
            // Últimas 7 horas del día
            labels = Array.from({length: 7}, (_, i) => {
                const hora = new Date();
                hora.setHours(hora.getHours() - (6 - i));
                return `${hora.getHours()}:00`;
            });
            valores = labels.map(() => Math.random() * 2000 + 500);
            break;
            
        case 'semana':
            // Últimos 7 días
            labels = Array.from({length: 7}, (_, i) => {
                const fecha = new Date();
                fecha.setDate(fecha.getDate() - (6 - i));
                return fecha.toLocaleDateString('es-ES', { weekday: 'short' });
            });
            valores = labels.map(() => Math.random() * 3000 + 1000);
            break;
            
        case 'mes':
            // Últimas 4 semanas
            labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
            valores = labels.map(() => Math.random() * 8000 + 2000);
            break;
            
        default:
            labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            valores = [1200, 1900, 1500, 2100, 1800, 2500, 2200];
    }
    
    return { labels, valores };
}

// Nueva función para renderizar la tabla de Top Clientes
function renderTablaTopClientes(clientes) {
    const container = document.getElementById('topClientesContainer');
    if (!container) return;

    if (clientes.length === 0) {
        container.innerHTML = `<p class="text-center text-muted mt-4">No hay ventas en este período.</p>`;
        return;
    }

    container.innerHTML = `
        <table class="table table-sm table-hover">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th class="text-end">Total Comprado</th>
                    <th>Productos Comprados (Cant.)</th>
                </tr>
            </thead>
            <tbody>
                ${clientes.map((cliente, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td><strong>${cliente.nombre}</strong></td>
                        <td class="text-end fw-bold text-success">${formatearMoneda(cliente.totalComprado)}</td>
                        <td>
                            <small class="text-muted">${Object.values(cliente.productos).map(p => `${p.nombre} (${p.cantidad})`).join(', ')}</small>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Función auxiliar para obtener título del período
function getTituloPeriodo(periodo) {
    const titulos = {
        'hoy': 'Hoy',
        'semana': 'Esta Semana',
        'mes': 'Este Mes'
    };
    return titulos[periodo] || 'Recientes';
}

// Exportar funciones al scope global para el HTML
window.filtrarDashboard = filtrarDashboard;