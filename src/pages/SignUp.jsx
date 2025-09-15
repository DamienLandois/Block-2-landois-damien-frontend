import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import authStore from "@/lib/authStore"
import { toast } from "sonner"

export default function SignUp() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstname: "",
    name: "",
    phoneNumber: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const register = authStore((s) => s.register)

    const navigate = useNavigate()

  const onChange = (e) => {
    const { id, value } = e.target
    setForm((f) => ({ ...f, [id]: value }))
  }

  // Règles de validation :
  const nameRegex = /^[A-Za-zÀ-ÿ' -]+$/ // noms: lettres, espaces, tirets, apostrophes
  const emailRegex = /^\S+@\S+\.\S+$/
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{11,}$/

  const validate = () => {
    if (!nameRegex.test(form.firstname.trim())) return "Le prénom est incorrect."
    if (!nameRegex.test(form.name.trim())) return "Le nom est incorrect."
    if (!emailRegex.test(form.email.trim())) return "Email invalide."
    if (!passwordRegex.test(form.password)) return "Le mot de passe doit faire au moins 11 caractères, contenir une majuscule, un chiffre et un symbole."
    const phone = form.phoneNumber.replace(/\D/g, "")
    if (phone.length !== 10) return "Le numéro de téléphone doit contenir 10 chiffres."
    return ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    const msg = validate()
    if (msg) return setError(msg)

    setError("")
    setLoading(true)
    try {
      const payload = {
        email: form.email.trim(),
        password: form.password,
        firstname: form.firstname.trim(),
        name: form.name.trim(),
        phoneNumber: form.phoneNumber.replace(/\D/g, ""),
      }
      await register(payload)

       setForm({
        email: "",
        password: "",
        firstname: "",
        name: "",
        phoneNumber: "",
      })

      toast.success("Compte créé avec succès !")

      navigate("/connexion")

    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Impossible de créer le compte. Réessaie."
      setError(Array.isArray(message) ? message.join(", ") : message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Inscription</CardTitle>
          <CardDescription>Crée ton compte pour continuer.</CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstname">Prénom</Label>
                <Input
                  id="firstname"
                  value={form.firstname}
                  onChange={onChange}
                  placeholder="Prénom"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="Nom"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="you@example.com"
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Téléphone</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={form.phoneNumber}
                onChange={onChange}
                placeholder="0612345678"
                required
                inputMode="numeric"
                maxLength={14} // autorise espaces
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={onChange}
                placeholder="•••••••••••"
                required
                autoComplete="new-password"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                11+ caractères, au moins une majuscule, un chiffre et un symbole.
              </p>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Création..." : "S'inscrire"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-sm">
          <span className="text-muted-foreground">
            Déjà un compte ?{" "}
            <a href="/signin" className="underline underline-offset-4 ml-1">
              Se connecter
            </a>
          </span>
        </CardFooter>
      </Card>
    </div>
  )
}
