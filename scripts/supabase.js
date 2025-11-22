// supabase.js - Cliente y funciones para Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Configuración de Supabase
const supabaseUrl = VITE_SUPABASE_URL; // <-- TU URL DE SUPABASE
const supabaseAnonKey = VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funciones para clientes
export const clientesAPI = {
    // Obtener todos los clientes
    async obtenerTodos() {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .order('fecha_registro', { ascending: false })
        
        if (error) throw error
        return data
    },

    // Obtener cliente por ID
    async obtenerPorId(id) {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('id', id)
            .single()
        
        if (error) throw error
        return data
    },

    // Crear nuevo cliente
    async crear(cliente) {
        const { data, error } = await supabase
            .from('clientes')
            .insert([cliente])
            .select()
            .single()
        
        if (error) throw error
        return data
    },

    // Actualizar cliente
    async actualizar(id, updates) {
        const { data, error } = await supabase
            .from('clientes')
            .update(updates)
            .eq('id', id)
            .select()
            .single()
        
        if (error) throw error
        return data
    },

    // Eliminar cliente
    async eliminar(id) {
        const { error } = await supabase
            .from('clientes')
            .delete()
            .eq('id', id)
        
        if (error) throw error
        return true
    }
}

// Funciones para productos
export const productosAPI = {
    // Obtener todos los productos
    async obtenerTodos() {
        const { data, error } = await supabase
            .from('productos')
            .select('*')
            .order('fecha_creacion', { ascending: false })
        
        if (error) throw error
        return data
    },

    // Obtener productos activos
    async obtenerActivos() {
        const { data, error } = await supabase
            .from('productos')
            .select('*')
            .eq('activo', true)
            .order('nombre')
        
        if (error) throw error
        return data
    },

    // Crear nuevo producto
    async crear(producto) {
        const { data, error } = await supabase
            .from('productos')
            .insert([producto])
            .select()
            .single()
        
        if (error) throw error
        return data
    },

    // Actualizar producto
    async actualizar(id, updates) {
        const { data, error } = await supabase
            .from('productos')
            .update(updates)
            .eq('id', id)
            .select()
            .single()
        
        if (error) throw error
        return data
    },

    // Actualizar stock
    async actualizarStock(id, nuevoStock) {
        const { data, error } = await supabase
            .from('productos')
            .update({ stock: nuevoStock })
            .eq('id', id)
            .select()
            .single()
        
        if (error) throw error
        return data
    }
}

// Funciones para ventas
export const ventasAPI = {
    // Obtener todas las ventas con relaciones
    async obtenerTodas() {
        const { data, error } = await supabase
            .from('ventas')
            .select(`
                *,
                clientes (*),
                venta_items (
                    *,
                    productos (*)
                )
            `)
            .order('fecha_venta', { ascending: false })
        
        if (error) throw error
        return data
    },

    // Obtener ventas por rango de fechas
    async obtenerPorFecha(fechaInicio, fechaFin) {
        let query = supabase
            .from('ventas')
            .select(`
                *,
                clientes (*),
                venta_items (
                    *,
                    productos (*)
                )
            `)
            .order('fecha_venta', { ascending: false })

        if (fechaInicio) {
            query = query.gte('fecha_venta', fechaInicio)
        }
        if (fechaFin) {
            query = query.lte('fecha_venta', fechaFin + ' 23:59:59')
        }

        const { data, error } = await query
        if (error) throw error
        return data
    },

    // Crear nueva venta (transacción)
    async crear(ventaData) {
        const { venta, items } = ventaData
        
        // Insertar venta
        const { data: ventaCreada, error: errorVenta } = await supabase
            .from('ventas')
            .insert([venta])
            .select()
            .single()
        
        if (errorVenta) throw errorVenta

        // Insertar items de venta
        const itemsConVentaId = items.map(item => ({
            ...item,
            venta_id: ventaCreada.id
        }))

        const { error: errorItems } = await supabase
            .from('venta_items')
            .insert(itemsConVentaId)

        if (errorItems) throw errorItems

        // Obtener venta completa
        const { data: ventaCompleta, error } = await supabase
            .from('ventas')
            .select(`
                *,
                clientes (*),
                venta_items (
                    *,
                    productos (*)
                )
            `)
            .eq('id', ventaCreada.id)
            .single()

        if (error) throw error
        return ventaCompleta
    },

    async eliminar(ventaId) {
        try {
            const { error: errorItems } = await supabase
                .from('venta_items')
                .delete()
                .eq('venta_id', ventaId);
            
            if (errorItems) {
                console.error('Error eliminando items de venta: ', errorItems);
                throw errorItems;
            } 
            
            // Luego eliminamos la venta
            const { error: errorVenta } = await supabase
                .from('ventas')
                .delete()
                .eq('id', ventaId);

            if (errorVenta) {
                console.error('Error eliminando venta:', errorVenta);
                throw errorVenta;
        }
            console.log('Venta eliminada exitosamente:', ventaId);
            return true;
        
        } catch (error) {
            console.error('Error en eliminación completa:', error);
            throw error;
        }
    },

      // Obtener venta específica con relaciones
    async obtenerPorId(ventaId) {
        const { data, error } = await supabase
            .from('ventas')
            .select(`
                *,
                clientes (*),
                venta_items (
                    *,
                    productos (*)
                )
            `)
            .eq('id', ventaId)
            .single();

        if (error) throw error;
        return data;
    }
};

