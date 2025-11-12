const mongoose = require('mongoose');

const cafeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
    index: true,
  },
  neighborhood: {
    type: String,
    default: '',
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  amenities: {
    wifi: {
      quality: {
        type: String,
        enum: ['excellent', 'good', 'spotty', 'poor', 'unknown'],
        default: 'unknown',
      },
      score: {
        type: Number,
        min: 0,
        max: 10,
        default: 5,
      },
    },
    outlets: {
      available: {
        type: Boolean,
        default: false,
      },
      score: {
        type: Number,
        min: 0,
        max: 10,
        default: 5,
      },
      notes: String,
    },
    seating: {
      type: {
        type: String,
        enum: ['comfortable', 'adequate', 'limited', 'unknown'],
        default: 'unknown',
      },
      score: {
        type: Number,
        min: 0,
        max: 10,
        default: 5,
      },
    },
    noise: {
      level: {
        type: String,
        enum: ['quiet', 'moderate', 'loud', 'unknown'],
        default: 'unknown',
      },
      score: {
        type: Number,
        min: 0,
        max: 10,
        default: 5,
      },
    },
  },
  workabilityScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 5,
  },
  tags: [{
    type: String,
    enum: ['Cozy', 'Quiet', 'Laptop-Friendly', 'Outdoor Seating', 'Spacious', 'Fast Wi-Fi', 'Many Outlets', 'Study-Friendly'],
  }],
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
  }],
  googleMapsId: String,
  yelpId: String,
  phone: String,
  website: String,
  hours: {
    type: Map,
    of: String,
  },
  priceLevel: {
    type: Number,
    min: 0,
    max: 4,
  },
  sources: [{
    type: String,
    enum: ['google', 'yelp', 'user'],
  }],
  types: [{
    type: String,
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
  },
  ratingSources: {
    type: Map,
    of: Number,
  },
  reviewCounts: {
    type: Map,
    of: Number,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  collection: 'cafes',
});

// Index for geospatial queries
cafeSchema.index({ coordinates: '2dsphere' });

// Calculate workability score before saving
cafeSchema.pre('save', function(next) {
  const wifiScore = this?.amenities?.wifi?.score ?? 5;
  const outletAvailable = this?.amenities?.outlets?.available ?? false;
  const outletScoreRaw = this?.amenities?.outlets?.score ?? 5;
  const seatingScore = this?.amenities?.seating?.score ?? 5;
  const noiseScore = this?.amenities?.noise?.score ?? 5;

  const outletScore = outletAvailable ? outletScoreRaw : 0;

  let weighted =
    outletScore * 0.45 +
    seatingScore * 0.3 +
    wifiScore * 0.2 +
    noiseScore * 0.05;

  if (!outletAvailable) {
    weighted *= 0.6;
  }

  this.workabilityScore = Number(weighted.toFixed(2));
  next();
});

// Transform function to convert GeoJSON coordinates to lat/lng for frontend
const transformCoordinates = function(doc, ret) {
  // Convert GeoJSON coordinates [lng, lat] to { lat, lng } for frontend
  if (ret.coordinates && ret.coordinates.coordinates && Array.isArray(ret.coordinates.coordinates)) {
    ret.coordinates = {
      lat: ret.coordinates.coordinates[1],
      lng: ret.coordinates.coordinates[0],
    };
  }
  return ret;
};

// Apply transform to both toJSON and toObject
cafeSchema.set('toJSON', { transform: transformCoordinates });
cafeSchema.set('toObject', { transform: transformCoordinates });

module.exports = mongoose.model('Cafe', cafeSchema);

