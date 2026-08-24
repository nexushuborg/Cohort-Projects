import { useState } from "react";
import axios from "axios";

function BookingForm({ propertyId, pricePerNight }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

    const bookingData = {
      property_id: propertyId,
      check_in: checkIn,
      check_out: checkOut,
      guests_count: Number(guests),
    };

    axios
      .post("http://localhost:5000/api/bookings", bookingData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Booking response:", response.data);
        setMessage("Booking request sent successfully!");
        alert("Booking request submitted!");
      })
      .catch((error) => {
        console.error("Booking error:", error);
        setMessage("Failed to book. Please check your dates.");
      });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md max-w-md">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        ₹{pricePerNight} <span className="text-sm font-normal text-gray-500">/ night</span>
      </h2>

      {message && (
        <p className="mb-4 text-sm font-semibold text-rose-500">{message}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Check-In Date</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-rose-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Check-Out Date</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-rose-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Number of Guests</label>
          <input
            type="number"
            min="1"
            max="10"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-rose-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-lg transition"
        >
          Book Now 🚀
        </button>
      </form>
    </div>
  );
}

export default BookingForm;