/* ==========================================================================
   comentarios.js - Formulario de comentarios y reseñas desde la base de datos
   Se comunica con la función serverless /api/comentarios (Vercel + Neon)
   ========================================================================== */

const API_COMENTARIOS = '/api/comentarios';
const COLORES_AVATAR = ['', 'avatar--cian', 'avatar--amarillo', 'avatar--azul'];

document.addEventListener('DOMContentLoaded', () => {
  cargarComentarios();
  iniciarFormulario();
});

/* ---------- Utilidades ---------- */
// Evita inyección de HTML (XSS) al mostrar texto escrito por usuarios
function escaparHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

const estrellas = n => '★'.repeat(n) + '☆'.repeat(5 - n);

function iniciales(nombre) {
  return nombre.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

function formatearFecha(iso) {
  return new Date(iso).toLocaleDateString('es-NI', { day: '2-digit', month: 'long', year: 'numeric' });
}

/* ---------- Reseñas (GET) ---------- */
function crearTarjeta(c, nueva = false) {
  const color = COLORES_AVATAR[c.id % COLORES_AVATAR.length];
  const articulo = document.createElement('article');
  articulo.className = `resena${nueva ? ' resena--nueva' : ''}`;
  articulo.innerHTML = `
    <div class="resena__cabecera">
      <div class="avatar ${color}">${escaparHTML(iniciales(c.nombre))}</div>
      <div>
        <h3>${escaparHTML(c.nombre)}</h3>
        <span class="resena__meta">${escaparHTML(c.tipo)} · ${escaparHTML(c.modalidad)}</span>
      </div>
    </div>
    <div class="estrellas" aria-label="${c.calificacion} de 5 estrellas">${estrellas(c.calificacion)}</div>
    <p>“${escaparHTML(c.comentario)}”</p>
    <span class="resena__fecha">${formatearFecha(c.creado_en)}</span>`;
  return articulo;
}

function actualizarResumen(promedio, total) {
  const resumen = document.getElementById('resenasResumen');
  if (!total) { resumen.hidden = true; return; }
  resumen.hidden = false;
  document.getElementById('promedio').textContent = Number(promedio).toFixed(1);
  document.getElementById('promedioEstrellas').textContent = estrellas(Math.round(promedio));
  document.getElementById('totalResenas').textContent = `${total} ${total === 1 ? 'reseña' : 'reseñas'}`;
}

async function cargarComentarios() {
  const contenedor = document.getElementById('resenasBD');
  try {
    const respuesta = await fetch(API_COMENTARIOS);
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    const datos = await respuesta.json();

    contenedor.innerHTML = '';
    if (!datos.comentarios.length) {
      contenedor.innerHTML = '<p class="cargando" id="estadoResenas">Aún no hay reseñas. ¡Sé el primero en opinar!</p>';
    } else {
      datos.comentarios.forEach(c => contenedor.appendChild(crearTarjeta(c)));
    }
    actualizarResumen(datos.promedio, datos.total);
  } catch (error) {
    console.error('Error al cargar comentarios:', error);
    contenedor.innerHTML = '<p class="cargando">No fue posible cargar las reseñas en este momento.</p>';
  }
}

/* ---------- Formulario (POST) ---------- */
function validar(datos) {
  const errores = {};
  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (datos.nombre.length < 3) errores.nombre = 'Ingrese su nombre (mínimo 3 caracteres).';
  if (!correoValido.test(datos.correo)) errores.correo = 'Ingrese un correo electrónico válido.';
  if (!datos.tipo) errores.tipo = 'Seleccione una opción.';
  if (!datos.modalidad) errores.modalidad = 'Seleccione una modalidad.';
  if (!(datos.calificacion >= 1 && datos.calificacion <= 5)) errores.calificacion = 'Seleccione una calificación.';
  if (datos.comentario.length < 10) errores.comentario = 'El comentario debe tener al menos 10 caracteres.';
  return errores;
}

function mostrarErrores(form, errores) {
  form.querySelectorAll('.error').forEach(el => {
    const campo = el.dataset.error;
    el.textContent = errores[campo] || '';
    el.closest('.campo').classList.toggle('invalido', Boolean(errores[campo]));
  });
}

function mostrarMensaje(texto, tipo) {
  const mensaje = document.getElementById('mensajeForm');
  mensaje.textContent = texto;
  mensaje.className = `mensaje ${tipo}`;
}

function iniciarFormulario() {
  const form = document.getElementById('formComentario');
  const boton = document.getElementById('btnEnviar');
  const textarea = document.getElementById('comentario');
  const contador = document.getElementById('contador');

  textarea.addEventListener('input', () => { contador.textContent = textarea.value.length; });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    mostrarMensaje('', '');

    const fd = new FormData(form);
    const datos = {
      nombre: (fd.get('nombre') || '').trim(),
      correo: (fd.get('correo') || '').trim(),
      tipo: fd.get('tipo') || '',
      modalidad: fd.get('modalidad') || '',
      calificacion: Number(fd.get('calificacion')),
      comentario: (fd.get('comentario') || '').trim(),
      sitio_web: fd.get('sitio_web') || '' // campo trampa anti-spam
    };

    const errores = validar(datos);
    mostrarErrores(form, errores);
    if (Object.keys(errores).length) {
      mostrarMensaje('Por favor corrija los campos marcados.', 'fallo');
      return;
    }

    boton.disabled = true;
    boton.textContent = 'Enviando…';

    try {
      const respuesta = await fetch(API_COMENTARIOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      const resultado = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok) {
        if (resultado.errores) mostrarErrores(form, resultado.errores);
        throw new Error(resultado.mensaje || 'No se pudo guardar el comentario.');
      }

      // Insertar la nueva reseña al inicio de la lista
      const contenedor = document.getElementById('resenasBD');
      document.getElementById('estadoResenas')?.remove();
      contenedor.prepend(crearTarjeta(resultado.comentario, true));
      actualizarResumen(resultado.promedio, resultado.total);

      form.reset();
      contador.textContent = '0';
      mostrarMensaje('¡Gracias! Tu comentario fue guardado correctamente.', 'exito');
    } catch (error) {
      mostrarMensaje(error.message, 'fallo');
    } finally {
      boton.disabled = false;
      boton.textContent = 'Enviar comentario';
    }
  });
}
