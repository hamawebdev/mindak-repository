import { TestimonialsSection } from "./testmonials-with-marquee"
import BlurText from "./blur-text"


const testimonials = [
  {
    author: {
      name: "Younes Ait hamou",
      handle: "",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
    },
    text: "Kanet expérience bzzaf chaba m3a Mindak Studio. F kol ma ykhes la production, la décoration, la qualité, wel accompagnement… y3tihom saha vraiment 3la kamel le travail li darouh m3ana. Merci !"
  },
  {
    author: {
      name: "Manel belkadi",
      handle: "",
      avatar: "https://scontent.cdninstagram.com/v/t51.2885-19/473045535_466633569822186_210148017142547268_n.jpg?stp=dst-jpg_s100x100_tt6&_nc_cat=109&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=zX17PHFWmH0Q7kNvwHWO65W&_nc_oc=AdlsGGTYN3vyKN97s-3tUcDeBjgf3CZAQ6asU7U-TlbzFraPSQjKkwC5ku7kPwsL9fw&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&oh=00_AfmWN0R8w-rg9F4DoHtmjsetixLqb_6HmvyufhlqAia0Dg&oe=693B71E4"
    },
    text: "Taajebni bzzaf Mindak Agency, ou hadi machi ma première expérience m3ahom. N conseils kamel mes amis bach yjou ykhedmou m3ahom. Franchement, décoration bzzaf chaba, lighting mlih, la qualité koulech top !"
  },
  {
    author: {
      name: "Chemsedine sahraoui",
      handle: "",
      avatar: "https://scontent.cdninstagram.com/v/t51.82787-19/589367172_18541731601065119_1685685417958888551_n.jpg?stp=dst-jpg_s100x100_tt6&_nc_cat=1&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=1N3Hyjjy0jMQ7kNvwHCynLm&_nc_oc=AdkeT6dM_T_MTbQ2Ye3I3I33WC8homvK4c9UgEjIBIHmeYjHqJAloAb8nkjpoEEfEgw&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=txqFUTPHFlmFA1H8cHHm3w&oh=00_AfnB1KfmU8nVX4yEJEiaEMuLLqnyRrwIqdfubdZKVbJVPQ&oe=693B6A8A"
    },
    text: "Je suis très satisfait du rendement et du professionnalisme de Mindak Studio. La qualité du studio, des caméras, du son… tout était impeccable. Et surtout, le personnel présent était attentif aux moindres détails. Je les remercie sincèrement et je recommande fortement Mindak Studio"
  },
  {
    author: {
      name: "Sarah",
      handle: "",
      avatar: "https://scontent.cdninstagram.com/v/t51.82787-19/588563756_17975300039956032_2650630684706297184_n.jpg?stp=dst-jpg_s100x100_tt6&_nc_cat=1&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=Lfizdf38m_wQ7kNvwGxxCz9&_nc_oc=AdnOH_PokzKevyV47JTvbHYZPwJrv8UHI6j1B87IqlhUzfY8eme_Ng6I1B_K3op4X6I&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=34lAeVWMLsAkNi5Mnf3_bQ&oh=00_AflC37YgzYLuw2oT5kLcmALthtJTT4OM2EuTUhS4PUmbPw&oe=693B6933"
    },
    text: "Koulech kan mlih : le lighting, l’espace, la qualité, le décor kan hayel. W l’équipe vraiment friendly, souriante et très professionnelle. Ils veillent sur le moindre détail et méprisent bien leur travail"
  },
  {
    author: {
      name: "Adem",
      handle: "",
      avatar: "https://scontent.cdninstagram.com/v/t51.75761-19/491442369_17874671796320843_6641242496664358516_n.jpg?stp=dst-jpg_s100x100_tt6&_nc_cat=107&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy44NTguQzMifQ%3D%3D&_nc_ohc=TYIpB7y0oAwQ7kNvwGQml58&_nc_oc=AdlY0nkjJiFPgfPdVNq1P0Kdxco3xU78rkOTxBeq2sfiuYmQAsYagQazs_6Ng6bYj3g&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=5yNiEBIoafBqC-PMtMur7g&oh=00_AfmbL__wXAO5Did1bUkDj8Q_FAuSerlk3REq7L0aHre5GQ&oe=693B6D65"
    },
    text: "jewezt une tres bonne experiance m3a mindak je me suis pas sentie e tournage l’equipe ma mis tres alaise je recomande vraiment"
  },
  {
    author: {
      name: "Mehdi",
      handle: "",
      avatar: "https://scontent.cdninstagram.com/v/t51.82787-19/520146375_18495084244064247_4837345030863671381_n.jpg?stp=dst-jpg_s100x100_tt6&_nc_cat=108&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=4gfhuELveXcQ7kNvwFqnEVp&_nc_oc=AdlBt3I1_-odD6lAQawBjcju6ZnOE2AK9FXuLSs5mz2F30IW7v1uei6kjR4cPaRi40o&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=M_R0XmiJok64hc4M7iIpUw&oh=00_AfkdULwzkH2LMycnG7heOmeRr71wUa_NBIjvyjHkLqKRCA&oe=693B6B37"
    },
    text: "la qualitee de travail le decor et toute lequipe une equipe tres bienveillante une experiance que jai adoree"
  },
  {
    author: {
      name: "Minaz",
      handle: "",
      avatar: "https://scontent.cdninstagram.com/v/t51.82787-19/587393808_17844798603619044_5366801542091145454_n.jpg?stp=dst-jpg_s100x100_tt6&_nc_cat=106&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=LEQBf6erM6MQ7kNvwHUlE9Q&_nc_oc=Admpl-J3w4c5B6Krgh3Z6nFgAEcTJP4_hYYI88kdNlg8Kuue6LX0Ok7JUJMvxo_fpvA&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&oh=00_Afle8Hdr6LANi99FN7JrLah6XIU9W9wqCUppT07wnqkJng&oe=693B52E4"
    },
    text: "sah ki jit l Mindak hassit rohi fi haja profetionel materiel decors et le personnel kifech yste9blok kifech yet3amlo m3ak c’est sur marahch tkon ma derniere experiance m3ahom, bon courage mindak"
  },
  {
    author: {
      name: "Nabila",
      handle: "",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    text: "kanet ma premiere experience et kanet magnifique 3jebniiii bzef le studio la decoration et surtout lighting jai aimer kol haja chaque detail merci beaucoup"
  },
  {
    author: {
      name: "Raouf",
      handle: "",
      avatar: "https://scontent.cdninstagram.com/v/t51.2885-19/461239787_2275490292783732_4773082544635919330_n.jpg?stp=dst-jpg_s100x100_tt6&_nc_cat=108&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy44MzcuQzMifQ%3D%3D&_nc_ohc=h6yo_vsgjjAQ7kNvwGKrkOH&_nc_oc=Adm56mhqCbDr3uny4sWrLuVp2uWvYXfmxNx2lYasDuEsw4VJF6uH_SSCBoc7yDC_9tw&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&oh=00_AfnB2cX_rRA0Wi-ZlW15tP417wu9XW31-XDmkzemXKgkAQ&oe=693B478D"
    },
    text: "Le meilleur studio podcast li tournit m3ah j’ai eu beaucoup d’experiance mais sah hadi kanet la meilleur men kol jiha Qualitee de service la gentiellece de lequipe les option qui propose le materiels la decoration je recommande vraiment"
  }
]

export function TestimonialsSectionDemo() {
  return (
    <section className="bg-black text-white py-12 sm:py-24 md:py-32 px-0">
      {/* Headline */}
      <div className="mx-auto flex max-w-container flex-col items-center gap-4 text-center sm:gap-16">
        <div className="flex flex-col items-center gap-4 px-4 sm:gap-8">
          <h2 className="max-w-[720px] text-[40px] md:text-[56px] lg:text-[72px] font-medium text-white leading-[0.95] mb-12 md:mb-16 lg:mb-20 tracking-tighter flex flex-col items-center gap-2">
            <BlurText
              text="Hear from those"
              className="font-custom-sans text-[40px] md:text-[56px] lg:text-[72px] font-medium text-white leading-[0.95] tracking-tighter"
              delay={50}
              animateBy="letters"
            />
            <BlurText
              text="who trusted us!"
              className="font-emphasis text-[40px] md:text-[56px] lg:text-[72px] font-bold text-white leading-[0.95] tracking-tighter italic"
              delay={50}
              animateBy="letters"
            />
          </h2>
        </div>
      </div>

      <TestimonialsSection
        testimonials={testimonials}
        renderSection={false}
      />
    </section>
  )
}