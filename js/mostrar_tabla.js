import { supabase } from "./supabase_config.js";

const tablaContainer = document.getElementById("tabla-container");
const selectClues = document.getElementById("clues-select");
const selectOrigen = document.getElementById("origen-select");
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

  const options = `<option value="">-- Selecciona CLUES --</option>` +
    data.map(d => `<option value="${d.clues}">${d.clues} - ${d.nombre}</option>`).join("");

  selectClues.innerHTML = options;

  // También llenar select para subir CSV
  const cluesUpload = document.getElementById("clues-select-upload");
  if (cluesUpload) cluesUpload.innerHTML = options;
}

// Cargar orígenes únicos desde tbl_indice
async function cargarOrigenes() {
  const { data, error } = await supabase
    .from("tbl_indice")
    .select("origen", { count: "exact" })
    .range(0, 4999);

  if (error) {
    console.error("Error orígenes:", error.message);
    return;
  }

  // Extraer orígenes únicos y no vacíos
  const unicos = [...new Set(data.map(d => d.origen).filter(o => o && o.trim() !== ""))];

  selectOrigen.innerHTML = `<option value="">-- Selecciona Origen --</option>` +
    unicos.map(o => `<option value="${o}">${o}</option>`).join("");
}

// Mostrar tabla filtrando por clues y origen
async function mostrarTabla() {
  const clues = selectClues.value;
  const origen = selectOrigen.value;

  if (!clues || !origen) {
    tablaContainer.innerHTML = `<div class="alert alert-info"><i class="bi bi-info-circle me-1"></i> Por favor, selecciona un CLUES y un Origen para mostrar datos.</div>`;
    return;
  }

  tablaContainer.innerHTML = `<div class="alert alert-info"><i class="bi bi-hourglass-split me-1"></i> Cargando datos...</div>`;

  let query = supabase
    .from("tbl_generales")
    .select(`
      var, cant,
      tbl_indice:var (
        desc_plat, secc, apartado, origen
      )
    `, { count: "exact" })
    .eq("clues", clues)
    .range(0, 4999);

  const { data, error } = await query;

  if (error) {
    tablaContainer.innerHTML = `<div class="alert alert-danger">Error al cargar datos: ${error.message}</div>`;
    return;
  }

  if (!data.length) {
    tablaContainer.innerHTML = `<div class="alert alert-warning">No se encontraron registros.</div>`;
    return;
  }

  // Filtrar por origen en cliente
  const filtrados = data.filter(r => r.tbl_indice?.origen === origen);

  if (!filtrados.length) {
    tablaContainer.innerHTML = `<div class="alert alert-warning">No se encontraron registros para este origen.</div>`;
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
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${filtrados.map((r) => `
          <tr data-var="${r.var}">
            <td>${r.var || '—'}</td>
            <td>${r.tbl_indice?.desc_plat || '—'}</td>
            <td>
              <span class="cant-text">${r.cant || '0'}</span>
              <input type="number" class="form-control form-control-sm cant-input d-none" value="${r.cant || 0}" min="0" style="max-width: 80px;" />
            </td>
            <td>${r.tbl_indice?.secc || '—'}</td>
            <td>${r.tbl_indice?.apartado || '—'}</td>
            <td>${r.tbl_indice?.origen || '—'}</td>
            <td>
              <button class="btn btn-sm btn-outline-primary btn-editar">Editar</button>
              <button class="btn btn-sm btn-outline-success btn-guardar d-none">Guardar</button>
              <button class="btn btn-sm btn-outline-secondary btn-cancelar d-none">Cancelar</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  tablaContainer.innerHTML = tablaHTML;

  setTimeout(() => {
    if ($.fn.DataTable.isDataTable('#tabla-supabase')) {
      $('#tabla-supabase').DataTable().destroy();
    }
    $('#tabla-supabase').DataTable({
      pageLength: 10,
      lengthMenu: [10, 25, 50, 100],
      language: {
        url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-MX.json"
      }
    });

    // Agregar eventos a los botones de la tabla
    agregarEventosBotones();
  }, 100);
}

// Función para manejar eventos de botones editar, guardar y cancelar
function agregarEventosBotones() {
  $('#tabla-supabase tbody').off('click').on('click', 'button', async function () {
    const $btn = $(this);
    const $tr = $btn.closest('tr');
    const varId = $tr.data('var');
    const $cantText = $tr.find('.cant-text');
    const $cantInput = $tr.find('.cant-input');
    const $btnEditar = $tr.find('.btn-editar');
    const $btnGuardar = $tr.find('.btn-guardar');
    const $btnCancelar = $tr.find('.btn-cancelar');

    if ($btn.hasClass('btn-editar')) {
      // Entrar modo edición
      $cantText.addClass('d-none');
      $cantInput.removeClass('d-none');
      $btnEditar.addClass('d-none');
      $btnGuardar.removeClass('d-none');
      $btnCancelar.removeClass('d-none');
    } else if ($btn.hasClass('btn-cancelar')) {
      // Cancelar edición
      $cantInput.val($cantText.text());
      $cantText.removeClass('d-none');
      $cantInput.addClass('d-none');
      $btnEditar.removeClass('d-none');
      $btnGuardar.addClass('d-none');
      $btnCancelar.addClass('d-none');
    } else if ($btn.hasClass('btn-guardar')) {
      // Guardar cambio
      const nuevoCant = Number($cantInput.val());
      if (isNaN(nuevoCant) || nuevoCant < 0) {
        alert('Por favor ingresa una cantidad válida (número mayor o igual a 0).');
        return;
      }

      // Deshabilitar botones para evitar múltiples clicks
      $btnGuardar.prop('disabled', true);
      $btnCancelar.prop('disabled', true);

      // Actualizar en Supabase
      const { error } = await supabase
        .from('tbl_generales')
        .update({ cant: nuevoCant })
        .eq('clues', selectClues.value)
        .eq('var', varId);

      if (error) {
        alert('Error al actualizar: ' + error.message);
        $btnGuardar.prop('disabled', false);
        $btnCancelar.prop('disabled', false);
        return;
      }

      // Actualización exitosa, recargar tabla para reflejar cambios
      mostrarTabla();
    }
  });
}

// Eventos
selectClues.addEventListener("change", mostrarTabla);
selectOrigen.addEventListener("change", mostrarTabla);
btnLimpiar.addEventListener("click", () => {
  selectClues.value = "";
  selectOrigen.value = "";
  mostrarTabla();
});

// Inicialización
cargarClues();
cargarOrigenes();
mostrarTabla();









