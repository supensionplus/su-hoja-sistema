import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "./AuthContext";

function Brand() {
  return <Link to="/" className="mb-8 inline-flex items-center gap-3 text-slate-900">
    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200"><Sparkles size={22}/></span>
    <span><span className="block text-lg font-bold leading-tight">Su hoja de cálculo</span><span className="block text-xs text-slate-500">se convirtió en un sistema</span></span>
  </Link>;
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <main className="min-h-screen bg-slate-50">
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md"><Brand/><h1 className="text-3xl font-bold tracking-tight text-slate-950">{title}</h1><p className="mt-2 mb-8 text-slate-500">{subtitle}</p>{children}</div>
      </section>
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full border border-white/10"/><div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full border border-white/10"/>
        <div className="relative"><div className="mb-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm"><ShieldCheck size={16} className="mr-2"/> Tu espacio de trabajo</div><h2 className="max-w-lg text-4xl font-semibold leading-tight">Deja de depender de hojas dispersas. Empieza a construir sistemas.</h2><p className="mt-5 max-w-md leading-7 text-indigo-100">Organiza tus procesos con una experiencia clara, segura y preparada para crecer.</p></div>
        <div className="relative flex items-center gap-3 text-sm text-indigo-100"><LockKeyhole size={17}/> Acceso protegido por sesión segura</div>
      </aside>
    </div>
  </main>;
}

function ErrorText({ children }: { children: string }) { return <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{children}</p>; }
function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="mb-4 block"><span className="mb-2 block text-sm font-medium text-slate-700">{label}</span><input {...props} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"/></label>;
}
function Submit({ children, busy }: { children: React.ReactNode; busy: boolean }) { return <button disabled={busy} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60">{busy ? "Procesando…" : children}<ArrowRight size={17}/></button>; }

export function LoginPage() {
  const { user, loading, signIn, googleEnabled } = useAuth(); const navigate = useNavigate();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  if (!loading && user) return <Navigate to="/app" replace/>;
  async function submit(e: FormEvent) { e.preventDefault(); setError(""); setBusy(true); try { await signIn(email, password); navigate("/app"); } catch (err) { setError(err instanceof Error ? err.message : "No fue posible iniciar sesión."); } finally { setBusy(false); } }
  return <AuthShell title="Qué bueno verte de nuevo" subtitle="Ingresa a tu espacio de trabajo.">
    <form onSubmit={submit}><Field label="Correo electrónico" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@empresa.com"/><Field label="Contraseña" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Tu contraseña"/><div className="-mt-1 mb-5 text-right"><Link className="text-sm font-medium text-indigo-600 hover:text-indigo-800" to="/recuperar-clave">¿Olvidaste tu contraseña?</Link></div><Submit busy={busy}>Iniciar sesión</Submit>{error && <ErrorText>{error}</ErrorText>}</form>
    <div className="my-6 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200"/><span>O CONTINÚA CON</span><span className="h-px flex-1 bg-slate-200"/></div>
    <button type="button" onClick={()=>{ if (googleEnabled) window.location.href="/api/auth/google/start"; else setError("El acceso con Google estará disponible cuando se configuren las credenciales de Google en Cloudflare."); }} className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"><span className="font-bold text-lg">G</span> Continuar con Google</button>
    <p className="mt-7 text-center text-sm text-slate-500">¿Aún no tienes cuenta? <Link className="font-semibold text-indigo-600" to="/registro">Crear cuenta</Link></p>
  </AuthShell>;
}

export function RegisterPage() {
  const { user, loading, signUp } = useAuth(); const navigate = useNavigate();
  const [name,setName]=useState(""); const [company,setCompany]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [confirm,setConfirm]=useState(""); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  if (!loading && user) return <Navigate to="/app" replace/>;
  async function submit(e:FormEvent) { e.preventDefault(); setError(""); if(password.length<8){setError("La contraseña debe tener al menos 8 caracteres.");return;} if(password!==confirm){setError("Las contraseñas no coinciden.");return;} setBusy(true); try{await signUp({full_name:name,company_name:company,email,password});navigate("/app");}catch(err){setError(err instanceof Error?err.message:"No fue posible crear la cuenta.");}finally{setBusy(false);} }
  return <AuthShell title="Crea tu cuenta" subtitle="Tu próximo sistema empieza con un primer paso.">
    <form onSubmit={submit}><Field label="Nombre completo" value={name} onChange={e=>setName(e.target.value)} autoComplete="name" required placeholder="Tu nombre"/><Field label="Nombre de la empresa (opcional)" value={company} onChange={e=>setCompany(e.target.value)} autoComplete="organization" placeholder="Tu empresa"/><Field label="Correo electrónico" type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required placeholder="tu@empresa.com"/><Field label="Contraseña (mínimo 8 caracteres)" type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" required minLength={8} placeholder="Crea una contraseña"/><Field label="Confirmar contraseña" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} autoComplete="new-password" required placeholder="Escríbela nuevamente"/><Submit busy={busy}>Crear cuenta</Submit>{error&&<ErrorText>{error}</ErrorText>}</form>
    <p className="mt-7 text-center text-sm text-slate-500">¿Ya tienes cuenta? <Link className="font-semibold text-indigo-600" to="/login">Inicia sesión</Link></p>
  </AuthShell>;
}

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth(); const [email,setEmail]=useState(""); const [busy,setBusy]=useState(false); const [message,setMessage]=useState(""); const [error,setError]=useState("");
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError("");setMessage("");try{setMessage(await requestPasswordReset(email));}catch(err){setError(err instanceof Error?err.message:"No fue posible procesar la solicitud.");}finally{setBusy(false);}}
  return <AuthShell title="Recupera tu acceso" subtitle="Te ayudaremos a crear una nueva contraseña."><form onSubmit={submit}><Field label="Correo electrónico" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@empresa.com"/><Submit busy={busy}>Enviar instrucciones</Submit>{message&&<p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 className="mr-2 inline" size={17}/>{message}</p>}{error&&<ErrorText>{error}</ErrorText>}</form><Link className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-600" to="/login"><ArrowLeft size={16}/> Volver al inicio de sesión</Link></AuthShell>;
}

