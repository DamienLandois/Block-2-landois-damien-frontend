import React from 'react'
import MassageCard from "../components/MassageCard"

export default function Massages() {


  return (
    <div>
        <h1>Massages</h1>
      <MassageCard
        title="Massage Suédois"
        content="Pressions fermes, pétrissages et effleurages pour détendre les tensions musculaires."
        duration="60 min"
        price="60 €"
        imageUrl="https://images.unsplash.com/photo-1587017539504-67cfbddac569?q=80&w=1200&auto=format&fit=crop"
        isAdmin={false}
        onEdit={() => console.log("Edit massage Suédois")}
      />
    </div>
  )
}
