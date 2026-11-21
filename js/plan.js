/* ==========================================================================
   plan.js - Datos y renderizado del Plan de Estudio por modalidad
   Fuente del plan oficial (modalidad Matutina):
   https://unhsjm.edu.ni/ingenieria-en-computacion/
   ========================================================================== */

// Plan oficial publicado por la UNHSJM (10 semestres, turno matutino)
const PLAN_OFICIAL = [
  ['Matemática Introductoria', 'Técnicas y Estrategias de Comunicación', 'Filosofía', 'Geometría Analítica', 'Historia de Nicaragua'],
  ['Algoritmos', 'Composición y Redacción Técnica', 'Género en la vida Cotidiana', 'Cálculo I', 'Estadísticas Descriptivas e Inferencial'],
  ['Programación', 'Estructuras Discretas', 'Física I', 'Cálculo II', 'Libre I (General)', 'Álgebra Lineal para Computación'],
  ['Estructura de Datos', 'Base de Datos I', 'Física II', 'Cálculo III', 'Métodos y Técnicas de Investigación', 'Análisis Numérico para Ingeniería'],
  ['Programación Orientada a Objeto', 'Base de Datos II', 'Circuitos Eléctricos', 'Metodología de la Investigación', 'Prácticas de Familiarización y Profesionales'],
  ['Ingeniería de Requerimientos', 'Gráfica asistida por Computadoras', 'Sistemas Digitales', 'Simulación por Computadores', 'Optativa I - Lenguajes Formales', 'Prácticas de Familiarización y Profesionalización'],
  ['Análisis y Diseño', 'Sistemas Operativos', 'Arquitectura de Computadoras I', 'Cultura de Paz', 'Lenguajes, Compiladores e Intérprete', 'Prácticas de Familiarización y Profesionalización'],
  ['Ingeniería del Software I', 'Diseño asistido por Computadora', 'Arquitectura de Computadoras II', 'Análisis Algorítmico Avanzado', 'Redes de Computadoras', 'Formas de Culminación de Estudios'],
  ['Ingeniería del Software II', 'Programación Móvil', 'Libre II (profesionalizante)', 'Sistemas Distribuidos', 'Sistemas de Control', 'Optativa II', 'Formas de Culminación de Estudios'],
  ['Formulación y Evaluación de Proyectos Computacionales', 'Programación Web', 'Inteligencia Artificial', 'Robótica', 'Libre III (profesionalizante)', 'Formas de Culminación de Estudios']
];

const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];

/**
 * Redistribuye las asignaturas (respetando su orden y prerrequisitos)
 * en una cantidad distinta de períodos, para las modalidades referenciales.
 */
function redistribuir(plan, periodos) {
  const todas = plan.flat();
  const base = Math.floor(todas.length / periodos);
  const extra = todas.length % periodos;
  const resultado = [];
  let indice = 0;
  for (let i = 0; i < periodos; i++) {
    const cantidad = base + (i < periodos - extra ? 0 : 1); // los últimos reciben 1 más
    resultado.push(todas.slice(indice, indice + cantidad));
    indice += cantidad;
  }
  return resultado;
}

const MODALIDADES = {
  matutina: {
    nombre: 'Regular – Matutina',
    resumen: '<strong>Modalidad oficial</strong> · 4 ½ años · 10 semestres · Lunes a viernes, 7:00 a.m. – 12:00 m.',
    periodo: 'Semestre',
    porAnio: 2,
    plan: PLAN_OFICIAL
  },
  sabatina: {
    nombre: 'Sabatina',
    resumen: '<strong>Modalidad referencial</strong> · 5 años · 15 cuatrimestres · Sábados, 8:00 a.m. – 5:00 p.m.',
    periodo: 'Cuatrimestre',
    porAnio: 3,
    plan: redistribuir(PLAN_OFICIAL, 15)
  },
  encuentro: {
    nombre: 'Por Encuentro – Dominical',
    resumen: '<strong>Modalidad referencial</strong> · 6 años · 12 semestres · Domingos, 8:00 a.m. – 4:00 p.m. + EVA',
    periodo: 'Semestre',
    porAnio: 2,
    plan: redistribuir(PLAN_OFICIAL, 12)
  }
};

/** Dibuja las tarjetas del plan de la modalidad seleccionada. */
function renderizarPlan(clave) {
  const modalidad = MODALIDADES[clave];
  const contenedor = document.getElementById('planContenedor');
  const resumen = document.getElementById('planResumen');
  if (!modalidad || !contenedor) return;

  resumen.innerHTML = `${modalidad.resumen} · <strong>${modalidad.plan.flat().length}</strong> asignaturas`;

  contenedor.innerHTML = modalidad.plan.map((asignaturas, i) => {
    const anio = Math.floor(i / modalidad.porAnio) + 1;
    return `
      <article class="periodo" style="animation-delay:${i * 0.04}s">
        <h3 class="periodo__titulo">
          ${ROMANOS[i]} ${modalidad.periodo.toUpperCase()}
          <small>Año ${anio}</small>
        </h3>
        <ul>${asignaturas.map(a => `<li>${a}</li>`).join('')}</ul>
      </article>`;
  }).join('');
}
