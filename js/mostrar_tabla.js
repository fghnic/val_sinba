import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Configuración Supabase
const supabase = createClient(
  "https://ucpujkiheaxclghkkyvn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjcHVqa2loZWF4Y2xnaGtreXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDMzOTEsImV4cCI6MjA2NTI3OTM5MX0.FGb-g6NBz4wVp6Voh1JYSAmbzPYGIJXqT608-LC3FFA"
);

// Referencias DOM
const tablaContainer = document.getElementById("tabla-container");
const selectClues = document.getElementById("clues-select");
const selectSecc = document.getElementById("secc-select");
const btnLimpiar = document.getElementById("limpiar-filtros");

let datosOriginales = [];

// Función para cargar todas las CLUES en el selector
async function cargarClues() {
  const { data, error } = await supabase
    .from("tbl_clues")
    .select("clues, nombre")
    .order("clues")
    .limit(10000); // límite alto para asegurar traer todas

  if (error) {
    console.error("Error cargando CLUES:", error.message);
    selectClues.innerHTML = `<option value="">-- Error al cargar CLUES --</option>`;
    return;
  }

  if (!data || data.length === 0) {
    selectClues.innerHTML = `<option value="">-- No hay CLUES disponibles --</option>`;
    return;
  }

  selectClues.innerHTML =
    `<option value="">-- Mostrar todos --</option>` +
    data
      .map((c) => `<option value="${c.clues}">${c.clues} - ${c.nombre}</option>`)
      .join("");
}

// Función para cargar todas las secciones en el selector
async function cargarSecciones() {
  const { data, error } = await supabase
    .from("tbl_indice")
    .select("secc")
    .order("secc")
    .limit(10000);

  if (error) {
    console.error("Error cargando secciones:", error.message);
    selectSecc.innerHTML = `<option value="">-- Error al cargar secciones --</option>`;
    return;
  }

  if (!data || data.length === 0) {
    selectSecc.innerHTML = `<option value="">-- No hay secciones disponibles --</option>`;
    return;
  }

  // Obtener valores únicos y filtrados (no nulos)
  const seccUnicas = [...new Set(data.map((d) => d.secc).filter(Boolean))];

  selectSecc.innerHTML =
    `<option value="">-- Mostrar todos --</option>` +
    seccUnicas.map((s) => `<option value="${s}">${s}</option>`).join("");
}

// Función para cargar todos los datos para la tabla
async function cargarDatos() {
  tablaContainer.innerHTML = `<div class="alert alert-info"><i class="bi bi-hourglass-split me-1"></i>Cargando datos...</div>`;

  const { data, error } = await supabase
    .from("tbl_generales")
    .select(`
      var, cant, clues,
      tbl_clues(clues, nombre),
      tbl_indice(desc_plat, secc, apartado, origen)
    `)
    .range(0, 9999); // hasta 10,000 registros

  if (error) {
    tablaContainer.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    return;
  }

  datosOriginales = data;
  renderTabla(data);
}

// Función para renderizar tabla con DataTables
function renderTabla(data) {
  if ($.fn.DataTable.isDataTable("#tabla-supabase")) {
    $("#tabla-supabase").DataTable().destroy();
  }

  const html = `
    <table id="tabla-supabase" class="table table-bordered table-striped">
      <thead>
        <tr>
          <th>CLUES</th>
          <th>Unidad</th>
          <th>Variable</th>
          <th>Descripción</th>
          <th>Cantidad</th>
          <th>Sección</th>
          <th>Apartado</th>
          <th>Origen</th>
        </tr>
      </thead>
      <tbody>
        ${data
          .map(
            (r) => `
          <tr>
            <td>${r.tbl_clues?.clues || "—"}</td>
            <td>${r.tbl_clues?.nombre || "—"}</td>
            <td>${r.var || "—"}</td>
            <td>${r.tbl_indice?.desc_plat || "—"}</td>
            <td>${r.cant || "—"}</td>
            <td>${r.tbl_indice?.secc || "—"}</td>
            <td>${r.tbl_indice?.apartado || "—"}</td>
            <td>${r.tbl_indice?.origen || "—"}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;

  tablaContainer.innerHTML = html;

  $("#tabla-supabase").DataTable({
    pageLength: 10,
    lengthMenu: [10, 25, 50, 100],
    lengthChange: true,
    language: {
      url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-MX.json",
      lengthMenu: "Mostrar _MENU_ registros por página",
    },
  });
}

// Función para filtrar datos según selección
function aplicarFiltros() {
  const filtroClues = selectClues.value;
  const filtroSecc = selectSecc.value;

  const datosFiltrados = datosOriginales.filter(
    (r) =>
      (!filtroClues || r.clues === filtroClues) &&
      (!filtroSecc || r.tbl_indice?.secc === filtroSecc)
  );

  renderTabla(datosFiltrados);
}

// Eventos
selectClues.addEventListener("change", aplicarFiltros);
selectSecc.addEventListener("change", aplicarFiltros);
btnLimpiar.addEventListener("click", () => {
  selectClues.value = "";
  selectSecc.value = "";
  renderTabla(datosOriginales);
});

// Inicializar todo
cargarClues();
cargarSecciones();
cargarDatos();

