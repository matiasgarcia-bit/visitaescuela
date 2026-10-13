// Catálogo de actividades: para cambiar un link, editarlo acá y se actualiza en todas las sedes.
// "logo" es el ícono del área sacado de tumo.ar (assets/icons); si no hay, se usa el emoji de "icono".
const ACTIVIDADES = {
  videojuegos: { nombre: "Videojuegos",    area: "programacion", icono: "🎮", color: "#93b11e", link: "https://tumo-product.github.io/PlatformGames/es_AR.html", logo: "icons/videojuegos.webp" },
  ia:          { nombre: "IA",             area: "programacion", icono: "🤖", color: "#8f6cf0", link: "https://hackathon-ia-tumo.vercel.app", logo: "icons/ia.webp" },
  animacion:   { nombre: "Animación 2D",   area: "diseno", icono: "🎞️", color: "#ffa600", link: "https://garticphone.com/es", logo: "icons/animacion.webp" },
  diseno:      { nombre: "Diseño gráfico", area: "diseno", icono: "🎨", color: "#f01243", link: "https://garticphone.com/es", logo: "icons/diseno.webp" },
  modelado:    { nombre: "Modelado 3D",    area: "diseno", icono: "🧊", color: "#787323", link: "https://stephaneginier.com/sculptgl/", logo: "icons/modelado.webp" },
  programacion:{ nombre: "Programación",   area: "programacion", icono: "💻", color: "#a59e67", link: "https://compute-it.toxicode.fr/", logo: "icons/programacion.webp" },
  robotica:    { nombre: "Robótica",       area: "programacion", icono: "🦾", color: "#c8613b", link: "https://lab.open-roberta.org/", logo: "icons/robotica.webp" },
  musica:      { nombre: "Música",         area: "diseno", icono: "🎵", color: "#782f6c", link: "https://www.incredibox.com/", logo: "icons/musica.webp" },
  motion:      { nombre: "Motion graphics",area: "diseno", icono: "✨", color: "#ce2b24", link: "https://www.motionity.app/", logo: "icons/motion.webp" },
  cine:        { nombre: "Cine",           area: "diseno", icono: "🎬", color: "#fa5c1b", link: "https://cloudstopmotion.com/", logo: "icons/cine.webp" },
  fotografia:  { nombre: "Fotografía",     area: "diseno", icono: "📷", color: "#0895b7", link: "https://docs.google.com/presentation/d/1GkRyXfYC1iKMxci1pfwX8kZ4nlCUbHGs/edit?usp=sharing&ouid=111947021961172210965&rtpof=true&sd=true", logo: "icons/fotografia.webp" },
  dibujo:      { nombre: "Dibujo",         area: "diseno", icono: "✏️", color: "#8f3567", link: "https://docs.google.com/presentation/d/1sAyDvsnyUDrzstdH9mnmAVdAD4KuSxQ-/edit?usp=sharing&ouid=101437381458811997703&rtpof=true&sd=true", logo: "icons/dibujo.svg" },
};

// Animaciones de los GIF de tumo.ar como grilla de cuadros (assets/animados): [columnas, filas, duración en ms],
// o la ruta de un SVG ya animado.
// Se usan solo en las tarjetas para elegir actividad.
const ANIMACIONES = {
  videojuegos: [25, 5, 10000], animacion: [25, 5, 10000], cine: [25, 5, 10000], diseno: [25, 5, 10000],
  robotica: [25, 5, 10000], modelado: [25, 5, 10000], programacion: [25, 5, 10000], musica: [25, 5, 10000],
  ia: [13, 7, 3640], motion: [25, 5, 10000], fotografia: [25, 5, 10000],
  dibujo: "animados/dibujo.svg", // no está en tumo.ar: es un SVG animado hecho a mano
};

// Áreas para filtrar la ruleta. Cada actividad indica su área con el campo "area".
const AREAS = {
  diseno: { nombre: "🎨 Diseño" },
  programacion: { nombre: "💻 Programación" },
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
    links: { diseno: "https://skribbl.io/" },
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
