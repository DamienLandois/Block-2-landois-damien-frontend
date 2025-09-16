import { useState } from "react"
import {
  Card, CardHeader, CardTitle, CardDescription,
  CardContent, CardFooter
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { massageStore } from "@/lib/massageStore"

export default function AddMassageCard() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    duration: "",
    price: "",
    position: "",
    image: null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const createMassage = massageStore((s) => s.createMassage)

  const onChange = (e) => {
    const { id, value, files } = e.target
    if (files) {
      setForm((f) => ({ ...f, [id]: files[0] }))
    } else {
      setForm((f) => ({ ...f, [id]: value }))
    }
  }

  const validate = () => {
    if (!form.name.trim()) return "Le nom est requis."
    if (!form.description.trim()) return "La description est requise."
    const duration = Number(form.duration)
    const price = Number(form.price)
    const position = Number(form.position)
    if (!Number.isFinite(duration) || duration <= 0) return "Durée invalide."
    if (!Number.isFinite(price) || price <= 0) return "Prix invalide."
    if (!Number.isFinite(position) || position < 0) return "Position invalide."
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
      const fd = new FormData()
      fd.append("name", form.name.trim())
      fd.append("description", form.description.trim())
      fd.append("duration", String(Number(form.duration)))
      fd.append("price", String(Number(form.price)))
      fd.append("position", String(Number(form.position)))
      if (form.image) fd.append("image", form.image)

      await createMassage(fd) 


      setForm({
        name: "",
        description: "",
        duration: "",
        price: "",
        position: "",
        image: null,
      })
      toast.success("Massage ajouté 🎉", {
        description: "Le massage a bien été créé.",
      })

    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Erreur lors de l’ajout."
      setError(String(message))
      toast.error("Échec de l’ajout", { description: String(message) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Ajouter un massage</CardTitle>
        <CardDescription>Remplis les informations pour créer un massage.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nom du massage</Label>
            <Input id="name" value={form.name} onChange={onChange} required disabled={loading} />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={onChange} required disabled={loading} />
          </div>

          <div>
            <Label htmlFor="duration">Durée (minutes)</Label>
            <Input id="duration" type="number" min="1" value={form.duration} onChange={onChange} required disabled={loading} />
          </div>

          <div>
            <Label htmlFor="price">Prix (€)</Label>
            <Input id="price" type="number" min="0" step="0.01" value={form.price} onChange={onChange} required disabled={loading} />
          </div>

          <div>
            <Label htmlFor="position">Position (ordre d’affichage)</Label>
            <Input id="position" type="number" min="0" value={form.position} onChange={onChange} required disabled={loading} />
          </div>

          <div>
            <Label htmlFor="image">Image (optionnelle)</Label>
            <Input id="image" type="file" accept="image/*" onChange={onChange} disabled={loading} />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </CardContent>

        <CardFooter className="flex">
          <Button type="submit" disabled={loading}>
            {loading ? "Ajout en cours..." : "Ajouter"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
