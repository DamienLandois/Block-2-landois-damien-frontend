import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios from "axios";

export default function AddMassageCard() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    duration: "",
    price: "",
    position: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWZqd2pzaXYwMDAwbXM2eWw2cTgxNmQzIiwiZW1haWwiOiJsaWV2aW4uZHlsYW4ucHJvQGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc1Nzg2ODU3MiwiZXhwIjoxNzU3ODY5NDcyfQ.9F2Ugx8gU0Pe2WfiUuCydAH1veRGozegNcVecSSdXT0";

  const handleChange = (e) => {
    const { id, value, files } = e.target;
    if (files) {
      setForm((f) => ({ ...f, [id]: files[0] }));
    } else {
      setForm((f) => ({ ...f, [id]: value }));
    }

    console.log(form);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      console.log("Payload envoyé:", form);
      const res = await axios.post("http://localhost:3001/massages", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Massage ajouté ✅");
      console.log("Réponse API:", response.data);
      setForm({
        name: "",
        description: "",
        duration: "",
        price: "",
        position: "",
        image: null,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l’ajout ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Ajouter un massage</CardTitle>
        <CardDescription>
          Remplis les informations pour créer un massage.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nom du massage</Label>
            <Input
              id="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="duration">Durée (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={form.duration}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="price">Prix (€)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              type="number"
              value={form.position}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="image">Image (optionnelle)</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleChange}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Ajout en cours..." : "Ajouter"}
          </Button>
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
        </CardFooter>
      </form>
    </Card>
  );
}
