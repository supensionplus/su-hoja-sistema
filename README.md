# Su hoja de cálculo se convirtió en un sistema — Etapa 1

Base inicial de interfaz con React, TypeScript, Vite, Tailwind CSS y React Router.

## Requisitos
- Node.js 20 o posterior
- npm

## Ejecutar localmente
1. Descomprima la carpeta.
2. Abra una terminal dentro de esta carpeta.
3. Ejecute `npm install`.
4. Ejecute `npm run dev`.
5. Abra la dirección local que muestra Vite.

## Compilar para producción
Ejecute `npm run build`. Los archivos listos para publicar se generan en `dist/`.

## Estructura
- `src/components/ui/`: Button, Input, Select, Textarea, Card, Badge, EmptyState, Skeleton y Loader.
- `src/components/layout/AppLayout.tsx`: sidebar responsivo, header, navegación y área principal.
- `src/styles/index.css`: variables CSS semánticas, tipografía y estilos globales.
- `src/App.tsx`: rutas placeholder para `/`, `/sistemas`, `/importar`, `/auditoria` y `/configuracion`.
- `tailwind.config.js`: tokens de color y tipografía.

## Alcance deliberado
Esta etapa solo establece la base visual y estructural. No implementa autenticación, Base44, IA, carga/procesamiento de archivos, pagos ni lógica de negocio. El perfil y las notificaciones son elementos estáticos de demostración.

## Notas
- La fuente Inter se carga desde Google Fonts; si no hay conexión, se usa la fuente del sistema.
- El menú lateral móvil se abre con el botón hamburguesa. En escritorio, el menú se puede contraer.
- Las rutas desconocidas redirigen al panel general.
