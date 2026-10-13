// Ruleta: gira, elige una actividad al azar (de todas, o solo de diseño o de programación) y permite volver a tirar.

const canvas = document.getElementById("ruleta");
const ctx = canvas.getContext("2d");
const botonGirar = document.getElementById("girar");
const botonReroll = document.getElementById("reroll");
const resultado = document.getElementById("resultado");
const filtros = document.getElementById("filtros");

let areaElegida = ""; // "" = todas las actividades
let opciones = [];
let rotacion = 0;
let girando = false;
let ultima = null;

// Íconos de tumo.ar precargados para dibujarlos en la ruleta.
const imagenes = {};
Object.keys(ACTIVIDADES).forEach((id) => {
  if (!ACTIVIDADES[id].logo) return;
  const img = new Image();
  img.onload = () => dibujar();
  img.src = BASE + "assets/" + ACTIVIDADES[id].logo;
  imagenes[id] = img;
});

function actividadesDelGrupo() {
  return todasLasActividades().filter((id) => !areaElegida || ACTIVIDADES[id].area === areaElegida);
}

function dibujar() {
  const lado = canvas.clientWidth * (window.devicePixelRatio || 1);
  canvas.width = canvas.height = lado;
  const r = lado / 2;
  const paso = (Math.PI * 2) / opciones.length;
  ctx.clearRect(0, 0, lado, lado);

  opciones.forEach((id, i) => {
    const a = ACTIVIDADES[id];
    const inicio = i * paso;
    ctx.beginPath();
    ctx.moveTo(r, r);
    ctx.arc(r, r, r, inicio, inicio + paso);
    ctx.closePath();
    ctx.fillStyle = a.color;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.55)";
    ctx.lineWidth = lado * 0.004;
    ctx.stroke();

    // Ícono contra el borde y el nombre a lo largo del radio, hacia el centro.
    ctx.save();
    ctx.translate(r, r);
    ctx.rotate(inicio + paso / 2);
    const img = imagenes[id];
    const tamIcono = Math.min(r * 0.2, paso * r * 0.6);
    let finTexto = r * 0.92;
    if (img && img.complete && img.naturalWidth) {
      ctx.save();
      ctx.translate(r * 0.93 - tamIcono / 2, 0);
      ctx.rotate(Math.PI / 2); // el ícono queda derecho cuando la porción está arriba
      ctx.drawImage(img, -tamIcono / 2, -tamIcono / 2, tamIcono, tamIcono);
      ctx.restore();
      finTexto = r * 0.93 - tamIcono - r * 0.04;
    }
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    const texto = img ? a.nombre : `${a.nombre} ${a.icono}`;
    const espacio = finTexto - r * 0.27; // hasta el botón central
    let tam = Math.min(lado * 0.042, paso * r * 0.55);
    ctx.font = `700 ${tam}px Figtree, "Segoe UI", sans-serif`;
    const ancho = ctx.measureText(texto).width;
    if (ancho > espacio) {
      tam *= espacio / ancho; // achica el texto para que no tape el botón central
      ctx.font = `700 ${tam}px Figtree, "Segoe UI", sans-serif`;
    }
    ctx.shadowColor = "rgba(0,0,0,.3)";
    ctx.shadowBlur = tam * 0.3;
    ctx.fillText(texto, finTexto, 0);
    ctx.restore();
  });
}

function armarFiltros() {
  filtros.innerHTML = ["", ...Object.keys(AREAS)]
    .map((id) => `<button class="chip ${id === areaElegida ? "activo" : ""}" data-area="${id}">${id ? AREAS[id].nombre : "✨ Todas"}</button>`)
    .join("");
  filtros.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip || girando) return;
    filtros.querySelectorAll(".chip").forEach((c) => c.classList.toggle("activo", c === chip));
    areaElegida = chip.dataset.area;
    opciones = actividadesDelGrupo();
    ultima = null;
    dibujar();
    mostrarVacio();
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
    <div class="resultado-icono">${icono(id)}</div>
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
  botonGirar.disabled = botonReroll.disabled = true;
  resultado.className = "resultado-vacio";
  resultado.textContent = "Girando…";
  canvas.style.transform = `rotate(${rotacion}deg)`;

  const terminar = () => {
    girando = false;
    botonGirar.disabled = false;
    ultima = elegida;
    mostrarResultado(elegida);
  };
  // Temporizador en vez de "transitionend": ese evento no llega si la pestaña queda en segundo plano.
  const duracion = parseFloat(getComputedStyle(canvas).transitionDuration) * 1000;
  setTimeout(terminar, duracion + 100);
}

botonGirar.addEventListener("click", girar);
botonReroll.addEventListener("click", girar);
window.addEventListener("resize", dibujar);

armarFiltros();
opciones = actividadesDelGrupo();
mostrarVacio();
dibujar();
document.fonts.ready.then(dibujar);
