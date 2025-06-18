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
    .select("var, tbl_indice(apartado, descripcion_plat)")
    .order("var");

  if (clues) {
    query = query.eq("clues", clues);
  }

  const { data, error } = await query;

  if (error) {
    tablaContainer.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    return;
  }

  if (!data || data.length === 0) {
    tablaContainer.innerHTML = `<div class="alert alert-warning">No se encontraron registros.</div>`;
    return;
  }

  // Construir tabla con columnas personalizadas
  let tabla = `
    <table class="table table-bordered table-striped table-hover">
      <thead class="table-primary">
        <tr>
          <th>Variable</th>
          <th>Apartado</th>
          <th>Descripción</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach(row => {
    tabla += `
      <tr>
        <td>${row.var ?? ''}</td>
        <td>${row.tbl_indice?.apartado ?? ''}</td>
        <td>${row.tbl_indice?.descripcion_plat ?? ''}</td>
      </tr>
    `;
  });

  tabla += `
      </tbody>
    </table>
  `;

  tablaContainer.innerHTML = tabla;
}

// Mostrar todos al inicio
mostrarTabla();

// Activar filtro por CLUES después de la carga de CSV
selectClues.addEventListener("change", () => {
  const seleccion = selectClues.value;
  mostrarTabla(seleccion);
});
