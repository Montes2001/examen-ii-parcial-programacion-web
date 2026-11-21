/* ==========================================================================
   API: /api/comentarios  (Función serverless de Vercel - Node.js)
   GET  -> lista los últimos 30 comentarios + promedio y total
   POST -> valida y guarda un comentario nuevo en Neon PostgreSQL
   Variable de entorno requerida: DATABASE_URL (creada por la integración Neon)
   ========================================================================== */
import { neon } from '@neondatabase/serverless';

const TIPOS = ['Estudiante', 'Egresado', 'Docente', 'Aspirante', 'Visitante'];
const MODALIDADES = ['Matutina', 'Sabatina', 'Por Encuentro'];
const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

let tablaLista = false;

// Crea la tabla si todavía no existe (igual que db/schema.sql)
async function asegurarTabla(sql) {
  if (tablaLista) return;
  await sql`
    CREATE TABLE IF NOT EXISTS comentarios (
      id           SERIAL PRIMARY KEY,
      nombre       VARCHAR(100) NOT NULL,
      correo       VARCHAR(150) NOT NULL,
      tipo         VARCHAR(30)  NOT NULL,
      modalidad    VARCHAR(30)  NOT NULL,
      calificacion SMALLINT     NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
      comentario   TEXT         NOT NULL,
      creado_en    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )`;
  tablaLista = true;
}

async function estadisticas(sql) {
  const [fila] = await sql`
    SELECT COALESCE(AVG(calificacion), 0)::float AS promedio, COUNT(*)::int AS total
    FROM comentarios`;
  return fila;
}

function validar(body) {
  const datos = {
    nombre: String(body.nombre ?? '').trim(),
    correo: String(body.correo ?? '').trim().toLowerCase(),
    tipo: String(body.tipo ?? '').trim(),
    modalidad: String(body.modalidad ?? '').trim(),
    calificacion: Number(body.calificacion),
    comentario: String(body.comentario ?? '').trim()
  };
  const errores = {};
  if (datos.nombre.length < 3 || datos.nombre.length > 100) errores.nombre = 'El nombre debe tener entre 3 y 100 caracteres.';
  if (!CORREO_VALIDO.test(datos.correo) || datos.correo.length > 150) errores.correo = 'Correo electrónico inválido.';
  if (!TIPOS.includes(datos.tipo)) errores.tipo = 'Opción no válida.';
  if (!MODALIDADES.includes(datos.modalidad)) errores.modalidad = 'Modalidad no válida.';
  if (!Number.isInteger(datos.calificacion) || datos.calificacion < 1 || datos.calificacion > 5) errores.calificacion = 'La calificación debe ser de 1 a 5.';
  if (datos.comentario.length < 10 || datos.comentario.length > 1000) errores.comentario = 'El comentario debe tener entre 10 y 1000 caracteres.';
  return { datos, errores };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    return res.status(500).json({ mensaje: 'La base de datos no está configurada (falta DATABASE_URL).' });
  }
  const sql = neon(url);

  try {
    await asegurarTabla(sql);

    if (req.method === 'GET') {
      // No se expone el correo electrónico de los usuarios
      const comentarios = await sql`
        SELECT id, nombre, tipo, modalidad, calificacion, comentario, creado_en
        FROM comentarios
        ORDER BY creado_en DESC
        LIMIT 30`;
      const { promedio, total } = await estadisticas(sql);
      return res.status(200).json({ comentarios, promedio, total });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

      // Campo trampa: si un bot lo llena, se ignora silenciosamente
      if (body.sitio_web) return res.status(400).json({ mensaje: 'Solicitud no válida.' });

      const { datos, errores } = validar(body);
      if (Object.keys(errores).length) {
        return res.status(422).json({ mensaje: 'Revise los datos del formulario.', errores });
      }

      // Consulta parametrizada: evita inyección SQL
      const [comentario] = await sql`
        INSERT INTO comentarios (nombre, correo, tipo, modalidad, calificacion, comentario)
        VALUES (${datos.nombre}, ${datos.correo}, ${datos.tipo}, ${datos.modalidad}, ${datos.calificacion}, ${datos.comentario})
        RETURNING id, nombre, tipo, modalidad, calificacion, comentario, creado_en`;
      const { promedio, total } = await estadisticas(sql);
      return res.status(201).json({ comentario, promedio, total });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ mensaje: 'Método no permitido.' });
  } catch (error) {
    console.error('Error en /api/comentarios:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor. Intente más tarde.' });
  }
}
