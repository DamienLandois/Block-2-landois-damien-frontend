import { useMemo, useRef } from "react";
import Calendar from "../components/booking/Calendar";
import WeekCalendar from "../components/booking/WeekCalendar";
import useCalendarPick from "@/hooks/useCalendarPick";
import useSlotsPlanner from "@/hooks/useSlotsPlanner";

const toInputValue = (iso) => {
  const d = new Date(iso);
  const t = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return t.toISOString().slice(0, 16);
};

export default function Booking() {
  const {
    admin,
    date, setDate,
    key,
    resetTick,                // <- remount après envoi
    list, onChange,
    repeat, setRepeat,
    existing,
    summary,
    sendList, onSend, sendLoading, sendResult,
    edit, onExistClick, onEditSave, onEditDelete, onEditCancel,
  } = useSlotsPlanner();

  const calendarRef = useRef(null);
  useCalendarPick(calendarRef, setDate);

  const count = useMemo(() => sendList.length, [sendList]);

  return (
    <div className="booking-page">
      <header className="booking-header">
        <h1>Gestion des créneaux</h1>
        <p>
          {admin
            ? "Sélection en rouge (drag). Les créneaux existants sont en vert : cliquez dessus pour éditer ou supprimer."
            : "Calendrier des disponibilités (lecture seule). Les créneaux disponibles apparaissent en vert."}
        </p>
      </header>

      <main className="booking-grid">
        <section className="booking-calendar" ref={calendarRef}>
          <Calendar />
        </section>

        <aside className="booking-week">
          <WeekCalendar
            key={`${key}:${resetTick}`}   // <- remount forcé après ajout pour enlever le rouge
            anchorDate={date}
            selectable={admin}
            onWeekSlotsChange={admin ? onChange : undefined}
            existingSlots={existing}
            onExistingSlotClick={admin ? onExistClick : undefined}
          />
        </aside>

        {admin && (
          <>
            <section className="booking-summary" style={{ marginTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <h2 style={{ margin: 0 }}>Récapitulatif (semaine sélectionnée)</h2>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  Répéter sur
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={repeat}
                    onChange={(e) => {
                      const v = parseInt(e.target.value || "1", 10);
                      setRepeat(Math.max(1, Math.min(52, v)));
                    }}
                    style={{ width: 70 }}
                  />
                  semaine(s)
                </label>
                <span style={{ color: "#666" }}>
                  Total créneaux à envoyer : <strong>{count}</strong>
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
                  {summary.map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f2f2f2" }}>
                      <td style={{ padding: "8px 6px", width: 100 }}>{row.day}</td>
                      <td style={{ padding: "8px 6px" }}>{row.ranges.length ? row.ranges.join("   ") : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="booking-admin" style={{ marginTop: 16 }}>
              <button onClick={() => onSend(sendList)} disabled={!count || sendLoading}>
                {sendLoading ? "Envoi..." : `Envoyer ${count} créneaux`}
              </button>

              {sendResult && (
                <div className="result" style={{ marginTop: 10 }}>
                  <p>
                    <strong>{sendResult.successes.length}</strong> succès,{" "}
                    <strong>{sendResult.failures.length}</strong> échec(s)
                  </p>
                  {sendResult.failures.length > 0 && (
                    <details>
                      <summary>Détails des échecs</summary>
                      <ul>
                        {sendResult.failures.map((f, i) => (
                          <li key={i}>
                            [{f.status}] {f.dto?.startTime} — {f.error?.message || JSON.stringify(f.error)}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              )}
            </section>

            {edit && (
              <section className="booking-edit" style={{ marginTop: 16 }}>
                <h3>Éditer le créneau</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const startIso = new Date(e.currentTarget.start.value).toISOString();
                    const endIso = new Date(e.currentTarget.end.value).toISOString();
                    onEditSave({ startIso, endIso }).catch((err) => {
                      alert("Mise à jour impossible. Voir console.");
                      console.error(err);
                    });
                  }}
                  style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}
                >
                  <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    Début
                    <input type="datetime-local" name="start" step="1800" defaultValue={toInputValue(edit.startTime)} required />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    Fin
                    <input type="datetime-local" name="end" step="1800" defaultValue={toInputValue(edit.endTime)} required />
                  </label>
                  <button type="submit">Mettre à jour</button>
                  <button type="button" onClick={() => onEditDelete().catch(console.error)} style={{ background: "#fee", borderColor: "#fca5a5" }}>
                    Supprimer
                  </button>
                  <button type="button" onClick={onEditCancel}>Annuler</button>
                </form>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
