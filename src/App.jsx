import { NavLink, Outlet } from "react-router-dom"

export default function App() {
  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md hover:opacity-80 ${isActive ? "bg-secondary" : ""}`

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <nav className="container mx-auto flex items-center gap-4 p-4">
          <NavLink to="/" className={linkClass}>Accueil</NavLink>
          <NavLink to="/signin" className={linkClass}>Connexion</NavLink>
        </nav>
      </header>

      <main className="container mx-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
