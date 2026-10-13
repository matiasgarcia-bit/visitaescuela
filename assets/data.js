// Catálogo de actividades: para cambiar un link, editarlo acá y se actualiza en todas las sedes.
const ACTIVIDADES = {
  videojuegos: { nombre: "Videojuegos",    icono: "🎮", color: "#7c4dff", link: "https://tumo-product.github.io/PlatformGames/es_AR.html" },
  ia:          { nombre: "IA",             icono: "🤖", color: "#00a3a3", link: "https://hackathon-ia-tumo.vercel.app" },
  animacion:   { nombre: "Animación 2D",   icono: "🎞️", color: "#ff7a1a", link: "https://docs.google.com/document/d/1U_kScfsVtxFEGS2MgzhLoNEV428iTcTlWOUAvETYCbE/edit?usp=sharing" },
  diseno:      { nombre: "Diseño gráfico", icono: "🎨", color: "#e83e8c", link: "https://docs.google.com/document/d/1U_kScfsVtxFEGS2MgzhLoNEV428iTcTlWOUAvETYCbE/edit?usp=sharing" },
  modelado:    { nombre: "Modelado 3D",    icono: "🧊", color: "#2f80ed", link: "https://stephaneginier.com/sculptgl/" },
  programacion:{ nombre: "Programación",   icono: "💻", color: "#27ae60", link: "https://compute-it.toxicode.fr/" },
  robotica:    { nombre: "Robótica",       icono: "🦾", color: "#5d6d7e", link: "https://lab.open-roberta.org/" },
  musica:      { nombre: "Música",         icono: "🎵", color: "#f2b705", link: "https://www.incredibox.com/" },
  motion:      { nombre: "Motion graphics",icono: "✨", color: "#9b51e0", link: "https://www.motionity.app/" },
  cine:        { nombre: "Cine",           icono: "🎬", color: "#d63031", link: "https://cloudstopmotion.com/" },
  fotografia:  { nombre: "Fotografía",     icono: "📷", color: "#16a085", link: "https://docs.google.com/presentation/d/1GkRyXfYC1iKMxci1pfwX8kZ4nlCUbHGs/edit?usp=sharing&ouid=111947021961172210965&rtpof=true&sd=true" },
  dibujo:      { nombre: "Dibujo",         icono: "✏️", color: "#c0392b", link: "https://docs.google.com/presentation/d/1sAyDvsnyUDrzstdH9mnmAVdAD4KuSxQ-/edit?usp=sharing&ouid=101437381458811997703&rtpof=true&sd=true" },
};

// Sedes: qué actividades tiene cada una y, si hace falta, links propios que pisan los del catálogo.
const SEDES = {
  barracas: {
    nombre: "Barracas",
    actividades: ["videojuegos", "ia", "animacion", "diseno", "modelado", "programacion", "robotica", "musica"],
  },
  chacarita: {
    nombre: "Chacarita",
    actividades: ["musica", "videojuegos", "ia", "programacion", "fotografia", "modelado", "dibujo", "cine"],
    links: { programacion: "https://cubicpainter.com/" },
  },
  nunez: {
    nombre: "Núñez",
    actividades: ["motion", "ia", "modelado", "cine", "fotografia", "videojuegos", "programacion", "diseno"],
  },
};

const JUEGO_FINAL = "https://kahoot.it/";

function linkDe(actividadId, sedeId) {
  const sede = SEDES[sedeId];
  return (sede && sede.links && sede.links[actividadId]) || ACTIVIDADES[actividadId].link;
}

function sedesVisibles() {
  return Object.keys(SEDES);
}

// Unión de las actividades de todas las sedes visibles, en orden de catálogo.
function todasLasActividades() {
  const usadas = new Set(sedesVisibles().flatMap((id) => SEDES[id].actividades));
  return Object.keys(ACTIVIDADES).filter((id) => usadas.has(id));
}
