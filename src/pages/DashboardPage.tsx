import { ArrowRight, FileSpreadsheet, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  return <div className="mx-auto max-w-6xl space-y-6">
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 to-slate-900 p-7 text-white md:p-10">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm"><Sparkles size={16}/> Tu espacio de trabajo</div>
      <h1 className="max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">Hola, {user?.full_name?.split(" ")[0] || "bienvenido"}. Convirtamos tus datos en un sistema.</h1>
      <p className="mt-3 max-w-xl leading-7 text-indigo-100">Este es el punto de partida para organizar tus archivos y preparar tus próximos sistemas de trabajo.</p>
      <Link to="/app/importar" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-indigo-700 hover:bg-indigo-50">Comenzar con un archivo <ArrowRight size={17}/></Link>
    </section>
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-5"><FileSpreadsheet className="mb-4 text-indigo-600" size={24}/><h2 className="font-semibold">Importar una hoja</h2><p className="mt-2 text-sm leading-6 text-slate-500">Prepara un archivo para convertirlo en un sistema organizado.</p><Link className="mt-4 inline-block text-sm font-semibold text-indigo-600" to="/app/importar">Ir a importar →</Link></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5"><ShieldCheck className="mb-4 text-emerald-600" size={24}/><h2 className="font-semibold">Acceso protegido</h2><p className="mt-2 text-sm leading-6 text-slate-500">Tu sesión se gestiona desde el servicio de autenticación.</p></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5"><Sparkles className="mb-4 text-violet-600" size={24}/><h2 className="font-semibold">Próximas funciones</h2><p className="mt-2 text-sm leading-6 text-slate-500">Esta etapa prepara la estructura visual y el acceso seguro.</p></div>
    </div>
  </div>;
}
