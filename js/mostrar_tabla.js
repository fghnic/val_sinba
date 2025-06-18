import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const SUPABASE_URL = 'https://ucpujkiheaxclghkkyvn.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjcHVqa2loZWF4Y2xnaGtreXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDMzOTEsImV4cCI6MjA2NTI3OTM5MX0.FGb-g6NBz4wVp6Voh1JYSAmbzPYGIJXqT608-LC3FFA'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function cargarDatos() {
  const { data, error } = await supabase
    .from('tbl_generales')
    .select('*')

  const contenedor = document.getElementById('tabla-container')

  if (error) {
    contenedor.innerHTML = `<p style="color: red;">Error al cargar datos: ${error.message}</p>`
    return
  }

  if (!data || data.length === 0) {
    contenedor.innerHTML = '<p>No hay registros disponibles.</p>'
    return
  }

  const headers = Object.keys(data[0])
  let tabla = '<table><thead><tr>'
  headers.forEach(h => tabla += `<th>${h}</th>`)
  tabla += '</tr></thead><tbody>'

  data.forEach(fila => {
    tabla += '<tr>'
    headers.forEach(h => tabla += `<td>${fila[h] ?? ''}</td>`)
    tabla += '</tr>'
  })

  tabla += '</tbody></table>'
  contenedor.innerHTML = tabla
}

cargarDatos()
