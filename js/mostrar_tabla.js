import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Inicializa el cliente Supabase con tu URL y clave pública
const supabaseUrl = "https://ucpujkiheaxclghkkyvn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjcHVqa2loZWF4Y2xnaGtreXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDMzOTEsImV4cCI6MjA2NTI3OTM5MX0.FGb-g6NBz4wVp6Voh1JYSAmbzPYGIJXqT608-LC3FFA";
const supabase = createClient(supabaseUrl, supabaseKey);

// Obtiene referencias a los elementos HTML
const tablaContainer = document.getElementById("tabla-container");
const selectClues = document.getElementById("clues-select");

/**
 * Muestra una tabla de datos obtenidos de Supabase, opcionalmente filtrados por CLUES.
 * @param {string} clues - El valor de CLUES para filtrar. Si está vacío, se muestran todos los datos.
 */
async function mostrarTabla(clues = "") {
  // Muestra un mensaje de carga mientras se obtienen los datos
  tablaContainer.innerHTML = `<div class="alert alert-info">Cargando datos...</div>`;

  // Construye la consulta de Supabase.
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

  // Aplica el filtro CLUES si se proporciona
  if (clues) {
    query = query.eq("clues", clues);
  }

  // Ejecuta la consulta
  const { data, error } = await query;

  // Maneja errores durante la obtención de datos
  if (error) {
    tablaContainer.innerHTML = `<div class="alert alert-danger">Error al cargar datos: ${error.message}</div>`;
    console.error("Error al obtener datos:", error.message);
    return;
  }

  // Maneja los casos en que no se encuentran datos
  if (!data || data.length === 0) {
    tablaContainer.innerHTML = `<div class="alert alert-warning">No se encontraron registros para esta CLUES.</div>`;
    return;
  }

  // Construye la tabla HTML con las nuevas columnas
  let tabla = `
    <table class="table table-striped table-hover table-bordered rounded-lg shadow-lg">
      <thead class="table-primary bg-blue-600 text-white">
        <tr>
          <th class="p-3 text-left">Variable</th>
          <th class="p-3 text-left">Descripción</th>
          <th class="p-3 text-left">Cantidad</th>
          <th class="p-3 text-left">Sección</th>    <!-- Encabezado de tabla para seccionles -->
          <th class="p-3 text-left">Apartado</th>   <!-- Encabezado de tabla para apartado -->
          <th class="p-3 text-left">Origen</th>     <!-- Encabezado de tabla para origen -->
        </tr>
      </thead>
      <tbody>
  `;

  // Rellena las filas de la tabla con los datos obtenidos
  data.forEach(row => {
    tabla += `
      <tr class="hover:bg-blue-50">
        <td class="p-3">${row.var || '—'}</td>
        <td class="p-3">${row.tbl_indice?.desc_plat || '—'}</td>
        <td class="p-3">${row.cant || '—'}</td>
        <td class="p-3">${row.tbl_indice?.secc || '—'}</td> <!-- Muestra los datos de seccionles -->
        <td class="p-3">${row.tbl_indice?.apartado || '—'}</td>   <!-- Muestra los datos de apartado -->
        <td class="p-3">${row.tbl_indice?.origen || '—'}</td>      <!-- Muestra los datos de origen -->
      </tr>
    `;
  });

  tabla += '</tbody></table>';
  tablaContainer.innerHTML = tabla;
}

// Muestra la tabla con todos los datos cuando la página carga
mostrarTabla();

// Agrega un escuchador de eventos al menú desplegable de CLUES para filtrar
selectClues.addEventListener("change", () => {
  const seleccion = selectClues.value; // Obtiene el valor CLUES seleccionado
  mostrarTabla(seleccion); // Llama a mostrarTabla con el CLUES seleccionado
});
