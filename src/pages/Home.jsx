import React from "react";
import { NavLink } from "react-router-dom";

export default function Home() {
  return (
    <div className="home-page space-y-8">
      <section>
        <h1>Massages BIEN être et soins Énergetiques</h1>
      </section>
      <section className="horizontal">
        <h2>JE VOUS PROPOSE UN MOMENT DE DETENTE</h2>
        <p>
          Bienvenue sur mon site dédié au bien-être et aux soins énergétiques !
          Je suis ravie de vous accueillir et de vous présenter mon univers de
          détente et de relaxation. Mon objectif est de vous offrir un moment
          privilégié de profonde relaxation et de ré-harmonisation de votre
          corps et de votre esprit, quelle que soit votre tranche d'âge. À
          travers mes mains et mon approche personnalisée, je vous propose un
          large éventail de massages qui sauront répondre à vos besoins
          spécifiques.
        </p>
        <p>
          Que vous souhaitiez simplement vous détendre et relâcher les tensions
          accumulées ou que vous recherchiez une expérience plus profonde et
          spirituelle, je saurai m'adapter à vos attentes. Je suis convaincue
          que le bien-être ne se limite pas seulement au corps physique, mais
          qu'il englobe également l'énergie vitale qui circule en nous. C'est
          pourquoi j'intègre des techniques de soins énergétiques dans mes
          séances. Ces techniques visent à rééquilibrer vos centres
          énergétiques, favoriser la libre circulation de l'énergie et restaurer
          l'harmonie globale de votre être.
        </p>
      </section>
      <section>
        <h3>Massage sur mesure</h3>
        <div className="horizontal">
          <div>
            <h4>Personnalisé</h4>
            <p>
              Il n'y a pas deux personnes identiques. Je suis à votre écoute et
              je m'adapte en fonction de vos besoins.{" "}
            </p>
          </div>
          <div>
            <h4>Un environnement sain et chaleureux</h4>
            <p>
              Vous méritez de vous offrir un moment de détente, et je suis là
              pour vous aider à atteindre cet objectif.{" "}
            </p>
          </div>
          <div>
            <h4>Conseils</h4>
            <p>
              N'hésitez pas à me contacter si vous avez des questions ou si vous
              souhaitez en savoir plus sur les différents massages.{" "}
            </p>
          </div>
        </div>
        <NavLink to="/massages" className="btn" />
      </section>
    </div>
  );
}
