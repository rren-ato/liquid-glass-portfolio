# Liquid Glass Portfolio

Portfolio con estilo "liquid glass", construido con React + Vite.

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
    │   └── projects.js         ← tus proyectos (actualizaciones)
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


**. Para subir cambios futuros**, ya no hace falta repetir todo, solo:

```bash
git add .
git commit -m "descripción de lo que cambiaste"
git push
```


### Para publicar el sitio online

- **Vercel** ([vercel.com](https://vercel.com))

