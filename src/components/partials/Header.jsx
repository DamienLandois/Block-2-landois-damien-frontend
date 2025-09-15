import { NavLink } from "react-router-dom";
import Hamburger from "hamburger-react";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
export default function Header() {
  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md ${isActive ? "active-link" : ""}`;
  const [isOpen, setOpen] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);

  const handleClosing = () => {
    if (width < 1100) {
      setOpen(false);
    }
  };
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (width >= 1100) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [width]);


    console.log(localStorage.getItem("user"));

  return (
    <header className="border-b">
      <div className="header-top">
        {" "}
        <div className="absolute top-4 left-4">
          <NavLink to="/profil">
            <User size={40} />
          </NavLink>
        </div>
        {width < 1100 && (
          <div className="absolute top-4 right-4">
            <Hamburger
              direction="left"
              size={30}
              toggled={isOpen}
              toggle={setOpen}
            />
          </div>
        )}
        <h1>Raphaelle Massages</h1>
      </div>

      {isOpen && (
        <div className="nav-container">
          <nav className="nav">
            <NavLink onClick={handleClosing} to="/" className={linkClass}>
              Accueil
            </NavLink>
            <NavLink
              onClick={handleClosing}
              to="/inscription"
              className={linkClass}
            >
              Inscription
            </NavLink>
            <NavLink
              onClick={handleClosing}
              to="/connexion"
              className={linkClass}
            >
              Connexion
            </NavLink>
            <NavLink
              onClick={handleClosing}
              to="/massages"
              className={linkClass}
            >
              Massages
            </NavLink>
            <NavLink
              onClick={handleClosing}
              to="/rendezvous"
              className={linkClass}
            >
              Rendez-vous
            </NavLink>
            <NavLink
              onClick={handleClosing}
              to="/apropos"
              className={linkClass}
            >
              À propos
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}
