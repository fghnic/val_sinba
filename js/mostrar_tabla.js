import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// se inicializa el cliente a la base de datos 
const supabaseUrl = "https://ucpujkiheaxclghkkyvn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjcHVqa2loZWF4Y2xnaGtreXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDMzOTEsImV4cCI6MjA2NTI3OTM5MX0.FGb-g6NBz4wVp6Voh1JYSAmbzPYGIJXqT608-LC3FFA";
const supabase = createClient(supabaseUrl, supabaseKey);

// obtenemos las referencias para el contenedor de la tabla y el select de CLUES
const tablaContainer = document.getElementById("tabla-container");
const selectClues = document.getElementById("clues-select");

/**
 * @param {string} clues - El valor de CLUES para filtrar los datos.
 */
async function mostrarTabla(clues = "") {
  
  tablaContainer.innerHTML = `<div class="alert alert-info">Cargando datos...</div>`;

  // Consulta a supabase
  // Seleccionamos 'var', 'cant', y unimos con 'tbl_indice' para obtener 'desc_plat', 'seccionles', 'apartado' y 'origen'.
  let query = supabase
    .from("tbl_generales")
    .select(`
      var,
      cant,
      tbl_indice:var (
        desc_plat,
        secc, 
        apartado,
        origen
      )
    `);

  if (clues) {
    query = query.eq("clues", clues);
  }

  // Ejecutamos la consulta
  const { data, error } = await query;

  //Errores
  if (error) {
    tablaContainer.innerHTML = `<div class="alert alert-danger">Error al cargar datos: ${error.message}</div>`;
    console.error("Error fetching data:", error.message);
    return;
  }

  // Si no hay datos, mostramos un mensaje
  if (!data || data.length === 0) {
    tablaContainer.innerHTML = `<div class="alert alert-warning">No se encontraron registros para esta CLUES.</div>`;
    return;
  }

  // Si hay datos, construimos la tabla
  let tabla = `
    <table class="table table-striped table-hover table-bordered rounded-lg shadow-lg">
      <thead class="table-primary bg-blue-600 text-white">
        <tr>
          <th class="p-3 text-left">Variable</th>
          <th class="p-3 text-left">Descripción</th>
          <th class="p-3 text-left">Cantidad</th>
          <th class="p-3 text-left">Sección</th>
          <th class="p-3 text-left">Apartado</th>
          <th class="p-3 text-left">Origen</th> 
        </tr>
      </thead>
      <tbody>
  `;

 // Iteramos sobre los datos y construimos las filas de la tabla
  data.forEach(row => {
    tabla += `
      <tr class="hover:bg-blue-50">
        <td class="p-3">${row.var || '—'}</td>
        <td class="p-3">${row.tbl_indice?.desc_plat || '—'}</td>
        <td class="p-3">${row.cant || '—'}</td>
        <td class="p-3">${row.tbl_indice?.secc || '—'}</td> <!-- Display data for seccionles -->
        <td class="p-3">${row.tbl_indice?.apartado || '—'}</td>   <!-- Display data for apartado -->
        <td class="p-3">${row.tbl_indice?.origen || '—'}</td>      <!-- Display data for origen -->
      </tr>
    `;
  });

  tabla += '</tbody></table>';
  tablaContainer.innerHTML = tabla;
}


mostrarTabla();

// Llenamos el select de CLUES con las opciones disponibles 
selectClues.addEventListener("change", () => {
  const seleccion = selectClues.value; 
  mostrarTabla(seleccion); 
});
