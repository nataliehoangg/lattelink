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
    capacity: {
      level: {
        type: String,
        enum: ['ample', 'roomy', 'cozy', 'tight', 'unknown'],
        default: 'unknown',
      },
      score: {
        type: Number,
        min: 0,
        max: 10,
        default: 5,
      },
    },
    drinks: {
      quality: {
        type: String,
        enum: ['excellent', 'good', 'average', 'poor', 'unknown'],
        default: 'unknown',
      },
      score: {
        type: Number,
        min: 0,
        max: 10,
        default: 5,
      },
    },
    lighting: {
      quality: {
        type: String,
        enum: ['bright', 'balanced', 'dim', 'unknown'],
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
    enum: ['Cozy', 'Quiet', 'Laptop-Friendly', 'Outdoor Seating', 'Spacious', 'Fast Wi-Fi', 'Many Outlets', 'Study-Friendly', 'Great Coffee', 'Well-Lit', 'Balanced Noise'],
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
  metrics: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({}),
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

// Calculate Holistic Workability Index (HWI) before saving
cafeSchema.pre('save', function(next) {
  const clamp = (value, defaultValue = 5, min = 0, max = 10) => {
    const numeric = typeof value === 'number' && Number.isFinite(value) ? value : defaultValue;
    return Math.min(max, Math.max(min, numeric));
  };

  const sigmoidWifi = (score) => {
    const clamped = clamp(score);
    const exponent = -0.5 * (clamped - 5);
    return 10 / (1 + Math.exp(exponent));
  };

  const gaussianNoise = (score) => {
    const clamped = clamp(score);
    return 10 * Math.exp(-((clamped - 5) ** 2) / 10);
  };

  const wifiRaw = clamp(this?.amenities?.wifi?.score);
  const seatingScore = clamp(this?.amenities?.seating?.score);
  const outletScore = clamp(this?.amenities?.outlets?.score);
  const capacityScore = clamp(this?.amenities?.capacity?.score);
  const drinksScore = clamp(this?.amenities?.drinks?.score);
  const lightingScore = clamp(this?.amenities?.lighting?.score);
  const noiseRaw = clamp(this?.amenities?.noise?.score);

  const wifiComponent = sigmoidWifi(wifiRaw);
  const noiseComponent = gaussianNoise(noiseRaw);

  const functionalScore =
    wifiComponent * 0.35 +
    seatingScore * 0.25 +
    outletScore * 0.20 +
    capacityScore * 0.10 +
    drinksScore * 0.10;

  let reputationScore = this?.metrics?.atmospheric?.components?.reputation;
  if (typeof reputationScore !== 'number' || !Number.isFinite(reputationScore)) {
    if (typeof this.rating === 'number' && Number.isFinite(this.rating)) {
      reputationScore = clamp(this.rating * 2, 6.8);
    } else {
      reputationScore = 6.8;
    }
  } else {
    reputationScore = clamp(reputationScore, 6.8);
  }

  const atmosphericScore =
    reputationScore * 0.5 +
    noiseComponent * 0.25 +
    lightingScore * 0.25;

  const rawScore = functionalScore * 0.7 + atmosphericScore * 0.3;

  const metrics = this.metrics || {};
  const confidence = metrics.confidence || {};
  const factorMentions =
    confidence && typeof confidence.factorMentions === 'object'
      ? confidence.factorMentions
      : undefined;

  const reviewsAnalyzed = (() => {
    if (typeof confidence.reviewsAnalyzed === 'number' && Number.isFinite(confidence.reviewsAnalyzed)) {
      return Math.max(0, confidence.reviewsAnalyzed);
    }
    if (Array.isArray(this.reviews)) {
      return this.reviews.length;
    }
    let count = 0;
    if (this.reviewCounts instanceof Map) {
      this.reviewCounts.forEach((value) => {
        if (typeof value === 'number' && Number.isFinite(value)) {
          count += value;
        }
      });
    } else if (this.reviewCounts && typeof this.reviewCounts === 'object') {
      Object.values(this.reviewCounts).forEach((value) => {
        if (typeof value === 'number' && Number.isFinite(value)) {
          count += value;
        }
      });
    }
    return count;
  })();

  const smoothingConstant =
    typeof confidence.smoothingConstant === 'number' && confidence.smoothingConstant > 0
      ? confidence.smoothingConstant
      : 8;

  const globalMean =
    typeof confidence.globalMean === 'number' && Number.isFinite(confidence.globalMean)
      ? confidence.globalMean
      : 6.8;

  const denominator = reviewsAnalyzed + smoothingConstant;
  const adjustedScore =
    denominator > 0
      ? (reviewsAnalyzed / denominator) * rawScore + (smoothingConstant / denominator) * globalMean
      : rawScore;

  metrics.functional = {
    score: Number(functionalScore.toFixed(2)),
    components: {
      wifi: Number(wifiComponent.toFixed(2)),
      seating: Number(seatingScore.toFixed(2)),
      outlets: Number(outletScore.toFixed(2)),
      capacity: Number(capacityScore.toFixed(2)),
      drinks: Number(drinksScore.toFixed(2)),
    },
  };

  metrics.atmospheric = {
    score: Number(atmosphericScore.toFixed(2)),
    components: {
      reputation: Number(clamp(reputationScore).toFixed(2)),
      noise: Number(noiseComponent.toFixed(2)),
      lighting: Number(lightingScore.toFixed(2)),
    },
  };

  metrics.confidence = {
    reviewsAnalyzed,
    smoothingConstant,
    globalMean,
    rawScore: Number(rawScore.toFixed(2)),
    ...(factorMentions ? { factorMentions } : {}),
  };

  this.metrics = metrics;
  this.workabilityScore = Number(Math.min(10, Math.max(0, adjustedScore)).toFixed(2));
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

