# Liquid Glass Portfolio

Portfolio con estilo "liquid glass", vibe playful + creative coding, construido con React + Vite.

## Estructura del proyecto

```
liquid-glass-portfolio/
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
└── src/
    ├── main.jsx              ← entry point
    ├── App.jsx                ← arma todo junto
    ├── styles/
    │   └── tokens.css         ← colores, tipografía, todos los estilos
    ├── data/
    │   ├── nav.js              ← links del menú
    │   └── projects.js         ← tus proyectos (editá esto para agregar los tuyos)
    └── components/
        ├── BlobCanvas.jsx      ← fondo animado (creative coding)
        ├── Nav.jsx
        ├── Hero.jsx
        ├── About.jsx
        ├── ProjectCard.jsx
        ├── Projects.jsx
        ├── Playground.jsx
        └── Footer.jsx
```

## Cómo correrlo en tu compu

Necesitás [Node.js](https://nodejs.org) instalado (versión 18 o más nueva). Después, desde la carpeta del proyecto:

```bash
npm install
npm run dev
```

Esto te va a dar una URL tipo `http://localhost:5173` — abrila en el navegador y ahí ves el sitio corriendo, con hot-reload (cada vez que guardás un archivo, se actualiza solo).

## Qué editar primero

1. **`src/data/projects.js`** — cambiá los 3 proyectos placeholder por los tuyos reales.
2. **`src/components/Hero.jsx`** — poné tu nombre real en el `<h1>`.
3. **`src/components/Footer.jsx`** — poné los links reales de tu GitHub/LinkedIn/mail.
4. **`src/styles/tokens.css`** — si en algún momento querés cambiar colores, están todos arriba del archivo en `:root`.

---

## Guía rápida de Git y GitHub (para recién empezar)

Git es el sistema que guarda el historial de cambios de tu código. GitHub es la web donde alojás ese historial para que otros (o vos desde otra compu) lo vean.

### Opción A — con la terminal (más control, más útil a largo plazo)

**1. Instalar Git** (si no lo tenés): [git-scm.com](https://git-scm.com/downloads)

**2. Iniciar el repositorio local**, desde adentro de la carpeta `liquid-glass-portfolio`:

```bash
git init
git add .
git commit -m "primer commit: portfolio base"
```

- `git init` → convierte esta carpeta en un repositorio de Git.
- `git add .` → marca todos los archivos como "listos para guardar" (excepto los que están en `.gitignore`, como `node_modules`).
- `git commit -m "..."` → guarda ese estado con un mensaje descriptivo. Cada commit es como una "foto" del proyecto en ese momento.

**3. Crear el repositorio en GitHub:**

- Entrá a [github.com/new](https://github.com/new)
- Ponele un nombre (ej. `liquid-glass-portfolio`)
- **No** marques "Add a README" (ya tenés uno)
- Creá el repositorio

**4. Conectar tu repo local con el de GitHub** (GitHub te muestra estos comandos apenas creás el repo, con tu usuario real):

```bash
git remote add origin https://github.com/TU-USUARIO/liquid-glass-portfolio.git
git branch -M main
git push -u origin main
```

- `git remote add origin ...` → le dice a Git dónde está la versión "en la nube" de este repo.
- `git push` → sube tus commits a GitHub.

**5. Para subir cambios futuros**, ya no hace falta repetir todo, solo:

```bash
git add .
git commit -m "descripción de lo que cambiaste"
git push
```

### Opción B — con GitHub Desktop (interfaz visual, sin comandos)

Si la terminal se te hace cuesta arriba todavía, [GitHub Desktop](https://desktop.github.com/) hace lo mismo con botones:

1. Instalalo y logueate con tu cuenta de GitHub.
2. "Add local repository" → seleccioná la carpeta `liquid-glass-portfolio`.
3. Te va a preguntar si querés crear un repo ahí — decís que sí.
4. Cada vez que hagas cambios, vas a ver los archivos modificados en la app, escribís un mensaje de commit, y apretás "Commit to main".
5. Después apretás "Publish repository" (la primera vez) o "Push origin" (las siguientes).

Es exactamente lo mismo que la Opción A, pero sin escribir comandos.

### Para publicar el sitio online (gratis)

Una vez que el código está en GitHub, dos opciones simples:

- **Vercel** ([vercel.com](https://vercel.com)) — conectás tu cuenta de GitHub, elegís el repo, y detecta Vite automáticamente. Cada `git push` futuro actualiza el sitio solo.
- **GitHub Pages** — un poco más manual para proyectos con Vite (necesita configurar `base` en `vite.config.js`), pero también gratis.

Si querés, en otro momento te ayudo a dejarlo publicado en Vercel paso a paso.
