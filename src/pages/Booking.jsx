import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Calendar from "../components/booking/Calendar";
import WeekCalendar from "../components/booking/WeekCalendar";
import useTimeSlotSender from "@/hooks/useTimeSlotSender";

const monthIndexFromFr = (label) => {
  const map = {
    Janvier: 0, Février: 1, Mars: 2, Avril: 3, Mai: 4, Juin: 5,
    Juillet: 6, Août: 7, Septembre: 8, Octobre: 9, Novembre: 10, Décembre: 11,
  };
  return map[label] ?? null;
};
const getIsoWeekStart = (date) => {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (copy.getDay() + 6) % 7;
  copy.setHours(0, 0, 0, 0);
  return copy;
};
const addDays = (date, n) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + n);
  return copy;
};
const FRENCH_WEEKDAY_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const pad2 = (n) => String(n).padStart(2, "0");
const formatHM = (date) => `${pad2(date.getHours())}h${pad2(date.getMinutes())}`;

// Réplique une semaine de créneaux (1 plage = 1 créneau) sur N semaines
const replicateWeeklySlots = (baseWeekTimeSlots, weeksCount) => {
  if (!weeksCount || weeksCount < 1) return baseWeekTimeSlots;
  const out = [];
  for (let w = 0; w < weeksCount; w++) {
    const offsetDays = 7 * w;
    for (const slot of baseWeekTimeSlots) {
      const start = new Date(slot.startTime);
      const end = new Date(slot.endTime);
      start.setDate(start.getDate() + offsetDays);
      end.setDate(end.getDate() + offsetDays);
      out.push({
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        isActive: slot.isActive ?? true,
      });
    }
  }
  return out;
};

