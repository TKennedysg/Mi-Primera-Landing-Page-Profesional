function realizarOperaciones() {
    const n1 = parseFloat(document.getElementById('num1').value);
    const n2 = parseFloat(document.getElementById('num2').value);

    if (isNaN(n1) || isNaN(n2)) {
        alert("Por favor ingrese ambos números.");
        return;
    }

    const operaciones = ["Suma", "Resta", "Multiplicación", "División", "Módulo"];
    let resultadosHTML = "";

    for (let i = 0; i < 5; i++) {
        let resultado;
        switch(i) {
            case 0: resultado = n1 + n2; break;
            case 1: resultado = n1 - n2; break;
            case 2: resultado = n1 * n2; break;
            case 3: resultado = n2 !== 0 ? (n1 / n2) : "Error: División por 0"; break;
            case 4: resultado = n2 !== 0 ? (n1 % n2) : "Error: División por 0"; break;
        }
        resultadosHTML += `<p><strong>${operaciones[i]}:</strong> ${resultado}</p>`;
    }

    document.getElementById('resultados').innerHTML = resultadosHTML;
}