export const comprasAPI = {
    // Obtener todas las compras con relaciones
    async obtenerTodas() {
        const { data, error } = await supabase
            .from('compras')
            .select(`
                *,
                compra_items (
                    *,
                    productos (*)
                )
            `)
            .order('fecha_compra', { ascending: false })
        
        if (error) throw error;
        return data;
    },

    // Obtener compra por ID
    async obtenerPorId(compraId) {
        const { data, error } = await supabase
            .from('compras')
            .select(`
                *,
                compra_items (
                    *,
                    productos (*)
                )
            `)
            .eq('id', compraId)
            .single();

        if (error) throw error;
        return data;
    },

    // Crear nueva compra (transacción)
    async crear(compraData) {
        const { compra, items } = compraData
        
        // Insertar compra
        const { data: compraCreada, error: errorCompra } = await supabase
            .from('compras')
            .insert([compra])
            .select()
            .single()
        
        if (errorCompra) throw errorCompra

        // Insertar items de compra
        const itemsConCompraId = items.map(item => ({
            ...item,
            compra_id: compraCreada.id
        }))

        const { error: errorItems } = await supabase
            .from('compra_items')
            .insert(itemsConCompraId)

        if (errorItems) throw errorItems

        // Obtener compra completa
        const { data: compraCompleta, error } = await supabase
            .from('compras')
            .select(`
                *,
                compra_items (
                    *,
                    productos (*)
                )
            `)
            .eq('id', compraCreada.id)
            .single()

        if (error) throw error
        return compraCompleta
    },

    // Eliminar compra y sus items
    async eliminar(compraId) {
        // Primero eliminamos los items de la compra
        const { error: errorItems } = await supabase
            .from('compra_items')
            .delete()
            .eq('compra_id', compraId);

        if (errorItems) throw errorItems;

        // Luego eliminamos la compra
        const { error: errorCompra } = await supabase
            .from('compras')
            .delete()
            .eq('id', compraId);

        if (errorCompra) throw errorCompra;

        return true;
    }
};

// Funciones para reportes
export const reportesAPI = {
    // Obtener estadísticas generales
    async obtenerEstadisticas(fechaInicio = null, fechaFin = null) {
        const { data, error } = await supabase
            .rpc('obtener_estadisticas_ventas', {
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin
            })
        
        if (error) throw error
        return data[0]
    },

    // Obtener ventas por período
    async obtenerVentasPorPeriodo(periodoTipo, fechaInicio = null, fechaFin = null) {
        const { data, error } = await supabase
            .rpc('obtener_ventas_por_periodo', {
                periodo_tipo: periodoTipo,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin
            })
        
        if (error) throw error
        return data
    }
}