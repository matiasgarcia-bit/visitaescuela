// Ruleta en tres pasos: primero se completa la trivia, después se eligen 3 habilidades
// y por último la ruleta gira entre esas 3 (se puede volver a tirar).

const pasos = {
  trivia: document.getElementById("paso-trivia"),
  habilidades: document.getElementById("paso-habilidades"),
  ruleta: document.getElementById("paso-ruleta"),
};

function mostrarPaso(id) {
  Object.keys(pasos).forEach((p) => (pasos[p].hidden = p !== id));
  window.scrollTo(0, 0);
  if (id === "ruleta") dibujar(); // el canvas no tiene tamaño mientras está oculto
}

// ---------- Paso 1: trivia ----------

const trivia = document.getElementById("trivia");
const triviaNumero = document.getElementById("trivia-numero");
const triviaPuntaje = document.getElementById("trivia-puntaje");
const triviaBarra = document.getElementById("trivia-barra");
let pregunta = 0;
let aciertos = 0;

function mostrarPregunta() {
  const p = TRIVIA[pregunta];
  triviaNumero.textContent = `Pregunta ${pregunta + 1} de ${TRIVIA.length}`;
  triviaPuntaje.textContent = `✅ ${aciertos}`;
  triviaBarra.style.width = `${(pregunta / TRIVIA.length) * 100}%`;
  trivia.innerHTML = `
    <div class="trivia-pregunta">${p.pregunta}</div>
    <div class="trivia-opciones ${p.opciones.length === 2 ? "vf" : ""}">
      ${p.opciones.map((o, i) => `<button class="opcion" data-i="${i}">${o}</button>`).join("")}
    </div>
    <div id="trivia-respuesta"></div>`;
}

trivia.addEventListener("click", (e) => {
  const opcion = e.target.closest(".opcion");
  if (opcion && !opcion.disabled) return responder(Number(opcion.dataset.i));
  if (e.target.closest("#siguiente")) {
    pregunta++;
    if (pregunta < TRIVIA.length) mostrarPregunta();
    else mostrarFinTrivia();
  }
  if (e.target.closest("#a-habilidades")) mostrarPaso("habilidades");
});

function responder(elegida) {
  const p = TRIVIA[pregunta];
  const bien = elegida === p.correcta;
  if (bien) aciertos++;
  trivia.querySelectorAll(".opcion").forEach((b, i) => {
    b.disabled = true;
    if (i === p.correcta) b.classList.add("correcta");
    else if (i === elegida) b.classList.add("incorrecta");
  });
  triviaPuntaje.textContent = `✅ ${aciertos}`;
  const ultima = pregunta === TRIVIA.length - 1;
  document.getElementById("trivia-respuesta").innerHTML = `
    <div class="trivia-respuesta ${bien ? "bien" : "mal"}">
      <strong>${bien ? "¡Correcto! 🎉" : `La respuesta era: ${p.opciones[p.correcta]}`}</strong>
      ${p.explicacion ? `<p>${p.explicacion}</p>` : ""}
    </div>
    <div class="acciones"><button class="boton primario" id="siguiente">${ultima ? "Ver resultado" : "Siguiente →"}</button></div>`;
}

function mostrarFinTrivia() {
  triviaNumero.textContent = "¡Trivia completa!";
  triviaBarra.style.width = "100%";
  trivia.innerHTML = `
    <div class="trivia-fin aparece">
      <div class="trivia-fin-puntaje">${aciertos}<span>/${TRIVIA.length}</span></div>
      <p>${aciertos === TRIVIA.length ? "¡Perfecto! Sabés todo sobre TUMO 🏆" : "¡Bien ahí! Ya conocés un montón de TUMO."}</p>
      <div class="acciones"><button class="boton primario" id="a-habilidades">Seguir →</button></div>
    </div>`;
}

// ---------- Paso 2: elegir habilidades ----------

const habilidades = document.getElementById("habilidades");
const habilidadesCuenta = document.getElementById("habilidades-cuenta");
const botonIrRuleta = document.getElementById("ir-ruleta");
let elegidas = [];

