export interface AboutPillar {
  title: string;
  /** Gol = draft păstrat, de completat. */
  items: string[];
}

export const ABOUT = {
  vision: {
    title: "Viziune",
    lead: "În viziunea ColabMe, procesul educațional este accesibil și de calitate pentru toate categoriile sociale, în folosul comunității.",
    pillars: [
      {
        title: "Accesibil prin",
        items: [
          "Conținut adaptat și relevant în contextul actual",
          "Conținut open source realizat în parteneriat cu instituții științifice",
          "Disponibil online de pe mai multe platforme",
        ],
      },
      {
        title: "De calitate",
        items: [],
      },
      {
        title: "Pentru toate categoriile sociale",
        items: [],
      },
      {
        title: "În folosul comunității",
        items: [
          "Aplicații practice; rezultatele practice sunt înregistrate și îmbunătățesc conținutul educativ",
        ],
      },
    ] satisfies AboutPillar[],
  },

  mission: {
    title: "Misiune",
    lead: "Misiunea noastră este să oferim servicii și produse EdTech complete, de la teorie la practică.",
    paragraphs: [
      "Construim platforma, laboratoarele virtuale și conținutul împreună cu profesori, elevi, universități și parteneri.",
      "Lucrăm pe trei axe care se susțin reciproc: Co (comunitate și colaborare), lab (experimentare și simulare) și Me (evoluție modulară spre aplicații reale), astfel încât învățarea să poată continua în circuit.",
    ],
  },

  objectives: {
    title: "Obiective",
    items: [
      "Să facem teoria aplicabilă: lecții, exerciții și simulări care se pot testa, repeta și adapta.",
      "Să economisim resurse și să reducem riscul: experimente periculoase sau costisitoare pot rula mai întâi în mediul virtual, fără deșeuri nocive.",
      "Să creștem conținutul open source împreună cu comunitatea — profesori, elevi și instituții partenere.",
      "Să legăm platforma de lumea reală: aplicații practice, hardware / IoT prin API-uri dedicate și feedback care îmbunătățește ColabMe.",
      "Să oferim un acces clar și util pentru elevi, profesori și parteneri, pe web și, pe termen mai lung, pe mai multe tipuri de clienți.",
    ],
  },
} as const;
