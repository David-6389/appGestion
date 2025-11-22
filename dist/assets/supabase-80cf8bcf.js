import{createClient as m}from"https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const n of a)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function t(a){const n={};return a.integrity&&(n.integrity=a.integrity),a.referrerPolicy&&(n.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?n.credentials="include":a.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(a){if(a.ep)return;a.ep=!0;const n=t(a);fetch(a.href,n)}})();const f=VITE_SUPABASE_URL,u=VITE_SUPABASE_ANON_KEY,o=m(f,u),w={async obtenerTodos(){const{data:r,error:e}=await o.from("clientes").select("*").order("fecha_registro",{ascending:!1});if(e)throw e;return r},async obtenerPorId(r){const{data:e,error:t}=await o.from("clientes").select("*").eq("id",r).single();if(t)throw t;return e},async crear(r){const{data:e,error:t}=await o.from("clientes").insert([r]).select().single();if(t)throw t;return e},async actualizar(r,e){const{data:t,error:s}=await o.from("clientes").update(e).eq("id",r).select().single();if(s)throw s;return t},async eliminar(r){const{error:e}=await o.from("clientes").delete().eq("id",r);if(e)throw e;return!0}},h={async obtenerTodos(){const{data:r,error:e}=await o.from("productos").select("*").order("fecha_creacion",{ascending:!1});if(e)throw e;return r},async obtenerActivos(){const{data:r,error:e}=await o.from("productos").select("*").eq("activo",!0).order("nombre");if(e)throw e;return r},async crear(r){const{data:e,error:t}=await o.from("productos").insert([r]).select().single();if(t)throw t;return e},async actualizar(r,e){const{data:t,error:s}=await o.from("productos").update(e).eq("id",r).select().single();if(s)throw s;return t},async actualizarStock(r,e){const{data:t,error:s}=await o.from("productos").update({stock:e}).eq("id",r).select().single();if(s)throw s;return t}},y={async obtenerTodas(){const{data:r,error:e}=await o.from("ventas").select(`
                *,
                clientes (*),
                venta_items (
                    *,
                    productos (*)
                )
            `).order("fecha_venta",{ascending:!1});if(e)throw e;return r},async obtenerPorFecha(r,e){let t=o.from("ventas").select(`
                *,
                clientes (*),
                venta_items (
                    *,
                    productos (*)
                )
            `).order("fecha_venta",{ascending:!1});r&&(t=t.gte("fecha_venta",r)),e&&(t=t.lte("fecha_venta",e+" 23:59:59"));const{data:s,error:a}=await t;if(a)throw a;return s},async crear(r){const{venta:e,items:t}=r,{data:s,error:a}=await o.from("ventas").insert([e]).select().single();if(a)throw a;const n=t.map(l=>({...l,venta_id:s.id})),{error:i}=await o.from("venta_items").insert(n);if(i)throw i;const{data:d,error:c}=await o.from("ventas").select(`
                *,
                clientes (*),
                venta_items (
                    *,
                    productos (*)
                )
            `).eq("id",s.id).single();if(c)throw c;return d},async eliminar(r){try{const{error:e}=await o.from("venta_items").delete().eq("venta_id",r);if(e)throw console.error("Error eliminando items de venta: ",e),e;const{error:t}=await o.from("ventas").delete().eq("id",r);if(t)throw console.error("Error eliminando venta:",t),t;return console.log("Venta eliminada exitosamente:",r),!0}catch(e){throw console.error("Error en eliminación completa:",e),e}},async obtenerPorId(r){const{data:e,error:t}=await o.from("ventas").select(`
                *,
                clientes (*),
                venta_items (
                    *,
                    productos (*)
                )
            `).eq("id",r).single();if(t)throw t;return e}},g={async obtenerTodas(){const{data:r,error:e}=await o.from("compras").select(`
                *,
                compra_items (
                    *,
                    productos (*)
                )
            `).order("fecha_compra",{ascending:!1});if(e)throw e;return r},async obtenerPorId(r){const{data:e,error:t}=await o.from("compras").select(`
                *,
                compra_items (
                    *,
                    productos (*)
                )
            `).eq("id",r).single();if(t)throw t;return e},async crear(r){const{compra:e,items:t}=r,{data:s,error:a}=await o.from("compras").insert([e]).select().single();if(a)throw a;const n=t.map(l=>({...l,compra_id:s.id})),{error:i}=await o.from("compra_items").insert(n);if(i)throw i;const{data:d,error:c}=await o.from("compras").select(`
                *,
                compra_items (
                    *,
                    productos (*)
                )
            `).eq("id",s.id).single();if(c)throw c;return d},async eliminar(r){const{error:e}=await o.from("compra_items").delete().eq("compra_id",r);if(e)throw e;const{error:t}=await o.from("compras").delete().eq("id",r);if(t)throw t;return!0}};export{g as a,w as c,h as p,o as s,y as v};
//# sourceMappingURL=supabase-80cf8bcf.js.map