function armarHabilidades() {
  habilidades.innerHTML = todasLasActividades()
    .map((id) => `
      <button class="habilidad" data-id="${id}" style="--c:${ACTIVIDADES[id].color}">
        <img src="${BASE}assets/${ACTIVIDADES[id].logo}" alt="">
        <span>${ACTIVIDADES[id].nombre}</span>
      </button>`)
    .join("");
  actualizarHabilidades();
}

function actualizarHabilidades() {
  const completas = elegidas.length === HABILIDADES_A_ELEGIR;
  habilidades.querySelectorAll(".habilidad").forEach((b) => {
    const elegida = elegidas.includes(b.dataset.id);
    b.classList.toggle("elegida", elegida);
    b.setAttribute("aria-pressed", elegida);
    b.disabled = completas && !elegida;
  });
  habilidadesCuenta.textContent = `${elegidas.length} de ${HABILIDADES_A_ELEGIR}`;
  botonIrRuleta.disabled = !completas;
}

habilidades.addEventListener("click", (e) => {
  const b = e.target.closest(".habilidad");
  if (!b) return;
  const id = b.dataset.id;
  if (elegidas.includes(id)) elegidas = elegidas.filter((x) => x !== id);
  else if (elegidas.length < HABILIDADES_A_ELEGIR) elegidas.push(id);
  actualizarHabilidades();
});

botonIrRuleta.addEventListener("click", () => {
  opciones = todasLasActividades().filter((id) => elegidas.includes(id)); // en orden de catálogo
  ultima = null;
  mostrarVacio();
  mostrarPaso("ruleta");
});

// ---------- Paso 3: ruleta ----------

const canvas = document.getElementById("ruleta");
const ctx = canvas.getContext("2d");
const botonGirar = document.getElementById("girar");
const botonReroll = document.getElementById("reroll");
const botonCambiar = document.getElementById("cambiar");
const resultado = document.getElementById("resultado");

let opciones = [];
let rotacion = 0; // giro final de la ruleta, en grados
let angulo = 0;   // giro que se ve ahora (cambia durante la animación)
let girando = false;
let ultima = null;

// Medidas de la rueda del Illustrator de diseño, como fracción del radio.
const RUEDA = {
  finTexto: 0.70,     // el texto termina a la misma distancia del ícono en todas las porciones
  minTexto: 0.275,    // y nunca se mete en el botón del centro
  centroIcono: 0.82,  // todos los íconos a la misma distancia del centro
  radioIcono: 0.089,  // ícono, con su borde blanco
  texto: 0.056,       // tamaño de letra, igual para todas las disciplinas
};

// Íconos de la rueda precargados para dibujarlos en el canvas.
const imagenes = {};
Object.keys(ACTIVIDADES).forEach((id) => {
  const img = new Image();
  img.onload = () => dibujar();
  img.src = BASE + "assets/" + ACTIVIDADES[id].logo;
  imagenes[id] = img;
});

const fuente = (tam) => `800 ${tam}px Figtree, "Segoe UI", sans-serif`;

// Un solo tamaño de letra para todas: el de diseño, o menos si el nombre más largo no entra antes del ícono.
function tamTexto(r) {
  const espacio = (RUEDA.finTexto - RUEDA.minTexto) * r;
  let tam = RUEDA.texto * r;
  ctx.font = fuente(tam);
  const masLargo = Math.max(...Object.values(ACTIVIDADES).map((a) => ctx.measureText(a.nombre.toUpperCase()).width));
  return masLargo > espacio ? tam * (espacio / masLargo) : tam;
}

