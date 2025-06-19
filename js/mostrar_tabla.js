import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://ucpujkiheaxclghkkyvn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjcHVqa2loZWF4Y2xnaGtreXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDMzOTEsImV4cCI6MjA2NTI3OTM5MX0.FGb-g6NBz4wVp6Voh1JYSAmbzPYGIJXqT608-LC3FFA";
const supabase = createClient(supabaseUrl, supabaseKey);

const tablaContainer = document.getElementById("tabla-container");
const selectClues = document.getElementById("clues-select");

async function mostrarTabla(clues = "") {
  tablaContainer.innerHTML = `<div class="alert alert-info">Cargando datos...</div>`;

  let query = supabase
    .from("tbl_generales")
    .select(`
      var,
      cant,
      tbl_indice:var (
        desc_plat
      )
    `);

  if (clues) {
    query = query.eq("clues", clues);
  }

  const { data, error } = await query;

  if (error) {
    tablaContainer.innerHTML = `<div class="alert alert-danger">Error al cargar datos: ${error.message}</div>`;
    return;
  }

  if (!data || data.length === 0) {
    tablaContainer.innerHTML = `<div class="alert alert-warning">No se encontraron registros para esta CLUES.</div>`;
    return;
  }

  // Construir tabla HTML solo con columnas: var, desc_plat, cant
  let tabla = `
    <table class="table table-striped table-hover table-bordered">
      <thead class="table-primary">
        <tr>
          <th>Variable</th>
          <th>Descripción</th>
          <th>Cantidad</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach(row => {
    tabla += `
      <tr>
        <td>${row.var}</td>
        <td>${row.tbl_indice?.desc_plat || '—'}</td>
        <td>${row.cant}</td>
      </tr>
    `;
  });

  tabla += '</tbody></table>';
  tablaContainer.innerHTML = tabla;
}

// Mostrar todo al cargar
mostrarTabla();

// Evento para filtrar por CLUES
selectClues.addEventListener("change", () => {
  const seleccion = selectClues.value;
  mostrarTabla(seleccion);
});
