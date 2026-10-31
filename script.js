
const TOTAL_RELOGIOS = 4;
const ANGULO_POR_NUMERO = 360 / 10;
const CENTRO = 100;
const RAIO_NUMEROS = 72;
const RAIO_PONTEIRO = 57;

// Os sentidos alternam: horário, anti-horário, horário, anti-horário.
const sentidos = [-1, 1, -1, 1];

// Começamos um pouco depois do zero para mostrar 0000.
let angulos = [2, 2, 2, 2];

const elementoRelogios = document.getElementById("relogios");
const elementoLeitura = document.getElementById("leitura");
const elementoMensagem = document.getElementById("mensagem");
const btnReiniciar = document.getElementById("btnReiniciar");
const btnExemplo = document.getElementById("btnExemplo");

// Converte graus em coordenadas do SVG.
function coordenadas(angulo, raio) {
    const radianos = (angulo * Math.PI) / 180;

    return {
        x: CENTRO + raio * Math.cos(radianos),
        y: CENTRO + raio * Math.sin(radianos)
    };
}

// Calcula a posição visual de um número no mostrador.
function anguloDoNumero(numero, sentido) {
    return -90 + sentido * numero * ANGULO_POR_NUMERO;
}

// Cria um relógio com números, círculo e ponteiro.
function criarRelogio(indice) {
    const sentido = sentidos[indice];

    const container = document.createElement("div");
    container.className = "relogio-container";

    const titulo = document.createElement("h3");
    titulo.textContent = `Relógio ${indice + 1}`;

    const svg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
    );

    svg.setAttribute("viewBox", "0 0 200 200");
    svg.setAttribute("class", "relogio");
    svg.setAttribute("role", "slider");
    svg.setAttribute("tabindex", "0");
    svg.setAttribute("aria-label", `Ponteiro do relógio ${indice + 1}`);
    svg.setAttribute("aria-valuemin", "0");
    svg.setAttribute("aria-valuemax", "9");

    // Fundo do mostrador.
    const circulo = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
    );

    circulo.setAttribute("cx", CENTRO);
    circulo.setAttribute("cy", CENTRO);
    circulo.setAttribute("r", "88");
    circulo.setAttribute("fill", "#ffffff");
    circulo.setAttribute("stroke", "#cbd5e1");
    circulo.setAttribute("stroke-width", "2");

    svg.appendChild(circulo);

    // Marca o sentido da rotação.
    const sentidoTexto = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
    );

    sentidoTexto.setAttribute("x", CENTRO);
    sentidoTexto.setAttribute("y", "19");
    sentidoTexto.setAttribute("text-anchor", "middle");
    sentidoTexto.setAttribute("font-size", "10");
    sentidoTexto.setAttribute("fill", "#64748b");
    sentidoTexto.textContent = sentido === 1 ? "↻" : "↺";

    svg.appendChild(sentidoTexto);

    // Desenha os números de 0 a 9.
    for (let numero = 0; numero < 10; numero++) {
        const ponto = coordenadas(
            anguloDoNumero(numero, sentido),
            RAIO_NUMEROS
        );

        const texto = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );

        texto.setAttribute("x", ponto.x);
        texto.setAttribute("y", ponto.y + 5);
        texto.setAttribute("text-anchor", "middle");
        texto.setAttribute("font-size", "17");
        texto.setAttribute("font-weight", "bold");
        texto.setAttribute("fill", "#334155");
        texto.textContent = numero;

        svg.appendChild(texto);
    }

    // Ponteiro.
    const ponteiro = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
    );

    ponteiro.setAttribute("x1", CENTRO);
    ponteiro.setAttribute("y1", CENTRO);
    ponteiro.setAttribute("x2", CENTRO);
    ponteiro.setAttribute("y2", CENTRO - RAIO_PONTEIRO);
    ponteiro.setAttribute("stroke", "#0f766e");
    ponteiro.setAttribute("stroke-width", "4");
    ponteiro.setAttribute("stroke-linecap", "round");

    svg.appendChild(ponteiro);

    // Centro do ponteiro.
    const pino = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
    );

    pino.setAttribute("cx", CENTRO);
    pino.setAttribute("cy", CENTRO);
    pino.setAttribute("r", "6");
    pino.setAttribute("fill", "#0f766e");

    svg.appendChild(pino);

    // Valor exibido abaixo de cada relógio.
    const valor = document.createElement("div");
    valor.className = "valor-ponteiro";
    valor.textContent = "0";

    container.appendChild(titulo);
    container.appendChild(svg);
    container.appendChild(valor);
    elementoRelogios.appendChild(container);

    // Permite arrastar o ponteiro com mouse ou toque.
    function moverPonteiro(evento) {
        const caixa = svg.getBoundingClientRect();

        // Converte a posição do toque para o sistema de coordenadas do SVG.
        const x = ((evento.clientX - caixa.left) / caixa.width) * 200;
        const y = ((evento.clientY - caixa.top) / caixa.height) * 200;

        const dx = x - CENTRO;
        const dy = y - CENTRO;

        // Ignora movimentos muito próximos do centro.
        if (Math.hypot(dx, dy) < 15) return;

        const anguloVisual =
            (Math.atan2(dy, dx) * 180) / Math.PI;

        // Zero fica no topo do relógio.
        const deslocamento = (anguloVisual + 90 + 360) % 360;

        angulos[indice] =
            sentido === 1
                ? deslocamento
                : (360 - deslocamento) % 360;

        atualizar();
    }

    svg.addEventListener("pointerdown", (evento) => {
        evento.preventDefault();
        svg.setPointerCapture(evento.pointerId);
        moverPonteiro(evento);
    });

    svg.addEventListener("pointermove", (evento) => {
        if (evento.buttons !== 0 || evento.pressure > 0) {
            if (svg.hasPointerCapture(evento.pointerId)) {
                moverPonteiro(evento);
            }
        }
    });

    // Também permite pequenos ajustes pelo teclado.
    svg.addEventListener("keydown", (evento) => {
        if (evento.key === "ArrowRight" || evento.key === "ArrowUp") {
            evento.preventDefault();
            angulos[indice] = (angulos[indice] + 3) % 360;
            atualizar();
        }

        if (evento.key === "ArrowLeft" || evento.key === "ArrowDown") {
            evento.preventDefault();
            angulos[indice] = (angulos[indice] - 3 + 360) % 360;
            atualizar();
        }
    });

    return { ponteiro, valor, svg };
}

