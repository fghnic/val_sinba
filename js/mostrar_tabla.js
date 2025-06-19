import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Se inicializa el cliente a la base de datos de Supabase
const supabaseUrl = "https://ucpujkiheaxclghkkyvn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjcHVqa2loZWF4Y2xnaGtreXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDMzOTEsImV4cCI6MjA2NTI3OTM5MX0.FGb-g6NBz4wVp6Voh1JYSAmbzPYGIJXqT608-LC3FFA";
const supabase = createClient(supabaseUrl, supabaseKey);

// Obtenemos las referencias a los elementos HTML del DOM
const tablaContainer = document.getElementById("tabla-container");
const selectClues = document.getElementById("clues-select");
const selectApartado = document.getElementById("apartado-select"); // Referencia al nuevo select de Apartado

/**
 * Muestra una tabla de datos obtenidos de Supabase, opcionalmente filtrados
 * por un valor de CLUES y/o un valor de Apartado.
 * @param {string} clues - El valor de CLUES para filtrar los datos. Si está vacío, no se aplica este filtro.
 * @param {string} apartado - El valor de Apartado para filtrar los datos. Si está vacío, no se aplica este filtro.
 */
async function mostrarTabla(clues = "", apartado = "") {
  // Muestra un mensaje de carga mientras se obtienen los datos
  tablaContainer.innerHTML = `<div class="alert alert-info">Cargando datos...</div>`;

  // Construye la consulta base a Supabase.
  // Seleccionamos 'var', 'cant', y unimos con 'tbl_indice' para obtener
  // 'desc_plat', 'secc', 'apartado' y 'origen'.
  // 'secc' es el nombre de la columna en la base de datos, se mostrará como 'Sección' en la tabla.
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

  // Aplica el filtro por CLUES si se proporciona un valor
  if (clues) {
    query = query.eq("clues", clues);
  }

  // Aplica el filtro por Apartado si se proporciona un valor
  // Importante: Para filtrar en una columna de una tabla relacionada (tbl_indice),
  // se usa la sintaxis 'nombre_relacion.nombre_columna'
  if (apartado) {
    query = query.eq("tbl_indice.apartado", apartado);
  }

  // Ejecutamos la consulta a la base de datos
  const { data, error } = await query;

  // Manejo de errores durante la obtención de datos
  if (error) {
    tablaContainer.innerHTML = `<div class="alert alert-danger">Error al cargar datos: ${error.message}</div>`;
    console.error("Error al obtener datos:", error.message);
    return;
  }

  // Si no se encontraron registros con los filtros aplicados
  if (!data || data.length === 0) {
    tablaContainer.innerHTML = `<div class="alert alert-warning">No se encontraron registros con los filtros aplicados.</div>`;
    return;
  }

  // Si hay datos, construimos la estructura HTML de la tabla
  let tabla = `
    <table class="table table-striped table-hover table-bordered">
      <thead class="table-primary">
        <tr>
          <th>Variable</th>
          <th>Descripción</th>
          <th>Cantidad</th>
          <th>Sección</th>    <!-- Encabezado de la columna 'secc' -->
          <th>Apartado</th>
          <th>Origen</th>
        </tr>
      </thead>
      <tbody>
  `;

  // Iteramos sobre cada fila de datos obtenida y construimos una fila de tabla HTML
  data.forEach(row => {
    tabla += `
      <tr>
        <td>${row.var || '—'}</td>
        <td>${row.tbl_indice?.desc_plat || '—'}</td>
        <td>${row.cant || '—'}</td>
        <td>${row.tbl_indice?.secc || '—'}</td> <!-- Muestra el valor de la columna 'secc' -->
        <td>${row.tbl_indice?.apartado || '—'}</td>
        <td>${row.tbl_indice?.origen || '—'}</td>
      </tr>
    `;
  });

  tabla += '</tbody></table>';
  // Inserta la tabla construida en el contenedor HTML
  tablaContainer.innerHTML = tabla;
}

/**
 * Carga dinámicamente las opciones para el filtro 'Apartado' desde la base de datos.
 * Obtiene valores únicos de la columna 'apartado' de la tabla 'tbl_indice'.
 */
async function cargarOpcionesApartado() {
    // Consulta para obtener solo la columna 'apartado' de 'tbl_indice' y ordenarla
    const { data, error } = await supabase
        .from('tbl_indice')
        .select('apartado')
        .order('apartado', { ascending: true }); // Ordena alfabéticamente para una mejor UX

    if (error) {
        console.error("Error al cargar opciones de apartado:", error.message);
        return;
    }

    // Limpia el select de Apartado, manteniendo solo la opción inicial "Mostrar todos"
    selectApartado.innerHTML = '<option value="">-- Mostrar todos --</option>';

    // Si se obtuvieron datos, se procesan y se añaden como opciones al select
    if (data) {
        // Extrae valores únicos de 'apartado' y filtra los que sean nulos o vacíos
        const apartadosUnicos = [...new Set(data.map(item => item.apartado))].filter(Boolean);
        apartadosUnicos.forEach(apartado => {
            const option = document.createElement('option');
            option.value = apartado;
            option.textContent = apartado;
            selectApartado.appendChild(option);
        });
    }
}


// Llama a la función para mostrar la tabla inicialmente sin filtros
mostrarTabla();

// Llama a la función para cargar las opciones del filtro de Apartado cuando la página se carga
cargarOpcionesApartado();


// Agrega un "event listener" al select de CLUES.
// Cada vez que cambia, se obtienen ambos valores de filtro y se recarga la tabla.
selectClues.addEventListener("change", () => {
  const seleccionClues = selectClues.value; // Valor seleccionado en el filtro de CLUES
  const seleccionApartado = selectApartado.value; // Valor actual del filtro de Apartado
  mostrarTabla(seleccionClues, seleccionApartado); // Vuelve a cargar la tabla con ambos filtros
});

// Agrega un "event listener" al select de Apartado.
// Cada vez que cambia, se obtienen ambos valores de filtro y se recarga la tabla.
selectApartado.addEventListener("change", () => {
  const seleccionClues = selectClues.value; // Valor actual del filtro de CLUES
  const seleccionApartado = selectApartado.value; // Valor seleccionado en el filtro de Apartado
  mostrarTabla(seleccionClues, seleccionApartado); // Vuelve a cargar la tabla con ambos filtros
});
