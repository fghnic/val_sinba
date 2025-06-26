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






