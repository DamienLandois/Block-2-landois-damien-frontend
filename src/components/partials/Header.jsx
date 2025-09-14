import { NavLink } from "react-router-dom"
export default function Header() {
const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md hover:opacity-80 ${isActive ? "active-link" : ""}`

return (
<header className="border-b">
    <h1>Raphaelle Massages</h1>
    <div className="nav-container">
        <nav className="nav">
          <NavLink to="/" className={linkClass}>Accueil</NavLink>
          <NavLink to="/inscription" className={linkClass}>Inscription</NavLink>
          <NavLink to="/connexion" className={linkClass}>Connexion</NavLink>
          <NavLink to="/massages" className={linkClass}>Massages</NavLink>
          <NavLink to="/rendezvous" className={linkClass}>Rendez-vous</NavLink>
          <NavLink to="/apropos" className={linkClass}>À propos</NavLink>
        </nav>
    </div>
      </header>)}