export default function Booking() {
  const [selectedDate, setSelectedDate] = useState(null);
  // Créneaux (DTO) pour la semaine courante — 1 plage = 1 créneau
  const [weeklyTimeSlots, setWeeklyTimeSlots] = useState([]);
  const [repeatWeeksCount, setRepeatWeeksCount] = useState(1);
  const calendarRootRef = useRef(null);

  // Hook d’envoi via la store (enableSend=false => DRY-RUN). Passe à true quand prêt.
  const { send, submitting, result, reset } = useTimeSlotSender({ enableSend: false });

  // Clic sur un jour du Calendar (sans modifier le composant Calendar)
  useEffect(() => {
    const root = calendarRootRef.current;
    if (!root) return;

    const handleDayClick = (e) => {
      const li = e.target.closest(".jours li");
      if (!li || !root.contains(li)) return;

      const daysUl = root.querySelector(".jours");
      const allLis = Array.from(daysUl.querySelectorAll("li"));
      const clickedIndex = allLis.indexOf(li);
      const firstOfMonth = allLis.findIndex((el) => !el.classList.contains("inactive"));
      const lastOfMonth =
        allLis.length - 1 - allLis.slice().reverse().findIndex((el) => !el.classList.contains("inactive"));

      const header =
        root.querySelector(".wrapper-header .date") ||
        root.querySelector("header .date") ||
        root.querySelector(".date");

      const [monthLabel, yearStr] = (header?.textContent || "").trim().split(/\s+/);
      const monthIndex = monthIndexFromFr(monthLabel);
      const year = parseInt(yearStr, 10);
      if (monthIndex == null || !Number.isFinite(year)) return;

      let monthOffset = 0;
      if (clickedIndex < firstOfMonth) monthOffset = -1;
      else if (clickedIndex > lastOfMonth) monthOffset = 1;

      const dayNumber = parseInt(li.textContent, 10);
      if (!Number.isFinite(dayNumber)) return;

      setSelectedDate(new Date(year, monthIndex + monthOffset, dayNumber));
      setWeeklyTimeSlots([]); // reset quand on change de semaine
      reset();
    };

    root.addEventListener("click", handleDayClick);
    return () => root.removeEventListener("click", handleDayClick);
  }, [reset]);

  // Callback STABLE pour recevoir les créneaux depuis WeekCalendar
  const handleWeekSlotsChange = useCallback((dtos) => {
    setWeeklyTimeSlots(dtos);
  }, []);

  // Lundi de la semaine des créneaux reçus
  const weekStartDate = useMemo(() => {
    if (!weeklyTimeSlots.length) return null;
    const minStart = new Date(Math.min(...weeklyTimeSlots.map((s) => Date.parse(s.startTime))));
    return getIsoWeekStart(minStart);
  }, [weeklyTimeSlots]);

  // Sécurise : garde uniquement les créneaux de la semaine de base
  const baseWeekTimeSlots = useMemo(() => {
    if (!weekStartDate) return [];
    const nextWeekStart = addDays(weekStartDate, 7);
    return weeklyTimeSlots.filter((s) => {
      const d = new Date(s.startTime);
      return d >= weekStartDate && d < nextWeekStart;
    });
  }, [weeklyTimeSlots, weekStartDate]);

  // Récap par jour : plusieurs plages triées
  const weeklySummaryRows = useMemo(() => {
    const perDay = Array.from({ length: 7 }, () => []);
    for (const slot of baseWeekTimeSlots) {
      const start = new Date(slot.startTime);
      const dayIndex = (start.getDay() + 6) % 7;
      perDay[dayIndex].push(slot);
    }
    return perDay.map((daySlots, idx) => {
      const ordered = [...daySlots].sort(
        (a, b) => Date.parse(a.startTime) - Date.parse(b.startTime)
      );
      const ranges = ordered.map((s) => {
        const start = new Date(s.startTime),
          end = new Date(s.endTime);
        return `${formatHM(start)} → ${formatHM(end)}`;
      });
      return { dayLabel: FRENCH_WEEKDAY_SHORT[idx], ranges };
    });
  }, [baseWeekTimeSlots]);

  const timeSlotsToSend = useMemo(
    () => replicateWeeklySlots(baseWeekTimeSlots, repeatWeeksCount),
    [baseWeekTimeSlots, repeatWeeksCount]
  );

  return (
    <div className="booking-page">
      <header className="booking-header">
        <h1>Gestion des créneaux</h1>
        <p>Glissez pour créer des plages par jour (plusieurs possibles), vérifiez le récap, puis envoyez.</p>
      </header>

      <main className="booking-grid">
        <section className="booking-calendar" ref={calendarRootRef}>
          <Calendar />
        </section>

        <aside className="booking-week">
          <WeekCalendar
            anchorDate={selectedDate}
            selectable
            onWeekSlotsChange={handleWeekSlotsChange}é
          />
        </aside>

        <section className="booking-summary" style={{ marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0 }}>Récapitulatif (semaine sélectionnée)</h2>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              Répéter sur
              <input
                type="number"
                min={1}
                max={52}
                value={repeatWeeksCount}
                onChange={(e) =>
                  setRepeatWeeksCount(
                    Math.max(1, Math.min(52, parseInt(e.target.value || "1", 10)))
                  )
                }
                style={{ width: 70 }}
              />
              semaine(s)
            </label>
            <span style={{ color: "#666" }}>
              Total créneaux à envoyer : <strong>{timeSlotsToSend.length}</strong>
            </span>
          </div>

          <table className="summary-table" style={{ width: "100%", marginTop: 8, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                <th style={{ padding: "8px 6px" }}>Jour</th>
                <th style={{ padding: "8px 6px" }}>Plages</th>
              </tr>
            </thead>
            <tbody>
              {weeklySummaryRows.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f2f2f2" }}>
                  <td style={{ padding: "8px 6px", width: 100 }}>{row.dayLabel}</td>
                  <td style={{ padding: "8px 6px" }}>
                    {row.ranges.length ? row.ranges.join("   ") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="booking-admin" style={{ marginTop: 16 }}>
          <button
            onClick={() => send(timeSlotsToSend)}
            disabled={!timeSlotsToSend.length || submitting}
          >
            {submitting ? "Envoi..." : `Envoyer ${timeSlotsToSend.length} créneaux`}
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