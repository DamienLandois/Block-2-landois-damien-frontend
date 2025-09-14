import { Outlet } from "react-router-dom"
import Header from "./components/partials/Header.jsx"
import Footer from "./components/partials/Footer.jsx"
import "./styles/App.sass"
export default function App() {

  return (
    <div className="body min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto p-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
