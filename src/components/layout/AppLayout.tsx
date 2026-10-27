import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Activity, ArrowUpRight, Boxes, CircleHelp, FileSpreadsheet, LayoutDashboard, LogOut, Settings2, Sparkles, UploadCloud } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

const nav = [
  { to: "/app", label: "Resumen", icon: LayoutDashboard, end: true },
  { to: "/app/sistemas", label: "Mis sistemas", icon: Boxes },
  { to: "/app/importar", label: "Importar archivo", icon: UploadCloud },
  { to: "/app/auditoria", label: "Actividad", icon: Activity },
  { to: "/app/configuracion", label: "Configuración", icon: Settings2 },
];

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  async function logout() { await signOut(); navigate("/login", { replace: true }); }
  const initials = (user?.full_name || user?.email || "U").split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase();
  return <div className="min-h-screen bg-slate-50 text-slate-900 md:flex">
    <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="flex items-center gap-3 px-5 py-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white"><Sparkles size={21}/></span><div><p className="font-bold leading-tight">Su hoja de cálculo</p><p className="text-xs text-slate-500">se convirtió en un sistema</p></div></div>
      <div className="px-4 pb-3"><div className="rounded-xl bg-indigo-50 p-3"><div className="flex items-center gap-2 text-xs font-semibold text-indigo-700"><FileSpreadsheet size={15}/> ESPACIO DE TRABAJO</div><p className="mt-1 truncate text-sm font-medium text-slate-800">{user?.company_name || "Mi organización"}</p></div></div>
      <nav className="flex gap-1 overflow-x-auto px-3 py-2 md:flex-col">{nav.map(item=><NavLink key={item.to} to={item.to} end={item.end} className={({isActive})=>`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive?"bg-indigo-50 text-indigo-700":"text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}><item.icon size={18}/>{item.label}</NavLink>)}</nav>
      <div className="mt-auto hidden p-4 md:block"><div className="rounded-xl border border-slate-200 p-3"><div className="flex items-center gap-2 text-sm font-semibold"><CircleHelp size={17}/> ¿Necesitas ayuda?</div><p className="mt-1 text-xs leading-5 text-slate-500">Pronto encontrarás aquí guías para crear tu primer sistema.</p><span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">Centro de ayuda <ArrowUpRight size={13}/></span></div></div>
    </aside>
    <div className="min-w-0 flex-1">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 md:px-8"><div><p className="text-sm font-semibold">Espacio de trabajo</p><p className="text-xs text-slate-500">Bienvenido, {user?.full_name?.split(" ")[0] || "usuario"}</p></div><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">{initials}</div><div className="hidden sm:block"><p className="max-w-48 truncate text-sm font-medium">{user?.full_name}</p><p className="max-w-48 truncate text-xs text-slate-500">{user?.email}</p></div><button title="Cerrar sesión" onClick={logout} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><LogOut size={18}/></button></div></header>
      <main className="p-5 md:p-8"><Outlet/></main>
    </div>
  </div>;
}
