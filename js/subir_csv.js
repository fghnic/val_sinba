import { supabase } from "./supabase_config.js";

const form = document.getElementById("csv-form");
const fileInput = document.getElementById("csv-file");
const statusDiv = document.getElementById("upload-status");
const cluesSelectUpload = document.getElementById("clues-select-upload");
const btnUpload = document.getElementById("btn-upload");

const FILAS_ESPERADAS = 1760;
const AXO_ESPERADO = 2025;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = fileInput.files[0];
  const clues = cluesSelectUpload.value;

  if (!clues) {
    mostrarAlerta("Por favor selecciona un CLUES antes de subir.", "warning");
    return;
  }

  if (!file) {
    mostrarAlerta("Por favor selecciona un archivo CSV válido.", "warning");
    return;
  }

  mostrarAlerta("Verificando datos existentes...", "info");

  // Verificar si ya hay datos para la CLUES
  const { data: existentes, error: errCheck } = await supabase
    .from('tbl_generales')
    .select('id_generales')
    .eq('clues', clues)
    .limit(1);

  if (errCheck) {
    mostrarAlerta(`Error al verificar datos existentes: ${errCheck.message}`, 'danger');
    return;
  }

  if (existentes.length > 0) {
    mostrarAlerta(`Ya existen datos cargados para la CLUES ${clues}. No se permite subir duplicados.`, 'warning');
    return;
  }

  mostrarAlerta("Procesando archivo CSV...", "info");

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: async function (results) {
      const required = ["clues", "var", "cant", "mes", "axo"];
      const headers = results.meta.fields;

      if (!required.every(h => headers.includes(h))) {
        mostrarAlerta(`El archivo debe contener los encabezados: ${required.join(", ")}`, "danger");
        return;
      }

      // Validar que todos los registros tengan el mismo clues que el seleccionado
      const csvCluesSet = new Set(results.data.map(row => (row.clues || "").toUpperCase().trim()));
      if (csvCluesSet.size !== 1 || !csvCluesSet.has(clues.toUpperCase())) {
        mostrarAlerta(`El archivo CSV contiene datos de CLUES diferente a "${clues}". Por favor verifica.`, "danger");
        return;
      }

      // Validar filas con campos requeridos y validaciones específicas
      const registros = results.data.filter((row, index) => {
        // Validar campos no vacíos
        const camposLlenos = required.every(h => row[h] !== undefined && row[h].toString().trim() !== "");
        if (!camposLlenos) {
          mostrarAlerta(`Fila ${index + 2} tiene campos vacíos.`, "danger");
          return false;
        }

        // Validar mes
        const mesNum = Number(row.mes);
        if (!(mesNum >= 1 && mesNum <= 12)) {
          mostrarAlerta(`Fila ${index + 2}: mes inválido (${row.mes}). Debe ser entre 1 y 12.`, "danger");
          return false;
        }

        // Validar axo exacto
        const axoNum = Number(row.axo);
        if (axoNum !== AXO_ESPERADO) {
          mostrarAlerta(`Fila ${index + 2}: año inválido (${row.axo}). Solo se permite ${AXO_ESPERADO}.`, "danger");
          return false;
        }

        return true;
      });

      if (registros.length !== FILAS_ESPERADAS) {
        mostrarAlerta(`El archivo debe contener exactamente ${FILAS_ESPERADAS} filas válidas. Se encontraron ${registros.length}.`, "danger");
        return;
      }

      try {
        const batchSize = 500;

        for (let i = 0; i < registros.length; i += batchSize) {
          const lote = registros.slice(i, i + batchSize);
          const { error } = await supabase.from("tbl_generales").upsert(lote);

          if (error) {
            mostrarAlerta(`Error al subir datos: ${error.message}`, "danger");
            return;
          }
        }

        mostrarAlerta(`✅ Se cargaron ${registros.length} registros correctamente.`, "success");
        form.reset();
        btnUpload.disabled = true;

        // Refrescar tabla si filtros están seleccionados
        const event = new Event('change');
        document.getElementById("clues-select").dispatchEvent(event);
        document.getElementById("secc-select").dispatchEvent(event);

      } catch (err) {
        mostrarAlerta("Error inesperado: " + err.message, "danger");
      }
    },
    error: function (err) {
      mostrarAlerta("Error leyendo el archivo: " + err.message, "danger");
    }
  });
});

function mostrarAlerta(mensaje, tipo = "info") {
  const iconos = {
    info: "bi-info-circle-fill",
    success: "bi-check-circle-fill",
    warning: "bi-exclamation-triangle-fill",
    danger: "bi-x-circle-fill"
  };
  const icono = iconos[tipo] || iconos.info;

  statusDiv.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show mt-2" role="alert">
      <i class="bi ${icono} me-2"></i> ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    </div>
  `;
}

// Habilitar botón subir solo si se selecciona CLUES
cluesSelectUpload.addEventListener("change", () => {
  btnUpload.disabled = !cluesSelectUpload.value;
});





