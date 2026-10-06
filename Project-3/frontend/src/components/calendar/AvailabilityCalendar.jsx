import { useEffect, useState } from "react";

function AvailabilityCalendar({ propertyId }) {
  const [selectedDates, setSelectedDates] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleDate = (date) => {
    setSelectedDates((current) =>
      current.includes(date)
        ? current.filter((item) => item !== date)
        : [...current, date]
    );
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      dates.push(date.toISOString().split("T")[0]);
    }

    return dates;
  };

  const dates = generateDates();

  const handleSave = async () => {
    try {
      setLoading(true);

      console.log("Property:", propertyId);
      console.log("Selected dates:", selectedDates);

      // Connect your availability API here later.

      alert("Availability updated successfully.");
    } catch (error) {
      console.error("Failed to update availability:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">

      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Manage Availability
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Select dates that you want to mark as unavailable.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {dates.map((date) => {
          const selected = selectedDates.includes(date);

          return (
            <button
              key={date}
              type="button"
              onClick={() => toggleDate(date)}
              className={`rounded-lg border px-3 py-3 text-sm font-medium transition ${
                selected
                  ? "border-red-300 bg-red-100 text-red-700"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:border-rose-300"
              }`}
            >
              {new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between">

        <p className="text-sm text-gray-500">
          {selectedDates.length} date
          {selectedDates.length !== 1 ? "s" : ""} selected
        </p>

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Availability"}
        </button>

      </div>
    </div>
  );
}

export default AvailabilityCalendar;