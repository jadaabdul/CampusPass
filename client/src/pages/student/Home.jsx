import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Search } from "lucide-react";
import api from "../../api/axios";

const Home = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [searchTerm] = useState("");

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [, categoryRes] = await Promise.allSettled([
          api.get("/events?status=published"),
          api.get("/categories"),
        ]);
        if (categoryRes.status === "fulfilled") {
          setCategories(categoryRes.value.data.data || []);
        }
      } catch (error) {
        console.log("Home loading error", error);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10 px-2 sm:px-0">
      {/* Explore Categories */}
      {!searchTerm && categories.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-text">Explore Categories</h3>
            <button
              onClick={() => navigate("/browse")}
              className="flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80 transition"
            >
              View All
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {categories.slice(0, 8).map((category) => (
              <button
                key={category._id || category.id}
                className="group relative overflow-hidden h-36 rounded-3xl border border-border bg-surface p-5 text-left transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-text group-hover:text-primary transition">
                      {category.name}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">Discover events</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Quick Explore Banner */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-border bg-gradient-to-br from-primary/20 via-surface to-surface p-8 sm:p-10">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
              <Search size={14} />
              FIND YOUR NEXT EXPERIENCE
            </div>
            <h3 className="text-3xl font-black text-text">Never Miss Campus Events</h3>
            <p className="max-w-xl text-sm text-text-muted">
              Discover workshops, hackathons, cultural programs and competitions happening around you.
            </p>
          </div>
          <button
            onClick={() => navigate("/browse")}
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-sm font-black text-background shadow-lg shadow-primary/20 transition hover:scale-105"
          >
            Explore Events
            <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
