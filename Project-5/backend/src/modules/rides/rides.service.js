const repository = require('./rides.repository');

const createRide = async (data) => {

 

  const driver =
    await repository.findDriverByUserId(
      data.userId
    );

  if (!driver) {
    const error = new Error(
      'You must register as a driver before creating a ride'
    );

    error.statusCode = 403;
    error.code = 'DRIVER_NOT_FOUND';

    throw error;
  }


  const vehicle =
    await repository.findActiveVehicleByDriver(
      driver.id
    );

  if (!vehicle) {
    const error = new Error(
      'No active vehicle found for this driver'
    );

    error.statusCode = 400;
    error.code = 'VEHICLE_NOT_FOUND';

    throw error;
  }



  const totalSeats =
    vehicle.seat_count;

  const rideData = {
    driver_id: driver.id,
    vehicle_id: vehicle.id,
    origin_address:
      data.originAddress,
    origin_lat:
      data.originLat,
    origin_lng:
      data.originLng,
    origin_city:
      data.originCity,


    // Destination
    destination_address:
      data.destinationAddress,

    destination_lat:
      data.destinationLat,

    destination_lng:
      data.destinationLng,

    destination_city:
      data.destinationCity,


    // Departure
    departure_at:
      data.departureAt,


    // Seats come from the vehicle
    total_seats:
      totalSeats,

    available_seats:
      totalSeats,


    // Price
    price_per_seat:
      data.pricePerSeat,


    // Optional notes
    notes:
      data.notes || null,


    // New rides are active
    status: 'active'
  };


  return repository.createRide(
    rideData
  );
};


const getRideById = async (rideId) => {

  const ride =
    await repository.findRideById(
      rideId
    );

  if (!ride) {

    const error = new Error(
      'Ride not found'
    );

    error.statusCode = 404;
    error.code = 'NOT_FOUND';

    throw error;
  }

  return ride;
};


module.exports = {
  createRide,
  getRideById
};