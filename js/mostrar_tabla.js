import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Initialize Supabase client with your URL and public key
const supabaseUrl = "https://ucpujkiheaxclghkkyvn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjcHVqa2loZWF4Y2xnaGtreXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDMzOTEsImV4cCI6MjA2NTI3OTM5MX0.FGb-g6NBz4wVp6Voh1JYSAmbzPYGIJXqT608-LC3FFA";
const supabase = createClient(supabaseUrl, supabaseKey);

// Get references to the HTML elements
const tablaContainer = document.getElementById("tabla-container");
const selectClues = document.getElementById("clues-select");

/**
 * Displays a table of data fetched from Supabase, optionally filtered by CLUES.
 * @param {string} clues - The CLUES value to filter by. If empty, all data is shown.
 */
async function mostrarTabla(clues = "") {
  // Show a loading message while fetching data
  tablaContainer.innerHTML = `<div class="alert alert-info">Cargando datos...</div>`;

  // Build the Supabase query.
  // We select 'var', 'cant', and join with 'tbl_indice' to get 'desc_plat', 'seccionles', 'apartado', and 'origen'.
  let query = supabase
    .from("tbl_generales")
    .select(`
      var,
      cant,
      tbl_indice:var (
        desc_plat,
        secc, // Added new column: Sección
        apartado,   // Added new column: Apartado
        origen      // Added new column: Origen
      )
    `);

  // Apply CLUES filter if provided
  if (clues) {
    query = query.eq("clues", clues);
  }

  // Execute the query
  const { data, error } = await query;

  // Handle errors during data fetching
  if (error) {
    tablaContainer.innerHTML = `<div class="alert alert-danger">Error al cargar datos: ${error.message}</div>`;
    console.error("Error fetching data:", error.message);
    return;
  }

  // Handle cases where no data is found
  if (!data || data.length === 0) {
    tablaContainer.innerHTML = `<div class="alert alert-warning">No se encontraron registros para esta CLUES.</div>`;
    return;
  }

  // Construct the HTML table with the new columns
  let tabla = `
    <table class="table table-striped table-hover table-bordered rounded-lg shadow-lg">
      <thead class="table-primary bg-blue-600 text-white">
        <tr>
          <th class="p-3 text-left">Variable</th>
          <th class="p-3 text-left">Descripción</th>
          <th class="p-3 text-left">Cantidad</th>
          <th class="p-3 text-left">Sección</th>    <!-- New table header for seccionles -->
          <th class="p-3 text-left">Apartado</th>   <!-- New table header for apartado -->
          <th class="p-3 text-left">Origen</th>     <!-- New table header for origen -->
        </tr>
      </thead>
      <tbody>
  `;

  // Populate the table rows with fetched data
  data.forEach(row => {
    tabla += `
      <tr class="hover:bg-blue-50">
        <td class="p-3">${row.var || '—'}</td>
        <td class="p-3">${row.tbl_indice?.desc_plat || '—'}</td>
        <td class="p-3">${row.cant || '—'}</td>
        <td class="p-3">${row.tbl_indice?.seccionles || '—'}</td> <!-- Display data for seccionles -->
        <td class="p-3">${row.tbl_indice?.apartado || '—'}</td>   <!-- Display data for apartado -->
        <td class="p-3">${row.tbl_indice?.origen || '—'}</td>      <!-- Display data for origen -->
      </tr>
    `;
  });

  tabla += '</tbody></table>';
  tablaContainer.innerHTML = tabla;
}

// Display the table with all data when the page loads
mostrarTabla();

// Add an event listener to the CLUES select dropdown for filtering
selectClues.addEventListener("change", () => {
  const seleccion = selectClues.value; // Get the selected CLUES value
  mostrarTabla(seleccion); // Call mostrarTabla with the selected CLUES
});
