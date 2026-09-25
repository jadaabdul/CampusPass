import { Users, CalendarDays, Ticket, ShieldCheck, ArrowRight } from "lucide-react";
import aboutCampus from "../../assets/about-campus.png";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: CalendarDays,
      title: "Discover Campus Events",
      description:
        "Browse technical, cultural, sports, workshops, hackathons, and college festivals all from one unified portal.",
    },
    {
      icon: Ticket,
      title: "Instant Digital Passes",
      description:
        "Register in seconds and receive your verified digital E-Ticket with QR code directly on your profile.",
    },
    {
      icon: Users,
      title: "Student Chapter Network",
      description: "Connect with student organizations, clubs, and peers to collaborate on impactful events.",
    },
    {
      icon: ShieldCheck,
      title: "Secure Verification",
      description: "Fast QR scanning for organizers with instant attendee check-in and anti-duplication protection.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-text">
      <section className="border-b border-border py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-6 text-center space-y-6">
          <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary">
            About CampusPass
          </span>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Making Campus Events
            <br />
            <span className="text-primary">Simple, Digital & Instant</span>
          </h1>

          <p className="mx-auto max-w-3xl text-base leading-relaxed text-text-muted sm:text-lg">
            CampusPass is an all-in-one event hub designed for university students, organizers, and campus
            administrators. Eliminate physical queues, paper passes, and fragmented forms.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-surface p-3 shadow-md">
          <img src={aboutCampus} alt="Campus Event Experience" className="w-full rounded-2xl object-cover" />
        </div>

        <div className="space-y-6">
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary">Our Mission</span>

          <h2 className="text-3xl font-extrabold sm:text-4xl">Empowering Campus Communities Through Seamless Events</h2>

          <p className="text-sm leading-relaxed text-text-muted">
            We believe that university life is enriched when students can easily explore opportunities outside the
            classroom. From coding hackathons to cultural nights, CampusPass removes registration friction.
          </p>

          <p className="text-sm leading-relaxed text-text-muted">
            For organizers, CampusPass provides automated seat tracking, venue assignment, ticket validation, and
            real-time attendance reporting.
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-surface-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center space-y-3">
            <h2 className="text-3xl font-extrabold">Why Universities Choose CampusPass</h2>

            <p className="text-sm text-text-muted">Built specifically for modern academic ecosystems.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={index}
                  className="rounded-3xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="mb-5 inline-flex rounded-2xl bg-primary/10 p-3.5 text-primary">
                    <Icon size={24} />
                  </div>

                  <h3 className="text-lg font-bold">{feature.title}</h3>

                  <p className="mt-3 text-sm leading-relaxed text-text-muted">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-background to-surface-secondary py-20">
        <div className="mx-auto max-w-4xl px-6 text-center space-y-6">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to Elevate Your Campus Events?</h2>

          <p className="text-sm text-text-muted">Join thousands of students and organizers using CampusPass today.</p>

          <button
            onClick={() => navigate("/register")}
            className="group inline-flex items-center gap-3 rounded-2xl bg-primary px-8 py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            Create Student Account
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default About;