// Cria os quatro relógios.
const relogios = [];

for (let i = 0; i < TOTAL_RELOGIOS; i++) {
    relogios.push(criarRelogio(i));
}

// Descobre o algarismo indicado pelo ponteiro.
function obterDigito(indice) {
    const progresso = angulos[indice] / ANGULO_POR_NUMERO;
    let digito = Math.floor(progresso);

    // Quando está exatamente sobre um número, usamos o relógio
    // à direita para desempatar, se ele ainda não passou do zero.
    const fracao = progresso - Math.floor(progresso);
    const estaSobreNumero =
        fracao < 0.015 || fracao > 0.985;

    if (estaSobreNumero && indice < TOTAL_RELOGIOS - 1) {
        const progressoDireita = angulos[indice + 1];

        if (progressoDireita < 2) {
            digito = (digito + 9) % 10;
        }
    }

    return digito;
}

// Atualiza os ponteiros, os algarismos e a leitura completa.
function atualizar() {
    const digitos = [];

    relogios.forEach((relogio, indice) => {
        const sentido = sentidos[indice];

        // O ponteiro parte do topo e acompanha o sentido do relógio.
        const anguloVisual = -90 + sentido * angulos[indice];
        const ponto = coordenadas(anguloVisual, RAIO_PONTEIRO);

        relogio.ponteiro.setAttribute("x2", ponto.x);
        relogio.ponteiro.setAttribute("y2", ponto.y);

        const digito = obterDigito(indice);

        relogio.valor.textContent = digito;
        relogio.svg.setAttribute("aria-valuenow", digito);

        digitos.push(digito);
    });

    elementoLeitura.textContent = digitos.join("");

    elementoMensagem.textContent =
        "Leitura atualizada! Confira os ponteiros no medidor físico.";
}

// Reinicia os quatro ponteiros.
btnReiniciar.addEventListener("click", () => {
    angulos = [2, 2, 2, 2];
    atualizar();

    elementoMensagem.textContent =
        "Medidor reiniciado. Ajuste os ponteiros para começar.";
});

// Carrega uma leitura de exemplo: 3728.
btnExemplo.addEventListener("click", () => {
    const exemplo = [3, 7, 2, 8];

    angulos = exemplo.map((digito) =>
        digito * ANGULO_POR_NUMERO + 5
    );

    atualizar();

    elementoMensagem.textContent =
        "Exemplo carregado. Movimente os ponteiros para testar.";
});

// Mostra o estado inicial.
atualizar();
