# Su hoja de cálculo se convirtió en un sistema — versión Cloudflare

Esta versión reemplaza la integración con Base44 por autenticación propia usando **Cloudflare Pages Functions + D1**. No requiere cuenta de Base44.

## Qué incluye
- Interfaz React/Vite basada en la Etapa 1.
- Rutas de acceso, registro, recuperación y cambio de contraseña.
- API en `functions/api/auth/[[path]].ts`.
- Contraseñas almacenadas con PBKDF2-SHA-256; nunca se guardan en texto plano.
- Sesiones con cookie `HttpOnly`, `Secure` y `SameSite=Lax`.
- Tabla D1 para usuarios, sesiones y tokens de recuperación.
- Inicio con Google opcional, sujeto a configuración de OAuth.
- Restablecimiento por correo opcional, sujeto a configuración de Resend.

## Importante: qué está y qué no está listo
Este ZIP es una **base de proyecto preparada para configurar**, no una publicación ya conectada a tu cuenta. Hay que crear la base D1, configurar el ID, instalar dependencias y desplegar. El inicio con Google no funciona hasta registrar credenciales OAuth. La recuperación de contraseña solo envía correos si se configura Resend. Antes de usarla con clientes, conviene ejecutar pruebas completas y añadir límites de solicitudes/antispam.

## Requisitos
- Cuenta de Cloudflare.
- Node.js LTS instalado en el computador.
- Para desplegar con funciones, lo más sencillo es conectar el proyecto a un repositorio Git y usar Cloudflare Pages, o utilizar Wrangler desde la terminal. Subir solo la carpeta `dist` desde el panel no publica las funciones de `functions/`.

## Pasos generales

1. Descomprime el ZIP.
2. Abre una terminal en la carpeta del proyecto e instala dependencias:
   ```bash
   npm install
   ```
3. En Cloudflare, entra a **Workers & Pages → D1 SQL Database** y crea una base llamada `su-hoja-sistema-db`.
4. Copia el identificador de la base D1 y reemplaza `REEMPLAZA_CON_EL_ID_DE_TU_BASE_D1` en `wrangler.jsonc`.
5. Ejecuta el archivo `schema.sql` en la consola SQL de esa base D1.
6. Después del primer despliegue, configura `APP_URL` con la URL HTTPS real en los ajustes de Pages si vas a activar Google OAuth o recuperación por correo. Para las rutas normales, la aplicación puede usar automáticamente el origen de la solicitud.
7. Configura el proyecto en Cloudflare Pages con el directorio de salida `dist` y comando de compilación `npm run build`. Asegúrate de que la configuración de Pages incluya el binding D1 llamado `DB` apuntando a esa misma base. Si usas el archivo `wrangler.jsonc`, revisa que la configuración se sincronice con el proyecto de Pages.
8. Despliega mediante integración Git o Wrangler; para despliegue desde terminal puedes usar:
   ```bash
   npx wrangler pages deploy dist
   ```
   Si el proyecto de Pages todavía no existe, primero créalo desde Cloudflare.
9. Prueba crear cuenta, cerrar sesión, volver a entrar y las rutas protegidas.

## Configurar recuperación por correo
Para que se envíen correos reales, configura en los ajustes del proyecto Pages las variables/secretos:
- `RESEND_API_KEY` como secreto.
- `FROM_EMAIL` como dirección de remitente verificada en Resend.
- `APP_URL` con la URL HTTPS exacta del sitio.

Sin esos datos, el formulario muestra una respuesta genérica de seguridad, pero no envía correo.

## Configurar acceso con Google (opcional)
1. Crea un cliente OAuth en Google Cloud Console.
2. Configura la URL de redirección autorizada como:
   `https://TU-SITIO.pages.dev/api/auth/google/callback`
3. En Cloudflare Pages configura los secretos `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`.
4. Configura `APP_URL` con la URL HTTPS del sitio.
5. Vuelve a desplegar y prueba el botón.

## Prueba local
La aplicación visual puede iniciarse con `npm run dev`, pero el inicio de sesión necesita el entorno de Pages Functions y D1. Para probar el backend localmente:
```bash
npm run build
npx wrangler pages dev dist
```
La base local debe tener el esquema aplicado con Wrangler/D1. Para la primera prueba remota, crea una cuenta de prueba y verifica las operaciones básicas antes de usar datos reales.

## Estructura
- `src/`: interfaz React.
- `functions/`: endpoints de autenticación ejecutados por Cloudflare Pages.
- `schema.sql`: tablas D1.
- `wrangler.jsonc`: configuración Cloudflare (debes reemplazar los valores de ejemplo).

## Nota de seguridad
El proyecto es una base inicial. Antes de abrir el registro al público, añade limitación de intentos para login/registro/recuperación, protección anti-bots, monitoreo, política de privacidad, términos y pruebas de seguridad. No uses datos personales reales durante las primeras pruebas.
