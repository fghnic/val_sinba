import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://ucpujkiheaxclghkkyvn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjcHVqa2loZWF4Y2xnaGtreXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDMzOTEsImV4cCI6MjA2NTI3OTM5MX0.FGb-g6NBz4wVp6Voh1JYSAmbzPYGIJXqT608-LC3FFA";
const supabase = createClient(supabaseUrl, supabaseKey);

const tablaContainer = document.getElementById("tabla-container");
const selectClues = document.getElementById("clues-select");

async function mostrarTabla(clues = "") {
  tablaContainer.innerHTML = `<div class="alert alert-info">Cargando datos...</div>`;

  // Obtener todos los registros de tbl_generales
  const { data: generales, error: errorGenerales } = await supabase
    .from("tbl_generales")
    .select("var, clues")
    .order("var", { ascending: true });

  if (errorGenerales) {
    tablaContainer.innerHTML = `<div class="alert alert-danger">Error al obtener tbl_generales: ${errorGenerales.message}</div>`;
    return;
  }

  // Si se aplica filtro por clues
  const filtrados = clues ? generales.filter(row => row.clues === clues) : generales;

  // Obtener todos los registros de tbl_indice
  const { data: indice, error: errorIndice } = await supabase
    .from("tbl_indice")
    .select("id_var, apartado, desc_plat");

  if (errorIndice) {
    tablaContainer.innerHTML = `<div class="alert alert-danger">Error al obtener tbl_indice: ${errorIndice.message}</div>`;
    return;
  }

  // Unir datos manualmente
  const datosCombinados = filtrados.map(gen => {
    const relacion = indice.find(ind => ind.id_var === gen.var);
    return {
      var: gen.var,
      apartado: relacion?.apartado || "",
      desc_plat: relacion?.desc_plat || ""
    };
  });

  if (datosCombinados.length === 0) {
    tablaContainer.innerHTML = `<div class="alert alert-warning">No se encontraron datos con esos criterios.</div>`;
    return;
  }

  // Generar HTML de tabla
  let tablaHTML = `
    <table class="table table-bordered table-striped">
      <thead class="table-primary">
        <tr>
          <th>Variable</th>
          <th>Apartado</th>
          <th>Descripción</th>
        </tr>
      </thead>
      <tbody>
  `;

  datosCombinados.forEach(row => {
    tablaHTML += `
      <tr>
        <td>${row.var}</td>
        <td>${row.apartado}</td>
        <td>${row.desc_plat}</td>
      </tr>
    `;
  });

  tablaHTML += `
      </tbody>
    </table>
  `;

  tablaContainer.innerHTML = tablaHTML;
}

// Mostrar todos al inicio
mostrarTabla();

// Filtrar por clues después de subir
selectClues.addEventListener("change", () => {
  const seleccion = selectClues.value;
  mostrarTabla(seleccion);
});
