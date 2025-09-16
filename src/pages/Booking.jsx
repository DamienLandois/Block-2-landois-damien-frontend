import { useEffect, useMemo, useRef, useState } from "react";
import Calendar from "../components/booking/Calendar";
import WeekCalendar from "../components/booking/WeekCalendar";
import useTimeSlotSender from "@/hooks/useTimeSlotSender";

// Helpers
const monthIndexFromFr = (label) => {
  const map = {
    Janvier: 0, Février: 1, Mars: 2, Avril: 3, Mai: 4, Juin: 5,
    Juillet: 6, Août: 7, Septembre: 8, Octobre: 9, Novembre: 10, Décembre: 11,
  };
  return map[label] ?? null;
};
const startOfISOWeek = (d) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
};
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const frDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const pad2 = (n) => String(n).padStart(2, "0");
const fmtHM = (date) => `${pad2(date.getHours())}h${pad2(date.getMinutes())}`;

// Réplique une semaine de slots sur N semaines
const replicateWeeks = (baseWeekSlots, weeks) => {
  if (!weeks || weeks < 1) return baseWeekSlots;
  const out = [];
  for (let w = 0; w < weeks; w++) {
    const offsetDays = 7 * w;
    for (const s of baseWeekSlots) {
      const sStart = new Date(s.startTime);
      const sEnd = new Date(s.endTime);
      sStart.setDate(sStart.getDate() + offsetDays);
      sEnd.setDate(sEnd.getDate() + offsetDays);
      out.push({
        startTime: sStart.toISOString(),
        endTime: sEnd.toISOString(),
        isActive: s.isActive ?? true,
      });
    }
  }
  return out;
};

