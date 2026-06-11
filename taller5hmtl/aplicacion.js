const formularioTareas = document.getElementById('formulario-tareas');
const tituloTarea = document.getElementById('titulo-tarea');
const descripcionTarea = document.getElementById('descripcion-tarea');
const listaTareas = document.getElementById('lista-tareas');
const btnExportarJson = document.getElementById('btn-exportar-json');
const btnExportarXml = document.getElementById('btn-exportar-xml');D

let coleccionTareas = JSON.parse(localStorage.getItem('tareasGuardadas')) || [];

function redibujarInterfaz() {
  listaTareas.innerHTML = '';

  if (coleccionTareas.length === 0) {
    listaTareas.innerHTML = `
      <li class="mensaje-vacio">
        No existen tareas registradas todavía.
      </li>
    `;
    return;
  }

  coleccionTareas.forEach((tarea, indice) => {
    const elementoLista = document.createElement('li');
    elementoLista.className = 'elemento-tarea';

    elementoLista.innerHTML = `
      <div>
        <h3>${tarea.titulo}</h3>
        <p>${tarea.descripcion}</p>
        <small>Código: ${tarea.codigo} | Registro: ${tarea.fecha}</small>
      </div>

      <button class="btn-eliminar" onclick="removerTarea(${indice})">
        Eliminar
      </button>
    `;

    listaTareas.appendChild(elementoLista);
  });
}

function actualizarAlmacenamientoLocal() {
  localStorage.setItem('tareasGuardadas', JSON.stringify(coleccionTareas));
}

formularioTareas.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const tituloIngresado = tituloTarea.value.trim();
  const descripcionIngresada = descripcionTarea.value.trim();

  if (tituloIngresado === '' || descripcionIngresada === '') {
    alert('Por favor, complete todos los campos.');
    return;
  }

  const nuevaTarea = {
    codigo: Date.now().toString(),
    titulo: tituloIngresado,
    descripcion: descripcionIngresada,
    fecha: new Date().toLocaleDateString()
  };

  coleccionTareas.push(nuevaTarea);

  actualizarAlmacenamientoLocal();
  redibujarInterfaz();

  formularioTareas.reset();
});

window.removerTarea = function(indice) {
  const confirmarEliminacion = confirm('¿Seguro que desea eliminar esta tarea?');

  if (!confirmarEliminacion) {
    return;
  }

  coleccionTareas.splice(indice, 1);
  actualizarAlmacenamientoLocal();
  redibujarInterfaz();
};

btnExportarJson.addEventListener('click', () => {
  if (coleccionTareas.length === 0) {
    alert('No existen tareas para exportar.');
    return;
  }

  const textoJson = JSON.stringify(coleccionTareas, null, 2);

  console.log('--- FLUJO DE DATOS: JSON GENERADO ---');
  console.log(textoJson);

  generarDescarga(
    textoJson,
    'tareas_academicas.json',
    'application/json'
  );
});

btnExportarXml.addEventListener('click', () => {
  if (coleccionTareas.length === 0) {
    alert('No existen tareas para exportar.');
    return;
  }

  let textoXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  textoXml += `<tareas>\n`;

  coleccionTareas.forEach((tarea) => {
    textoXml += `  <tarea codigo="${tarea.codigo}">\n`;
    textoXml += `    <titulo>${sanitizarTextoXml(tarea.titulo)}</titulo>\n`;
    textoXml += `    <descripcion>${sanitizarTextoXml(tarea.descripcion)}</descripcion>\n`;
    textoXml += `    <fecha>${tarea.fecha}</fecha>\n`;
    textoXml += `  </tarea>\n`;
  });

  textoXml += `</tareas>`;

  console.log('--- FLUJO DE DATOS: XML GENERADO ---');
  console.log(textoXml);

  generarDescarga(
    textoXml,
    'tareas_academicas.xml',
    'application/xml'
  );
});

function generarDescarga(contenidoTexto, nombreArchivo, tipoMime) {
  const bloqueDatos = new Blob([contenidoTexto], { type: tipoMime });
  const urlDescarga = URL.createObjectURL(bloqueDatos);

  const enlaceDescarga = document.createElement('a');
  enlaceDescarga.href = urlDescarga;
  enlaceDescarga.download = nombreArchivo;

  document.body.appendChild(enlaceDescarga);
  enlaceDescarga.click();
  document.body.removeChild(enlaceDescarga);

  URL.revokeObjectURL(urlDescarga);
}

function sanitizarTextoXml(textoInseguro) {
  return textoInseguro.replace(/[<>&'"]/g, (caracter) => {
    switch (caracter) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return caracter;
    }
  });
}