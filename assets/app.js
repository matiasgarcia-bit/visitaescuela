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
  const header = document.createElement("header");
  header.className = "topbar";
  header.innerHTML = `
    <div class="topbar-inner">
      <a class="logo" href="${BASE || "./"}">TUMO<span>.</span></a>
      <nav class="nav">
        ${items.map((i) => `<a href="${BASE + i.href || "./"}" class="${i.id === activa ? "activo" : ""}">${i.texto}</a>`).join("")}
      </nav>
    </div>`;
  document.body.prepend(header);
  const enlaceActivo = header.querySelector(".nav a.activo");
  if (enlaceActivo) enlaceActivo.scrollIntoView({ block: "nearest", inline: "center" });
}

function tarjeta(actividadId, sedeId, conBadges) {
  const a = ACTIVIDADES[actividadId];
  const sedes = sedesVisibles().filter((id) => SEDES[id].actividades.includes(actividadId));
  const pie = conBadges
    ? `<div class="badges">${sedes.map((id) => `<span class="badge">${SEDES[id].nombre}</span>`).join("")}</div>`
    : `<span>Abrir actividad</span>`;
  return `
    <a class="card" href="${linkDe(actividadId, sedeId)}" target="_blank" rel="noopener"
       style="--c:${a.color}" data-actividad="${actividadId}" data-sedes="${sedes.join(" ")}">
      <div class="card-icono">${a.icono}</div>
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
        <div class="sede-titulo"><h2>${s.nombre}</h2><span>${s.actividades.length} actividades</span></div>
        <div class="sede-iconos">${s.actividades.map((a) => ACTIVIDADES[a].icono).join("")}</div>
        <p>${s.actividades.map((a) => ACTIVIDADES[a].nombre).join(" · ")}</p>
      </a>`;
  });
  tarjetasSedes.push(`
    <a class="sede" href="sedes/">
      <div class="sede-titulo"><h2>Todas las sedes</h2><span>${todasLasActividades().length} actividades</span></div>
      <div class="sede-iconos">${todasLasActividades().map((a) => ACTIVIDADES[a].icono).join("")}</div>
      <p>Todas las actividades juntas, con filtro por sede.</p>
    </a>`);
  tarjetasSedes.push(`
    <a class="sede destacada" href="ruleta/">
      <div class="sede-titulo"><h2>🎡 Ruleta</h2><span>¿No sabés por dónde empezar?</span></div>
      <p>Girá la ruleta y dejá que el azar elija tu próxima actividad.</p>
    </a>`);
  document.getElementById("hub").innerHTML = tarjetasSedes.join("");
}

armarMenu();
const sedeActual = document.body.dataset.sede;
if (sedeActual) armarGrillaSede(sedeActual);
if (document.body.dataset.pagina === "sedes") armarTodas();
if (document.body.dataset.pagina === "inicio") armarInicio();
document.querySelectorAll("[data-juego-final]").forEach((a) => (a.href = JUEGO_FINAL));