export function ResetPasswordPage() {
  const { updatePassword }=useAuth(); const [params]=useSearchParams(); const token=params.get("token")||""; const navigate=useNavigate(); const [password,setPassword]=useState(""); const [confirm,setConfirm]=useState(""); const [busy,setBusy]=useState(false); const [message,setMessage]=useState(""); const [error,setError]=useState("");
  async function submit(e:FormEvent){e.preventDefault();setError("");if(!token){setError("El enlace no contiene un token válido. Solicita uno nuevo.");return;}if(password.length<8){setError("La contraseña debe tener al menos 8 caracteres.");return;}if(password!==confirm){setError("Las contraseñas no coinciden.");return;}setBusy(true);try{await updatePassword(token,password);setMessage("Contraseña actualizada. Ya puedes iniciar sesión.");setTimeout(()=>navigate("/login"),1800);}catch(err){setError(err instanceof Error?err.message:"El enlace puede haber vencido. Solicita uno nuevo.");}finally{setBusy(false);}}
  return <AuthShell title="Elige una nueva contraseña" subtitle="Usa al menos 8 caracteres."><form onSubmit={submit}><Field label="Nueva contraseña" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/><Field label="Confirmar contraseña" type="password" required autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)}/><Submit busy={busy}>Guardar contraseña</Submit>{message&&<p className="mt-4 text-sm text-emerald-700">{message}</p>}{error&&<ErrorText>{error}</ErrorText>}</form><Link className="mt-6 inline-flex items-center gap-2 text-sm text-indigo-600" to="/login"><ArrowLeft size={16}/> Volver al inicio de sesión</Link></AuthShell>;
}
