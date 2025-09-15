import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import authStore from "@/lib/authStore";

export default function LoginCard({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Récupération de l’action du store Zustand (hook)
  const login = authStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // évite les double-clics
    setError("");
    setLoading(true);

    try {
      await login({ email, password }); // ⬅️ important : attendre la promesse
      onSubmit?.({ email });            // optionnel : callback parent si fourni
    } catch (err) {
      // Essaie d’extraire un message serveur sinon message générique
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Identifiants invalides.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  console.log(localStorage.getItem("User"));

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>
          Entre tes identifiants pour accéder à ton compte.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="text-sm">
        <span className="text-muted-foreground">
          Pas de compte ?{" "}
          <a href="/signup" className="underline underline-offset-4 ml-1">
            Inscription
          </a>
        </span>
      </CardFooter>
    </Card>
  );
}
