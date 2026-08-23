const repository = require('./rides.repository');

const createRide = async (data) => {
  // Find an active vehicle belonging to this driver
  const vehicle = await repository.findActiveVehicleByDriver(data.driverId);

  if (!vehicle) {
    const error = new Error('No active vehicle found for this driver');
    error.statusCode = 400;
    throw error;
  }

  // A ride cannot have more seats than the vehicle
  if (data.totalSeats > vehicle.seat_count) {
    const error = new Error(
      `Total seats cannot exceed vehicle seat count of ${vehicle.seat_count}`
    );
    error.statusCode = 400;
    throw error;
  }

  const rideData = {
    driver_id: data.driverId,
    vehicle_id: vehicle.id,

    origin_address: data.originAddress,
    origin_lat: data.originLat,
    origin_lng: data.originLng,
    origin_city: data.originCity,

    destination_address: data.destinationAddress,
    destination_lat: data.destinationLat,
    destination_lng: data.destinationLng,
    destination_city: data.destinationCity,

    departure_at: data.departureAt,

    total_seats: data.totalSeats,
    available_seats: data.totalSeats,

    price_per_seat: data.pricePerSeat,

    notes: data.notes || null,
    status: 'active'
  };

  return repository.createRide(rideData);
};

const getRideById = async (rideId) => {
  const ride = await repository.findRideById(rideId);

  if (!ride) {
    const error = new Error('Ride not found');
    error.statusCode = 404;
    throw error;
  }

  return ride;
};

module.exports = {
  createRide,
  getRideById
};