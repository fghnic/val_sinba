// subir_csv.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://ucpujkiheaxclghkkyvn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjcHVqa2loZWF4Y2xnaGtreXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDMzOTEsImV4cCI6MjA2NTI3OTM5MX0.FGb-g6NBz4wVp6Voh1JYSAmbzPYGIJXqT608-LC3FFA"
);

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

  const reader = new FileReader();
  reader.onload = async (event) => {
    const text = event.target.result;
    const rows = text.trim().split("\n").map((row) => row.split(","));

    const headers = rows[0];
    const required = ["clues", "var", "cant"];
    if (!required.every((h) => headers.includes(h))) {
      mostrarAlerta("El archivo no contiene los encabezados requeridos: clues, var, cant", "danger");
      return;
    }

    const registros = rows.slice(1).map((cols) => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h.trim()] = cols[i]?.trim();
      });
      return obj;
    });

    const { data, error } = await supabase.from("tbl_generales").insert(registros);

    if (error) {
      mostrarAlerta("Error al subir los datos: " + error.message, "danger");
    } else {
      mostrarAlerta("Datos cargados correctamente.", "success");
      form.reset();
    }
  };

  reader.readAsText(file);
});

function mostrarAlerta(mensaje, tipo = "info") {
  statusDiv.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      <i class="bi bi-info-circle-fill me-2"></i> ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    </div>
  `;
}

