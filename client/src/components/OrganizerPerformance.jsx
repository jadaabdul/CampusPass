const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const OrganizerPerformance = ({ organizers = [] }) => {
  if (!organizers.length) {
    return (
      <div className="rounded-3xl border border-border bg-surface/80 p-8 text-center text-sm text-text-muted backdrop-blur-xl">
        No organizer revenue data yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-surface/80 backdrop-blur-xl">
      <div className="border-b border-border px-6 py-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-text">
          Organizer Performance
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/50">
              {[
                "Organizer",
                "Events",
                "Gross Revenue",
                "Platform Fee",
                "Net Earnings",
              ].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left font-bold uppercase tracking-wider text-text-muted"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {organizers.map((org) => (
              <tr
                key={org.organizerId}
                className="border-b border-border/30 transition hover:bg-surface-secondary/50"
              >
                <td className="px-5 py-4">
                  <p className="font-bold text-text">
                    {org.organizerName || "N/A"}
                  </p>
                  <p className="text-text-muted">{org.organizerEmail || ""}</p>
                </td>
                <td className="px-5 py-4 text-text-muted">
                  {org.eventCount || 0}
                </td>
                <td className="px-5 py-4 font-bold text-text">
                  {fmt(org.totalRevenue)}
                </td>
                <td className="px-5 py-4 text-primary">
                  {fmt(org.platformCommission)}
                </td>
                <td className="px-5 py-4 font-bold text-green-400">
                  {fmt(org.organizerEarnings)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrganizerPerformance;
