import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Leaf, TriangleAlert } from "lucide-react";
import ColabMeLogo from "../components/ColabMeLogo";
import { ColabMeLogoFocus } from "../components/ColabMeWordPart";
import YouTubeEmbed from "../components/media/YouTubeEmbed";

/** Playlist ColabMe.eu — https://www.youtube.com/playlist?list=PLURbUKKPSHjc */
const HOME_PLAYLIST_ID = "PLURbUKKPSHjc";

function EuroBanknoteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="1.25"
        y="4.25"
        width="21.5"
        height="15.5"
        rx="2.2"
        stroke="currentColor"
        strokeWidth="1.05"
      />
      <path
        d="M15.35 8.05A5.15 5.15 0 1 0 15.35 15.95"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinecap="round"
      />
      <path
        d="M7.15 10.65h7.35M7.15 13.35h5.7"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinecap="round"
      />
    </svg>
  );
}

const LAB_ADVANTAGE_ICONS = {
  cost: EuroBanknoteIcon,
  leaf: Leaf,
  caution: TriangleAlert,
} as const;

const AXES = [
  ["DIGITAL", "REAL"],
  ["TEORIE", "PRACTICĂ"],
  ["SOCIAL", "ECONOMIC"],
] as const;

const PILLARS = [
  {
    id: "co" as const,
    title: "Comunitate și colaborare",
    paragraphs: [
      "Din comunitatea ColabMe fac parte atât instituții publice și private din domeniul educației, cât și persoane interesate de știință. Colaborăm pentru a face educația accesibilă, sustenabilă și relevantă. Folosim tehnologii moderne ca să legăm teoria de practică și creăm unelte educaționale digitale și fizice.",
    ],
  },
  {
    id: "lab" as const,
    title: "Laboratorul virtual",
    paragraphs: [
      "Laboratorul virtual este locul în care teoria poate fi pusă în aplicare, un spațiu de experimentare, testare și prototipare care simulează materiale și echipamente reale. Simulatorul funcționează în tandem cu baza de date ce conține logica pentru componentele disponibile, lecții și exerciții, și poate fi accesat online prin intermediul platformei ColabMe și a produselor IoT.",
    ],
    bulletsLabel: "Avantaje:",
    bullets: [
      {
        icon: "cost" as const,
        text: "economia de resurse fizice în procesul de învățare și experimentare",
      },
      {
        icon: "leaf" as const,
        text: "lipsa deșeurilor nocive",
      },
      {
        icon: "caution" as const,
        text: "realizarea experimentelor periculoase în siguranță",
      },
    ],
  },
  {
    id: "me" as const,
    title: "Modular evolution",
    paragraphs: [
      "Modular Evolution se referă la învățarea continuă, în cicluri. Prin Me („eu”, în engleză) vrem să amintim că validarea cunoștințelor dobândite se face prin acțiuni autonome ale individului, cu rezultate concrete în viața lui și a comunității din care face parte.",
    ],
  },
] as const;

export default function HomePage() {
  const [params] = useSearchParams();
  const deleted = params.get("deleted") === "1";
  const [videoInteractive, setVideoInteractive] = useState(false);

  return (
    <section className="home">
      {deleted && (
        <p className="auth-info" role="status">
          Contul și datele asociate au fost șterse. Ne pare rău să te vedem
          plecând — poți crea oricând un cont nou.
        </p>
      )}

      <header className="home-intro">
        <div className="home-brand">
          <ColabMeLogo className="colabme-logo--hero" />
        </div>

        <h1 className="home-lead">
          <span className="home-lead-line">
            Un proces educațional complet, de la teorie și practică
          </span>
          <span className="home-lead-line">
            în mediul virtual, până la aplicații în lumea reală.
          </span>
        </h1>
      </header>

      <div className="home-video-block">
        <figure
          className={`home-video${videoInteractive ? " home-video--interactive" : ""}`}
        >
          <YouTubeEmbed
            playlistId={HOME_PLAYLIST_ID}
            title="ColabMe — playlist"
            ambient
            showControls={videoInteractive}
          />
        </figure>
        <button
          type="button"
          className={`home-video-unlock${videoInteractive ? " is-on" : ""}`}
          aria-pressed={videoInteractive}
          aria-label={
            videoInteractive
              ? "Dezactivează control video"
              : "Activează control video"
          }
          onClick={() => setVideoInteractive((on) => !on)}
        >
          <span className="home-video-unlock-mark" aria-hidden="true">
            {videoInteractive ? "✓" : "✕"}
          </span>
          control video
        </button>
      </div>

      <div className="home-pillars">
        {PILLARS.map((pillar) => (
          <section
            key={pillar.id}
            className={`home-pillar home-pillar--${pillar.id}`}
          >
            <ColabMeLogoFocus
              active={pillar.id}
              className="home-pillar-logo"
            />
            <h2 className="home-pillar-title">{pillar.title}</h2>
            {pillar.paragraphs.map((paragraph) => (
              <p key={paragraph} className="home-copy">
                {paragraph}
              </p>
            ))}
            {"bullets" in pillar && pillar.bullets && (
              <>
                <p className="home-copy home-pillar-pros-label">
                  {pillar.bulletsLabel}
                </p>
                <ul className="home-pillar-pros">
                  {pillar.bullets.map((bullet) => {
                    const Icon = LAB_ADVANTAGE_ICONS[bullet.icon];
                    return (
                      <li key={bullet.text}>
                        <span className="home-pillar-pro-icon" aria-hidden="true">
                          <Icon />
                        </span>
                        <span>{bullet.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </section>
        ))}
      </div>

      <section className="home-axes" aria-label="Cele trei axe ColabMe">
        <p className="home-axes-caption">
          Un proiect pe trei axe interconectate.
        </p>
        <ul className="home-axes-list">
          {AXES.map(([left, right]) => (
            <li key={left} className="home-axis">
              <span className="home-axis-pole">{left}</span>
              <span className="home-axis-link" aria-hidden="true">
                ⇔
              </span>
              <span className="home-axis-pole">{right}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="home-cta">
        Poți afla mai multe pe pagina <Link to="/roadmap">Roadmap</Link> sau
        poți încerca ce există deja în <Link to="/lectii">Lumea Lecțiilor</Link>{" "}
        și în <Link to="/lobby">Lumea Online</Link>.
      </p>

      <section className="home-block home-block--why">
        <h2 className="home-heading">De ce facem asta?</h2>
        <p className="home-copy">
          Pentru că vrem să trăim într-o lume mai bună, iar nivelul de educație
          al societății determină nivelul ei de trai.
        </p>
      </section>
    </section>
  );
}
