import { useMemo, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { massageStore } from "@/lib/massageStore";
import { Clock2 } from "lucide-react";

export default function MassageCard({
  id,
  title,
  content,
  duration,
  price,
  imageUrl,
  imageAlt = "",
  position,
  isAdmin = false,
}) {
  const updateMassage = massageStore((s) => s.updateMassage);
  const deleteMassage = massageStore((s) => s.deleteMassage);

  console.log("MassageCard id:", id);

  const initial = useMemo(() => {
    const toNumber = (v) =>
      typeof v === "number"
        ? v
        : Number(String(v ?? "").replace(/[^\d.]/g, "")) || 0;
    return {
      name: title ?? "",
      description: content ?? "",
      duration: toNumber(duration),
      price: toNumber(price),
      position: typeof position === "number" ? position : toNumber(position),
      image: null,
      imagePreview: imageUrl ?? "",
    };
  }, [title, content, duration, price, position, imageUrl]);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initial);

  const onChange = (e) => {
    const { id, value, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const preview = URL.createObjectURL(file);
      setForm((f) => ({ ...f, image: file, imagePreview: preview }));
    } else {
      setForm((f) => ({ ...f, [id]: value }));
    }
  };

  const cancelEdit = () => {
    setForm(initial);
    setEditing(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Le nom est requis.");
    if (!form.description.trim())
      return toast.error("La description est requise.");
    if (!Number(form.duration) || Number(form.duration) <= 0)
      return toast.error("Durée invalide.");
    if (!Number(form.price) || Number(form.price) <= 0)
      return toast.error("Prix invalide.");
    if (Number(form.position) < 0) return toast.error("Position invalide.");

    setLoading(true);
    try {
      if (form.image) {
        const fd = new FormData();
        fd.append("name", form.name.trim());
        fd.append("description", form.description.trim());
        fd.append("duration", String(Number(form.duration)));
        fd.append("price", String(Number(form.price)));
        fd.append("position", String(Number(form.position)));
        fd.append("image", form.image);
        await updateMassage(id, fd);
      } else {
        await updateMassage(id, {
          name: form.name.trim(),
          description: form.description.trim(),
          duration: Number(form.duration),
          price: Number(form.price),
          position: Number(form.position),
        });
      }
      toast.success("Massage mis à jour");
      setEditing(false);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Échec de la mise à jour.";
      toast.error("Erreur", { description: String(msg) });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer ce massage ?")) return;
    setLoading(true);
    try {
      await deleteMassage(id);
      toast.success("Massage supprimé");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Échec de la suppression.";
      toast.error("Erreur", { description: String(msg) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="container-massagepart">
      <div className="relative">
        <div className="container-content">
          {/* Image (1/3) */}
          <div className="container-picture">
            {editing ? (
              <div className="flex flex-col gap-2">
                {form.imagePreview ? (
                  <img
                    src={form.imagePreview}
                    alt={imageAlt || form.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center text-sm text-muted-foreground">
                    Pas d’image
                  </div>
                )}
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={onChange}
                  disabled={loading}
                />
              </div>
            ) : (
              <img
                src={form.imagePreview}
                alt={imageAlt || form.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            )}
          </div>

          {/* Contenu (2/3) */}
          <div>
            <CardContent className="container-text">
              {editing ? (
                <>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="Nom du massage"
                    disabled={loading}
                  />
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={onChange}
                    placeholder="Description"
                    disabled={loading}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-sm text-muted-foreground">
                        Durée (min)
                      </label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        value={form.duration}
                        onChange={onChange}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-muted-foreground">
                        Prix (€)
                      </label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={onChange}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground">
                      Position
                    </label>
                    <Input
                      id="position"
                      type="number"
                      min="0"
                      value={form.position}
                      onChange={onChange}
                      disabled={loading}
                    />
                  </div>
                </>
              ) : (
                <>
                  <h3>{form.name}</h3>
                  <p>{form.description}</p>
                  <div>
                    <p className="duration">
                      <Clock2 /> {`${form.duration} min`}
                    </p>
                    <p className="price">Tarif : {`${form.price} €`}</p>
                  </div>
                </>
              )}
            </CardContent>
          </div>
        </div>
      </div>

      {isAdmin && (
        <CardFooter className="flex items-center justify-end gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={cancelEdit} disabled={loading}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setEditing(true)}
                disabled={loading}
              >
                Modifier
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                Supprimer
              </Button>
            </>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
