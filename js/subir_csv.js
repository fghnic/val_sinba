import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Configuración Supabase
const supabase = createClient(
  "https://ucpujkiheaxclghkkyvn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjcHVqa2loZWF4Y2xnaGtreXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDMzOTEsImV4cCI6MjA2NTI3OTM5MX0.FGb-g6NBz4wVp6Voh1JYSAmbzPYGIJXqT608-LC3FFA"
);

// Referencias al DOM
const form = document.getElementById("csv-form");
const fileInput = document.getElementById("csv-file");
const statusDiv = document.getElementById("upload-status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = fileInput.files[0];
  if (!file) {
    mostrarAlerta("Por favor selecciona un archivo CSV válido.", "warning");
    return;
  }

  mostrarAlerta("Procesando archivo CSV...", "info");

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: async function (results) {
      const required = ["clues", "var", "cant"];
      const headers = results.meta.fields;

      // Verificar encabezados requeridos
      if (!required.every(h => headers.includes(h))) {
        mostrarAlerta(`El archivo debe contener los encabezados: ${required.join(", ")}`, "danger");
        console.warn("Encabezados recibidos:", headers);
        return;
      }

      // Filtrar registros válidos
      const registros = results.data.filter(row =>
        required.every(h => row[h] !== undefined && row[h].trim() !== "")
      );

      if (registros.length === 0) {
        mostrarAlerta("No se encontraron registros válidos para subir.", "warning");
        return;
      }

      console.log(`Total de registros a subir: ${registros.length}`);

      try {
        const batchSize = 500;

        for (let i = 0; i < registros.length; i += batchSize) {
          const lote = registros.slice(i, i + batchSize);
          const { error } = await supabase.from("tbl_generales").insert(lote);

          if (error) {
            console.error("Error en lote:", error);
            mostrarAlerta(`Error al subir datos: ${error.message}`, "danger");
            return;
          }
        }

        mostrarAlerta(`✅ Se cargaron ${registros.length} registros correctamente.`, "success");
        form.reset();
      } catch (err) {
        console.error("Error inesperado:", err);
        mostrarAlerta("Error inesperado: " + err.message, "danger");
      }
    },
    error: function (err) {
      console.error("Error al leer el archivo:", err);
      mostrarAlerta("Error leyendo el archivo: " + err.message, "danger");
    }
  });
});

// Función para mostrar mensajes
function mostrarAlerta(mensaje, tipo = "info") {
  statusDiv.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show mt-2" role="alert">
      <i class="bi bi-info-circle-fill me-2"></i> ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    </div>
  `;
}
