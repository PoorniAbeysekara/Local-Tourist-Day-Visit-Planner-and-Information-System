// Run with: npm run seed   (wipes places + categories, upserts the admin)
// IMPORTANT: coordinates, hours, fees and photos below are PLACEHOLDERS.
// Verify each place (Google Maps pin, phone call, official site) before the demo.
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Place from '../models/Place.js';
import Category from '../models/Category.js';
import Admin from '../models/Admin.js';

const daily = (open, close) => [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, open, close }));

const categories = [
  { slug: 'religious', name: 'Religious' },
  { slug: 'heritage', name: 'Heritage' },
  { slug: 'nature', name: 'Nature' },
  { slug: 'coastal', name: 'Coastal' },
  { slug: 'cultural', name: 'Cultural' },
  { slug: 'commercial', name: 'Shopping & Dining' },
  { slug: 'adventure', name: 'Adventure' },
];

const places = [
  {
    name: 'Dutugemunu Rajamaha Viharaya', categories: ['religious', 'heritage'],
    description: 'A Buddhist temple in Baddegama town of cultural and historical significance to the local community.',
    location: { lat: 6.1745, lng: 80.18 }, distanceKm: 0.8, entranceFee: 0, openingHours: daily('06:00', '20:00'),
    visitDuration: 45, travelTips: 'Wear white or modest clothing and remove footwear before entering.',
    facilities: { parking: 'Roadside parking', restrooms: 'Basic', food: 'Shops in town' },
  },
  {
    name: 'Serene River Park', categories: ['nature'],
    description: 'A riverside recreational park near Poddala offering activities suited to families and casual visitors.',
    location: { lat: 6.1, lng: 80.165 }, distanceKm: 8.5, entranceFee: 0, openingHours: daily('08:00', '18:00'),
    visitDuration: 90, travelTips: 'Bring insect repellent and water. Best in the morning.',
    facilities: { parking: 'Yes', restrooms: 'Yes', food: 'Small kiosk' },
  },
  {
    name: 'National Maritime Archaeology Museum', categories: ['heritage', 'cultural'],
    description: 'A museum within the Galle Fort premises showcasing maritime artefacts and shipwreck findings.',
    location: { lat: 6.0278, lng: 80.2172 }, distanceKm: 18, entranceFee: 0, openingHours: daily('09:00', '17:00'),
    visitDuration: 60, travelTips: 'Combine with a walk along the Fort ramparts.',
    facilities: { parking: 'Fort car park', restrooms: 'Yes', food: 'Cafes nearby' },
  },
  {
    name: 'Galle Dutch Fort', categories: ['heritage'],
    description: 'A historic fortification built by the Portuguese and expanded by the Dutch; the historic core of Galle city and a UNESCO World Heritage Site.',
    location: { lat: 6.0267, lng: 80.2168 }, distanceKm: 19, entranceFee: 0, open24h: true,
    visitDuration: 120, travelTips: 'Sunset from the ramparts is the highlight. Wear comfortable shoes for cobblestones.',
    facilities: { parking: 'Paid parking near the entrance', restrooms: 'Near the lighthouse', food: 'Many restaurants inside' },
  },
  {
    name: "St. Mary's Cathedral, Galle", categories: ['religious', 'heritage'],
    description: 'A historic Roman Catholic cathedral in Galle city, notable for its colonial-era architecture.',
    location: { lat: 6.03, lng: 80.2165 }, distanceKm: 19, entranceFee: 0, openingHours: daily('07:00', '18:00'),
    visitDuration: 30, travelTips: 'Dress modestly. Avoid entering during services.',
    facilities: { parking: 'Street parking', restrooms: 'No', food: 'Cafes nearby' },
  },
  {
    name: 'Galle City Center', categories: ['commercial'],
    description: 'A shopping mall on Old Matara Road offering retail, dining and entertainment for visitors extending their day trip.',
    location: { lat: 6.0545, lng: 80.2215 }, distanceKm: 20, entranceFee: 0, openingHours: daily('10:00', '21:00'),
    visitDuration: 60, travelTips: 'Good option for lunch or a rest from the heat.',
    facilities: { parking: 'Yes', restrooms: 'Yes', food: 'Food court' },
  },
  {
    name: 'Yatagala Rajamaha Viharaya', categories: ['religious', 'heritage'],
    description: 'An ancient rock temple set among granite boulders near Unawatuna, notable for its large reclining Buddha statue and centuries-old murals.',
    location: { lat: 6.0143, lng: 80.2517 }, distanceKm: 20, entranceFee: 0, openingHours: daily('06:00', '19:00'),
    visitDuration: 45, travelTips: 'Wear modest clothing. Some steps to climb.',
    facilities: { parking: 'Limited', restrooms: 'Basic', food: 'No' },
  },
  {
    name: 'Rumassala', categories: ['nature', 'heritage', 'religious'],
    description: 'A forested headland near Unawatuna, home to the Japanese Peace Pagoda and offering panoramic views of the coastline.',
    location: { lat: 6.0215, lng: 80.242 }, distanceKm: 21, entranceFee: 0, openingHours: daily('06:00', '18:00'),
    visitDuration: 75, travelTips: 'Go early or near sunset to avoid the heat. Bring water.',
    facilities: { parking: 'Limited', restrooms: 'No', food: 'No' },
  },
  {
    name: 'Jungle Beach, Unawatuna', categories: ['coastal', 'nature'],
    description: 'A secluded cove beach tucked into the Rumassala headland, sheltered by a coral reef and popular for swimming and snorkelling.',
    location: { lat: 6.02, lng: 80.244 }, distanceKm: 22, entranceFee: 0, open24h: true,
    visitDuration: 120, travelTips: 'Bring sun protection and water. Swim only in calm conditions.',
    facilities: { parking: 'Walk-in from road', restrooms: 'No', food: 'Small stalls' },
  },
  {
    name: 'Unawatuna Scuba Diving', categories: ['adventure', 'coastal'],
    description: 'A dive centre near Unawatuna Beach offering guided scuba and snorkelling excursions along the coral reef.',
    location: { lat: 6.01, lng: 80.2495 }, distanceKm: 22, entranceFee: 0, openingHours: daily('08:00', '17:00'),
    visitDuration: 120, travelTips: 'Activities are arranged directly with the dive centre. Check sea conditions first.',
    facilities: { parking: 'Nearby', restrooms: 'Yes', food: 'Beachfront cafes' },
  },
].map((p) => ({ ...p, status: 'active', photos: [] }));

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Category.deleteMany({});
  await Place.deleteMany({});
  await Category.insertMany(categories);
  await Place.insertMany(places);

  const email = (process.env.ADMIN_EMAIL || 'admin@baddegama.lk').toLowerCase();
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'ChangeMe#2026', 10);
  await Admin.findOneAndUpdate({ email }, { email, passwordHash }, { upsert: true });

  console.log(`Seeded ${categories.length} categories, ${places.length} places, admin ${email}`);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
