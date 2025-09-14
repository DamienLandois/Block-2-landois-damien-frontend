import { useState } from "react";
import Calendar from "../components/booking/Calendar.jsx";

export default function Booking() {
  const [selectedDate, setSelectedDate] = useState(null);

  // Placeholder temporaire pour DayCalendar (sera remplacé plus tard)
  const DayCalendar = ({ date }) => (
    <div className="day-calendar">
      <h2>Journée</h2>
      {date ? (
        <p>
          Journée du <strong>{date.toLocaleDateString("fr-FR")}</strong>
        </p>
      ) : (
        <p>Sélectionnez un jour dans le calendrier.</p>
      )}
    </div>
  );

  return (
    <div className="booking-page">
      <header className="booking-header">
        <h1>Réserver un créneau</h1>
        <p>Choisissez un jour, puis un horaire.</p>
      </header>

      <main className="booking-grid">
        <section className="booking-calendar">
          <Calendar />
        </section>
        <aside className="booking-day">
          <DayCalendar date={selectedDate} />
        </aside>
      </main>
    </div>
  );
}
