/**
 * Seed script to add sample café data for testing
 * Run with: node scripts/seed-sample-data.js
 */

require('dotenv').config()
const mongoose = require('mongoose')
const Cafe = require('../models/Cafe')
const Review = require('../models/Review')

const sampleCafes = [
  // BERKELEY
  {
    name: 'Blue Bottle Coffee',
    address: '2112 University Ave, Berkeley, CA 94704',
    city: 'Berkeley',
    neighborhood: 'Downtown',
    coordinates: { lat: 37.8706, lng: -122.2708 },
    amenities: {
      wifi: { quality: 'excellent', score: 9.0 },
      outlets: { available: true, score: 8.5 },
      seating: { type: 'comfortable', score: 7.5 },
      noise: { level: 'moderate', score: 7.0 },
    },
    tags: ['Fast Wi-Fi', 'Many Outlets', 'Laptop-Friendly', 'Study-Friendly'],
    phone: '(510) 653-3394',
    website: 'https://bluebottlecoffee.com',
  },
  {
    name: 'Philz Coffee',
    address: '1600 Shattuck Ave, Berkeley, CA 94709',
    city: 'Berkeley',
    neighborhood: 'North Berkeley',
    coordinates: { lat: 37.8805, lng: -122.2696 },
    amenities: {
      wifi: { quality: 'good', score: 8.0 },
      outlets: { available: true, score: 7.0 },
      seating: { type: 'adequate', score: 6.5 },
      noise: { level: 'moderate', score: 6.5 },
    },
    tags: ['Fast Wi-Fi', 'Many Outlets', 'Laptop-Friendly'],
    phone: '(510) 848-4000',
  },
  {
    name: 'Café Strada',
    address: '2300 College Ave, Berkeley, CA 94704',
    city: 'Berkeley',
    neighborhood: 'Elmwood',
    coordinates: { lat: 37.8719, lng: -122.2585 },
    amenities: {
      wifi: { quality: 'good', score: 7.5 },
      outlets: { available: false, score: 4.0 },
      seating: { type: 'comfortable', score: 8.0 },
      noise: { level: 'quiet', score: 8.5 },
    },
    tags: ['Quiet', 'Spacious', 'Study-Friendly'],
    phone: '(510) 843-5282',
  },
  {
    name: 'Café Milano',
    address: '2522 Bancroft Way, Berkeley, CA 94720',
    city: 'Berkeley',
    neighborhood: 'UC Berkeley',
    coordinates: { lat: 37.8695, lng: -122.2590 },
    amenities: {
      wifi: { quality: 'spotty', score: 5.5 },
      outlets: { available: true, score: 6.5 },
      seating: { type: 'limited', score: 5.0 },
      noise: { level: 'loud', score: 4.0 },
    },
    tags: ['Laptop-Friendly'],
  },
  {
    name: 'Peet\'s Coffee',
    address: '2190 Shattuck Ave, Berkeley, CA 94704',
    city: 'Berkeley',
    neighborhood: 'Downtown',
    coordinates: { lat: 37.8701, lng: -122.2680 },
    amenities: {
      wifi: { quality: 'excellent', score: 9.5 },
      outlets: { available: true, score: 9.0 },
      seating: { type: 'comfortable', score: 8.5 },
      noise: { level: 'moderate', score: 7.5 },
    },
    tags: ['Fast Wi-Fi', 'Many Outlets', 'Spacious', 'Laptop-Friendly', 'Study-Friendly'],
    phone: '(510) 549-0590',
  },
  {
    name: 'Café M',
    address: '2500 Bancroft Way, Berkeley, CA 94704',
    city: 'Berkeley',
    neighborhood: 'UC Berkeley',
    coordinates: { lat: 37.8698, lng: -122.2588 },
    amenities: {
      wifi: { quality: 'good', score: 8.0 },
      outlets: { available: true, score: 7.5 },
      seating: { type: 'comfortable', score: 7.0 },
      noise: { level: 'moderate', score: 6.5 },
    },
    tags: ['Laptop-Friendly', 'Study-Friendly'],
  },
  {
    name: 'Au Coquelet',
    address: '2000 University Ave, Berkeley, CA 94704',
    city: 'Berkeley',
    neighborhood: 'Downtown',
    coordinates: { lat: 37.8710, lng: -122.2685 },
    amenities: {
      wifi: { quality: 'good', score: 7.5 },
      outlets: { available: true, score: 6.0 },
      seating: { type: 'adequate', score: 6.5 },
      noise: { level: 'moderate', score: 6.0 },
    },
    tags: ['Laptop-Friendly'],
  },
  {
    name: 'Café Leila',
    address: '1725 San Pablo Ave, Berkeley, CA 94702',
    city: 'Berkeley',
    neighborhood: 'West Berkeley',
    coordinates: { lat: 37.8665, lng: -122.2850 },
    amenities: {
      wifi: { quality: 'excellent', score: 9.0 },
      outlets: { available: true, score: 8.0 },
      seating: { type: 'comfortable', score: 8.5 },
      noise: { level: 'quiet', score: 8.0 },
    },
    tags: ['Quiet', 'Spacious', 'Fast Wi-Fi', 'Study-Friendly'],
  },
  {
    name: 'Café Durant',
    address: '2517 Durant Ave, Berkeley, CA 94704',
    city: 'Berkeley',
    neighborhood: 'UC Berkeley',
    coordinates: { lat: 37.8690, lng: -122.2580 },
    amenities: {
      wifi: { quality: 'spotty', score: 6.0 },
      outlets: { available: false, score: 4.5 },
      seating: { type: 'limited', score: 5.5 },
      noise: { level: 'loud', score: 5.0 },
    },
    tags: [],
  },
  {
    name: 'Café Think',
    address: '2020 Kittredge St, Berkeley, CA 94704',
    city: 'Berkeley',
    neighborhood: 'Downtown',
    coordinates: { lat: 37.8700, lng: -122.2680 },
    amenities: {
      wifi: { quality: 'excellent', score: 9.5 },
      outlets: { available: true, score: 9.0 },
      seating: { type: 'comfortable', score: 8.0 },
      noise: { level: 'quiet', score: 8.5 },
    },
    tags: ['Fast Wi-Fi', 'Many Outlets', 'Quiet', 'Study-Friendly'],
  },

  // SAN FRANCISCO
  {
    name: 'Blue Bottle Coffee',
    address: '315 Linden St, San Francisco, CA 94102',
    city: 'San Francisco',
    neighborhood: 'Hayes Valley',
    coordinates: { lat: 37.7766, lng: -122.4234 },
    amenities: {
      wifi: { quality: 'excellent', score: 9.5 },
      outlets: { available: true, score: 8.5 },
      seating: { type: 'comfortable', score: 8.0 },
      noise: { level: 'moderate', score: 7.0 },
    },
    tags: ['Fast Wi-Fi', 'Many Outlets', 'Laptop-Friendly', 'Study-Friendly'],
  },
  {
    name: 'Sightglass Coffee',
    address: '270 7th St, San Francisco, CA 94103',
    city: 'San Francisco',
    neighborhood: 'SOMA',
    coordinates: { lat: 37.7749, lng: -122.4014 },
    amenities: {
      wifi: { quality: 'excellent', score: 9.0 },
      outlets: { available: true, score: 8.0 },
      seating: { type: 'comfortable', score: 8.5 },
      noise: { level: 'moderate', score: 7.5 },
    },
    tags: ['Fast Wi-Fi', 'Spacious', 'Laptop-Friendly'],
  },
  {
    name: 'Ritual Coffee Roasters',
    address: '1026 Valencia St, San Francisco, CA 94110',
    city: 'San Francisco',
    neighborhood: 'Mission',
    coordinates: { lat: 37.7570, lng: -122.4210 },
    amenities: {
      wifi: { quality: 'good', score: 8.0 },
      outlets: { available: true, score: 7.5 },
      seating: { type: 'adequate', score: 7.0 },
      noise: { level: 'moderate', score: 6.5 },
    },
    tags: ['Laptop-Friendly'],
  },
  {
    name: 'Four Barrel Coffee',
    address: '375 Valencia St, San Francisco, CA 94103',
    city: 'San Francisco',
    neighborhood: 'Mission',
    coordinates: { lat: 37.7658, lng: -122.4219 },
    amenities: {
      wifi: { quality: 'good', score: 8.5 },
      outlets: { available: true, score: 7.0 },
      seating: { type: 'comfortable', score: 7.5 },
      noise: { level: 'moderate', score: 7.0 },
    },
    tags: ['Fast Wi-Fi', 'Laptop-Friendly'],
  },
  {
    name: 'Workshop Café',
    address: '180 Montgomery St, San Francisco, CA 94104',
    city: 'San Francisco',
    neighborhood: 'Financial District',
    coordinates: { lat: 37.7900, lng: -122.4010 },
    amenities: {
      wifi: { quality: 'excellent', score: 9.5 },
      outlets: { available: true, score: 9.5 },
      seating: { type: 'comfortable', score: 9.0 },
      noise: { level: 'quiet', score: 8.5 },
    },
    tags: ['Fast Wi-Fi', 'Many Outlets', 'Quiet', 'Spacious', 'Study-Friendly'],
  },
  {
    name: 'Café Réveille',
    address: '4076 18th St, San Francisco, CA 94114',
    city: 'San Francisco',
    neighborhood: 'Castro',
    coordinates: { lat: 37.7608, lng: -122.4340 },
    amenities: {
      wifi: { quality: 'excellent', score: 9.0 },
      outlets: { available: true, score: 8.0 },
      seating: { type: 'comfortable', score: 8.0 },
      noise: { level: 'moderate', score: 7.0 },
    },
    tags: ['Fast Wi-Fi', 'Laptop-Friendly'],
  },
  {
    name: 'Andytown Coffee Roasters',
    address: '3655 Lawton St, San Francisco, CA 94122',
    city: 'San Francisco',
    neighborhood: 'Outer Sunset',
    coordinates: { lat: 37.7590, lng: -122.4990 },
    amenities: {
      wifi: { quality: 'good', score: 8.0 },
      outlets: { available: true, score: 7.0 },
      seating: { type: 'adequate', score: 7.0 },
      noise: { level: 'moderate', score: 6.5 },
    },
    tags: ['Laptop-Friendly'],
  },
  {
    name: 'Café du Soleil',
    address: '200 Fillmore St, San Francisco, CA 94117',
    city: 'San Francisco',
    neighborhood: 'Lower Haight',
    coordinates: { lat: 37.7710, lng: -122.4320 },
    amenities: {
      wifi: { quality: 'good', score: 7.5 },
      outlets: { available: false, score: 5.0 },
      seating: { type: 'adequate', score: 6.5 },
      noise: { level: 'moderate', score: 6.0 },
    },
    tags: ['Laptop-Friendly'],
  },
  {
    name: 'Café Trieste',
    address: '601 Vallejo St, San Francisco, CA 94133',
    city: 'San Francisco',
    neighborhood: 'North Beach',
    coordinates: { lat: 37.7990, lng: -122.4080 },
    amenities: {
      wifi: { quality: 'spotty', score: 6.0 },
      outlets: { available: false, score: 4.0 },
      seating: { type: 'limited', score: 5.5 },
      noise: { level: 'loud', score: 5.0 },
    },
    tags: [],
  },
  {
    name: 'Starbucks Reserve',
    address: '1124 Market St, San Francisco, CA 94102',
    city: 'San Francisco',
    neighborhood: 'Civic Center',
    coordinates: { lat: 37.7810, lng: -122.4140 },
    amenities: {
      wifi: { quality: 'excellent', score: 9.5 },
      outlets: { available: true, score: 9.0 },
      seating: { type: 'comfortable', score: 8.5 },
      noise: { level: 'moderate', score: 7.5 },
    },
    tags: ['Fast Wi-Fi', 'Many Outlets', 'Spacious', 'Laptop-Friendly'],
  },
  {
    name: 'Café Claude',
    address: '7 Claude Ln, San Francisco, CA 94108',
    city: 'San Francisco',
    neighborhood: 'Financial District',
    coordinates: { lat: 37.7880, lng: -122.4040 },
    amenities: {
      wifi: { quality: 'good', score: 8.0 },
      outlets: { available: true, score: 7.5 },
      seating: { type: 'comfortable', score: 7.5 },
      noise: { level: 'quiet', score: 8.0 },
    },
    tags: ['Quiet', 'Laptop-Friendly'],
  },
  {
    name: 'Café Réveille',
    address: '2001 Fillmore St, San Francisco, CA 94115',
    city: 'San Francisco',
    neighborhood: 'Pacific Heights',
    coordinates: { lat: 37.7890, lng: -122.4340 },
    amenities: {
      wifi: { quality: 'excellent', score: 9.0 },
      outlets: { available: true, score: 8.5 },
      seating: { type: 'comfortable', score: 8.0 },
      noise: { level: 'moderate', score: 7.0 },
    },
    tags: ['Fast Wi-Fi', 'Many Outlets', 'Laptop-Friendly'],
  },

  // ALAMEDA
  {
    name: 'Café Jolie',
    address: '1417 Park St, Alameda, CA 94501',
    city: 'Alameda',
    neighborhood: 'Park Street',
    coordinates: { lat: 37.7670, lng: -122.2410 },
    amenities: {
      wifi: { quality: 'good', score: 8.0 },
      outlets: { available: true, score: 7.0 },
      seating: { type: 'comfortable', score: 7.5 },
      noise: { level: 'quiet', score: 8.0 },
    },
    tags: ['Quiet', 'Laptop-Friendly', 'Study-Friendly'],
  },
  {
    name: 'Blue Dot Café',
    address: '1915 Park St, Alameda, CA 94501',
    city: 'Alameda',
    neighborhood: 'Park Street',
    coordinates: { lat: 37.7680, lng: -122.2420 },
    amenities: {
      wifi: { quality: 'good', score: 7.5 },
      outlets: { available: true, score: 6.5 },
      seating: { type: 'adequate', score: 6.5 },
      noise: { level: 'moderate', score: 6.5 },
    },
    tags: ['Laptop-Friendly'],
  },
  {
    name: 'Julie\'s Coffee & Tea Garden',
    address: '1223 Park St, Alameda, CA 94501',
    city: 'Alameda',
    neighborhood: 'Park Street',
    coordinates: { lat: 37.7660, lng: -122.2400 },
    amenities: {
      wifi: { quality: 'excellent', score: 9.0 },
      outlets: { available: true, score: 8.0 },
      seating: { type: 'comfortable', score: 8.5 },
      noise: { level: 'quiet', score: 8.5 },
    },
    tags: ['Fast Wi-Fi', 'Quiet', 'Spacious', 'Study-Friendly'],
  },
  {
    name: 'Café Q',
    address: '2301 Central Ave, Alameda, CA 94501',
    city: 'Alameda',
    neighborhood: 'Central',
    coordinates: { lat: 37.7650, lng: -122.2500 },
    amenities: {
      wifi: { quality: 'good', score: 8.0 },
      outlets: { available: true, score: 7.5 },
      seating: { type: 'comfortable', score: 7.0 },
      noise: { level: 'moderate', score: 7.0 },
    },
    tags: ['Laptop-Friendly'],
  },

  // EMERYVILLE
  {
    name: 'Café Leila',
    address: '5800 Shellmound St, Emeryville, CA 94608',
    city: 'Emeryville',
    neighborhood: 'Bay Street',
    coordinates: { lat: 37.8380, lng: -122.2930 },
    amenities: {
      wifi: { quality: 'excellent', score: 9.0 },
      outlets: { available: true, score: 8.5 },
      seating: { type: 'comfortable', score: 8.0 },
      noise: { level: 'moderate', score: 7.5 },
    },
    tags: ['Fast Wi-Fi', 'Many Outlets', 'Laptop-Friendly'],
  },
  {
    name: 'Peet\'s Coffee',
    address: '5800 Shellmound Way, Emeryville, CA 94608',
    city: 'Emeryville',
    neighborhood: 'Bay Street',
    coordinates: { lat: 37.8390, lng: -122.2940 },
    amenities: {
      wifi: { quality: 'excellent', score: 9.5 },
      outlets: { available: true, score: 9.0 },
      seating: { type: 'comfortable', score: 8.5 },
      noise: { level: 'moderate', score: 7.5 },
    },
    tags: ['Fast Wi-Fi', 'Many Outlets', 'Spacious', 'Laptop-Friendly'],
  },
  {
    name: 'Starbucks',
    address: '5800 Shellmound St, Emeryville, CA 94608',
    city: 'Emeryville',
    neighborhood: 'Bay Street',
    coordinates: { lat: 37.8385, lng: -122.2935 },
    amenities: {
      wifi: { quality: 'excellent', score: 9.5 },
      outlets: { available: true, score: 9.0 },
      seating: { type: 'comfortable', score: 8.5 },
      noise: { level: 'moderate', score: 7.0 },
    },
    tags: ['Fast Wi-Fi', 'Many Outlets', 'Laptop-Friendly'],
  },

  // OAKLAND
  {
    name: 'Blue Bottle Coffee',
    address: '300 Webster St, Oakland, CA 94607',
    city: 'Oakland',
    neighborhood: 'Jack London Square',
    coordinates: { lat: 37.7970, lng: -122.2790 },
    amenities: {
      wifi: { quality: 'excellent', score: 9.0 },
      outlets: { available: true, score: 8.5 },
      seating: { type: 'comfortable', score: 8.0 },
      noise: { level: 'moderate', score: 7.0 },
    },
    tags: ['Fast Wi-Fi', 'Many Outlets', 'Laptop-Friendly'],
  },
  {
    name: 'Café 817',
    address: '817 Washington St, Oakland, CA 94607',
    city: 'Oakland',
    neighborhood: 'Old Oakland',
    coordinates: { lat: 37.8000, lng: -122.2750 },
    amenities: {
      wifi: { quality: 'good', score: 8.0 },
      outlets: { available: true, score: 7.5 },
      seating: { type: 'comfortable', score: 7.5 },
      noise: { level: 'quiet', score: 8.0 },
    },
    tags: ['Quiet', 'Laptop-Friendly', 'Study-Friendly'],
  },
  {
    name: 'Awaken Café',
    address: '1429 Broadway, Oakland, CA 94612',
    city: 'Oakland',
    neighborhood: 'Downtown',
    coordinates: { lat: 37.8050, lng: -122.2700 },
    amenities: {
      wifi: { quality: 'excellent', score: 9.5 },
      outlets: { available: true, score: 9.0 },
      seating: { type: 'comfortable', score: 8.5 },
      noise: { level: 'quiet', score: 8.5 },
    },
    tags: ['Fast Wi-Fi', 'Many Outlets', 'Quiet', 'Spacious', 'Study-Friendly'],
  },
  {
    name: 'Café Colucci',
    address: '6427 Telegraph Ave, Oakland, CA 94609',
    city: 'Oakland',
    neighborhood: 'Temescal',
    coordinates: { lat: 37.8450, lng: -122.2650 },
    amenities: {
      wifi: { quality: 'good', score: 7.5 },
      outlets: { available: true, score: 7.0 },
      seating: { type: 'adequate', score: 7.0 },
      noise: { level: 'moderate', score: 6.5 },
    },
    tags: ['Laptop-Friendly'],
  },
  {
    name: 'Modern Coffee',
    address: '411 13th St, Oakland, CA 94612',
    city: 'Oakland',
    neighborhood: 'Downtown',
    coordinates: { lat: 37.8040, lng: -122.2720 },
    amenities: {
      wifi: { quality: 'excellent', score: 9.0 },
      outlets: { available: true, score: 8.0 },
      seating: { type: 'comfortable', score: 8.0 },
      noise: { level: 'moderate', score: 7.0 },
    },
    tags: ['Fast Wi-Fi', 'Laptop-Friendly'],
  },
]

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lattelink'
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB')

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await Cafe.deleteMany({})
    // await Review.deleteMany({})
    // console.log('🗑️  Cleared existing data')

    // Insert sample cafes
    const insertedCafes = []
    for (const cafeData of sampleCafes) {
      // Convert lat/lng to GeoJSON format [lng, lat]
      const cafeWithGeoJSON = {
        ...cafeData,
        coordinates: {
          type: 'Point',
          coordinates: [cafeData.coordinates.lng, cafeData.coordinates.lat], // [longitude, latitude]
        },
      }
      
      // Check if café already exists
      const existing = await Cafe.findOne({
        name: cafeData.name,
        address: cafeData.address,
      })

      if (existing) {
        console.log(`⏭️  Skipping existing café: ${cafeData.name}`)
        insertedCafes.push(existing)
      } else {
        const cafe = new Cafe(cafeWithGeoJSON)
        await cafe.save()
        console.log(`✅ Added café: ${cafeData.name}`)
        insertedCafes.push(cafe)
      }
    }

    console.log(`\n✨ Seeded ${insertedCafes.length} cafés`)
    console.log('\n🎉 Database seeding complete!')
    console.log('\nCities included: Berkeley, San Francisco, Alameda, Emeryville, Oakland')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()
