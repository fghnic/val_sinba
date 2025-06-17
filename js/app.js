// Reemplaza con tus datos reales de Supabase
const SUPABASE_URL = "https://ucpujkiheaxclghkkyvn.supabase.co";
const SUPABASE_KEY = "TeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjcHVqa2loZWF4Y2xnaGtreXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDMzOTEsImV4cCI6MjA2NTI3OTM5MX0.FGb-g6NBz4wVp6Voh1JYSAmbzPYGIJXqT608-LC3FFA";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.getElementById('formGenerales').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  const nuevoRegistro = {
    id_generales: formData.get('id_generales'),
    clues: formData.get('clues'),
    var: formData.get('var'),
    cant: parseInt(formData.get('cant')),
    mes: parseInt(formData.get('mes')),
    axo: parseInt(formData.get('axo'))
  };

  const { error } = await supabase.from('tbl_generales').insert([nuevoRegistro]);
  if (error) {
    alert("Error al guardar: " + error.message);
  } else {
    alert("Registro guardado correctamente");
    e.target.reset();
  }
});

async function cargarSelects() {
  const { data: clues } = await supabase.from('tbl_clues').select('clues, nombre');
  const { data: vars } = await supabase.from('tbl_indice').select('id_var, desc_plat');

  const selectClues = document.getElementById('selectClues');
  clues.forEach(c => {
    let option = document.createElement('option');
    option.value = c.clues;
    option.textContent = `${c.clues} - ${c.nombre}`;
    selectClues.appendChild(option);
  });

  const selectVar = document.getElementById('selectVar');
  vars.forEach(v => {
    let option = document.createElement('option');
    option.value = v.id_var;
    option.textContent = `${v.id_var} - ${v.desc_plat}`;
    selectVar.appendChild(option);
  });
}
