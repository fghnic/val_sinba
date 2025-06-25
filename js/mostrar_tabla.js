import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Supabase config
const supabase = createClient(
  "https://ucpujkiheaxclghkkyvn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjcHVqa2loZWF4Y2xnaGtreXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDMzOTEsImV4cCI6MjA2NTI3OTM5MX0.FGb-g6NBz4wVp6Voh1JYSAmbzPYGIJXqT608-LC3FFA"
);

// Referencias DOM
const tablaContainer = document.getElementById("tabla-container");
const selectClues = document.getElementById("clues-select");
const selectSecc = document.getElementById("secc-select");
const btnLimpiar = document.getElementById("limpiar-filtros");

// Cargar CLUES dinámicamente
async function cargarClues() {
  const { data, error } = await supabase
    .from("tbl_clues")
    .select("clues, nombre")
    .order("clues");

  if (error) {
    console.error("Error CLUES:", error.message);
    return;
  }

  selectClues.innerHTML = `<option value="">-- Mostrar todos --</option>` +
    data.map(d => `<option value="${d.clues}">${d.clues} - ${d.nombre}</option>`).join("");
}

// Cargar secciones dinámicamente (hasta 5000 registros)
async function cargarSecciones() {
  const { data, error } = await supabase
    .from("tbl_indice")
    .select("secc", { count: "exact" })
    .range(0, 4999);

  if (error) {
    console.error("Error secciones:", error.message);
    return;
  }

  const unicas = [...new Set(data.map(d => d.secc).filter(secc => secc && secc.trim() !== ""))];

  selectSecc.innerHTML = `<option value="">-- Mostrar todos --</option>` +
    unicas.map(secc => `<option value="${secc}">${secc}</option>`).join("");
}

// Mostrar datos con filtros (hasta 5000 registros)
async function mostrarTabla() {
  const clues = selectClues.value;
  const secc = selectSecc.value;

  tablaContainer.innerHTML = `<div class="alert alert-info">Cargando datos...</div>`;

  let query = supabase
    .from("tbl_generales")
    .select(`
      var, cant,
      tbl_indice:var (
        desc_plat, secc, apartado, origen
      )
    `, { count: "exact" })
    .range(0, 4999); // Ajustable

  if (clues) query = query.eq("clues", clues);

  const { data, error } = await query;

  if (error) {
    tablaContainer.innerHTML = `<div class="alert alert-danger">Error al cargar datos: ${error.message}</div>`;
    return;
  }

  if (!data.length) {
    tablaContainer.innerHTML = `<div class="alert alert-warning">No se encontraron registros.</div>`;
    return;
  }

  const filtrados = secc
    ? data.filter(r => r.tbl_indice?.secc === secc)
    : data;

  if (!filtrados.length) {
    tablaContainer.innerHTML = `<div class="alert alert-warning">No se encontraron registros para esta sección.</div>`;
    return;
  }

  const tablaHTML = `
    <table id="tabla-supabase" class="table table-striped table-bordered">
      <thead>
        <tr>
          <th>Variable</th>
          <th>Descripción</th>
          <th>Cantidad</th>
          <th>Sección</th>
          <th>Apartado</th>
          <th>Origen</th>
        </tr>
      </thead>
      <tbody>
        ${filtrados.map(r => `
          <tr>
            <td>${r.var || '—'}</td>
            <td>${r.tbl_indice?.desc_plat || '—'}</td>
            <td>${r.cant || '—'}</td>
            <td>${r.tbl_indice?.secc || '—'}</td>
            <td>${r.tbl_indice?.apartado || '—'}</td>
            <td>${r.tbl_indice?.origen || '—'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  tablaContainer.innerHTML = tablaHTML;

  // Activar DataTables
  setTimeout(() => {
    $('#tabla-supabase').DataTable({
      pageLength: 10,
      lengthMenu: [10, 25, 50, 100],
      language: {
        url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-MX.json"
      }
    });
  }, 100);
}

// Eventos
selectClues.addEventListener("change", mostrarTabla);
selectSecc.addEventListener("change", mostrarTabla);
btnLimpiar.addEventListener("click", () => {
  selectClues.value = "";
  selectSecc.value = "";
  mostrarTabla();
});

// Inicialización
cargarClues();
cargarSecciones();
mostrarTabla();




