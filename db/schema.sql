-- ==========================================================================
-- Base de datos: Neon PostgreSQL
-- Proyecto: Ingeniería en Computación - UNHSJM
-- Autor: Giancarlo Javier Montes Arauz
-- Nota: la API (/api/comentarios) también crea la tabla automáticamente
--       si no existe, por lo que ejecutar este script es opcional.
-- ==========================================================================

CREATE TABLE IF NOT EXISTS comentarios (
  id           SERIAL PRIMARY KEY,
  nombre       VARCHAR(100) NOT NULL,
  correo       VARCHAR(150) NOT NULL,
  tipo         VARCHAR(30)  NOT NULL,          -- Estudiante, Egresado, Docente, Aspirante, Visitante
  modalidad    VARCHAR(30)  NOT NULL,          -- Matutina, Sabatina, Por Encuentro
  calificacion SMALLINT     NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
  comentario   TEXT         NOT NULL,
  creado_en    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comentarios_fecha ON comentarios (creado_en DESC);

-- Consultas útiles
-- SELECT * FROM comentarios ORDER BY creado_en DESC;
-- SELECT ROUND(AVG(calificacion), 2) AS promedio, COUNT(*) AS total FROM comentarios;
