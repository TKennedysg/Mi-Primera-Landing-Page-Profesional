document.getElementById('registroForm').addEventListener('submit', function(e) {
    
    e.preventDefault();

    document.querySelectorAll('.error').forEach(function(el) {
        el.innerText = '';
    });

    let esValido = true;

    const nombre = document.getElementById('nombre').value;

    const regexNombre = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ ]+$/;

    if (!regexNombre.test(nombre)) {
        document.getElementById('errorNombre').innerText = 
            "El nombre solo debe contener letras.";
        esValido = false;

    const email = document.getElementById('email').value;

    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!regexEmail.test(email)) {
        document.getElementById('errorEmail').innerText = 
            "Ingrese un correo electrónico válido.";
        esValido = false;
    }

    const pass = document.getElementById('password').value;

    const regexPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!regexPass.test(pass)) {
        document.getElementById('errorPass').innerText = 
            "La contraseña debe tener 8 caracteres, una mayúscula y un número.";
        esValido = false;
    }

    if (esValido) {
        alert("¡Formulario enviado con éxito!");
        this.reset();
    }
});