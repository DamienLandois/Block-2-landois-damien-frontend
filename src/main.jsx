import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import App from "./App.jsx"

import Home from "./pages/Home.jsx"
import SignIn from "./pages/SignIn.jsx"
import SignUp from "./pages/SignUp.jsx"
import Massages from "./pages/Massages.jsx"
import Appointment from "./pages/Appointment.jsx"
import About from "./pages/About.jsx"

import "./index.css"

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/connexion", element: <SignIn /> },
      { path: "/inscription", element: <SignUp /> },
      { path: "/massages", element: <Massages /> },
      { path: "/rendezvous", element: <Appointment /> },
      { path: "/apropos", element: <About /> },
      { path: "*", element: <div className="p-8">404 - Page introuvable</div> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
