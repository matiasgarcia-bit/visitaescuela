// Arma el menú y la grilla de cada página según los atributos del <body>:
//   data-base: ruta relativa a la raíz ("" en la raíz, "../" en subcarpetas)
//   data-pagina: id de la página activa en el menú
//   data-sede: id de la sede cuyas actividades se muestran (opcional)

const BASE = document.body.dataset.base || "";

function armarMenu() {
  const items = [
    { id: "inicio", texto: "Inicio", href: "" },
    ...sedesVisibles().map((id) => ({ id, texto: SEDES[id].nombre, href: id + "/" })),
    { id: "sedes", texto: "Todas las sedes", href: "sedes/" },
    { id: "ruleta", texto: "🎡 Ruleta", href: "ruleta/" },
  ];
  const activa = document.body.dataset.pagina;
  // Logo de TUMO Buenos Aires; si el archivo falta, queda el texto "TUMO.".
  const logo = `<img class="logo-img" src="${BASE}assets/logo-tumo.webp" alt="TUMO Buenos Aires"
    onerror="this.replaceWith(Object.assign(document.createElement('span'), { innerHTML: 'TUMO<span>.</span>' }))">`;
  const header = document.createElement("header");
  header.className = "topbar";
  // Solo el inicio tiene menú: dentro de una sede no se puede saltar a las otras.
  header.innerHTML = activa === "inicio"
    ? `
    <div class="topbar-inner">
      <a class="logo" href="./">${logo}</a>
      <nav class="nav">
        ${items.map((i) => `<a href="${BASE + i.href || "./"}" class="${i.id === activa ? "activo" : ""}">${i.texto}</a>`).join("")}
      </nav>
      <button class="tema" id="tema"></button>
    </div>`
    : `
    <div class="topbar-inner">
      <span class="logo">${logo}</span>
      <button class="tema" id="tema"></button>
    </div>`;
  document.body.prepend(header);
  armarBotonTema(header.querySelector("#tema"));
  const enlaceActivo = header.querySelector(".nav a.activo");
  if (enlaceActivo) enlaceActivo.scrollIntoView({ block: "nearest", inline: "center" });
}

// Claro por defecto; la elección se recuerda en este navegador.
function armarBotonTema(boton) {
  const raiz = document.documentElement;
  const pintar = () => {
    const oscuro = raiz.dataset.theme === "dark";
    boton.textContent = oscuro ? "☀️" : "🌙";
    boton.title = oscuro ? "Tema claro" : "Tema oscuro";
  };
  boton.addEventListener("click", () => {
    const oscuro = raiz.dataset.theme !== "dark";
    if (oscuro) raiz.dataset.theme = "dark";
    else delete raiz.dataset.theme;
    try { localStorage.setItem("tema", oscuro ? "oscuro" : "claro"); } catch (e) {}
    pintar();
  });
  pintar();
}

// Ícono de tumo.ar si la actividad lo tiene; si no, su emoji.
function icono(actividadId) {
  const a = ACTIVIDADES[actividadId];
  return a.logo ? `<img src="${BASE}assets/${a.logo}" alt="">` : a.icono;
}

// En las tarjetas el ícono se anima recorriendo la grilla de cuadros:
// la imagen avanza de a una columna y el contenedor baja de a una fila al terminar cada fila.
function iconoAnimado(actividadId) {
  const anim = ANIMACIONES[actividadId];
  if (!anim) return `<div class="card-icono ${ACTIVIDADES[actividadId].logo ? "con-logo" : ""}">${icono(actividadId)}</div>`;
  if (typeof anim === "string") return `<div class="card-icono animado"><img src="${BASE}assets/${anim}" alt=""></div>`;
  const [columnas, filas, ms] = anim;
  return `
      <div class="card-icono animado">
        <div class="sprite-filas" style="animation-duration:${ms}ms;animation-timing-function:steps(${filas})">
          <img class="sprite" src="${BASE}assets/animados/${actividadId}.webp" alt=""
            style="width:${columnas * 100}%;animation-duration:${ms / filas}ms;animation-timing-function:steps(${columnas})">
        </div>
      </div>`;
}

function tarjeta(actividadId, sedeId, conBadges) {
  const a = ACTIVIDADES[actividadId];
  const sedes = sedesVisibles().filter((id) => SEDES[id].actividades.includes(actividadId));
  const pie = conBadges
    ? `<div class="badges">${sedes.map((id) => `<span class="badge">${SEDES[id].nombre}</span>`).join("")}</div>`
    : `<span></span>`;
  return `
    <a class="card" href="${linkDe(actividadId, sedeId)}" target="_blank" rel="noopener"
       style="--c:${a.color}" data-actividad="${actividadId}" data-sedes="${sedes.join(" ")}">
      ${iconoAnimado(actividadId)}
      <div class="card-nombre">${a.nombre}</div>
      <div class="card-pie">${pie}<span class="card-flecha">↗</span></div>
    </a>`;
}

function armarGrillaSede(sedeId) {
  document.getElementById("grid").innerHTML = SEDES[sedeId].actividades.map((id) => tarjeta(id, sedeId, false)).join("");
}

function armarTodas() {
  const grid = document.getElementById("grid");
  grid.innerHTML = todasLasActividades().map((id) => tarjeta(id, null, true)).join("");

  const filtros = document.getElementById("filtros");
  filtros.innerHTML = [`<button class="chip activo" data-sede="">Todas</button>`]
    .concat(sedesVisibles().map((id) => `<button class="chip" data-sede="${id}">${SEDES[id].nombre}</button>`))
    .join("");
  filtros.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    filtros.querySelectorAll(".chip").forEach((c) => c.classList.toggle("activo", c === chip));
    const sede = chip.dataset.sede;
    grid.querySelectorAll(".card").forEach((card) => {
      const tiene = !sede || card.dataset.sedes.split(" ").includes(sede);
      card.classList.toggle("oculta", !tiene);
      // Con una sede elegida, el link apunta a la versión de esa sede.
      card.href = linkDe(card.dataset.actividad, sede || null);
    });
  });
}

function armarInicio() {
  const tarjetasSedes = sedesVisibles().map((id) => {
    const s = SEDES[id];
    return `
      <a class="sede" href="${id}/">
        <div class="sede-titulo"><h2>${s.nombre}</h2></div>
        <div class="sede-iconos">${s.actividades.map(icono).join("")}</div>
      </a>`;
  });
  tarjetasSedes.push(`
    <a class="sede" href="sedes/">
      <div class="sede-titulo"><h2>Todas las sedes</h2></div>
      <div class="sede-iconos">${todasLasActividades().map(icono).join("")}</div>
    </a>`);
  tarjetasSedes.push(`
    <a class="sede destacada" href="ruleta/">
      <div class="sede-titulo"><h2>🎡 Ruleta</h2></div>
    </a>`);
  document.getElementById("hub").innerHTML = tarjetasSedes.join("");
}

armarMenu();
const sedeActual = document.body.dataset.sede;
if (sedeActual) armarGrillaSede(sedeActual);
if (document.body.dataset.pagina === "sedes") armarTodas();
if (document.body.dataset.pagina === "inicio") armarInicio();
document.querySelectorAll("[data-juego-final]").forEach((a) => (a.href = JUEGO_FINAL));
