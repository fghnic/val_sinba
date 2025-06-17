const SUPABASE_URL = "https://ucpujkiheaxclghkkyvn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjcHVqa2loZWF4Y2xnaGtreXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDMzOTEsImV4cCI6MjA2NTI3OTM5MX0.FGb-g6NBz4wVp6Voh1JYSAmbzPYGIJXqT608-LC3FFA";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Cargar CSV y guardar en Supabase
async function cargarCSV() {
  const archivo = document.getElementById('csvFileInput').files[0];
  if (!archivo) {
    alert("Selecciona un archivo CSV primero.");
    return;
  }

  const texto = await archivo.text();
  const lineas = texto.split('\n').map(l => l.trim()).filter(Boolean);
  const registros = lineas.slice(1).map(linea => {
    const valores = linea.split(',');
    return {
      id_generales: valores[0],
      clues: valores[1],
      var: valores[2],
      cant: parseInt(valores[3]),
      mes: parseInt(valores[4]),
      axo: parseInt(valores[5])
    };
  });

  const { error } = await supabase.from('tbl_generales').insert(registros);
  if (error) {
    console.error(error);
    alert("Error al subir: " + error.message);
  } else {
    alert("Archivo CSV subido correctamente.");
    mostrarDatos(); // Mostrar datos tras la carga
  }
}

// Mostrar tabla con datos existentes
async function mostrarDatos() {
  const { data, error } = await supabase
    .from('tbl_generales')
    .select('*')
    .order('axo', { ascending: false });

  if (error) {
    console.error(error);
    alert("Error al consultar datos.");
    return;
  }

  const tbody = document.querySelector('#tablaDatos tbody');
  tbody.innerHTML = ''; // Limpiar antes

  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.id_generales}</td>
      <td>${row.clues}</td>
      <td>${row.var}</td>
      <td>${row.cant}</td>
      <td>${row.mes}</td>
      <td>${row.axo}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Mostrar datos al cargar la página
mostrarDatos();

async function filtrarDatos() {
  const clues = document.getElementById('filtroClues').value.trim();
  const mes = document.getElementById('filtroMes').value.trim();
  const axo = document.getElementById('filtroAxo').value.trim();

  let query = supabase.from('tbl_generales').select('*');

  if (clues) query = query.ilike('clues', `%${clues}%`);
  if (mes) query = query.eq('mes', parseInt(mes));
  if (axo) query = query.eq('axo', parseInt(axo));

  const { data, error } = await query.order('axo', { ascending: false });

  if (error) {
    console.error(error);
    alert("Error al aplicar filtros.");
    return;
  }

  const tbody = document.querySelector('#tablaDatos tbody');
  tbody.innerHTML = '';

  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.id_generales}</td>
      <td>${row.clues}</td>
      <td>${row.var}</td>
      <td>${row.cant}</td>
      <td>${row.mes}</td>
      <td>${row.axo}</td>
    `;
    tbody.appendChild(tr);
  });
}
