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

// Cargar datos completos con relaciones
async function cargarDatos() {
  tablaContainer.innerHTML = `<div class="alert alert-info"><i class="bi bi-hourglass-split me-1"></i>Cargando datos...</div>`;

  const { data, error } = await supabase
    .from("tbl_generales")
    .select(`
      var, cant, clues,
      tbl_clues(clues, nombre),
      tbl_indice(desc_plat, secc, apartado, origen)
    `);

  if (error) {
    tablaContainer.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    return;
  }

  datosOriginales = data;
  renderTabla(data);
  cargarFiltros(data);
}

// Renderizar tabla con DataTables
function renderTabla(data) {
  if ($.fn.DataTable.isDataTable('#tabla-supabase')) {
    $('#tabla-supabase').DataTable().destroy();
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
        ${data.map(r => `
          <tr>
            <td>${r.tbl_clues?.clues || '—'}</td>
            <td>${r.tbl_clues?.nombre || '—'}</td>
            <td>${r.var || '—'}</td>
            <td>${r.tbl_indice?.desc_plat || '—'}</td>
            <td>${r.cant || '—'}</td>
            <td>${r.tbl_indice?.secc || '—'}</td>
            <td>${r.tbl_indice?.apartado || '—'}</td>
            <td>${r.tbl_indice?.origen || '—'}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  tablaContainer.innerHTML = html;

  $('#tabla-supabase').DataTable({
    pageLength: 10,
    lengthChange: false,
    language: {
      url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-MX.json"
    }
  });
}

// Cargar filtros únicos
function cargarFiltros(data) {
  const cluesUnicas = [...new Set(data.map(r => r.clues))].filter(Boolean);
  const seccUnicas = [...new Set(data.map(r => r.tbl_indice?.secc))].filter(Boolean);

  selectClues.innerHTML = `<option value="">-- Mostrar todos --</option>` +
    cluesUnicas.map(c => `<option value="${c}">${c}</option>`).join("");

  selectSecc.innerHTML = `<option value="">-- Mostrar todos --</option>` +
    seccUnicas.map(s => `<option value="${s}">${s}</option>`).join("");
}

// Aplicar filtros seleccionados
function aplicarFiltros() {
  const filtroClues = selectClues.value;
  const filtroSecc = selectSecc.value;

  const datosFiltrados = datosOriginales.filter(r =>
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

// Inicializar
cargarDatos();
