# Ingeniería en Computación — UNHSJM

Página web informativa de la carrera **Ingeniería en Computación** de la **Universidad Nacional Héroes de San José de las Mulas** (Managua, Nicaragua).

**Examen II Parcial · Programación Web**
**Autor:** Giancarlo Javier Montes Arauz

🔗 **Sitio publicado:** https://examen-ii-parcial-programacion-web.vercel.app
📦 **Repositorio:** https://github.com/Montes2001/examen-ii-parcial-programacion-web

---

## Contenido de la página

1. Carrusel informativo
2. Menú principal (fijo y responsive)
3. Organigrama de la Universidad
4. Descripción de la carrera
5. Modalidades, duración y horarios
6. Perfiles de salida
7. Áreas de estudio
8. Plan de estudio por modalidad
9. Reseñas (cargadas dinámicamente desde la base de datos)
10. Formulario de comentarios (guardado en base de datos online)

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | HTML5, CSS3 (hoja de estilo externa), JavaScript (ES6+) |
| Backend | Función serverless de Vercel (Node.js) — `api/comentarios.js` |
| Base de datos | Neon PostgreSQL (serverless) |
| Hosting / CI | Vercel conectado a GitHub (despliegue automático en cada `git push`) |

## Estructura

```
├── index.html            Página principal (10 secciones)
├── css/styles.css        Hoja de estilo
├── js/main.js            Menú, carrusel, pestañas y animaciones
├── js/plan.js            Datos y renderizado del plan de estudio
├── js/comentarios.js     Formulario y reseñas (consume la API)
├── api/comentarios.js    API serverless GET/POST → Neon
├── db/schema.sql         Script de la tabla "comentarios"
├── img/                  Logos e imágenes del carrusel
├── docs/DOCUMENTACION.md Documentación completa (Markdown)
├── docs/DOCUMENTACION.pdf Documentación completa (PDF)
├── package.json
└── vercel.json
```

## Ejecución local

```bash
npm install
vercel link              # vincular con el proyecto de Vercel
vercel env pull .env.local   # descarga DATABASE_URL
vercel dev               # http://localhost:3000
```

Consulte [docs/DOCUMENTACION.pdf](docs/DOCUMENTACION.pdf) (o [docs/DOCUMENTACION.md](docs/DOCUMENTACION.md)) para la documentación completa.
