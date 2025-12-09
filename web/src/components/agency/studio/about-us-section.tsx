



import BlurText from '@/components/ui/blur-text';
import ScrollReveal from '@/components/ui/scroll-reveal';
import CountUp from '@/components/ui/count-up';

export function AboutUsSection() {
    return (
        <section id="about" className="relative w-full bg-black px-6 md:px-6 py-16 lg:py-24">
            <div className="mx-auto w-full max-w-[1400px]">
                {/* Centered Headline */}
                <h2 className="text-[40px] md:text-[56px] lg:text-[72px] font-medium text-white leading-[0.95] mb-12 md:mb-16 lg:mb-20 tracking-[-0.04em] text-center flex flex-col items-center gap-2">
                    <BlurText
                        text="À propos de"
                        className="font-custom-sans text-[40px] md:text-[56px] lg:text-[72px] font-medium text-white leading-[0.95] tracking-[-0.04em]"
                        delay={50}
                        animateBy="letters"
                    />
                    <BlurText
                        text="Mindak Studio"
                        className="font-emphasis text-[40px] md:text-[56px] lg:text-[72px] font-bold italic text-white leading-[0.95] tracking-[-0.04em]"
                        delay={50}
                        animateBy="letters"
                    />
                </h2>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left Column */}
                    <div className="flex flex-col max-w-2xl mx-auto lg:mx-0">
                        <ScrollReveal
                            baseOpacity={0.05}
                            enableBlur={true}
                            baseRotation={1.5}
                            blurStrength={3}
                            textClassName="font-custom-sans text-[14px] md:text-[20px] lg:text-[24px] font-light text-white/70 leading-[1.6] tracking-normal text-center lg:text-left"
                            containerClassName="mb-10 md:mb-16 max-w-xl mx-auto lg:mx-0"
                            scrub={1.5}
                            stagger={0.015}
                        >
                            Mindak Studio est un studio de podcast professionnel situé à Alger, conçu pour répondre aux besoins des créateurs de contenu, podcasteurs, YouTubeurs, marques et célébrités. Nous mettons à votre disposition un studio d’enregistrement moderne, équipé des dernières technologies pour garantir un son de qualité studio et une expérience d’enregistrement fluide et sans stress. Que vous souhaitiez louer un studio pour enregistrer un podcast, tourner une vidéo ou produire du contenu pour vos réseaux, Mindak Studio vous accompagne à chaque étape.
                        </ScrollReveal>

                        <div className="flex flex-row gap-x-6 gap-y-8 md:gap-16 flex-wrap justify-center lg:justify-start">
                            <div className="flex flex-col gap-1 items-center lg:items-start">
                                <span className="font-custom-sans text-[32px] md:text-[56px] lg:text-[64px] font-medium text-white leading-none tracking-tight">
                                    <CountUp
                                        from={0}
                                        to={100}
                                        separator=","
                                        direction="up"
                                        duration={1}
                                        className="count-up-text"
                                    />%
                                </span>
                                <span className="font-custom-sans text-[12px] md:text-[14px] font-normal text-white/50 leading-tight tracking-wide text-center lg:text-left">
                                    de clients<br />reviennent
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 items-center lg:items-start">
                                <span className="font-custom-sans text-[32px] md:text-[56px] lg:text-[64px] font-medium text-white leading-none tracking-tight">
                                    <CountUp
                                        from={0}
                                        to={94}
                                        separator=","
                                        direction="up"
                                        duration={1}
                                        className="count-up-text"
                                    />%
                                </span>
                                <span className="font-custom-sans text-[12px] md:text-[14px] font-normal text-white/50 leading-tight tracking-wide text-center lg:text-left">
                                    de livraisons<br />à temps
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 items-center lg:items-start">
                                <span className="font-custom-sans text-[32px] md:text-[56px] lg:text-[64px] font-medium text-white leading-none tracking-tight">
                                    <CountUp
                                        from={0}
                                        to={98}
                                        separator=","
                                        direction="up"
                                        duration={1}
                                        className="count-up-text"
                                    />%
                                </span>
                                <span className="font-custom-sans text-[12px] md:text-[14px] font-normal text-white/50 leading-tight tracking-wide text-center lg:text-left">
                                    de satisfaction<br />client
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Gray Box */}
                    <div className="mx-auto w-full max-w-2xl aspect-[4/3] lg:aspect-square lg:h-auto bg-neutral-800 rounded-[24px] md:rounded-[32px] border border-white/5 overflow-hidden relative group">
                        <img
                            src="/Studio/aboutus.JPG"
                            alt="About Us"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>
                </div>
            </div>
        </section>
    );
}
