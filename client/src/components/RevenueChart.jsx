import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-3 text-xs shadow-xl">
        <p className="mb-1 font-bold text-text">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name}: ₹{Number(entry.value).toLocaleString("en-IN")}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const formatMonthlyData = (raw) =>
  raw.map((d) => ({
    name: `${MONTHS[(d._id.month || 1) - 1]} ${d._id.year}`,
    Revenue: d.revenue || 0,
    Transactions: d.count || 0,
  }));

const formatWeeklyData = (raw) =>
  raw.map((d) => ({
    name: `W${d._id.week} ${d._id.year}`,
    Revenue: d.revenue || 0,
  }));

const formatOrganizerData = (raw) =>
  raw.slice(0, 8).map((d) => ({
    name: d.organizerName?.split(" ")[0] || "N/A",
    "Net Earnings": d.organizerEarnings || 0,
    "Platform Fee": d.platformCommission || 0,
  }));

const RevenueChart = ({
  monthlyData = [],
  weeklyData = [],
  organizerData = [],
}) => {
  return (
    <div className="space-y-8">
      {/* Monthly Revenue */}
      <div className="rounded-3xl border border-border bg-surface/80 p-6 backdrop-blur-xl">
        <h3 className="mb-6 text-sm font-black uppercase tracking-wider text-text">
          Monthly Revenue
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={formatMonthlyData(monthlyData)}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
            />
            <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} />
            <YAxis
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="Revenue"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 3, fill: "#22c55e" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Revenue */}
      <div className="rounded-3xl border border-border bg-surface/80 p-6 backdrop-blur-xl">
        <h3 className="mb-6 text-sm font-black uppercase tracking-wider text-text">
          Weekly Revenue
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={formatWeeklyData(weeklyData)}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
            />
            <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} />
            <YAxis
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="Revenue"
              fill="#22c55e"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue by Organizer */}
      {organizerData.length > 0 && (
        <div className="rounded-3xl border border-border bg-surface/80 p-6 backdrop-blur-xl">
          <h3 className="mb-6 text-sm font-black uppercase tracking-wider text-text">
            Revenue by Organizer
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={formatOrganizerData(organizerData)}
              layout="vertical"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                type="number"
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12 }} />
              <Bar
                dataKey="Net Earnings"
                fill="#22c55e"
                radius={[0, 4, 4, 0]}
                maxBarSize={20}
              />
              <Bar
                dataKey="Platform Fee"
                fill="#6366f1"
                radius={[0, 4, 4, 0]}
                maxBarSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;
