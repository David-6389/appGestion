import{v as w,c as $,p as y,a as C,s as A}from"./supabase-a3896273.js";import"https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";async function W(){console.log("Cargando dashboard...");try{const[e,t]=await Promise.all([w.obtenerTodas(),$.obtenerTodos()]);s.datos.ventas=e,s.datos.clientes=t,O("hoy"),R("hoy")}catch(e){console.error("Error cargando datos del dashboard:",e),c("No se pudieron cargar los datos del dashboard: "+e.message,"danger")}Z(),X()}function X(){const e=document.querySelector(".btn-group .btn:nth-child(1)"),t=document.querySelector(".btn-group .btn:nth-child(2)"),o=document.querySelector(".btn-group .btn:nth-child(3)");e&&(e.onclick=()=>_("hoy")),t&&(t.onclick=()=>_("semana")),o&&(o.onclick=()=>_("mes"))}function Z(){const e=document.getElementById("sandwich-btn"),t=document.getElementById("dashboard-filters");e&&t&&e.addEventListener("click",()=>{t.classList.toggle("is-active")}),t==null||t.addEventListener("click",()=>t.classList.remove("is-active"))}function _(e){console.log(`Filtrando dashboard para: ${e}`),document.querySelectorAll(".btn-group .btn").forEach(a=>{a.classList.remove("active")});const t={hoy:0,semana:1,mes:2},o=document.querySelectorAll(".btn-group .btn")[t[e]];o&&o.classList.add("active"),O(e),R(e)}function O(e="hoy"){try{const{ventasHoy:t,ingresosMes:o,totalVentasPeriodo:a,promedioVenta:n}=J(e),r=document.getElementById("ventasHoy"),d=document.getElementById("ingresosMes"),b=document.getElementById("totalClientes"),m=document.getElementById("totalProductos");if(r){if(e==="hoy"){r.textContent=l(t);const i=r.previousElementSibling;i&&(i.textContent="VENTAS HOY")}else if(e==="semana"){r.textContent=l(a);const i=r.previousElementSibling;i&&(i.textContent="VENTAS ESTA SEMANA")}else if(e==="mes"){r.textContent=l(o);const i=r.previousElementSibling;i&&(i.textContent="VENTAS ESTE MES")}}d&&(d.textContent=l(o)),b&&(b.textContent=s.datos.clientes.length),m&&(m.textContent=s.datos.productos.length)}catch(t){console.error("Error actualizando estadísticas:",t)}}function J(e){const t=new Date;let o=new Date;switch(e){case"hoy":o.setHours(0,0,0,0);break;case"semana":o.setDate(t.getDate()-7);break;case"mes":o.setDate(1);break;default:o.setHours(0,0,0,0)}const a=s.datos.ventas.filter(i=>{if(!i.fecha_venta)return!1;const u=new Date(i.fecha_venta);return u>=o&&u<=t}),n=a.reduce((i,u)=>i+(u.total||0),0),r=a.reduce((i,u)=>i+(u.total||0),0),d=new Date;d.setDate(1),d.setHours(0,0,0,0);const b=s.datos.ventas.filter(i=>i.fecha_venta&&new Date(i.fecha_venta)>=d).reduce((i,u)=>i+(u.total||0),0),m=a.length>0?r/a.length:0;return{ventasHoy:n,ingresosMes:b,totalVentasPeriodo:r,promedioVenta:m,cantidadVentas:a.length}}function R(e="hoy"){const t=K(e),o=document.getElementById("tituloTopClientes");o&&(o.textContent=`Top Clientes (${F(e)})`),Q(t.topClientes);const a=document.getElementById("chartProductosPopulares");a&&(a.chart&&a.chart.destroy(),a.chart=new Chart(a,{type:"doughnut",data:{labels:t.productosPopulares.labels,datasets:[{data:t.productosPopulares.valores,backgroundColor:["#3498db","#2ecc71","#e74c3c","#f39c12","#9b59b6","#1abc9c","#34495e"]}]},options:{responsive:!0,plugins:{legend:{position:"bottom"},title:{display:!0,text:`Productos Más Vendidos (${F(e)})`}}}}))}function K(e){const t=new Date;let o=new Date;switch(e){case"hoy":o.setHours(0,0,0,0);break;case"semana":o.setDate(t.getDate()-7);break;case"mes":o.setDate(1);break}const a=s.datos.ventas.filter(i=>{if(!i.fecha_venta)return!1;const u=new Date(i.fecha_venta);return u>=o&&u<=t}),n={};a.forEach(i=>{if(!i.clientes)return;const u=i.clientes.id;n[u]||(n[u]={nombre:i.clientes.nombre,totalComprado:0,productos:{}}),n[u].totalComprado+=i.total,(i.venta_items||[]).forEach(h=>{if(!h.productos)return;const v=h.productos.id;n[u].productos[v]||(n[u].productos[v]={nombre:h.productos.nombre,cantidad:0}),n[u].productos[v].cantidad+=h.cantidad})});const r=Object.values(n).sort((i,u)=>u.totalComprado-i.totalComprado).slice(0,10),d={};a.forEach(i=>{(i.venta_items||[]).forEach(u=>{u.productos&&(d[u.productos.nombre]||(d[u.productos.nombre]=0),d[u.productos.nombre]+=u.cantidad)})});const b=Object.entries(d).sort(([,i],[,u])=>u-i).slice(0,5),m={labels:b.map(([i])=>i),valores:b.map(([,i])=>i)};return{topClientes:r,productosPopulares:m}}function Q(e){const t=document.getElementById("topClientesContainer");if(t){if(e.length===0){t.innerHTML='<p class="text-center text-muted mt-4">No hay ventas en este período.</p>';return}t.innerHTML=`
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
                ${e.map((o,a)=>`
                    <tr>
                        <td>${a+1}</td>
                        <td><strong>${o.nombre}</strong></td>
                        <td class="text-end fw-bold text-success">${l(o.totalComprado)}</td>
                        <td>
                            <small class="text-muted">${Object.values(o.productos).map(n=>`${n.nombre} (${n.cantidad})`).join(", ")}</small>
                        </td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `}}function F(e){return{hoy:"Hoy",semana:"Esta Semana",mes:"Este Mes"}[e]||"Recientes"}window.filtrarDashboard=_;let I=null;async function S(){console.log("Cargando clientes desde Supabase...");try{const e=await $.obtenerTodos();s.datos.clientes=e,z(),nt()}catch(e){console.error("Error cargando clientes:",e),c("Error al cargar clientes: "+e.message,"danger")}}function z(){const e=document.getElementById("tablaClientes");if(s.datos.clientes.length===0){e.innerHTML=`
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bi bi-people display-4"></i>
                    <p class="mt-2">No hay clientes registrados</p>
                    <button class="btn btn-primary" onclick="mostrarModalCliente()">
                        <i class="bi bi-plus"></i> Agregar Primer Cliente
                    </button>
                </td>
            </tr>
        `;return}e.innerHTML=s.datos.clientes.map(t=>`
        <tr>
            <td>${t.nombre}</td>
            <td>${t.email}</td>
            <td>${t.telefono||"-"}</td>
            <td><span class="badge ${j(t.tipo)}">${t.tipo||"N/A"}</span></td>
            <td>${E(t.fecha_registro)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editarCliente('${t.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarCliente('${t.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join("")}function j(e){switch(e){case"Master":return"bg-primary";case"Revenda":return"bg-info text-dark";default:return"bg-secondary"}}function tt(){document.getElementById("formCliente").reset(),document.getElementById("tituloModalCliente").textContent="Nuevo Cliente",I=null,document.getElementById("tipoMaster").checked=!0,new bootstrap.Modal(document.getElementById("modalCliente")).show()}async function et(e){console.log("Editando cliente:",e);try{const t=s.datos.clientes.find(o=>o.id===e);t?(I=e,document.getElementById("clienteNombre").value=t.nombre,document.getElementById("clienteEmail").value=t.email,document.getElementById("clienteTelefono").value=t.telefono||"",t.tipo==="Revenda"?document.getElementById("tipoRevenda").checked=!0:document.getElementById("tipoMaster").checked=!0,document.getElementById("tituloModalCliente").textContent="Editar Cliente",new bootstrap.Modal(document.getElementById("modalCliente")).show()):c("Cliente no encontrado","danger")}catch(t){console.error("Error editando cliente:",t),c("Error al cargar datos del cliente: "+t.message,"danger")}}async function ot(){const e=document.getElementById("formCliente");if(!e.checkValidity()){e.reportValidity();return}const t={nombre:document.getElementById("clienteNombre").value,email:document.getElementById("clienteEmail").value,telefono:document.getElementById("clienteTelefono").value,tipo:document.querySelector('input[name="tipoCliente"]:checked').value,user_id:s.datos.usuario.id,fecha_registro:new Date().toISOString()};if(s.datos.clientes.find(a=>a.email===t.email&&a.id!==I)){c("Ya existe un cliente con este email","warning");return}try{I?(delete t.fecha_registro,delete t.user_id,await $.actualizar(I,t),c("Cliente actualizado exitosamente","success")):(await $.crear(t),c("Cliente guardado exitosamente","success")),await S(),bootstrap.Modal.getInstance(document.getElementById("modalCliente")).hide()}catch(a){console.error("Error guardando cliente:",a),c("Error al guardar cliente: "+a.message,"danger")}}async function at(e){if(confirm("¿Estás seguro de que quieres eliminar este cliente?"))try{await $.eliminar(e),c("Cliente eliminado exitosamente","success"),await S()}catch(t){console.error("Error eliminando cliente:",t),c("Error al eliminar cliente: "+t.message,"danger")}}function nt(){document.getElementById("modalCliente").addEventListener("hidden.bs.modal",function(){document.getElementById("formCliente").reset(),document.getElementById("tituloModalCliente").textContent="Nuevo Cliente",document.getElementById("tipoMaster").checked=!0,I=null})}function rt(){const e=document.getElementById("filtroNombre").value.toLowerCase(),t=document.getElementById("filtroEmail").value.toLowerCase();let o=s.datos.clientes;e&&(o=o.filter(n=>n.nombre.toLowerCase().includes(e))),t&&(o=o.filter(n=>n.email.toLowerCase().includes(t)));const a=document.getElementById("tablaClientes");if(o.length===0){a.innerHTML=`
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    <i class="bi bi-search display-4"></i>
                    <p class="mt-2">No se encontraron clientes</p>
                    <button class="btn btn-outline-primary" onclick="limpiarFiltrosClientes()">
                        <i class="bi bi-arrow-clockwise"></i> Limpiar filtros
                    </button>
                </td>
            </tr>
        `;return}a.innerHTML=o.map(n=>`
        <tr>
            <td>${n.nombre}</td>
            <td>${n.email}</td>
            <td>${n.telefono||"-"}</td>
            <td><span class="badge ${j(n.tipo)}">${n.tipo||"N/A"}</span></td>
            <td>${E(n.fecha_registro)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editarCliente('${n.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarCliente('${n.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join("")}function st(){document.getElementById("filtroNombre").value="",document.getElementById("filtroEmail").value="",z(),c("Filtros limpiados","info")}window.mostrarModalCliente=tt;window.editarCliente=et;window.guardarCliente=ot;window.eliminarCliente=at;window.filtrarClientes=rt;window.limpiarFiltrosClientes=st;let it=null;async function ct(){console.log("Cargando productos desde Supabase...");try{const e=await y.obtenerTodos();s.datos.productos=e,B()}catch(e){console.error("Error cargando productos:",e),c("Error al cargar productos: "+e.message,"danger")}}function B(){const e=document.getElementById("tablaProductos");if(console.log("📊 Productos en estado:",s.datos.productos),!e){console.error("❌ No se encontró el elemento tablaProductos");return}if(!s.datos.productos||s.datos.productos.length===0){console.log("📭 No hay productos para mostrar"),e.innerHTML=`
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bi bi-box display-4"></i>
                    <p class="mt-2">No hay productos registrados</p>
                    <button class="btn btn-primary" onclick="mostrarModalProducto()">
                        <i class="bi bi-plus"></i> Agregar Primer Producto
                    </button>
                </td>
            </tr>
        `;return}console.log("🎨 Renderizando",s.datos.productos.length,"productos en la tabla");const t=s.datos.productos.map(o=>`
        <tr>
            <td>
                <strong>${o.nombre}</strong>
                ${o.unidad_medida?`<br><small class="text-muted">${o.unidad_medida}</small>`:""}
            </td>
            <td>${o.descripcion||"-"}</td>
            <td>
                <span class="badge ${o.stock>0?"bg-success":"bg-danger"}">
                    ${o.stock} ${o.unidad_medida||"unidades"}
                </span>
            </td>
            <td>
                ${o.categoria?`<span class="badge bg-info">${o.categoria}</span>`:"-"}
            </td>
            <td>${E(o.fecha_creacion)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editarProducto('${o.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarProducto('${o.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join("");e.innerHTML=t,console.log("✅ Tabla actualizada correctamente con",s.datos.productos.length,"productos")}function q(e=null){const t=document.getElementById("formProducto"),o=document.getElementById("tituloModalProducto");t.reset(),e?(o.textContent="Editar Producto",console.log("Editando producto:",e)):o.textContent="Nuevo Producto",new bootstrap.Modal(document.getElementById("modalProducto")).show()}async function dt(){const e=document.getElementById("formProducto");if(!e.checkValidity()){e.reportValidity();return}const t={nombre:document.getElementById("productoNombre").value,descripcion:document.getElementById("productoDescripcion").value,categoria:document.getElementById("productoCategoria").value,stock:parseInt(document.getElementById("productoStock").value)||0,unidad_medida:document.getElementById("productoUnidad").value,activo:!0,user_id:s.datos.usuario.id,fecha_creacion:new Date().toISOString()};if(t.stock<0){c("El stock no puede ser negativo","warning");return}console.log("📦 Datos del producto a guardar:",t);try{let o;it||(o=await y.crear(t),console.log("✅ Producto creado:",o),s.datos.productos=[o,...s.datos.productos],c("Producto guardado exitosamente","success")),B(),console.log("🔄 Tabla actualizada. Productos en estado:",s.datos.productos.length),bootstrap.Modal.getInstance(document.getElementById("modalProducto")).hide()}catch(o){console.error("Error guardando producto:",o),c("Error al guardar producto: "+o.message,"danger")}}async function lt(e){console.log("Editando producto:",e);try{const t=s.datos.productos.find(o=>o.id===e);t?(document.getElementById("productoNombre").value=t.nombre,document.getElementById("productoDescripcion").value=t.descripcion||"",document.getElementById("productoCategoria").value=t.categoria||"",document.getElementById("productoStock").value=t.stock,document.getElementById("productoUnidad").value=t.unidad_medida||"unidad",q(e)):c("Producto no encontrado","danger")}catch(t){console.error("Error editando producto:",t),c("Error al cargar datos del producto: "+t.message,"danger")}}function ut(e){if(confirm("¿Estás seguro de que quieres eliminar este producto?")){const t=s.datos.productos.findIndex(o=>o.id===e);t!==-1?(s.datos.productos.splice(t,1),B(),c("Producto eliminado exitosamente","success")):c("Producto no encontrado","danger")}}function mt(){const e=document.getElementById("filtroProductoNombre").value.toLowerCase(),t=document.getElementById("filtroCategoria").value,o=document.getElementById("filtroStock").value;let a=s.datos.productos;e&&(a=a.filter(r=>r.nombre.toLowerCase().includes(e))),t&&(a=a.filter(r=>r.categoria===t)),o==="disponible"?a=a.filter(r=>r.stock>0):o==="agotado"&&(a=a.filter(r=>r.stock===0));const n=document.getElementById("tablaProductos");if(a.length===0){n.innerHTML=`
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="bi bi-search display-4"></i>
                    <p class="mt-2">No se encontraron productos</p>
                    <button class="btn btn-outline-primary" onclick="limpiarFiltrosProductos()">
                        <i class="bi bi-arrow-clockwise"></i> Limpiar filtros
                    </button>
                </td>
            </tr>
        `;return}n.innerHTML=a.map(r=>`
        <tr>
            <td>
                <strong>${r.nombre}</strong>
                ${r.unidad?`<br><small class="text-muted">${r.unidad}</small>`:""}
            </td>
            <td>${r.descripcion||"-"}</td>
            <td>${l(r.precio)}</td>
            <td>
                <span class="badge ${r.stock>0?"bg-success":"bg-danger"}">
                    ${r.stock} ${r.unidad||"unidades"}
                </span>
            </td>
            <td>
                ${r.categoria?`<span class="badge bg-info">${r.categoria}</span>`:"-"}
            </td>
            <td>${E(r.fecha_creacion)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editarProducto('${r.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarProducto('${r.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join("")}function pt(){document.getElementById("filtroProductoNombre").value="",document.getElementById("filtroCategoria").value="",document.getElementById("filtroStock").value="",B(),c("Filtros limpiados","info")}window.mostrarModalProducto=q;window.guardarProducto=dt;window.editarProducto=lt;window.eliminarProducto=ut;window.filtrarProductos=mt;window.limpiarFiltrosProductos=pt;let p={clienteId:null,productos:[],subtotal:0,iva:0,total:0};async function bt(){console.log("Cargando ventas desde Supabase...");try{const e=await w.obtenerTodas();s.datos.ventas=e,P(),U()}catch(e){console.error("Error cargando ventas:",e),c("Error al cargar ventas: "+e.message,"danger")}}function P(){const e=document.getElementById("tablaVentas");if(s.datos.ventas.length===0){e.innerHTML=`
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bi bi-cart display-4"></i>
                    <p class="mt-2">No hay ventas registradas</p>
                    <button class="btn btn-primary" onclick="mostrarModalVenta()">
                        <i class="bi bi-plus"></i> Registrar Primera Venta
                    </button>
                </td>
            </tr>
        `;return}e.innerHTML=s.datos.ventas.map(t=>`
        <tr>
            <td>${E(t.fecha_venta)}</td>
            <td>
                <strong>${t.clientes?t.clientes.nombre:"-"}</strong>
                <br><small class="text-muted">${t.clientes?t.clientes.email:"-"}</small>
            </td>
            <td>
                <small>
                    ${(t.venta_items||[]).map(o=>`${o.cantidad} x ${o.productos?o.productos.nombre:"-"}`).join("<br>")}
                </small>
            </td>
            <td>${l(t.total)}</td>
            <td>
                <span class="badge bg-success">Completada</span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-info" onclick="verDetalleVentaModal('${t.id}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarVenta('${t.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join("")}function gt(e){const t=p.productos[e],o=`
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
                            <input type="text" class="form-control" value="${t.nombre}" disabled>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <label class="form-label">Cantidad</label>
                                <input type="number" class="form-control" id="editarCantidad" 
                                       value="${t.cantidad}" min="1">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Precio Unitario</label>
                                <div class="input-group">
                                    <span class="input-group-text">$</span>
                                    <input type="number" class="form-control" id="editarPrecio" 
                                           value="${t.precio}" step="0.01" min="0.01">
                                </div>
                            </div>
                        </div>
                        ${t.precioOriginal?`
                        <div class="mt-2">
                            <small class="text-muted">
                                Precio original: ${l(t.precioOriginal)}
                            </small>
                        </div>
                        `:""}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="guardarEdicionProductoVenta(${e})">
                            <i class="bi bi-check"></i> Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,a=document.getElementById("modalEditarProductoVenta");a&&a.remove(),document.body.insertAdjacentHTML("beforeend",o),new bootstrap.Modal(document.getElementById("modalEditarProductoVenta")).show()}function ft(e){const t=parseInt(document.getElementById("editarCantidad").value)||1,o=parseFloat(document.getElementById("editarPrecio").value)||0;if(t<=0){c("La cantidad debe ser mayor a 0","warning");return}if(o<=0){c("El precio debe ser mayor a 0","warning");return}p.productos[e].cantidad=t,p.productos[e].precio=o,p.productos[e].subtotal=t*o,x(),bootstrap.Modal.getInstance(document.getElementById("modalEditarProductoVenta")).hide(),c("Producto actualizado en la venta","success")}function U(){const e=document.getElementById("ventaCliente"),t=document.getElementById("filtroClienteVenta"),o='<option value="">Seleccionar cliente...</option>'+s.datos.clientes.map(a=>`<option value="${a.id}">${a.nombre} - ${a.email}</option>`).join("");e.innerHTML=o,t.innerHTML='<option value="">Todos los clientes</option>'+s.datos.clientes.map(a=>`<option value="${a.id}">${a.nombre}</option>`).join("")}function vt(){const e=document.getElementById("productoSelect"),t='<option value="">Seleccionar producto...</option>'+s.datos.productos.filter(o=>o.stock>0).map(o=>`<option value="${o.id}" 
                     data-precio="${o.precio}" 
                     data-stock="${o.stock}"
                     data-nombre="${o.nombre}">
                ${o.nombre} - ${l(o.precio)} (Stock: ${o.stock})
            </option>`).join("");e.innerHTML=t}function Y(){p={clienteId:null,productos:[],subtotal:0,iva:0,total:0},document.getElementById("ventaCliente").value="",document.getElementById("productoSelect").value="",document.getElementById("productoCantidad").value="1",U(),vt(),x(),new bootstrap.Modal(document.getElementById("modalVenta")).show()}window.mostrarModalVenta=Y;function ht(){const e=document.getElementById("productoSelect"),t=document.getElementById("productoCantidad"),o=document.getElementById("productoPrecioVenta"),a=e.value,n=parseInt(t.value)||1,r=parseFloat(o.value)||0;if(!a){c("Selecciona un producto","warning");return}if(n<=0){c("La cantidad debe ser mayor a 0","warning");return}s.datos.productos.find(v=>v.id===a);const d=e.options[e.selectedIndex],b=parseFloat(d.dataset.precio),m=parseInt(d.dataset.stock),i=d.dataset.nombre,u=r>0?r:b;if(n>m){c(`Stock insuficiente. Solo hay ${m} unidades disponibles`,"danger");return}const h=p.productos.find(v=>v.productoId===a);if(h){const v=h.cantidad+n;if(v>m){c(`No puedes agregar más de ${m} unidades de este producto`,"danger");return}h.cantidad=v,h.precio=u,h.subtotal=v*u}else p.productos.push({productoId:a,nombre:i,precio:u,precioOriginal:b,cantidad:n,subtotal:n*u});x(),e.value="",t.value="1",o.value="",c("Producto agregado a la venta","success")}function x(){const e=document.getElementById("listaProductosVenta"),t=document.getElementById("subtotalVenta"),o=document.getElementById("ivaVenta"),a=document.getElementById("totalVenta");p.subtotal=p.productos.reduce((n,r)=>n+r.subtotal,0),p.iva=p.subtotal*.21,p.total=p.subtotal+p.iva,p.productos.length===0?e.innerHTML='<p class="text-muted text-center">No hay productos agregados</p>':e.innerHTML=p.productos.map((n,r)=>{const d=n.precioOriginal&&n.precio!==n.precioOriginal,b=d?`<span class="badge bg-warning ms-2" title="Precio original: ${l(n.precioOriginal)}">Modificado</span>`:"";return`
                <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                    <div class="flex-grow-1">
                        <strong>${n.nombre}</strong>
                        ${b}
                        <br>
                        <small class="text-muted">
                            ${n.cantidad} × ${l(n.precio)}
                            ${d?`<br><small class="text-warning">Original: ${l(n.precioOriginal)}</small>`:""}
                        </small>
                    </div>
                    <div class="text-end">
                        <div class="fw-bold">${l(n.subtotal)}</div>
                        <div class="btn-group btn-group-sm mt-1">
                            <button class="btn btn-outline-primary" onclick="editarProductoVenta(${r})">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="removerProductoVenta(${r})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `}).join(""),t.textContent=l(p.subtotal),o.textContent=l(p.iva),a.textContent=l(p.total)}function yt(e){p.productos.splice(e,1),x(),c("Producto removido de la venta","info")}async function Et(){const e=document.getElementById("ventaCliente").value;if(!e){c("Selecciona un cliente","warning");return}if(p.productos.length===0){c("Agrega al menos un producto a la venta","warning");return}try{const t={venta:{cliente_id:e,subtotal:p.subtotal,iva:p.iva,total:p.total,user_id:s.datos.usuario.id,estado:"completada"},items:p.productos.map(n=>({producto_id:n.productoId,cantidad:n.cantidad,precio_unitario:n.precio}))},o=await w.crear(t);for(const n of p.productos){const r=s.datos.productos.find(d=>d.id===n.productoId);if(r){const d=r.stock-n.cantidad;await y.actualizarStock(n.productoId,d)}}s.datos.ventas=await w.obtenerTodas(),s.datos.productos=await y.obtenerTodos(),bootstrap.Modal.getInstance(document.getElementById("modalVenta")).hide(),P(),L(),c(`Venta registrada exitosamente por ${l(p.total)}`,"success")}catch(t){console.error("Error guardando venta:",t),c("Error al guardar venta: "+t.message,"danger")}}function wt(e){e.forEach(t=>{const o=s.datos.productos.find(a=>a.id===t.productoId);o&&(o.stock-=t.cantidad,o.stock<0&&(o.stock=0))})}function Ct(){const e=document.getElementById("fechaInicio").value,t=document.getElementById("fechaFin").value,o=document.getElementById("filtroClienteVenta").value;let a=s.datos.ventas;if(e&&(a=a.filter(r=>new Date(r.fecha_venta)>=new Date(e))),t){const r=new Date(t);r.setHours(23,59,59,999),a=a.filter(d=>new Date(d.fecha_venta)<=r)}o&&(a=a.filter(r=>r.clientes&&r.clientes.id===o?!0:r.cliente_id===o));const n=document.getElementById("tablaVentas");if(a.length===0){n.innerHTML=`
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bi bi-search display-4"></i>
                    <p class="mt-2">No se encontraron ventas</p>
                    <button class="btn btn-outline-primary" onclick="limpiarFiltrosVentas()">
                        <i class="bi bi-arrow-clockwise"></i> Limpiar filtros
                    </button>
                </td>
            </tr>
        `;return}n.innerHTML=a.map(r=>`
        <tr>
            <td>${E(r.fecha_venta)}</td>
            <td>
                <strong>${r.clientes?r.clientes.nombre:"Cliente no disponible"}</strong>
                <br><small class="text-muted">${r.clientes?r.clientes.email:"-"}</small>
            </td>
            <td>
                <small>
                    ${(r.venta_items||[]).map(d=>`${d.cantidad} x ${d.productos?d.productos.nombre:"Producto"} - ${l(d.precio_unitario)}`).join("<br>")}
                </small>
            </td>
            <td>${l(r.total)}</td>
            <td>
                <span class="badge ${r.estado==="completada"?"bg-success":r.estado==="pendiente"?"bg-warning":"bg-danger"}">
                    ${r.estado}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-info" onclick="verDetalleVenta('${r.id}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarVenta('${r.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join("")}function It(){document.getElementById("fechaInicio").value="",document.getElementById("fechaFin").value="",document.getElementById("filtroClienteVenta").value="",P(),c("Filtros limpiados","info")}function $t(e){try{const t=s.datos.ventas.find(m=>m.id===e);if(!t){c("Venta no encontrada","danger");return}const o=t.clientes?t.clientes.nombre:"Cliente no disponible",a=t.clientes?t.clientes.email:"-",n=(t.venta_items||[]).map(m=>`
                <tr>
                    <td>${m.productos?m.productos.nombre:"Producto no disponible"}</td>
                    <td class="text-center">${m.cantidad}</td>
                    <td class="text-end">${l(m.precio_unitario)}</td>
                    <td class="text-end">${l(m.subtotal)}</td>
                </tr>
            `).join(""),r=`
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
                                    ${o}<br>
                                    <small class="text-muted">${a}</small>
                                </div>
                                <div class="col-md-6">
                                    <strong>Fecha:</strong><br>
                                    ${E(t.fecha_venta)}<br>
                                    <span class="badge bg-success">${t.estado||"completada"}</span>
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
                                        ${n||'<tr><td colspan="4" class="text-center text-muted">No hay productos</td></tr>'}
                                    </tbody>
                                    <tfoot class="table-light">
                                        <tr>
                                            <td colspan="3" class="text-end"><strong>Subtotal:</strong></td>
                                            <td class="text-end"><strong>${l(t.subtotal)}</strong></td>
                                        </tr>
                                        <tr>
                                            <td colspan="3" class="text-end"><strong>IVA:</strong></td>
                                            <td class="text-end"><strong>${l(t.iva)}</strong></td>
                                        </tr>
                                        <tr>
                                            <td colspan="3" class="text-end"><strong>Total:</strong></td>
                                            <td class="text-end"><strong class="text-success">${l(t.total)}</strong></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            
                            ${t.notas?`
                            <div class="mt-3">
                                <strong>Notas:</strong><br>
                                <p class="text-muted">${t.notas}</p>
                            </div>
                            `:""}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        `,d=document.getElementById("modalDetalleVenta");d&&d.remove(),document.body.insertAdjacentHTML("beforeend",r),new bootstrap.Modal(document.getElementById("modalDetalleVenta")).show()}catch(t){console.error("Error mostrando detalle de venta:",t),c("Error al mostrar el detalle de la venta","danger")}}async function _t(e){if(confirm(`¿Estás seguro de que quieres eliminar esta venta?
Esta acción no se puede deshacer.`))try{const t=await w.obtenerPorId(e);if(!t){c("Venta no encontrada","danger");return}if(console.log("Venta encontrada:",t),t.venta_items&&t.venta_items.length>0)for(const a of t.venta_items){const n=s.datos.productos.find(r=>r.id===a.producto_id);if(n){const r=n.stock+a.cantidad;await y.actualizarStock(a.producto_id,r),console.log(`Stock revertido para ${n.nombre}: +${a.cantidad} unidades`)}}else console.log("No hay items para revertir stock");await w.eliminar(e);const o=s.datos.ventas.findIndex(a=>a.id===e);o!==-1&&s.datos.ventas.splice(o,1),s.datos.ventas=await w.obtenerTodas(),s.datos.productos=await y.obtenerTodos(),P(),L(),c("Venta eliminada exitosamente","success")}catch(t){console.error("Error eliminando venta:",t),c("Error al eliminar venta: "+t.message,"danger")}}function Bt(){try{const e=new Date().toISOString().split("T")[0],t=new Date;t.setDate(1);const o=t.toISOString().split("T")[0],a=s.datos.ventas.filter(i=>i.fecha_venta&&i.fecha_venta.startsWith(e)).reduce((i,u)=>i+(u.total||0),0),n=s.datos.ventas.filter(i=>i.fecha_venta&&i.fecha_venta>=o).reduce((i,u)=>i+(u.total||0),0),r=document.getElementById("ventasHoy"),d=document.getElementById("ingresosMes"),b=document.getElementById("totalClientes"),m=document.getElementById("totalProductos");r&&(r.textContent=l(a)),d&&(d.textContent=l(n)),b&&(b.textContent=s.datos.clientes.length),m&&(m.textContent=s.datos.productos.length)}catch(e){console.error("Error actualizando estadísticas:",e)}}window.mostrarModalVenta=Y;window.agregarProductoVenta=ht;window.removerProductoVenta=yt;window.guardarVenta=Et;window.filtrarVentas=Ct;window.limpiarFiltrosVentas=It;window.verDetalleVentaModal=$t;window.eliminarVenta=_t;window.actualizarStockProductos=wt;window.editarProductoVenta=gt;window.guardarEdicionProductoVenta=ft;window.actualizarEstadisticasDashboard=Bt;let g={proveedor:"",numeroFactura:"",productos:[],subtotal:0,iva:0,total:0};async function Pt(){console.log("Cargando compras desde Supabase...");try{const e=await C.obtenerTodas();s.datos.compras=e,M(),Lt()}catch(e){console.error("Error cargando compras:",e),c("Error al cargar compras: "+e.message,"danger")}}function M(){const e=document.getElementById("tablaCompras");if(!s.datos.compras||s.datos.compras.length===0){e.innerHTML=`
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="bi bi-box-seam display-4"></i>
                    <p class="mt-2">No hay compras registradas</p>
                    <button class="btn btn-primary" onclick="mostrarModalCompra()">
                        <i class="bi bi-plus"></i> Registrar Primera Compra
                    </button>
                </td>
            </tr>
        `;return}e.innerHTML=s.datos.compras.map(t=>`
        <tr>
            <td>${E(t.fecha_compra)}</td>
            <td>
                <strong>${t.proveedor}</strong>
                ${t.numero_factura?`<br><small class="text-muted">Factura: ${t.numero_factura}</small>`:""}
            </td>
            <td>
                <small>
                    ${(t.compra_items||[]).map(o=>`${o.cantidad} x ${o.productos?o.productos.nombre:"Producto"}`).join("<br>")}
                </small>
            </td>
            <td>${l(t.subtotal)}</td>
            <td>${l(t.iva)}</td>
            <td>${l(t.total)}</td>
            <td>
                <span class="badge ${t.estado==="completada"?"bg-success":t.estado==="pendiente"?"bg-warning":"bg-danger"}">
                    ${t.estado}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-info" onclick="verDetalleCompra('${t.id}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarCompra('${t.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join("")}function xt(){g={proveedor:"",numeroFactura:"",productos:[],subtotal:0,iva:0,total:0},document.getElementById("compraProveedor").value="",document.getElementById("compraNumeroFactura").value="",document.getElementById("productoSelectCompra").value="",document.getElementById("productoCantidadCompra").value="1",document.getElementById("productoPrecioCompra").value="",kt(),T(),new bootstrap.Modal(document.getElementById("modalCompra")).show()}function kt(){const e=document.getElementById("productoSelectCompra"),t='<option value="">Seleccionar producto...</option>'+s.datos.productos.map(o=>`<option value="${o.id}" data-nombre="${o.nombre}">
                ${o.nombre} (Stock: ${o.stock})
            </option>`).join("");e.innerHTML=t}function St(){const e=document.getElementById("productoSelectCompra"),t=document.getElementById("productoCantidadCompra"),o=document.getElementById("productoPrecioCompra"),a=e.value,n=parseInt(t.value)||1,r=parseFloat(o.value)||0;if(!a){c("Selecciona un producto","warning");return}if(n<=0){c("La cantidad debe ser mayor a 0","warning");return}if(r<=0){c("El precio debe ser mayor a 0","warning");return}const d=s.datos.productos.find(i=>i.id===a),b=d?d.nombre:"Producto",m=g.productos.find(i=>i.productoId===a);m?(m.cantidad=n,m.precioUnitario=r,m.subtotal=n*r):g.productos.push({productoId:a,nombre:b,cantidad:n,precioUnitario:r,subtotal:n*r}),T(),e.value="",t.value="1",o.value="",c("Producto agregado a la compra","success")}function T(){const e=document.getElementById("listaProductosCompra"),t=document.getElementById("subtotalCompra"),o=document.getElementById("ivaCompra"),a=document.getElementById("totalCompra");g.subtotal=g.productos.reduce((n,r)=>n+r.subtotal,0),g.iva=g.subtotal*.21,g.total=g.subtotal+g.iva,g.productos.length===0?e.innerHTML='<p class="text-muted text-center">No hay productos agregados</p>':e.innerHTML=g.productos.map((n,r)=>`
            <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                <div class="flex-grow-1">
                    <strong>${n.nombre}</strong><br>
                    <small class="text-muted">
                        ${n.cantidad} × ${l(n.precioUnitario)}
                    </small>
                </div>
                <div class="text-end">
                    <div class="fw-bold">${l(n.subtotal)}</div>
                    <button class="btn btn-sm btn-outline-danger mt-1" onclick="removerProductoCompra(${r})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join(""),t.textContent=l(g.subtotal),o.textContent=l(g.iva),a.textContent=l(g.total)}function Mt(e){g.productos.splice(e,1),T(),c("Producto removido de la compra","info")}async function Tt(){const e=document.getElementById("compraProveedor").value,t=document.getElementById("compraNumeroFactura").value;if(!e.trim()){c("Ingresa el nombre del proveedor","warning");return}if(g.productos.length===0){c("Agrega al menos un producto a la compra","warning");return}try{const o={compra:{proveedor:e.trim(),numero_factura:t.trim()||null,subtotal:g.subtotal,iva:g.iva,total:g.total,user_id:s.datos.usuario.id,estado:"completada"},items:g.productos.map(r=>({producto_id:r.productoId,cantidad:r.cantidad,precio_unitario:r.precioUnitario}))},a=await C.crear(o);for(const r of g.productos){const d=s.datos.productos.find(b=>b.id===r.productoId);if(d){const b=d.stock+r.cantidad;await y.actualizarStock(r.productoId,b)}}s.datos.compras=await C.obtenerTodas(),s.datos.productos=await y.obtenerTodos(),bootstrap.Modal.getInstance(document.getElementById("modalCompra")).hide(),M(),c(`Compra registrada exitosamente por ${l(g.total)}`,"success")}catch(o){console.error("Error guardando compra:",o),c("Error al guardar compra: "+o.message,"danger")}}function Vt(e){try{const t=s.datos.compras.find(n=>n.id===e);if(!t){c("Compra no encontrada","danger");return}const o=(t.compra_items||[]).map(n=>{const r=n.productos?n.productos.nombre:"Producto no disponible";return`- ${n.cantidad} x ${r} (${l(n.precio_unitario)}) = ${l(n.subtotal)}`}).join(`
`),a=`
DETALLE DE COMPRA
=================
Proveedor: ${t.proveedor}
${t.numero_factura?`Factura: ${t.numero_factura}`:""}
Fecha: ${E(t.fecha_compra)}
Estado: ${t.estado}
Subtotal: ${l(t.subtotal)}
IVA: ${l(t.iva)}
Total: ${l(t.total)}

PRODUCTOS:
${o||"No hay productos registrados"}

${t.notas?`Notas: ${t.notas}`:""}
        `.trim();alert(a)}catch(t){console.error("Error mostrando detalle de compra:",t),c("Error al mostrar el detalle de la compra","danger")}}async function Dt(e){if(confirm("¿Estás seguro de que quieres eliminar esta compra? Esta acción revertirá el stock."))try{const t=await C.obtenerPorId(e);if(!t){c("Compra no encontrada","danger");return}for(const a of t.compra_items||[]){const n=s.datos.productos.find(r=>r.id===a.producto_id);if(n){const r=n.stock-a.cantidad;await y.actualizarStock(a.producto_id,r)}}await C.eliminar(e);const o=s.datos.compras.findIndex(a=>a.id===e);o!==-1&&s.datos.compras.splice(o,1),s.datos.compras=await C.obtenerTodas(),s.datos.productos=await y.obtenerTodos(),M(),c("Compra eliminada exitosamente","success")}catch(t){console.error("Error eliminando compra:",t),c("Error al eliminar compra: "+t.message,"danger")}}function Lt(){document.getElementById("modalCompra").addEventListener("hidden.bs.modal",function(){document.getElementById("formCompra").reset(),g={proveedor:"",numeroFactura:"",productos:[],subtotal:0,iva:0,total:0}})}window.mostrarModalCompra=xt;window.agregarProductoCompra=St;window.removerProductoCompra=Mt;window.guardarCompra=Tt;window.verDetalleCompra=Vt;window.eliminarCompra=Dt;let f={tipo:"diario",fechaInicio:null,fechaFin:null,datos:[]};function Ft(){console.log("Cargando reportes...");const e=new Date,t=new Date;t.setDate(t.getDate()-30),document.getElementById("reporteFechaInicio").value=t.toISOString().split("T")[0],document.getElementById("reporteFechaFin").value=e.toISOString().split("T")[0],k()}function k(e=null){if(e?(f.tipo=e,document.getElementById("periodoReporte").value=e):f.tipo=document.getElementById("periodoReporte").value,f.fechaInicio=document.getElementById("reporteFechaInicio").value,f.fechaFin=document.getElementById("reporteFechaFin").value,!f.fechaInicio||!f.fechaFin){c("Selecciona un rango de fechas válido","warning");return}if(new Date(f.fechaInicio)>new Date(f.fechaFin)){c("La fecha de inicio no puede ser mayor a la fecha fin","warning");return}const t=Ht();f.datos=t,Ot(t),Rt(t),c(`Reporte ${f.tipo} generado exitosamente`,"success")}function Ht(){const e=G();switch(f.tipo){case"diario":return H(e);case"mensual":return Nt(e);case"anual":return At(e);default:return H(e)}}function G(){const e=new Date(f.fechaInicio),t=new Date(f.fechaFin);return t.setHours(23,59,59,999),s.datos.ventas.filter(o=>{const a=new Date(o.fecha_venta);return a>=e&&a<=t})}function H(e){const t={};return e.forEach(o=>{if(!o.fecha_venta)return;const n=new Date(o.fecha_venta).toISOString().split("T")[0];t[n]||(t[n]={periodo:n,total_ventas:0,cantidad_ventas:0,clientes_unicos:new Set,productos_vendidos:0}),t[n].total_ventas+=o.total,t[n].cantidad_ventas+=1,o.clientes&&o.clientes.id?t[n].clientes_unicos.add(o.clientes.id):o.cliente_id&&t[n].clientes_unicos.add(o.cliente_id),o.venta_items&&Array.isArray(o.venta_items)&&(t[n].productos_vendidos+=o.venta_items.reduce((r,d)=>r+(d.cantidad||0),0))}),Object.values(t).map(o=>({...o,clientes_atendidos:o.clientes_unicos.size,promedio_venta:o.cantidad_ventas>0?o.total_ventas/o.cantidad_ventas:0})).sort((o,a)=>o.periodo.localeCompare(a.periodo))}function Nt(e){const t={};return e.forEach(o=>{if(!o.fecha_venta)return;const n=new Date(o.fecha_venta).toISOString().substring(0,7);t[n]||(t[n]={periodo:n,total_ventas:0,cantidad_ventas:0,clientes_unicos:new Set,productos_vendidos:0}),t[n].total_ventas+=o.total,t[n].cantidad_ventas+=1,o.clientes&&o.clientes.id?t[n].clientes_unicos.add(o.clientes.id):o.cliente_id&&t[n].clientes_unicos.add(o.cliente_id),o.venta_items&&Array.isArray(o.venta_items)&&(t[n].productos_vendidos+=o.venta_items.reduce((r,d)=>r+(d.cantidad||0),0))}),Object.values(t).map(o=>({...o,clientes_atendidos:o.clientes_unicos.size,promedio_venta:o.cantidad_ventas>0?o.total_ventas/o.cantidad_ventas:0})).sort((o,a)=>o.periodo.localeCompare(a.periodo))}function At(e){const t={};return e.forEach(o=>{if(!o.fecha_venta)return;const n=new Date(o.fecha_venta).getFullYear().toString();t[n]||(t[n]={periodo:n,total_ventas:0,cantidad_ventas:0,clientes_unicos:new Set,productos_vendidos:0}),t[n].total_ventas+=o.total,o.clientes&&o.clientes.id?t[n].clientes_unicos.add(o.clientes.id):o.cliente_id&&t[n].clientes_unicos.add(o.cliente_id),o.venta_items&&Array.isArray(o.venta_items)&&(t[n].productos_vendidos+=o.venta_items.reduce((r,d)=>r+(d.cantidad||0),0))}),Object.values(t).map(o=>({...o,clientes_atendidos:o.clientes_unicos.size,promedio_venta:o.cantidad_ventas>0?o.total_ventas/o.cantidad_ventas:0})).sort((o,a)=>o.periodo.localeCompare(a.periodo))}function Ot(e){const t=document.getElementById("tablaReportes");if(e.length===0){t.innerHTML=`
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    <i class="bi bi-graph-up display-4"></i>
                    <p class="mt-2">No hay datos para el período seleccionado</p>
                </td>
            </tr>
        `;return}t.innerHTML=e.map(o=>`
        <tr>
            <td>
                <strong>${V(o.periodo)}</strong>
            </td>
            <td class="fw-bold text-success">${l(o.total_ventas)}</td>
            <td>
                <span class="badge bg-primary">${o.cantidad_ventas} ventas</span>
            </td>
            <td>${l(o.promedio_venta)}</td>
            <td>
                <span class="badge bg-info">${o.clientes_atendidos} clientes</span>
            </td>
        </tr>
    `).join("")}function V(e){switch(f.tipo){case"diario":return new Date(e).toLocaleDateString("es-ES",{year:"numeric",month:"long",day:"numeric"});case"mensual":const[t,o]=e.split("-");return new Date(t,o-1).toLocaleDateString("es-ES",{year:"numeric",month:"long"});case"anual":return e;default:return e}}function Rt(e){zt(e),jt()}function zt(e){const t=document.getElementById("chartVentasPeriodo");if(!t)return;t.chart&&t.chart.destroy();const o=e.map(n=>V(n.periodo)),a=e.map(n=>n.total_ventas);t.chart=new Chart(t,{type:"bar",data:{labels:o,datasets:[{label:"Ventas Totales",data:a,backgroundColor:"rgba(54, 162, 235, 0.8)",borderColor:"rgba(54, 162, 235, 1)",borderWidth:1}]},options:{responsive:!0,plugins:{title:{display:!0,text:`Ventas por Período (${f.tipo})`},legend:{display:!1}},scales:{y:{beginAtZero:!0,ticks:{callback:function(n){return l(n)}}}}}})}function jt(){const e=document.getElementById("chartCategorias");if(!e)return;e.chart&&e.chart.destroy();const t=G(),o=qt(t),a=Object.keys(o),n=Object.values(o);if(a.length===0||n.reduce((r,d)=>r+d,0)===0){e.innerHTML=`
            <div class="text-center text-muted py-4">
                <i class="bi bi-pie-chart display-4"></i>
                <p class="mt-2">No hay datos de categorías para el período seleccionado</p>
            </div>
        `;return}e.chart=new Chart(e,{type:"doughnut",data:{labels:a,datasets:[{data:n,backgroundColor:["#3498db","#2ecc71","#e74c3c","#f39c12","#9b59b6","#1abc9c","#34495e","#e67e22","#16a085","#27ae60","#2980b9","#8e44ad"]}]},options:{responsive:!0,plugins:{title:{display:!0,text:"Distribución por Categorías"},legend:{position:"bottom"}}}})}function qt(e){const t={};return e.forEach(o=>{try{if(!o.venta_items||!Array.isArray(o.venta_items))return;o.venta_items.forEach(a=>{try{let n="Sin categoría",r=0;a.productos&&a.productos.categoria&&(n=a.productos.categoria),a.subtotal?r=Number(a.subtotal):a.precio_unitario&&a.cantidad&&(r=Number(a.precio_unitario)*Number(a.cantidad)),t[n]||(t[n]=0),t[n]+=r}catch(n){console.warn("Error procesando item de venta:",n)}})}catch(a){console.warn("Error procesando venta para categorías:",a)}}),t}function Ut(){const e=document.getElementById("periodoReporte").value,t=new Date;let o=new Date;switch(e){case"diario":o.setDate(o.getDate()-7);break;case"mensual":o.setMonth(o.getMonth()-6);break;case"anual":o.setFullYear(o.getFullYear()-3);break}document.getElementById("reporteFechaInicio").value=o.toISOString().split("T")[0],document.getElementById("reporteFechaFin").value=t.toISOString().split("T")[0],k()}function Yt(){if(f.datos.length===0){c("No hay datos para exportar","warning");return}const e=Gt(),t=new Blob([e],{type:"text/csv"}),o=window.URL.createObjectURL(t),a=document.createElement("a");a.href=o,a.download=`reporte_${f.tipo}_${new Date().toISOString().split("T")[0]}.csv`,document.body.appendChild(a),a.click(),document.body.removeChild(a),window.URL.revokeObjectURL(o),c("Reporte exportado exitosamente","success")}function Gt(){let e=`Período,Total Ventas,Cantidad Ventas,Promedio Venta,Clientes Atendidos,Productos Vendidos
`;return f.datos.forEach(t=>{e+=`"${V(t.periodo)}",${t.total_ventas},${t.cantidad_ventas},${t.promedio_venta},${t.clientes_atendidos},${t.productos_vendidos}
`}),e}function Wt(e){const t=new Date;let o=new Date;switch(e){case"diario":o.setDate(o.getDate()-7);break;case"mensual":o.setMonth(o.getMonth()-6);break;case"anual":o.setFullYear(o.getFullYear()-3);break}document.getElementById("reporteFechaInicio").value=o.toISOString().split("T")[0],document.getElementById("reporteFechaFin").value=t.toISOString().split("T")[0],document.getElementById("periodoReporte").value=e,k(e)}window.generarReporte=k;window.generarReporteRapido=Wt;window.cambiarPeriodoReporte=Ut;window.exportarReporte=Yt;const s={seccionActual:"dashboard",datos:{clientes:[],productos:[],ventas:[],compras:[],usuario:null}};function D(e){document.querySelectorAll(".seccion").forEach(a=>{a.style.display="none"}),document.querySelectorAll(".sidebar .nav-link").forEach(a=>{a.classList.remove("active")});const t=document.getElementById(e);t&&(t.style.display="block"),document.querySelectorAll(".sidebar .nav-link").forEach(a=>{a.textContent.includes(Xt(e))&&a.classList.add("active")}),s.seccionActual=e,Zt(e)}window.mostrarSeccion=D;function Xt(e){return{dashboard:"Dashboard",clientes:"Clientes",productos:"Productos",ventas:"Ventas",compras:"Compras",reportes:"Reportes"}[e]||e}async function Zt(e){console.log(`Cargando datos para: ${e}`);try{switch(e){case"dashboard":await W();break;case"clientes":await S();break;case"productos":await ct();break;case"ventas":await bt();break;case"compras":await Pt();break;case"reportes":await Ft();break}}catch(t){console.error(`Error cargando sección ${e}:`,t),c(`Error al cargar ${e}: ${t.message}`,"danger")}}function c(e,t="info"){const o=document.getElementById("alertContainer"),a=document.createElement("div");a.className=`alert alert-${t} alert-dismissible fade show`,a.innerHTML=`
        <i class="bi bi-${Jt(t)}"></i>
        ${e}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `,o.appendChild(a),setTimeout(()=>{a.parentNode&&a.remove()},3e3)}function Jt(e){return{success:"check-circle",danger:"exclamation-triangle",warning:"exclamation-circle",info:"info-circle"}[e]||"info-circle"}function E(e){const t={year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"};return new Date(e).toLocaleDateString("es-ES",t)}function l(e){return new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(e)}document.addEventListener("DOMContentLoaded",function(){Qt(),A.auth.onAuthStateChange(async(e,t)=>{t?(console.log("Usuario autenticado:",t.user),s.datos.usuario=t.user,window.location.pathname.includes("login.html")||window.location.pathname.includes("signup.html")?window.location.href="/index.html":Kt()):(console.log("Usuario no autenticado."),s.datos.usuario=null,!window.location.pathname.includes("login.html")&&!window.location.pathname.includes("signup.html")&&(window.location.href="/login.html"))})});function Kt(){console.log("Inicializando aplicación...");const e=document.getElementById("logout-button");e&&e.addEventListener("click",async()=>{N();const{error:t}=await A.auth.signOut();t&&c("Error al cerrar sesión: "+t.message,"danger")}),N(),D("dashboard")}function Qt(){const e=document.querySelector(".navbar-toggler"),t=document.querySelector(".sidebar"),o=document.querySelector(".sidebar-overlay");e&&t&&o&&(e.addEventListener("click",()=>{t.classList.toggle("show"),o.classList.toggle("show")}),o.addEventListener("click",()=>{t.classList.remove("show"),o.classList.remove("show")}),t.addEventListener("click",a=>{a.target.classList.contains("nav-link")&&(t.classList.remove("show"),o.classList.remove("show"))}))}function N(){console.log("Limpiando estado de la aplicación..."),s.datos.clientes=[],s.datos.productos=[],s.datos.ventas=[],s.datos.compras=[],s.datos.usuario=null,document.getElementById("tablaClientes").innerHTML="",document.getElementById("tablaProductos").innerHTML="",document.getElementById("tablaVentas").innerHTML="",document.getElementById("tablaCompras").innerHTML="",document.getElementById("topClientesContainer").innerHTML="";const e=document.getElementById("chartProductosPopulares");e&&e.chart&&e.chart.destroy()}function L(){try{const e=new Date().toISOString().split("T")[0],t=new Date;t.setDate(1);const o=t.toISOString().split("T")[0],a=s.datos.ventas.filter(i=>i.fecha_venta&&i.fecha_venta.startsWith(e)).reduce((i,u)=>i+(u.total||0),0),n=s.datos.ventas.filter(i=>i.fecha_venta&&i.fecha_venta>=o).reduce((i,u)=>i+(u.total||0),0),r=document.getElementById("ventasHoy"),d=document.getElementById("ingresosMes"),b=document.getElementById("totalClientes"),m=document.getElementById("totalProductos");r&&(r.textContent=l(a)),d&&(d.textContent=l(n)),b&&(b.textContent=s.datos.clientes.length),m&&(m.textContent=s.datos.productos.length)}catch(e){console.error("Error actualizando estadísticas:",e)}}window.mostrarSeccion=D;window.mostrarAlerta=c;window.formatearFecha=E;window.formatearMoneda=l;window.actualizarEstadisticas=L;
//# sourceMappingURL=main-6126e105.js.map
