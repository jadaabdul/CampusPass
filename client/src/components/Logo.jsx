import { Ticket } from "lucide-react";

const Logo = () => {
  return (
    <div className="flex items-center gap-2 cursor-pointer group">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 transition-all duration-300 group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/30 group-hover:-rotate-12">
        <Ticket className="text-primary h-5 w-5 transition-colors duration-300 group-hover:text-black" />
      </div>

      <h2 className="text-2xl font-black tracking-tight text-text">
        Campus<span className="text-primary">Pass</span>
      </h2>
    </div>
  );
};

export default Logo;
