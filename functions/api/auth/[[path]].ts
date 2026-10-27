interface Env {
  DB: D1Database;
  APP_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  RESEND_API_KEY?: string;
  FROM_EMAIL?: string;
}
type PagesContext = { request: Request; env: Env; params: Record<string, string>; waitUntil: (promise: Promise<unknown>) => void; next: () => Promise<Response>; data: Record<string, unknown> };
type UserRow = { id: string; email: string; full_name: string; company_name: string | null; avatar_url: string | null; password_hash: string | null; google_sub: string | null };
const SESSION_COOKIE = "__Host-session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

function json(data: unknown, status = 200, headers: HeadersInit = {}) {
  const h = new Headers(headers); h.set("Content-Type", "application/json; charset=utf-8"); h.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(data), { status, headers: h });
}
function fail(message: string, status = 400) { return json({ error: message }, status); }
function cookieValue(request: Request, name: string) {
  const raw = request.headers.get("Cookie") || "";
  for (const piece of raw.split(";")) { const i = piece.indexOf("="); if (i > -1 && piece.slice(0, i).trim() === name) return piece.slice(i + 1).trim(); }
  return null;
}
function setCookie(name: string, value: string, maxAge: number) {
  return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}
function clearCookie(name: string) { return setCookie(name, "", 0); }
function randomToken(bytes = 32) { const b = crypto.getRandomValues(new Uint8Array(bytes)); return base64url(b); }
function base64url(bytes: Uint8Array) { let s = ""; for (const b of bytes) s += String.fromCharCode(b); return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
function fromBase64url(s: string) { const raw = atob(s.replace(/-/g,"+").replace(/_/g,"/") + "===".slice((s.length+3)%4)); return Uint8Array.from(raw, c=>c.charCodeAt(0)); }
async function sha256(value: string) { return base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))); }
async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16)); const iterations = 310000;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name:"PBKDF2", salt, iterations, hash:"SHA-256" }, key, 256);
  return `pbkdf2$${iterations}$${base64url(salt)}$${base64url(new Uint8Array(bits))}`;
}
async function verifyPassword(password: string, stored: string | null) {
  if (!stored) return false;
  const [kind, iter, salt, expected] = stored.split("$"); if (kind !== "pbkdf2" || !iter || !salt || !expected) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = new Uint8Array(await crypto.subtle.deriveBits({ name:"PBKDF2", salt:fromBase64url(salt), iterations:Number(iter), hash:"SHA-256" }, key, 256));
  const actual = base64url(bits); return actual === expected;
}
function publicUser(row: UserRow) { return { id: row.id, email: row.email, full_name: row.full_name, company_name: row.company_name, avatar_url: row.avatar_url }; }
async function readBody(request: Request) { try { return await request.json() as Record<string, unknown>; } catch { return null; } }
function validEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254; }
async function createSession(env: Env, userId: string) {
  const token = randomToken(); const tokenHash = await sha256(token); const now = Math.floor(Date.now()/1000);
  await env.DB.prepare("INSERT INTO sessions (token_hash,user_id,expires_at,created_at) VALUES (?,?,?,?)").bind(tokenHash,userId,now+SESSION_SECONDS,now).run();
  return setCookie(SESSION_COOKIE, token, SESSION_SECONDS);
}
async function getUser(request: Request, env: Env): Promise<UserRow | null> {
  const token = cookieValue(request, SESSION_COOKIE); if (!token) return null;
  const tokenHash = await sha256(token); const now = Math.floor(Date.now()/1000);
  const row = await env.DB.prepare("SELECT u.id,u.email,u.full_name,u.company_name,u.avatar_url,u.password_hash,u.google_sub FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?").bind(tokenHash,now).first<UserRow>();
  return row || null;
}
async function mailReset(env: Env, email: string, link: string) {
  if (!env.RESEND_API_KEY || !env.FROM_EMAIL) return;
  await fetch("https://api.resend.com/emails", { method:"POST", headers:{ Authorization:`Bearer ${env.RESEND_API_KEY}`, "Content-Type":"application/json" }, body:JSON.stringify({ from:env.FROM_EMAIL, to:[email], subject:"Restablece tu contraseña", html:`<p>Recibimos una solicitud para cambiar la contraseña de tu cuenta.</p><p><a href="${link}">Crear nueva contraseña</a></p><p>El enlace vence en 30 minutos. Si no solicitaste el cambio, ignora este mensaje.</p>` }) });
}
function htmlMessage(title: string, message: string, status = 400) {
  return new Response(`<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title><body style="font:16px system-ui;max-width:560px;margin:12vh auto;padding:24px;color:#0f172a"><h1>${title}</h1><p>${message}</p><p><a href="/login">Volver a iniciar sesión</a></p></body></html>`, { status, headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"} });
}
export const onRequest = async (context: PagesContext) => {
  const { request, env } = context; const url = new URL(request.url); const path = url.pathname.replace(/^\/api\/auth\/?/, "").replace(/\/$/, "");
  if (request.method === "OPTIONS") return new Response(null, { status:204 });
  if (path === "google/status" && request.method === "GET") return json({ enabled: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) });
  if (path === "me" && request.method === "GET") {
    const user = await getUser(request,env); return json({ user: user ? publicUser(user) : null });
  }
  if (path === "register" && request.method === "POST") {
    const body = await readBody(request); if (!body) return fail("Solicitud no válida.");
    const fullName = String(body.full_name || "").trim().slice(0,120), company = String(body.company_name || "").trim().slice(0,160), email = String(body.email || "").trim().toLowerCase(), password = String(body.password || "");
    if (fullName.length < 2) return fail("Escribe tu nombre completo.");
    if (!validEmail(email)) return fail("Escribe un correo electrónico válido.");
    if (password.length < 8 || password.length > 256) return fail("La contraseña debe tener entre 8 y 256 caracteres.");
    const exists = await env.DB.prepare("SELECT id FROM users WHERE email=? COLLATE NOCASE").bind(email).first();
    if (exists) return fail("Ya existe una cuenta con ese correo. Intenta iniciar sesión.",409);
    const id = crypto.randomUUID(); const hash = await hashPassword(password);
    try { await env.DB.prepare("INSERT INTO users (id,email,full_name,company_name,password_hash,created_at) VALUES (?,?,?,?,?,?)").bind(id,email,fullName,company || null,hash,new Date().toISOString()).run(); }
    catch { return fail("No fue posible crear la cuenta. Verifica si el correo ya está registrado.",409); }
    const cookie = await createSession(env,id);
    return json({ user:{id,email,full_name:fullName,company_name:company || null,avatar_url:null} },201,{"Set-Cookie":cookie});
  }
  if (path === "login" && request.method === "POST") {
    const body = await readBody(request); if (!body) return fail("Solicitud no válida.");
    const email = String(body.email || "").trim().toLowerCase(), password = String(body.password || "");
    const user = await env.DB.prepare("SELECT id,email,full_name,company_name,avatar_url,password_hash,google_sub FROM users WHERE email=? COLLATE NOCASE").bind(email).first<UserRow>();
    if (!user || !(await verifyPassword(password,user.password_hash))) return fail("Correo o contraseña incorrectos.",401);
    const cookie = await createSession(env,user.id); return json({ user:publicUser(user) },200,{"Set-Cookie":cookie});
  }
  if (path === "logout" && request.method === "POST") {
    const token = cookieValue(request,SESSION_COOKIE); if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await sha256(token)).run();
    return json({ ok:true },200,{"Set-Cookie":clearCookie(SESSION_COOKIE)});
  }
  if (path === "forgot-password" && request.method === "POST") {
    const body = await readBody(request); if (!body) return fail("Solicitud no válida.");
    const email = String(body.email || "").trim().toLowerCase(); if (!validEmail(email)) return fail("Escribe un correo electrónico válido.");
    const user = await env.DB.prepare("SELECT id,email FROM users WHERE email=? COLLATE NOCASE").bind(email).first<{id:string,email:string}>();
    if (user && env.RESEND_API_KEY && env.FROM_EMAIL) {
      const token = randomToken(); const tokenHash = await sha256(token); const now = Math.floor(Date.now()/1000);
      await env.DB.prepare("DELETE FROM password_reset_tokens WHERE user_id=?").bind(user.id).run();
      await env.DB.prepare("INSERT INTO password_reset_tokens (token_hash,user_id,expires_at,used_at) VALUES (?,?,?,NULL)").bind(tokenHash,user.id,now+1800).run();
      await mailReset(env,user.email,`${env.APP_URL || url.origin}/restablecer-clave?token=${encodeURIComponent(token)}`);
    }
    return json({ message:"Si el correo corresponde a una cuenta y el envío de correo está configurado, recibirás instrucciones para restablecer tu contraseña." });
  }
  if (path === "reset-password" && request.method === "POST") {
    const body = await readBody(request); if (!body) return fail("Solicitud no válida.");
    const token = String(body.token || ""), password = String(body.password || "");
    if (password.length < 8 || password.length > 256) return fail("La contraseña debe tener entre 8 y 256 caracteres.");
    if (!token) return fail("El enlace de recuperación no es válido.");
    const now = Math.floor(Date.now()/1000); const tokenHash = await sha256(token);
    const record = await env.DB.prepare("SELECT user_id FROM password_reset_tokens WHERE token_hash=? AND expires_at>? AND used_at IS NULL").bind(tokenHash,now).first<{user_id:string}>();
    if (!record) return fail("El enlace venció o ya fue utilizado. Solicita uno nuevo.",400);
    const hash = await hashPassword(password);
    await env.DB.prepare("UPDATE users SET password_hash=? WHERE id=?").bind(hash,record.user_id).run();
    await env.DB.prepare("UPDATE password_reset_tokens SET used_at=? WHERE token_hash=?").bind(now,tokenHash).run();
    await env.DB.prepare("DELETE FROM sessions WHERE user_id=?").bind(record.user_id).run();
    return json({ ok:true });
  }
  if (path === "google/start" && request.method === "GET") {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return htmlMessage("Google no configurado","Para activar esta opción, configura GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en los secretos de Cloudflare.",503);
    const state = randomToken(24); const redirect = `${env.APP_URL || url.origin}/api/auth/google/callback`;
    const google = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    google.searchParams.set("client_id",env.GOOGLE_CLIENT_ID); google.searchParams.set("redirect_uri",redirect); google.searchParams.set("response_type","code"); google.searchParams.set("scope","openid email profile"); google.searchParams.set("state",state); google.searchParams.set("prompt","select_account");
    return new Response(null,{status:302,headers:{Location:google.toString(),"Set-Cookie":setCookie("__Host-google-state",state,600),"Cache-Control":"no-store"}});
  }
  if (path === "google/callback" && request.method === "GET") {
    const state = url.searchParams.get("state"), code = url.searchParams.get("code"), saved = cookieValue(request,"__Host-google-state");
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !state || !saved || state !== saved || !code) return htmlMessage("No se pudo iniciar sesión","La verificación de Google falló. Vuelve a intentarlo.",400);
    const redirect = `${env.APP_URL || url.origin}/api/auth/google/callback`;
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({code,client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,redirect_uri:redirect,grant_type:"authorization_code"})});
    const tokenData = await tokenResponse.json() as {access_token?:string};
    if (!tokenResponse.ok || !tokenData.access_token) return htmlMessage("No se pudo iniciar sesión","Google no pudo validar el acceso. Vuelve a intentarlo.",400);
    const infoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo",{headers:{Authorization:`Bearer ${tokenData.access_token}`}});
    const info = await infoResponse.json() as {sub?:string,email?:string,email_verified?:boolean,name?:string,picture?:string};
    if (!infoResponse.ok || !info.sub || !info.email || !info.email_verified) return htmlMessage("Cuenta de Google no válida","Google no confirmó el correo electrónico de esta cuenta.",400);
    let user = await env.DB.prepare("SELECT id,email,full_name,company_name,avatar_url,password_hash,google_sub FROM users WHERE google_sub=? OR email=? COLLATE NOCASE").bind(info.sub,info.email.toLowerCase()).first<UserRow>();
    if (user) {
      if (user.google_sub && user.google_sub !== info.sub) return htmlMessage("No se pudo vincular la cuenta","Este correo ya está asociado a otra forma de acceso. Inicia sesión con tu contraseña.",409);
      await env.DB.prepare("UPDATE users SET google_sub=?,avatar_url=COALESCE(?,avatar_url) WHERE id=?").bind(info.sub,info.picture || null,user.id).run();
      user.google_sub=info.sub; if(info.picture) user.avatar_url=info.picture;
    } else {
      const id=crypto.randomUUID(); const name=(info.name || info.email.split("@")[0]).slice(0,120);
      await env.DB.prepare("INSERT INTO users (id,email,full_name,avatar_url,google_sub,created_at) VALUES (?,?,?,?,?,?)").bind(id,info.email.toLowerCase(),name,info.picture || null,info.sub,new Date().toISOString()).run();
      user={id,email:info.email.toLowerCase(),full_name:name,company_name:null,avatar_url:info.picture || null,password_hash:null,google_sub:info.sub};
    }
    const sessionCookie=await createSession(env,user.id);
    const headers = new Headers({Location:`${env.APP_URL || url.origin}/app`,"Cache-Control":"no-store"}); headers.append("Set-Cookie",sessionCookie); headers.append("Set-Cookie",clearCookie("__Host-google-state")); return new Response(null,{status:302,headers});
  }
  return fail("Ruta de autenticación no encontrada.",404);
};
