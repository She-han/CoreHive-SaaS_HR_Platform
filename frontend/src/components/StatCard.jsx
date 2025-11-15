export default function StatsCard({ title, value, color }) {
  return (
    <div className={`${color} text-white p-4 rounded-lg shadow-md`}>
      <h3 className="text-lg">{title}</h3>
      <p className="text-3xl font-semibold">{value}</p>
    </div>
  );
}
