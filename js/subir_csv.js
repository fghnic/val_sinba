import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://ucpujkiheaxclghkkyvn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjcHVqa2loZWF4Y2xnaGtreXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDMzOTEsImV4cCI6MjA2NTI3OTM5MX0.FGb-g6NBz4wVp6Voh1JYSAmbzPYGIJXqT608-LC3FFA";
const supabase = createClient(supabaseUrl, supabaseKey);

document.getElementById("csv-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const fileInput = document.getElementById("csv-file");
  const file = fileInput.files[0];

  if (!file) return;

  const statusDiv = document.getElementById("upload-status");
  statusDiv.textContent = "Procesando archivo...";

  const reader = new FileReader();
  reader.onload = async function (e) {
    const lines = e.target.result.split("\n").filter(line => line.trim() !== "");
    const headers = lines[0].split(",").map(h => h.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim());
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || null;
      });
      return row;
    });

    let errores = 0;
    for (const row of data) {
      const { error } = await supabase.from("tbl_generales").insert(row);
      if (error) errores++;
    }

    if (errores === 0) {
      statusDiv.textContent = "Archivo cargado correctamente.";
    } else {
      statusDiv.textContent = Carga terminada con ${errores} error(es).;
    }
  };

  reader.readAsText(file);
});

