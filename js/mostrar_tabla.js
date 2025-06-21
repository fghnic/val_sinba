// mostrar_tabla.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Configura tu cliente Supabase
const supabase = createClient(
  "https://ucpujkiheaxclghkkyvn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjcHVqa2loZWF4Y2xnaGtreXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDMzOTEsImV4cCI6MjA2NTI3OTM5MX0.FGb-g6NBz4wVp6Voh1JYSAmbzPYGIJXqT608-LC3FFA"
);

// Referencias DOM
const tablaContainer = document.getElementById("tabla-container");
const selectClues = document.getElementById("clues-select");
const selectSecc = document.getElementById("secc-select");
const btnLimpiar = document.getElementById("limpiar-filtros");

let tablaRef = null;

async function mostrarTabla(filtroClues = "", filtroSecc = "") {
  tablaContainer.innerHTML = `<div class="alert alert-info">Cargando datos...</div>`;

  let query = supabase.from("tbl_generales").select(`
    clues,
    var,
    cant,
    tbl_indice:var (
      desc_plat,
      secc,
      apartado,
      origen
    )
  `);

  if (filtroClues) query = query.eq("clues", filtroClues);
  if (filtroSecc) query = query.eq("tbl_indice.secc", filtroSecc);

  const { data, error } = await query;

  if (error) {
    tablaContainer.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    return;
  }

  if (!data || data.length === 0) {
    tablaContainer.innerHTML = `<div class="alert alert-warning">No se encontraron datos.</div>`;
    return;
  }

  // Obtener valores únicos para los filtros dinámicos
  const secciones = [...new Set(data.map(row => row.tbl_indice?.secc).filter(Boolean))];
  const cluesUnicos = [...new Set(data.map(row => row.clues))];

  // Cargar dinámicamente los selectores si están vacíos
  if (selectSecc.children.length <= 1) {
    secciones.forEach(secc => {
      const option = document.createElement("option");
      option.value = secc;
      option.textContent = secc;
      selectSecc.appendChild(option);
    });
  }

  if (selectClues.children.length <= 1) {
    cluesUnicos.forEach(clues => {
      const option = document.createElement("option");
      option.value = clues;
      option.textContent = clues;
      selectClues.appendChild(option);
    });
  }

  let tablaHTML = `
    <table id="mi-tabla" class="table table-striped table-bordered table-hover rounded-2 w-100">
      <thead>
        <tr>
          <th>CLUES</th>
          <th>Variable</th>
          <th>Descripción</th>
          <th>Cantidad</th>
          <th>Sección</th>
          <th>Apartado</th>
          <th>Origen</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach(row => {
    tablaHTML += `
      <tr>
        <td>${row.clues || "—"}</td>
        <td>${row.var || "—"}</td>
        <td>${row.tbl_indice?.desc_plat || "—"}</td>
        <td>${row.cant || "—"}</td>
        <td>${row.tbl_indice?.secc || "—"}</td>
        <td>${row.tbl_indice?.apartado || "—"}</td>
        <td>${row.tbl_indice?.origen || "—"}</td>
      </tr>
    `;
  });

  tablaHTML += `</tbody></table>`;
  tablaContainer.innerHTML = tablaHTML;

  if (tablaRef) {
    tablaRef.destroy();
  }
  tablaRef = new DataTable("#mi-tabla", {
    language: {
      url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-MX.json"
    },
    pageLength: 10,
    lengthChange: true,
    ordering: true,
    responsive: true
  });
}

// Eventos de filtros
selectClues.addEventListener("change", () => {
  mostrarTabla(selectClues.value, selectSecc.value);
});

selectSecc.addEventListener("change", () => {
  mostrarTabla(selectClues.value, selectSecc.value);
});

btnLimpiar.addEventListener("click", () => {
  selectClues.value = "";
  selectSecc.value = "";
  mostrarTabla();
});

// Cargar tabla al iniciar
mostrarTabla();
