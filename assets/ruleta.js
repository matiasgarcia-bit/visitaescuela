// Ruleta: gira, elige una actividad al azar del grupo elegido y permite volver a tirar.

const canvas = document.getElementById("ruleta");
const ctx = canvas.getContext("2d");
const botonGirar = document.getElementById("girar");
const botonReroll = document.getElementById("reroll");
const resultado = document.getElementById("resultado");
const filtros = document.getElementById("filtros");

let sedeElegida = "";
let opciones = [];
let rotacion = 0;
let girando = false;
let ultima = null;

function actividadesDelGrupo() {
  return sedeElegida ? SEDES[sedeElegida].actividades : todasLasActividades();
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

    // Texto a lo largo del radio, del borde hacia el centro.
    ctx.save();
    ctx.translate(r, r);
    ctx.rotate(inicio + paso / 2);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    const texto = `${a.nombre} ${a.icono}`;
    let tam = Math.min(lado * 0.042, paso * r * 0.55);
    ctx.font = `700 ${tam}px Outfit, "Segoe UI", sans-serif`;
    const ancho = ctx.measureText(texto).width;
    if (ancho > r * 0.6) {
      tam *= (r * 0.6) / ancho; // achica el texto para que no tape el botón central
      ctx.font = `700 ${tam}px Outfit, "Segoe UI", sans-serif`;
    }
    ctx.shadowColor = "rgba(0,0,0,.25)";
    ctx.shadowBlur = tam * 0.3;
    ctx.fillText(texto, r * 0.92, 0);
    ctx.restore();
  });
}

function armarFiltros() {
  filtros.innerHTML = [`<button class="chip activo" data-sede="">Todas</button>`]
    .concat(sedesVisibles().map((id) => `<button class="chip" data-sede="${id}">${SEDES[id].nombre}</button>`))
    .join("");
  filtros.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip || girando) return;
    filtros.querySelectorAll(".chip").forEach((c) => c.classList.toggle("activo", c === chip));
    sedeElegida = chip.dataset.sede;
    opciones = actividadesDelGrupo();
    ultima = null;
    dibujar();
    mostrarVacio();
  });
}

function mostrarVacio() {
  resultado.className = "resultado-vacio";
  resultado.innerHTML = "Tocá <strong>GIRAR</strong> para descubrir tu actividad.";
  botonReroll.disabled = true;
}

function mostrarResultado(id) {
  const a = ACTIVIDADES[id];
  resultado.className = "resultado";
  void resultado.offsetWidth; // reinicia la animación
  resultado.classList.add("aparece");
  resultado.innerHTML = `
    <div class="resultado-icono">${a.icono}</div>
    <div class="resultado-nombre">${a.nombre}</div>
    <div class="acciones">
      <a class="boton primario" href="${linkDe(id, sedeElegida || null)}" target="_blank" rel="noopener">Ir a la actividad ↗</a>
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