function dibujar() {
  if (!canvas.clientWidth || opciones.length === 0) return;
  const lado = Math.round(canvas.clientWidth * (window.devicePixelRatio || 1));
  if (canvas.width !== lado) canvas.width = canvas.height = lado;
  const r = lado / 2;
  const giro = (angulo * Math.PI) / 180;
  const paso = (Math.PI * 2) / opciones.length;
  const tam = tamTexto(r);
  ctx.clearRect(0, 0, lado, lado);

  opciones.forEach((id, i) => {
    const a = ACTIVIDADES[id];
    const inicio = i * paso + giro;
    const medio = inicio + paso / 2;
    ctx.beginPath();
    ctx.moveTo(r, r);
    ctx.arc(r, r, r, inicio, inicio + paso);
    ctx.closePath();
    ctx.fillStyle = a.color;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.55)";
    ctx.lineWidth = lado * 0.002;
    ctx.stroke();

    ctx.save();
    ctx.translate(r, r);
    ctx.rotate(medio);

    // Nombre en mayúsculas a lo largo del radio, alineado contra el ícono con el mismo margen en todas.
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.font = fuente(tam);
    ctx.fillText(a.nombre.toUpperCase(), RUEDA.finTexto * r, 0);

    // Ícono (ya trae su borde blanco), siempre derecho como en el diseño, aunque la ruleta gire.
    ctx.translate(RUEDA.centroIcono * r, 0);
    ctx.rotate(-medio);
    const img = imagenes[id];
    const ri = RUEDA.radioIcono * r;
    if (img.complete && img.naturalWidth) ctx.drawImage(img, -ri, -ri, ri * 2, ri * 2);
    ctx.restore();
  });
}

function mostrarVacio() {
  resultado.className = "resultado-vacio";
  resultado.textContent = "—";
  botonReroll.disabled = true;
}

function mostrarResultado(id) {
  const a = ACTIVIDADES[id];
  resultado.className = "resultado";
  void resultado.offsetWidth; // reinicia la animación
  resultado.classList.add("aparece");
  resultado.innerHTML = `
    <div class="resultado-icono">${iconoAnimado(id)}</div>
    <div class="resultado-nombre">${a.nombre}</div>
    <div class="acciones">
      <a class="boton primario" href="${linkDe(id, null)}" target="_blank" rel="noopener">Ir a la actividad ↗</a>
    </div>`;
  botonReroll.disabled = false;
}

function girar() {
  if (girando || opciones.length === 0) return;
  // Evita que salga dos veces seguidas la misma actividad.
  const candidatos = opciones.length > 1 ? opciones.filter((id) => id !== ultima) : opciones;
  const elegida = candidatos[Math.floor(Math.random() * candidatos.length)];
  const indice = opciones.indexOf(elegida);

  const paso = 360 / opciones.length;
  const centro = (indice + 0.5) * paso + (Math.random() - 0.5) * paso * 0.7;
  // El puntero está arriba (270° en coordenadas del canvas).
  const destino = (((270 - centro - rotacion) % 360) + 360) % 360;
  rotacion += 360 * (5 + Math.floor(Math.random() * 3)) + destino;

  girando = true;
  botonGirar.disabled = botonReroll.disabled = botonCambiar.disabled = true;
  resultado.className = "resultado-vacio";
  resultado.textContent = "Girando…";

  // El giro se anima redibujando el canvas en cada cuadro, para que los íconos no roten con la ruleta.
  const desde = angulo;
  const duracion = matchMedia("(prefers-reduced-motion: reduce)").matches ? 10 : 5000;
  const comienzo = performance.now();
  const animar = (ahora) => {
    if (!girando) return;
    const t = Math.min((ahora - comienzo) / duracion, 1);
    angulo = desde + (rotacion - desde) * (1 - Math.pow(1 - t, 4)); // arranca rápido y frena de a poco
    dibujar();
    if (t < 1) requestAnimationFrame(animar);
  };
  requestAnimationFrame(animar);

  const terminar = () => {
    girando = false;
    angulo = rotacion;
    dibujar();
    botonGirar.disabled = botonCambiar.disabled = false;
    ultima = elegida;
    mostrarResultado(elegida);
  };
  // Temporizador aparte: requestAnimationFrame se pausa si la pestaña queda en segundo plano.
  setTimeout(terminar, duracion + 100);
}

botonCambiar.addEventListener("click", () => mostrarPaso("habilidades"));
botonGirar.addEventListener("click", girar);
botonReroll.addEventListener("click", girar);
window.addEventListener("resize", dibujar);
document.fonts.ready.then(dibujar);

mostrarPregunta();
armarHabilidades();
