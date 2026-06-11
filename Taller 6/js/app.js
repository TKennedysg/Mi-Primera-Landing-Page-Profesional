"use strict";

const CLAVE_ALMACENAMIENTO = "taller6_estudiantes";

const formulario = document.getElementById("formulario-estudiante");
const cuerpoTabla = document.getElementById("cuerpo-tabla");
const estadoVacio = document.getElementById("estado-vacio");
const totalEstudiantes = document.getElementById("total-estudiantes");
const tituloFormulario = document.getElementById("titulo-formulario");
const botonGuardar = document.getElementById("boton-guardar");
const botonCancelar = document.getElementById("boton-cancelar");
const busqueda = document.getElementById("busqueda");
const notificacion = document.getElementById("notificacion");
const modal = document.getElementById("modal-confirmacion");
const modalCancelar = document.getElementById("modal-cancelar");
const modalEliminar = document.getElementById("modal-eliminar");

const campos = [
    "cedula",
    "apellidos",
    "nombres",
    "direccion",
    "telefono",
    "correo",
    "facultad",
    "nivel",
    "paralelo"
];

const expresiones = {
    cedula: /^\d{10}$/,
    apellidos: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[\s'-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/,
    nombres: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[\s'-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/,
    direccion: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9][A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s.,#°/-]{4,99}$/,
    telefono: /^(?:09\d{8}|0[2-7]\d{7})$/,
    correo: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
    paralelo: /^[A-Za-z]$/
};

const mensajes = {
    cedula: "La cédula debe contener exactamente 10 números.",
    apellidos: "Ingresa apellidos válidos usando solo letras.",
    nombres: "Ingresa nombres válidos usando solo letras.",
    direccion: "La dirección debe contener entre 5 y 100 caracteres válidos.",
    telefono: "Ingresa un teléfono ecuatoriano válido.",
    correo: "Ingresa un correo electrónico válido.",
    facultad: "Selecciona una facultad.",
    nivel: "Selecciona un nivel.",
    paralelo: "El paralelo debe ser una sola letra."
};

let estudiantes = cargarEstudiantes();
let indicePendienteEliminar = null;
let temporizadorNotificacion = null;

function cargarEstudiantes() {
    try {
        const datosJSON = localStorage.getItem(CLAVE_ALMACENAMIENTO);
        const datos = datosJSON ? JSON.parse(datosJSON) : [];
        return Array.isArray(datos) ? datos : [];
    } catch (error) {
        console.error("No se pudieron leer los registros:", error);
        return [];
    }
}

function guardarEstudiantes() {
    const datosJSON = JSON.stringify(estudiantes);
    localStorage.setItem(CLAVE_ALMACENAMIENTO, datosJSON);
}

function obtenerDatosFormulario() {
    const datos = {};

    campos.forEach((campo) => {
        datos[campo] = document.getElementById(campo).value.trim();
    });

    datos.paralelo = datos.paralelo.toUpperCase();
    return datos;
}

function validarCedulaEcuatoriana(cedula) {
    if (!expresiones.cedula.test(cedula)) {
        return false;
    }

    const provincia = Number(cedula.substring(0, 2));
    const tercerDigito = Number(cedula[2]);

    if (provincia < 1 || provincia > 24 || tercerDigito >= 6) {
        return false;
    }

    let suma = 0;

    for (let i = 0; i < 9; i += 1) {
        let valor = Number(cedula[i]);

        if (i % 2 === 0) {
            valor *= 2;
            if (valor > 9) {
                valor -= 9;
            }
        }

        suma += valor;
    }

    const digitoVerificador = (10 - (suma % 10)) % 10;
    return digitoVerificador === Number(cedula[9]);
}

function validarCampo(nombre, valor) {
    if (!valor) {
        mostrarError(nombre, "Este campo es obligatorio.");
        return false;
    }

    if (nombre === "facultad" || nombre === "nivel") {
        limpiarError(nombre);
        return true;
    }

    if (nombre === "cedula" && !validarCedulaEcuatoriana(valor)) {
        mostrarError(nombre, "Ingresa una cédula ecuatoriana válida.");
        return false;
    }

    if (expresiones[nombre] && !expresiones[nombre].test(valor)) {
        mostrarError(nombre, mensajes[nombre]);
        return false;
    }

    limpiarError(nombre);
    return true;
}

function validarFormulario(datos) {
    let formularioValido = true;

    campos.forEach((campo) => {
        if (!validarCampo(campo, datos[campo])) {
            formularioValido = false;
        }
    });

    const indiceEdicion = document.getElementById("indice-edicion").value;
    const cedulaRepetida = estudiantes.some((estudiante, indice) =>
        estudiante.cedula === datos.cedula && String(indice) !== indiceEdicion
    );

    if (cedulaRepetida) {
        mostrarError("cedula", "Ya existe un estudiante registrado con esta cédula.");
        formularioValido = false;
    }

    return formularioValido;
}

function mostrarError(nombre, mensaje) {
    const campo = document.getElementById(nombre);
    const contenedorError = document.getElementById(`error-${nombre}`);

    campo.classList.add("campo-invalido");
    campo.setAttribute("aria-invalid", "true");
    contenedorError.textContent = mensaje;
}

function limpiarError(nombre) {
    const campo = document.getElementById(nombre);
    const contenedorError = document.getElementById(`error-${nombre}`);

    campo.classList.remove("campo-invalido");
    campo.removeAttribute("aria-invalid");
    contenedorError.textContent = "";
}

function limpiarTodosLosErrores() {
    campos.forEach(limpiarError);
}

function escaparHTML(texto) {
    const elemento = document.createElement("div");
    elemento.textContent = texto;
    return elemento.innerHTML;
}

function renderizarEstudiantes(filtro = "") {
    const termino = filtro.trim().toLocaleLowerCase("es");
    const registrosFiltrados = estudiantes
        .map((estudiante, indiceReal) => ({ estudiante, indiceReal }))
        .filter(({ estudiante }) =>
            [
                estudiante.cedula,
                estudiante.apellidos,
                estudiante.nombres,
                estudiante.facultad
            ].some((valor) => valor.toLocaleLowerCase("es").includes(termino))
        );

    cuerpoTabla.innerHTML = "";

    registrosFiltrados.forEach(({ estudiante, indiceReal }) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${escaparHTML(estudiante.cedula)}</td>
            <td>
                <strong>${escaparHTML(estudiante.apellidos)} ${escaparHTML(estudiante.nombres)}</strong>
                <small>${escaparHTML(estudiante.direccion)}</small>
            </td>
            <td>
                <strong>${escaparHTML(estudiante.telefono)}</strong>
                <small>${escaparHTML(estudiante.correo)}</small>
            </td>
            <td>${escaparHTML(estudiante.facultad)}</td>
            <td>${escaparHTML(estudiante.nivel)}</td>
            <td><span class="insignia">${escaparHTML(estudiante.paralelo)}</span></td>
            <td>
                <div class="acciones-tabla">
                    <button class="boton-icono" type="button" data-accion="editar"
                        data-indice="${indiceReal}" aria-label="Editar estudiante">Editar</button>
                    <button class="boton-icono boton-icono--eliminar" type="button"
                        data-accion="eliminar" data-indice="${indiceReal}"
                        aria-label="Eliminar estudiante">Eliminar</button>
                </div>
            </td>
        `;
        cuerpoTabla.appendChild(fila);
    });

    totalEstudiantes.textContent = estudiantes.length;
    const sinResultados = registrosFiltrados.length === 0;
    estadoVacio.classList.toggle("oculto", !sinResultados);

    const tituloVacio = estadoVacio.querySelector("h3");
    const textoVacio = estadoVacio.querySelector("p");

    if (termino && sinResultados) {
        tituloVacio.textContent = "No se encontraron coincidencias";
        textoVacio.textContent = "Prueba con otro nombre, cédula o facultad.";
    } else {
        tituloVacio.textContent = "Aún no hay estudiantes registrados";
        textoVacio.textContent = "Completa el formulario para agregar el primer registro.";
    }
}

function restablecerFormulario() {
    formulario.reset();
    document.getElementById("indice-edicion").value = "";
    tituloFormulario.textContent = "Nuevo estudiante";
    botonGuardar.textContent = "Guardar estudiante";
    botonCancelar.classList.add("oculto");
    limpiarTodosLosErrores();
}

function editarEstudiante(indice) {
    const estudiante = estudiantes[indice];

    campos.forEach((campo) => {
        document.getElementById(campo).value = estudiante[campo];
    });

    document.getElementById("indice-edicion").value = indice;
    tituloFormulario.textContent = "Editar estudiante";
    botonGuardar.textContent = "Actualizar estudiante";
    botonCancelar.classList.remove("oculto");
    limpiarTodosLosErrores();
    document.querySelector(".tarjeta--formulario").scrollIntoView({ behavior: "smooth" });
    document.getElementById("cedula").focus({ preventScroll: true });
}

function abrirConfirmacion(indice) {
    indicePendienteEliminar = indice;
    modal.classList.remove("oculto");
    modalEliminar.focus();
}

function cerrarConfirmacion() {
    indicePendienteEliminar = null;
    modal.classList.add("oculto");
}

function eliminarEstudiante() {
    if (indicePendienteEliminar === null) {
        return;
    }

    const indiceEdicion = document.getElementById("indice-edicion").value;

    estudiantes.splice(indicePendienteEliminar, 1);
    guardarEstudiantes();

    if (indiceEdicion !== "") {
        restablecerFormulario();
    }

    cerrarConfirmacion();
    renderizarEstudiantes(busqueda.value);
    mostrarNotificacion("Estudiante eliminado correctamente.");
}

function mostrarNotificacion(mensaje) {
    clearTimeout(temporizadorNotificacion);
    notificacion.textContent = mensaje;
    notificacion.classList.add("notificacion--visible");

    temporizadorNotificacion = setTimeout(() => {
        notificacion.classList.remove("notificacion--visible");
    }, 2800);
}

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const datos = obtenerDatosFormulario();

    if (!validarFormulario(datos)) {
        document.querySelector(".campo-invalido")?.focus();
        return;
    }

    const indiceEdicion = document.getElementById("indice-edicion").value;

    if (indiceEdicion === "") {
        estudiantes.push(datos);
        mostrarNotificacion("Estudiante registrado correctamente.");
    } else {
        estudiantes[Number(indiceEdicion)] = datos;
        mostrarNotificacion("Estudiante actualizado correctamente.");
    }

    guardarEstudiantes();
    restablecerFormulario();
    busqueda.value = "";
    renderizarEstudiantes();
});

campos.forEach((nombre) => {
    const campo = document.getElementById(nombre);

    campo.addEventListener("blur", () => {
        const valor = campo.value.trim();
        validarCampo(nombre, nombre === "paralelo" ? valor.toUpperCase() : valor);
    });

    campo.addEventListener("input", () => {
        if (nombre === "paralelo") {
            campo.value = campo.value.toUpperCase();
        }

        if (campo.classList.contains("campo-invalido")) {
            validarCampo(nombre, campo.value.trim());
        }
    });
});

cuerpoTabla.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button[data-accion]");

    if (!boton) {
        return;
    }

    const indice = Number(boton.dataset.indice);

    if (boton.dataset.accion === "editar") {
        editarEstudiante(indice);
    } else {
        abrirConfirmacion(indice);
    }
});

busqueda.addEventListener("input", () => renderizarEstudiantes(busqueda.value));
botonCancelar.addEventListener("click", restablecerFormulario);
modalCancelar.addEventListener("click", cerrarConfirmacion);
modalEliminar.addEventListener("click", eliminarEstudiante);

modal.addEventListener("click", (evento) => {
    if (evento.target === modal) {
        cerrarConfirmacion();
    }
});

document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && !modal.classList.contains("oculto")) {
        cerrarConfirmacion();
    }
});

renderizarEstudiantes();
