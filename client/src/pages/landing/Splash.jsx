import { useNavigate } from "react-router-dom";
import { Sparkles, Calendar, Ticket, ShieldCheck, ArrowRight } from "lucide-react";

import landingHero from "../../assets/landing-hero.png";
import Button from "../../components/Button";

const Splash = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: "Discover Campus Events",
      desc: "Browse workshops, hackathons, sports, cultural festivals, and seminars happening across your campus.",
    },
    {
      icon: Ticket,
      title: "Instant QR Passes",
      desc: "Reserve your seat in seconds and receive a secure digital QR pass instantly.",
    },
    {
      icon: ShieldCheck,
      title: "Organizer Dashboard",
      desc: "Manage registrations, verify attendees, and monitor your events from one place.",
    },
    {
      icon: Sparkles,
      title: "Real-Time Updates",
      desc: "Receive notifications about schedule changes, announcements, and reminders.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-text">
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute left-1/2 top-24 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />

        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">
          <div className="animate-fade-in-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <Sparkles size={16} />
              Campus Event Management Platform
            </div>

            <h1 className="text-5xl font-extrabold leading-tight lg:text-6xl">
              Discover,
              <br />
              Connect &
              <br />
              <span className="text-primary">Experience Campus Life</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-text-muted">
              CampusPass makes discovering events, booking tickets, generating QR passes, and managing registrations
              simple for students and organizers.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="group inline-flex items-center gap-3 rounded-2xl bg-primary px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30 active:translate-y-0"
              >
                Explore Events
                <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => navigate("/register")}
                className="inline-flex items-center rounded-2xl border border-border bg-surface px-8 py-4 text-base font-semibold text-text shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:bg-primary/5 hover:text-primary active:translate-y-0"
              >
                Create Account
              </button>
            </div>
          </div>

          <div className="animate-fade-in-up">
            <div className="rounded-[2rem] border border-border bg-surface p-3 shadow-lg">
              <img src={landingHero} alt="CampusPass" className="rounded-[1.5rem]" />
            </div>
          </div>
        </div>
      </section>
      <section className="border-t border-border bg-surface-secondary/40 py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-3xl text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <Sparkles size={16} />
              Why Choose CampusPass?
            </div>

            <h2 className="mt-6 text-4xl font-bold lg:text-5xl">
              Everything You Need
              <br />
              To Manage Campus Events
            </h2>

            <p className="mt-5 text-lg leading-8 text-text-muted">
              From discovering exciting events to seamless registrations and secure QR check-ins, CampusPass simplifies
              the entire event experience for students and organizers.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={index}
                  className="group rounded-3xl border border-border bg-surface p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                    <Icon size={28} />
                  </div>

                  <h3 className="mt-8 text-xl font-bold">{feature.title}</h3>

                  <p className="mt-4 leading-7 text-text-muted">{feature.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="relative mt-24 overflow-hidden rounded-[2rem] border border-border bg-surface p-10 text-center shadow-md sm:p-14">
            <div className="absolute left-1/2 top-0 -z-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-3xl">
              <h2 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
                Ready to Join Your Next Campus Event?
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-text-muted sm:text-lg">
                Create your free account today and discover hackathons, workshops, seminars, cultural festivals, sports
                events, competitions, and much more happening on your campus.
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => navigate("/register")}
                  className="group inline-flex items-center gap-3 rounded-2xl bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30 active:translate-y-0"
                >
                  Get Started
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center rounded-2xl border border-border bg-background px-8 py-3.5 text-base font-semibold text-text transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:bg-primary/5 hover:text-primary active:translate-y-0"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="border-t border-border bg-background py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-6 text-center text-sm text-text-muted md:flex-row">
          <p>
            © {new Date().getFullYear()} <span className="font-semibold text-text">CampusPass</span>. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Splash;
