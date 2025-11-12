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
});

// Index for geospatial queries
cafeSchema.index({ coordinates: '2dsphere' });

// Calculate workability score before saving
cafeSchema.pre('save', function(next) {
  const scores = [
    this.amenities.wifi.score,
    this.amenities.outlets.score,
    this.amenities.seating.score,
    this.amenities.noise.score,
  ];
  this.workabilityScore = scores.reduce((a, b) => a + b, 0) / scores.length;
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

