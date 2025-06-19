import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Se inicializa el cliente a la base de datos
const supabaseUrl = "https://ucpujkiheaxclghkkyvn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjcHVqa2loZWF4Y2xnaGtreXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDMzOTEsImV4cCI6MjA2NTI3OTM5MX0.FGb-g6NBz4wVp6Voh1JYSAmbzPYGIJXqT608-LC3FFA";
const supabase = createClient(supabaseUrl, supabaseKey);

// Obtenemos las referencias para el contenedor de la tabla y los selects de filtro
const tablaContainer = document.getElementById("tabla-container");
const selectClues = document.getElementById("clues-select");
const selectApartado = document.getElementById("apartado-select"); // Nueva referencia para el select de Apartado

/**
 * Muestra una tabla de datos obtenidos de Supabase, opcionalmente filtrados por CLUES y Apartado.
 * @param {string} clues - El valor de CLUES para filtrar los datos.
 * @param {string} apartado - El valor de Apartado para filtrar los datos.
 */
async function mostrarTabla(clues = "", apartado = "") {
  tablaContainer.innerHTML = `<div class="alert alert-info">Cargando datos...</div>`;

  // Construye la consulta a Supabase.
  // Seleccionamos 'var', 'cant', y unimos con 'tbl_indice' para obtener 'desc_plat', 'secc', 'apartado' y 'origen'.
  // ¡Corregido! Ahora usamos 'secc' para la columna de sección.
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

  // Aplica el filtro Apartado si se proporciona
  if (apartado) {
    // Para filtrar por una columna de la tabla unida (tbl_indice), usamos 'nombre_relacion.nombre_columna'
    query = query.eq("tbl_indice.apartado", apartado);
  }

  // Ejecutamos la consulta
  const { data, error } = await query;

  // Manejo de errores
  if (error) {
    tablaContainer.innerHTML = `<div class="alert alert-danger">Error al cargar datos: ${error.message}</div>`;
    console.error("Error al obtener datos:", error.message);
    return;
  }

  // Si no hay datos, mostramos un mensaje
  if (!data || data.length === 0) {
    tablaContainer.innerHTML = `<div class="alert alert-warning">No se encontraron registros con los filtros aplicados.</div>`;
    return;
  }

  // Si hay datos, construimos la tabla
  let tabla = `
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="table-primary bg-blue-600 text-white">
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider rounded-tl-lg">Variable</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Descripción</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Cantidad</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Sección</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Apartado</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider rounded-tr-lg">Origen</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
  `;

  // Iteramos sobre los datos y construimos las filas de la tabla
  data.forEach(row => {
    tabla += `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${row.var || '—'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.tbl_indice?.desc_plat || '—'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.cant || '—'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.tbl_indice?.secc || '—'}</td> <!-- Muestra los datos de la columna 'secc' -->
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.tbl_indice?.apartado || '—'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.tbl_indice?.origen || '—'}</td>
      </tr>
    `;
  });

  tabla += '</tbody></table>';
  tablaContainer.innerHTML = tabla;
}

/**
 * Carga dinámicamente las opciones de 'apartado' en el select correspondiente.
 * Obtiene valores únicos de la columna 'apartado' en tbl_indice.
 */
async function cargarOpcionesApartado() {
    // Consulta para obtener los valores únicos de 'apartado' de tbl_indice
    const { data, error } = await supabase
        .from('tbl_indice')
        .select('apartado')
        .order('apartado', { ascending: true }); // Ordena alfabéticamente

    if (error) {
        console.error("Error al cargar opciones de apartado:", error.message);
        return;
    }

    // Limpia las opciones actuales, manteniendo la opción "Mostrar todos"
    selectApartado.innerHTML = '<option value="">-- Mostrar todos --</option>';

    // Agrega las nuevas opciones
    if (data) {
        const apartadosUnicos = [...new Set(data.map(item => item.apartado))].filter(Boolean); // Filtra valores nulos/vacíos
        apartadosUnicos.forEach(apartado => {
            const option = document.createElement('option');
            option.value = apartado;
            option.textContent = apartado;
            selectApartado.appendChild(option);
        });
    }
}

// Llama a la función para mostrar la tabla inicialmente
mostrarTabla();

// Llama a la función para cargar las opciones de apartado cuando la página carga
cargarOpcionesApartado();

// Evento para filtrar por CLUES
selectClues.addEventListener("change", () => {
  const seleccionClues = selectClues.value;
  const seleccionApartado = selectApartado.value; // Obtiene el valor actual del filtro de apartado
  mostrarTabla(seleccionClues, seleccionApartado); // Pasa ambos filtros
});

// Nuevo evento para filtrar por Apartado
selectApartado.addEventListener("change", () => {
  const seleccionClues = selectClues.value; // Obtiene el valor actual del filtro de CLUES
  const seleccionApartado = selectApartado.value;
  mostrarTabla(seleccionClues, seleccionApartado); // Pasa ambos filtros
});
