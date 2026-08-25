function StatsCard({ title, value, icon, color = "bg-blue-100" }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
      </div>

      <div className={`h-12 w-12 rounded-2xl ${color} flex items-center justify-center text-2xl`}>
        {icon}
      </div>
    </div>
  );
}

export default StatsCard;