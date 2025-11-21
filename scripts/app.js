// app.js - Navegación y Funciones Básicas
import { supabase, clientesAPI, productosAPI, ventasAPI, comprasAPI, reportesAPI } from './supabase.js'
import { cargarDashboard } from './dashboard.js';
import { cargarClientes } from './clientes.js';
import { cargarProductos } from './productos.js';
import { cargarVentas } from './ventas.js';
import { cargarCompras } from './compras.js';
import { cargarReportes } from './reportes.js';


// Estado global de la aplicación
export const estadoApp = {
    seccionActual: 'dashboard',
    datos: {
        clientes: [],
        productos: [],
        ventas: [],
        compras: []
    }
};

// Función para mostrar una sección y ocultar las demás
export function mostrarSeccion(seccion) {
    // Ocultar todas las secciones
    document.querySelectorAll('.seccion').forEach(sec => {
        sec.style.display = 'none';
    });
    
    // Remover clase active de todos los enlaces
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    const seccionElement = document.getElementById(seccion);
    if (seccionElement) {
        seccionElement.style.display = 'block';
    }
    
    // Activar el enlace correspondiente en el sidebar
    const enlaces = document.querySelectorAll('.sidebar .nav-link');
    enlaces.forEach(link => {
        if (link.textContent.includes(getTituloSeccion(seccion))) {
            link.classList.add('active');
        }
    });
    
    // Actualizar estado
    estadoApp.seccionActual = seccion;
    
    // Cargar datos específicos de la sección
    cargarDatosSeccion(seccion);
}
window.mostrarSeccion = mostrarSeccion;

// Función auxiliar para obtener el título de la sección
function getTituloSeccion(seccion) {
    const titulos = {
        'dashboard': 'Dashboard',
        'clientes': 'Clientes',
        'productos': 'Productos',
        'ventas': 'Ventas',
        'compras': 'Compras',
        'reportes': 'Reportes'
    };
    return titulos[seccion] || seccion;
}

// Función para cargar datos según la sección
async function cargarDatosSeccion(seccion) {
    console.log(`Cargando datos para: ${seccion}`);
    try {
        switch(seccion) {
            case 'dashboard':
                await cargarDashboard();
                break;
            case 'clientes':
                await cargarClientes();
                break;
            case 'productos':
                await cargarProductos();
                break;
            case 'ventas':
                await cargarVentas();
                break;
            case 'compras':
                await cargarCompras();
                break;
            case 'reportes':
                await cargarReportes();
                break;
        }
    } catch (error) {
        console.error(`Error cargando sección ${seccion}:`, error);
        mostrarAlerta(`Error al cargar ${seccion}: ${error.message}`, 'danger');
    }
}

// Función para mostrar alertas
export function mostrarAlerta(mensaje, tipo = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    alerta.innerHTML = `
        <i class="bi bi-${getIconoAlerta(tipo)}"></i>
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.appendChild(alerta);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (alerta.parentNode) {
            alerta.remove();
        }
    }, 3000);
}

// Función auxiliar para iconos de alerta
function getIconoAlerta(tipo) {
    const iconos = {
        'success': 'check-circle',
        'danger': 'exclamation-triangle',
        'warning': 'exclamation-circle',
        'info': 'info-circle'
    };
    return iconos[tipo] || 'info-circle';
}

// Función para formatear fechas
export function formatearFecha(fechaString) {
    const opciones = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(fechaString).toLocaleDateString('es-ES', opciones);
}

// Función para formatear moneda
export function formatearMoneda(monto) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN' // Ver si esta bien MXN
    }).format(monto);
}

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando aplicación...');
    
    // Mostrar la sección dashboard por defecto
    mostrarSeccion('dashboard');
    
    // Mostrar mensaje de bienvenida
    mostrarAlerta('¡Sistema de gestión cargado correctamente!', 'success');
    
    // Cargar datos iniciales
    cargarDatosIniciales();
});

// Función para cargar datos iniciales
async function cargarDatosIniciales() {
    try {
        console.log('Cargando datos iniciales desde Supabase...');
        
        // Cargar datos en paralelo
        const [clientes, productos, ventas, compras] = await Promise.all([
            clientesAPI.obtenerTodos(),
            productosAPI.obtenerTodos(),
            //productosAPI.obtenerActivos(),
            ventasAPI.obtenerTodas(),
            comprasAPI.obtenerTodas()
        ]);

         // Actualizar estado global
        estadoApp.datos.clientes = clientes;
        estadoApp.datos.productos = productos;
        estadoApp.datos.ventas = ventas;
        estadoApp.datos.compras = compras;

        console.log('Datos cargados:', {
            clientes: clientes.length,
            productos: productos.length,
            ventas: ventas.length,
            compras: compras.length
        });

         // Mostrar mensaje de bienvenida
        mostrarAlerta('¡Sistema de gestión cargado correctamente!', 'success');
        
    } catch (error) {
        console.error('Error cargando datos iniciales:', error);
        mostrarAlerta('Error al cargar los datos iniciales: ' + error.message, 'danger');
    }
}

export function actualizarEstadisticas() {
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

// Exportar funciones globales para que estén disponibles en el HTML
window.mostrarSeccion = mostrarSeccion;
window.mostrarAlerta = mostrarAlerta;
window.formatearFecha = formatearFecha;
window.formatearMoneda = formatearMoneda;
window.actualizarEstadisticas = actualizarEstadisticas;


export { cargarDashboard } from './dashboard.js';
export { cargarClientes } from './clientes.js';
export { cargarProductos } from './productos.js';
export { cargarVentas } from './ventas.js';
export { cargarCompras } from './compras.js';
export { cargarReportes } from './reportes.js';