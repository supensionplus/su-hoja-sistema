import { Navigate, Route, Routes } from "react-router-dom";
import { BarChart3, ClipboardList, FileSpreadsheet, History, Settings2 } from "lucide-react";
import { EmptyState } from "./components/ui/EmptyState";
import AppLayout from "./components/layout/AppLayout";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage } from "./auth/AuthPages";
import { ProtectedRoute } from "./auth/ProtectedRoute";

function PlaceholderPage({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return <div className="page-enter"><div className="mb-7"><p className="mb-2 text-sm font-medium text-brand">Espacio de trabajo</p><h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p></div><EmptyState icon={icon} title="Todavía no hay información" description="Esta vista está preparada. El contenido y las funciones se incorporarán en una etapa posterior." /></div>;
}
function Landing() { const { user, loading } = useAuth(); if (loading) return <div className="flex min-h-screen items-center justify-center text-slate-500">Cargando…</div>; return <Navigate to={user ? "/app" : "/login"} replace/>; }
export default function App() {
 return <AuthProvider><Routes>
  <Route path="/" element={<Landing/>}/><Route path="/login" element={<LoginPage/>}/><Route path="/registro" element={<RegisterPage/>}/><Route path="/recuperar-clave" element={<ForgotPasswordPage/>}/><Route path="/restablecer-clave" element={<ResetPasswordPage/>}/>
  <Route element={<ProtectedRoute/>}><Route path="/app" element={<AppLayout/>}>
   <Route index element={<PlaceholderPage title="Panel general" description="Una vista general de tus sistemas y actividad." icon={<BarChart3/>}/>}/><Route path="sistemas" element={<PlaceholderPage title="Mis sistemas generados" description="Aquí aparecerán los sistemas que hayas creado a partir de tus hojas de cálculo." icon={<ClipboardList/>}/>}/><Route path="importar" element={<PlaceholderPage title="Importar hoja de cálculo" description="El espacio de preparación para iniciar un nuevo sistema." icon={<FileSpreadsheet/>}/>}/><Route path="auditoria" element={<PlaceholderPage title="Registro de cambios y auditoría" description="Consulta futura de actividad, modificaciones y trazabilidad." icon={<History/>}/>}/><Route path="configuracion" element={<PlaceholderPage title="Configuración y permisos" description="Preferencias y controles del espacio de trabajo." icon={<Settings2/>}/>}/>
  </Route></Route><Route path="*" element={<Navigate to="/" replace/>}/>
 </Routes></AuthProvider>;
}
