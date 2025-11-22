// supabase.js - Cliente y funciones para Supabase
import { createClient } from '@supabase/supabase-js';

// --- PASO DE DEPURACIÓN ---
console.log("Clave leída por Vite:", import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log("URL leída por Vite:", import.meta.env.VITE_SUPABASE_URL);
// --------------------------

// Configuración de Supabase usando variables de entorno de Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseInstance = null;

function getSupabaseClient() {
    if (!supabaseInstance) {
        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error("Supabase URL o Anon Key no están definidas. Revisa tu archivo .env y reinicia el servidor de Vite.");
        }
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    }
    return supabaseInstance;
}
export const supabase = getSupabaseClient(); // exportamos el cliente

// Helper: obtiene el usuario autenticado (y falla si no hay sesión)
async function getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!data || !data.user) throw new Error("No hay usuario autenticado.");
    return data.user;
}

/* =========================
   API: Clientes
   ========================= */
export const clientesAPI = {
    async obtenerTodos() {
        const { data, error } = await getSupabaseClient()
            .from('clientes')
            .select('*')
            .order('fecha_registro', { ascending: false });

        if (error) throw error;
        return data;
    },

    async obtenerPorId(id) {
        const { data, error } = await getSupabaseClient()
            .from('clientes')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async crear(cliente) {
        const user = await getCurrentUser();
        const nuevoCliente = { ...cliente, user_id: user.id };

        const { data, error } = await getSupabaseClient()
            .from('clientes')
            .insert([nuevoCliente])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async actualizar(id, updates) {
        const { data, error } = await getSupabaseClient()
            .from('clientes')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async eliminar(id) {
        const { error } = await getSupabaseClient()
            .from('clientes')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};

/* =========================
   API: Productos
   ========================= */
export const productosAPI = {
    async obtenerTodos() {
        const { data, error } = await getSupabaseClient()
            .from('productos')
            .select('*')
            .order('fecha_creacion', { ascending: false });

        if (error) throw error;
        return data;
    },

    async obtenerActivos() {
        const { data, error } = await getSupabaseClient()
            .from('productos')
            .select('*')
            .eq('activo', true)
            .order('nombre');

        if (error) throw error;
        return data;
    },

    async crear(producto) {
        const user = await getCurrentUser();
        const nuevoProducto = { ...producto, user_id: user.id };

        const { data, error } = await getSupabaseClient()
            .from('productos')
            .insert([nuevoProducto])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async actualizar(id, updates) {
        const { data, error } = await getSupabaseClient()
            .from('productos')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async actualizarStock(id, nuevoStock) {
        const { data, error } = await getSupabaseClient()
            .from('productos')
            .update({ stock: nuevoStock })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

/* =========================
   API: Ventas
   ========================= */
export const ventasAPI = {
    async obtenerTodas() {
        const { data, error } = await getSupabaseClient()
            .from('ventas')
            .select(`
                *,
                clientes (*),
                venta_items (
                    *,
                    productos (*)
                )
            `)
            .order('fecha_venta', { ascending: false });

        if (error) throw error;
        return data;
    },

    async obtenerPorFecha(fechaInicio, fechaFin) {
        let query = getSupabaseClient()
            .from('ventas')
            .select(`
                *,
                clientes (*),
                venta_items (
                    *,
                    productos (*)
                )
            `)
            .order('fecha_venta', { ascending: false });

        if (fechaInicio) query = query.gte('fecha_venta', fechaInicio);
        if (fechaFin) query = query.lte('fecha_venta', fechaFin + ' 23:59:59');

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    // Crear nueva venta (transacción)
    async crear(ventaData) {
        const { venta, items } = ventaData;
        const user = await getCurrentUser();

        const ventaConUser = { ...venta, user_id: user.id };

        // Insertar venta
        const { data: ventaCreada, error: errorVenta } = await getSupabaseClient()
            .from('ventas')
            .insert([ventaConUser])
            .select()
            .single();

        if (errorVenta) throw errorVenta;

        // Insertar items de venta
        const itemsConVentaId = items.map(item => ({ ...item, venta_id: ventaCreada.id }));

        const { error: errorItems } = await getSupabaseClient()
            .from('venta_items')
            .insert(itemsConVentaId);

        if (errorItems) throw errorItems;

        // Obtener venta completa
        const { data: ventaCompleta, error } = await getSupabaseClient()
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
            .single();

        if (error) throw error;
        return ventaCompleta;
    },

    async eliminar(ventaId) {
        try {
            const { error: errorItems } = await getSupabaseClient()
                .from('venta_items')
                .delete()
                .eq('venta_id', ventaId);

            if (errorItems) throw errorItems;

            const { error: errorVenta } = await getSupabaseClient()
                .from('ventas')
                .delete()
                .eq('id', ventaId);

            if (errorVenta) throw errorVenta;

            return true;
        } catch (error) {
            throw error;
        }
    },

    async obtenerPorId(ventaId) {
        const { data, error } = await getSupabaseClient()
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

/* =========================
   API: Compras
   ========================= */
export const comprasAPI = {
    async obtenerTodas() {
        const { data, error } = await getSupabaseClient()
            .from('compras')
            .select(`
                *,
                compra_items (
                    *,
                    productos (*)
                )
            `)
            .order('fecha_compra', { ascending: false });

        if (error) throw error;
        return data;
    },

    async obtenerPorId(compraId) {
        const { data, error } = await getSupabaseClient()
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

    async crear(compraData) {
        const { compra, items } = compraData;
        const user = await getCurrentUser();

        const compraConUser = { ...compra, user_id: user.id };

        // Insertar compra
        const { data: compraCreada, error: errorCompra } = await getSupabaseClient()
            .from('compras')
            .insert([compraConUser])
            .select()
            .single();

        if (errorCompra) throw errorCompra;

        // Insertar items de compra
        const itemsConCompraId = items.map(item => ({ ...item, compra_id: compraCreada.id }));

        const { error: errorItems } = await getSupabaseClient()
            .from('compra_items')
            .insert(itemsConCompraId);

        if (errorItems) throw errorItems;

        // Obtener compra completa
        const { data: compraCompleta, error } = await getSupabaseClient()
            .from('compras')
            .select(`
                *,
                compra_items (
                    *,
                    productos (*)
                )
            `)
            .eq('id', compraCreada.id)
            .single();

        if (error) throw error;
        return compraCompleta;
    },

    async eliminar(compraId) {
        const { error: errorItems } = await getSupabaseClient()
            .from('compra_items')
            .delete()
            .eq('compra_id', compraId);

        if (errorItems) throw errorItems;

        const { error: errorCompra } = await getSupabaseClient()
            .from('compras')
            .delete()
            .eq('id', compraId);

        if (errorCompra) throw errorCompra;

        return true;
    }
};

/* =========================
   API: Reportes
   ========================= */
export const reportesAPI = {
    async obtenerEstadisticas(fechaInicio = null, fechaFin = null) {
        const { data, error } = await getSupabaseClient()
            .rpc('obtener_estadisticas_ventas', {
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin
            });

        if (error) throw error;
        return data[0];
    },

    async obtenerVentasPorPeriodo(periodoTipo, fechaInicio = null, fechaFin = null) {
        const { data, error } = await getSupabaseClient()
            .rpc('obtener_ventas_por_periodo', {
                periodo_tipo: periodoTipo,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin
            });

        if (error) throw error;
        return data;
    }
};
