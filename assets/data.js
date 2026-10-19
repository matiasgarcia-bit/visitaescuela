// Catálogo de actividades: para cambiar un link, editarlo acá y se actualiza en todas las sedes.
// "logo" es el ícono del área sacado de tumo.ar (assets/icons); si no hay, se usa el emoji de "icono".
// "rueda" es el ícono de la ruleta, sacado del Illustrator de diseño (assets/rueda); los colores también salen de ahí.
const ACTIVIDADES = {
  videojuegos: { nombre: "Videojuegos",    icono: "🎮", color: "#8bb225", link: "https://tumo-product.github.io/PlatformGames/es_AR.html", logo: "icons/videojuegos.webp", rueda: "rueda/videojuegos.webp" },
  ia:          { nombre: "Gen IA",         icono: "🤖", color: "#7669ad", link: "https://hackathon-ia-tumo.vercel.app", logo: "icons/ia.webp", rueda: "rueda/ia.webp" },
  animacion:   { nombre: "Animación",      icono: "🎞️", color: "#f69f17", link: "https://garticphone.com/es", logo: "icons/animacion.webp", rueda: "rueda/animacion.webp" },
  diseno:      { nombre: "Diseño",         icono: "🎨", color: "#e61f42", link: "https://garticphone.com/es", logo: "icons/diseno.webp", rueda: "rueda/diseno.webp" },
  modelado:    { nombre: "Modelado 3D",    icono: "🧊", color: "#797520", link: "https://stephaneginier.com/sculptgl/", logo: "icons/modelado.webp", rueda: "rueda/modelado.webp" },
  programacion:{ nombre: "Programación",   icono: "💻", color: "#a79e61", link: "https://compute-it.toxicode.fr/", logo: "icons/programacion.webp", rueda: "rueda/programacion.webp" },
  robotica:    { nombre: "Robótica",       icono: "🦾", color: "#d8592d", link: "https://lab.open-roberta.org/", logo: "icons/robotica.webp", rueda: "rueda/robotica.webp" },
  musica:      { nombre: "Música",         icono: "🎵", color: "#822870", link: "https://www.incredibox.com/", logo: "icons/musica.webp", rueda: "rueda/musica.webp" },
  motion:      { nombre: "Motion",         area: "diseno", icono: "✨", color: "#e00915", link: "https://www.motionity.app/", logo: "icons/motion.webp", rueda: "rueda/motion.webp" },
  cine:        { nombre: "Cine",           icono: "🎬", color: "#e94f1d", link: "https://cloudstopmotion.com/", logo: "icons/cine.webp", rueda: "rueda/cine.webp" },
  fotografia:  { nombre: "Fotografía",     icono: "📷", color: "#0098bb", link: "https://docs.google.com/presentation/d/1GkRyXfYC1iKMxci1pfwX8kZ4nlCUbHGs/edit?usp=sharing&ouid=111947021961172210965&rtpof=true&sd=true", logo: "icons/fotografia.webp", rueda: "rueda/fotografia.webp" },
  dibujo:      { nombre: "Dibujo",         icono: "✏️", color: "#9c2c6a", link: "https://docs.google.com/presentation/d/1sAyDvsnyUDrzstdH9mnmAVdAD4KuSxQ-/edit?usp=sharing&ouid=101437381458811997703&rtpof=true&sd=true", logo: "icons/dibujo.svg", rueda: "rueda/dibujo.webp" },
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

// Trivia que se completa antes de la ruleta. "correcta" es el índice de la opción correcta (empieza en 0);
// "explicacion" (opcional) se muestra después de responder.
const VF = ["Verdadero", "Falso"];
const TRIVIA = [
  { pregunta: "¿En qué país se creó el modelo educativo TUMO?", opciones: ["Armenia", "Francia", "Japón", "Argentina"], correcta: 0 },
  { pregunta: "¿Qué edades tienen los jóvenes que pueden asistir a TUMO?", opciones: ["De 6 a 12 años", "De 12 a 18 años", "De 18 a 25 años", "Para todas las edades sin límite"], correcta: 1 },
  { pregunta: "¿En qué emblemático edificio de la Ciudad de Buenos Aires se instaló el primer Centro TUMO de América Latina?", opciones: ["Palacio Barolo", "Centro Cultural Recoleta", "Centro Metropolitano de Diseño (CMD)", "Usina del Arte"], correcta: 2 },
  { pregunta: "¿Cuáles son los tres pilares del aprendizaje en la metodología TUMO?", opciones: ["Exámenes, Tareas y Exposiciones", "Autoaprendizaje, Talleres y Laboratorios de Proyectos", "Lectura, Práctica y Evaluación", "Clases magistrales, Trabajos grupales y Exámenes finales"], correcta: 1 },
  { pregunta: "¿Cuántos centros TUMO hay actualmente en la Ciudad de Buenos Aires?", opciones: ["1", "2", "3", "5"], correcta: 2, explicacion: "Parque de la Ciudad, Núñez / Parque de la Innovación y Chacarita." },
  { pregunta: "Cada centro TUMO está representado por un color. ¿Cuáles son los colores de los centros en CABA?", opciones: ["Rojo, Azul y Verde", "Rosa, Azul y Amarillo", "Amarillo, Verde y Azul", "Las combinaciones dependen de las disciplinas"], correcta: 0 },
  { pregunta: "¿Cuál fue la primera ciudad de América Latina en contar con un centro TUMO?", opciones: ["San Pablo (Brasil)", "Santiago (Chile)", "Ciudad de Buenos Aires (Argentina)", "Ciudad de México (México)"], correcta: 2 },
  { pregunta: "¿Cuántas disciplinas o áreas de aprendizaje ofrece TUMO Buenos Aires?", opciones: ["4", "6", "8", "20"], correcta: 2 },
  { pregunta: "En la etapa de Autoaprendizaje, ¿con qué herramienta o plataforma van avanzando los chicos?", opciones: ["Un libro impreso", "Una plataforma interactiva", "Un cuaderno de ejercicios"], correcta: 1 },
  { pregunta: "¿Quién te acompaña y te orienta durante tus sesiones en el centro?", opciones: ["Un preceptor", "Un Coach", "Un celador", "Un profesor de grado"], correcta: 1 },
  { pregunta: "¿Cuál de estos proyectos podrías llegar a crear en TUMO?", opciones: ["Tu propio videojuego o animación 3D", "Una pista musical o producción digital", "Una página web o robot", "¡Todas las anteriores!"], correcta: 3 },
  { pregunta: "¿Cómo se llaman las instancias dinámicas donde aprendés en grupo junto a un especialista de la disciplina?", opciones: ["Clases teóricas", "Talleres (Workshops)", "Exámenes orales", "Dictados"], correcta: 1 },
  { pregunta: "¿Qué te llevás al finalizar un proyecto o taller en TUMO?", opciones: ["Una nota numérica del 1 al 10", "Un portafolio que contiene todos tus trabajos", "Un boletín con amonestaciones", "Una tarea para el hogar"], correcta: 1 },
  { pregunta: "¿Qué hacés si te trabás o no te sale un ejercicio durante el Autoaprendizaje?", opciones: ["Te ponés un 0 en el examen", "Le pedís ayuda a un Coach, que está ahí para orientarte", "Tenés que volver a empezar desde el principio", "Quedás descalificado del juego"], correcta: 1 },
  { pregunta: "¿Cómo sabés cuánto avanzaste en cada disciplina dentro de TUMO?", opciones: ["Por las notas que te da el profesor", "Visualizando tus logros y avances en la plataforma TUMO Path", "Preguntando en la dirección del centro", "Te llega un boletín a tu casa por correo"], correcta: 1 },
  { pregunta: "¿Qué podés hacer en los Laboratorios de Proyectos (Learning Labs)?", opciones: ["Trabajar junto a profesionales de la industria en proyectos reales", "Hacer la tarea de la escuela", "Rendir exámenes finales", "Limpiar los equipos informáticos"], correcta: 0 },
  { pregunta: "¿Verdadero o falso? En TUMO no hay profesores tradicionales ni notas/calificaciones.", opciones: VF, correcta: 0, explicacion: "En TUMO el aprendizaje es autónomo y guiado por coaches, sin evaluaciones numéricas ni exámenes tradicionales." },
  { pregunta: "¿Verdadero o falso? Asistir a TUMO tiene un costo mensual de inscripción.", opciones: VF, correcta: 1, explicacion: "Todos los centros TUMO en CABA son 100% gratuitos y públicos." },
  { pregunta: "¿Verdadero o falso? Para entrar a TUMO necesitás saber programar o tener conocimientos previos de tecnología.", opciones: VF, correcta: 1, explicacion: "No se requieren conocimientos previos, ¡empezás desde cero y aprendés a tu ritmo!" },
  { pregunta: "¿Verdadero o falso? En TUMO elegís vos mismo qué recorrido (path) querés hacer y qué disciplinas explorar.", opciones: VF, correcta: 0, explicacion: "Cada estudiante es dueño de su propio recorrido de aprendizaje según sus intereses." },
  { pregunta: "¿Verdadero o falso? Los chicos que asisten a TUMO tienen que llevar su propia computadora de sus casas.", opciones: VF, correcta: 1, explicacion: "Los centros TUMO están equipados con todas las herramientas de nivel profesional necesarias para trabajar ahí." },
  { pregunta: "¿Verdadero o falso? Además de los centros de la Ciudad de Buenos Aires, existen centros TUMO en otros países del mundo como Francia, Alemania, Portugal y Estados Unidos.", opciones: VF, correcta: 0, explicacion: "TUMO es una red global con presencia e intercambios en múltiples ciudades del mundo (París, Berlín, Lisboa, Los Ángeles, entre otras)." },
];

// Cuántas habilidades se eligen antes de tirar la ruleta.
const HABILIDADES_A_ELEGIR = 3;