export default function Booking() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [slotsFromWeek, setSlotsFromWeek] = useState([]); // DTO pour la semaine courante
  const [repeatWeeks, setRepeatWeeks] = useState(1);       // répétition côté Booking
  const calRef = useRef(null);

  // Hook d’envoi via la store (enableSend=false => DRY-RUN)
  const { send, submitting, result, reset } = useTimeSlotSender({ enableSend: false });

  // Capte le clic sur un jour du Calendar (sans le modifier)
  useEffect(() => {
    const root = calRef.current;
    if (!root) return;

    const handleClick = (e) => {
      const li = e.target.closest(".jours li");
      if (!li || !root.contains(li)) return;

      const jours = root.querySelector(".jours");
      const lis = Array.from(jours.querySelectorAll("li"));
      const idx = lis.indexOf(li);
      const firstIdx = lis.findIndex((el) => !el.classList.contains("inactive"));
      const lastIdx = lis.length - 1 - lis.slice().reverse().findIndex((el) => !el.classList.contains("inactive"));

      const header =
        root.querySelector(".wrapper-header .date") ||
        root.querySelector("header .date") ||
        root.querySelector(".date");

      const [moisLabel, yearStr] = (header?.textContent || "").trim().split(/\s+/);
      const baseMonth = monthIndexFromFr(moisLabel);
      const baseYear = parseInt(yearStr, 10);
      if (baseMonth == null || !Number.isFinite(baseYear)) return;

      let offset = 0;
      if (idx < firstIdx) offset = -1;
      else if (idx > lastIdx) offset = 1;

      const dayNum = parseInt(li.textContent, 10);
      if (!Number.isFinite(dayNum)) return;

      setSelectedDate(new Date(baseYear, baseMonth + offset, dayNum));
      setSlotsFromWeek([]); // reset quand on change de semaine
      reset();
    };

    root.addEventListener("click", handleClick);
    return () => root.removeEventListener("click", handleClick);
  }, [reset]);

  // Lundi de la semaine des slots reçus
  const baseMonday = useMemo(() => {
    if (!slotsFromWeek.length) return null;
    const minStart = new Date(Math.min(...slotsFromWeek.map(s => Date.parse(s.startTime))));
    return startOfISOWeek(minStart);
  }, [slotsFromWeek]);

  // On garde seulement la semaine de base (pour le récap et la réplication)
  const baseWeekSlots = useMemo(() => {
    if (!baseMonday) return [];
    const nextMonday = addDays(baseMonday, 7);
    return slotsFromWeek.filter(s => {
      const d = new Date(s.startTime);
      return d >= baseMonday && d < nextMonday;
    });
  }, [slotsFromWeek, baseMonday]);

  // Récap min → max par jour
  const recapRows = useMemo(() => {
    const groups = Array.from({ length: 7 }, () => []);
    for (const s of baseWeekSlots) {
      const d = new Date(s.startTime);
      const idx = (d.getDay() + 6) % 7; // 0=Mon..6=Sun
      groups[idx].push(s);
    }
    return groups.map((slots, idx) => {
      if (!slots.length) return { day: frDays[idx], range: "—" };
      const minStart = new Date(Math.min(...slots.map(x => Date.parse(x.startTime))));
      const maxEnd = new Date(Math.max(...slots.map(x => Date.parse(x.endTime))));
      return { day: frDays[idx], range: `${fmtHM(minStart)} → ${fmtHM(maxEnd)}` };
    });
  }, [baseWeekSlots]);

  // Slots finaux (répétés N semaines) passés à l’envoi
  const finalSlots = useMemo(() => replicateWeeks(baseWeekSlots, repeatWeeks), [baseWeekSlots, repeatWeeks]);

  return (
    <div className="booking-page">
      <header className="booking-header">
        <h1>Gestion des créneaux</h1>
        <p>Sélectionnez une plage (drag) dans la semaine, cochez jours & intervalle, vérifiez le récap, puis envoyez.</p>
      </header>

      <main className="booking-grid">
        <section className="booking-calendar" ref={calRef}>
          <Calendar />
        </section>

        <aside className="booking-week">
          <WeekCalendar
            anchorDate={selectedDate}
            selectable
            onSlotsChange={(payloads) => setSlotsFromWeek(payloads)} // ← slots d’UNE semaine
          />
        </aside>

        {/* Récap + répétition */}
        <section className="booking-summary" style={{ marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0 }}>Récapitulatif (semaine sélectionnée)</h2>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              Répéter sur
              <input
                type="number"
                min={1}
                max={52}
                value={repeatWeeks}
                onChange={(e) => setRepeatWeeks(Math.max(1, Math.min(52, parseInt(e.target.value || "1", 10))))}
                style={{ width: 70 }}
              />
              semaine(s)
            </label>
            <span style={{ color: "#666" }}>
              Total créneaux à envoyer : <strong>{finalSlots.length}</strong>
            </span>
          </div>

          <table className="summary-table" style={{ width: "100%", marginTop: 8, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                <th style={{ padding: "8px 6px" }}>Jour</th>
                <th style={{ padding: "8px 6px" }}>Plage</th>
              </tr>
            </thead>
            <tbody>
              {recapRows.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f2f2f2" }}>
                  <td style={{ padding: "8px 6px", width: 100 }}>{row.day}</td>
                  <td style={{ padding: "8px 6px" }}>{row.range}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Envoi via hook (store à l’intérieur) */}
        <section className="booking-admin" style={{ marginTop: 16 }}>
          <button
            onClick={() => send(finalSlots)}
            disabled={!finalSlots.length || submitting}
          >
            {submitting ? "Envoi..." : `Envoyer ${finalSlots.length} créneaux`}
          </button>

          {result && (
            <div className="result" style={{ marginTop: 10 }}>
              <p>
                <strong>{result.successes.length}</strong> succès,{" "}
                <strong>{result.failures.length}</strong> échec(s)
              </p>
              {result.failures.length > 0 && (
                <details>
                  <summary>Détails des échecs</summary>
                  <ul>
                    {result.failures.map((f, i) => (
                      <li key={i}>
                        [{f.status}] {f.dto?.startTime} — {f.error?.message || JSON.stringify(f.error)}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              <button onClick={reset} style={{ marginTop: 6 }}>Réinitialiser</button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}