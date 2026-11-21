/* ==========================================================================
   main.js - Interacción general de la página
   - Menú principal (hamburguesa, enlace activo, encabezado compacto)
   - Carrusel informativo (automático, flechas, indicadores, táctil, teclado)
   - Pestañas del plan de estudio
   - Animaciones al hacer scroll y botón "volver arriba"
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  iniciarMenu();
  iniciarCarrusel();
  iniciarPestanas();
  iniciarAnimaciones();
  document.getElementById('anio').textContent = new Date().getFullYear();
});

/* ---------- Menú principal ---------- */
function iniciarMenu() {
  const header = document.getElementById('header');
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  const enlaces = menu.querySelectorAll('.nav__link');
  const btnArriba = document.getElementById('btnArriba');

  const cerrarMenu = () => {
    menu.classList.remove('abierto');
    toggle.classList.remove('abierto');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const abierto = menu.classList.toggle('abierto');
    toggle.classList.toggle('abierto', abierto);
    toggle.setAttribute('aria-expanded', String(abierto));
  });

  enlaces.forEach(enlace => enlace.addEventListener('click', cerrarMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarMenu(); });

  // Encabezado compacto y botón "arriba"
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    header.classList.toggle('compacto', y > 60);
    btnArriba.classList.toggle('visible', y > 600);
  }, { passive: true });

  btnArriba.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Resaltar la sección visible en el menú
  const secciones = [...enlaces]
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const observador = new IntersectionObserver(entradas => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        enlaces.forEach(a => a.classList.toggle('activo', a.getAttribute('href') === `#${entrada.target.id}`));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  secciones.forEach(s => observador.observe(s));
}

/* ---------- Carrusel informativo ---------- */
function iniciarCarrusel() {
  const carrusel = document.getElementById('inicio');
  const slides = carrusel.querySelectorAll('.carrusel__slide');
  const indicadores = document.getElementById('carruselIndicadores');
  const INTERVALO = 6000;
  let actual = 0;
  let temporizador;

  // Crear indicadores (puntos)
  slides.forEach((_, i) => {
    const punto = document.createElement('button');
    punto.setAttribute('role', 'tab');
    punto.setAttribute('aria-label', `Ir a la diapositiva ${i + 1}`);
    punto.addEventListener('click', () => { irA(i); reiniciar(); });
    indicadores.appendChild(punto);
  });
  const puntos = indicadores.querySelectorAll('button');

  function irA(indice) {
    slides[actual].classList.remove('activo');
    puntos[actual].classList.remove('activo');
    actual = (indice + slides.length) % slides.length;
    slides[actual].classList.add('activo');
    puntos[actual].classList.add('activo');
    puntos.forEach((p, i) => p.setAttribute('aria-selected', String(i === actual)));
  }

  const siguiente = () => irA(actual + 1);
  const anterior = () => irA(actual - 1);
  const iniciar = () => { temporizador = setInterval(siguiente, INTERVALO); };
  const detener = () => clearInterval(temporizador);
  const reiniciar = () => { detener(); iniciar(); };

  document.getElementById('carruselNext').addEventListener('click', () => { siguiente(); reiniciar(); });
  document.getElementById('carruselPrev').addEventListener('click', () => { anterior(); reiniciar(); });

  // Pausa al pasar el mouse
  carrusel.addEventListener('mouseenter', detener);
  carrusel.addEventListener('mouseleave', iniciar);

  // Teclado
  document.addEventListener('keydown', e => {
    const rect = carrusel.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    if (e.key === 'ArrowRight') { siguiente(); reiniciar(); }
    if (e.key === 'ArrowLeft') { anterior(); reiniciar(); }
  });

  // Deslizamiento táctil
  let inicioX = 0;
  carrusel.addEventListener('touchstart', e => { inicioX = e.touches[0].clientX; }, { passive: true });
  carrusel.addEventListener('touchend', e => {
    const diferencia = e.changedTouches[0].clientX - inicioX;
    if (Math.abs(diferencia) > 50) { diferencia < 0 ? siguiente() : anterior(); reiniciar(); }
  });

  irA(0);
  iniciar();
}

/* ---------- Pestañas del plan de estudio ---------- */
function iniciarPestanas() {
  const pestanas = document.querySelectorAll('.tab');
  pestanas.forEach(tab => {
    tab.addEventListener('click', () => {
      pestanas.forEach(t => { t.classList.remove('activo'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('activo');
      tab.setAttribute('aria-selected', 'true');
      renderizarPlan(tab.dataset.modalidad);
    });
  });
  renderizarPlan('matutina');
}

/* ---------- Animaciones al hacer scroll ---------- */
function iniciarAnimaciones() {
  const elementos = document.querySelectorAll(
    '.seccion__encabezado, .organigrama, .carrera__imagen, .carrera__texto, .modalidad, .perfiles__col, .area, .resena, .formulario, .formulario__info'
  );
  elementos.forEach(el => el.classList.add('revelar'));

  const observador = new IntersectionObserver((entradas, obs) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visible');
        obs.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.12 });

  elementos.forEach(el => observador.observe(el));
}
