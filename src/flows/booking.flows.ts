import { defineFlow, type BookingFlow } from './booking-flow';
import { nextUpcoming } from '../utils/dates';
import {
  hotelBooking,
  thingsToDoBooking,
  evChargingBooking,
  flightsBooking,
  carRentalBooking,
  transportationBooking,
  showsEventsBooking,
  diningBooking,
  parkingBooking,
} from '../data/booking.data';
import { HotelsHomePage, type HotelsCriteria } from '../pages/HotelsHomePage';
import { ThingsToDoHomePage } from '../pages/ThingsToDoHomePage';
import { EvChargingHomePage } from '../pages/EvChargingHomePage';
import { FlightsHomePage } from '../pages/FlightsHomePage';
import { CarRentalHomePage } from '../pages/CarRentalHomePage';
import { TransportationHomePage } from '../pages/TransportationHomePage';
import { ShowsEventsHomePage } from '../pages/ShowsEventsHomePage';
import { DiningHomePage } from '../pages/DiningHomePage';
import { ParkingHomePage } from '../pages/ParkingHomePage';

const hotelsStay = hotelBooking.stay;
const hotelsCriteria: HotelsCriteria = {
  location: hotelBooking.location,
  checkIn: nextUpcoming(hotelsStay.month, hotelsStay.checkInDay),
  checkOut: nextUpcoming(
    hotelsStay.month,
    hotelsStay.checkInDay,
    hotelsStay.checkOutDay - hotelsStay.checkInDay,
  ),
  guests: hotelBooking.guests,
};

const flightsStay = flightsBooking.stay;
const dinnerDate = diningBooking.dinnerDate;
const parkingStay = parkingBooking.stay;
const transferDate = transportationBooking.pickUpDate;

const thingsToDoStay = thingsToDoBooking.stay;

/** One named flow per category — each spec file runs its own. */
export const thingsToDoFlow = defineFlow({
  category: thingsToDoBooking.category,
  criteria: {
    location: thingsToDoBooking.location,
    checkIn: nextUpcoming(thingsToDoStay.month, thingsToDoStay.checkInDay),
    checkOut: nextUpcoming(
      thingsToDoStay.month,
      thingsToDoStay.checkInDay,
      thingsToDoStay.checkOutDay - thingsToDoStay.checkInDay,
    ),
  },
  searchPage: ThingsToDoHomePage,
  resultsNoun: 'Activities',
  // Things To Do is the landing default — its link keeps the current route.
  categoryRoute: '/',
});

export const evChargingFlow = defineFlow({
  category: evChargingBooking.category,
  criteria: { location: evChargingBooking.location },
  searchPage: EvChargingHomePage,
  resultsNoun: 'Chargers',
});

/** The Hotels flow — also the entry point of the deep e2e journey. */
export const hotelsFlow = defineFlow({
  category: hotelBooking.category,
  criteria: hotelsCriteria,
  searchPage: HotelsHomePage,
  resultsNoun: 'Properties',
});

export const flightsFlow = defineFlow({
  category: flightsBooking.category,
  criteria: {
    origin: flightsBooking.origin,
    destination: flightsBooking.destination,
    checkIn: nextUpcoming(flightsStay.month, flightsStay.departDay),
    checkOut: nextUpcoming(
      flightsStay.month,
      flightsStay.departDay,
      flightsStay.returnDay - flightsStay.departDay,
    ),
  },
  searchPage: FlightsHomePage,
  
});

export const carRentalFlow = defineFlow({
  category: carRentalBooking.category,
  criteria: { location: carRentalBooking.location },
  searchPage: CarRentalHomePage,
  
});

export const transportationFlow = defineFlow({
  category: transportationBooking.category,
  criteria: {
    pickUp: transportationBooking.pickUp,
    dropOff: transportationBooking.dropOff,
    date: nextUpcoming(transferDate.month, transferDate.day),
  },
  searchPage: TransportationHomePage,
  resultsNoun: 'Transports',
});

export const showsEventsFlow = defineFlow({
  category: showsEventsBooking.category,
  criteria: { location: showsEventsBooking.location },
  searchPage: ShowsEventsHomePage,
  resultsNoun: 'Shows & Events',
});

export const diningFlow = defineFlow({
  category: diningBooking.category,
  criteria: {
    location: diningBooking.location,
    date: nextUpcoming(dinnerDate.month, dinnerDate.day),
  },
  searchPage: DiningHomePage,
  
});

export const parkingFlow = defineFlow({
  category: parkingBooking.category,
  criteria: {
    location: parkingBooking.location,
    checkIn: nextUpcoming(parkingStay.month, parkingStay.arrivalDay),
    checkOut: nextUpcoming(
      parkingStay.month,
      parkingStay.arrivalDay,
      parkingStay.departureDay - parkingStay.arrivalDay,
    ),
  },
  searchPage: ParkingHomePage,
  
});
