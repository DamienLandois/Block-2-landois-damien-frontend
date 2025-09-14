import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SignUp() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const onChange = (e) => {
    const { id, value } = e.target
    setForm((f) => ({ ...f, [id]: value }))
  }

  // Règles de validation :
  // - Prénom/Nom : lettres et tirets uniquement
  const nameRegex = /^[A-Za-zÀ-ÿ\-]+$/
  // - Email basique
  const emailRegex = /^\S+@\S+\.\S+$/
  // - Téléphone : exactement 10 chiffres
  const phoneRegex = /^\d{10}$/
  // - Mot de passe : min 11 caractères, 1 maj, 1 chiffre, 1 symbole
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{11,}$/

  const validate = () => {
    if (!nameRegex.test(form.firstName)) return "Le prénom est incorrect."
    if (!nameRegex.test(form.lastName)) return "Le nom est incorrect."
    if (!emailRegex.test(form.email)) return "Email invalide."
    if (!phoneRegex.test(form.phone)) return "Le numéro doit contenir exactement 10 chiffres."
    if (!passwordRegex.test(form.password)) return "Le mot de passe doit faire au moins 11 caractères, contenir une majuscule, un chiffre et un symbole."
    return ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const msg = validate()
    if (msg) return setError(msg)
    setError("")
    setLoading(true)
    try {
      console.log("signup payload:", form)
      // TODO: appel API ou navigation
    } catch {
      setError("Impossible de créer le compte. Réessaie.")
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
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={onChange}
                  placeholder="Prénom"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={onChange}
                  placeholder="Nom"
                  required
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={onChange}
                placeholder="0612345678"
                required
                inputMode="numeric"
                maxLength={10}
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
              />
              <p className="text-xs text-muted-foreground">
                Merci de choisir un mot de passe de 11 caractères possédant au moins une majuscule, un chiffre et un symbole
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
            Déjà un compte ? <a href="/signin" className="underline underline-offset-4 ml-1">Se connecter</a>
          </span>
        </CardFooter>
      </Card>
    </div>
  )
}
