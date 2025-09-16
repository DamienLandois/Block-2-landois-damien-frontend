import { useEffect } from "react";
import MassageCard from "../components/MassageCard";
import AddMassage from "../components/AddMassage";
import { massageStore } from "../lib/massageStore";

export default function Massages() {
  const massages = massageStore((s) => s.massages) || [];

  useEffect(() => {
    massageStore.getState().getMassages();
  }, []);

  // Tri
  const sorted = [...massages].sort(
    (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity)
  );

  console.log("Massage list:", sorted);

  const user = JSON.parse(localStorage.getItem("user"));
  const admin = user?.role === "ADMIN";

  return (
    <div className="massages-page space-y-6">
      <h1 className="text-2xl font-semibold mb-6">Massages</h1>

      <div>
        {sorted.length > 0 ? (
          sorted.map((m) => (
            <MassageCard
              key={m.id ?? m._id ?? m.name}
              id={m.id ?? m._id}
              title={m.name}
              content={
                m.description ??
                "Pressions fermes, pétrissages et effleurages pour détendre les tensions musculaires."
              }
              duration={
                typeof m.duration === "number"
                  ? `${m.duration} min`
                  : m.duration ?? "60 min"
              }
              price={
                typeof m.price === "number" ? `${m.price} €` : m.price ?? "60 €"
              }
              imageUrl={
                m.image ??
                "https://images.unsplash.com/photo-1587017539504-67cfbddac569?q=80&w=1200&auto=format&fit=crop"
              }
              isAdmin={admin}
              onEdit={() => console.log("Edit massage", m.id)}
            />
          ))
        ) : (
          <p className="text-muted-foreground">Aucun massage pour le moment.</p>
        )}
      </div>
      {admin && (
        <div>
          <AddMassage />
        </div>
      )}
    </div>
  );
}
