const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  cafe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cafe',
    required: true,
    index: true,
  },
  source: {
    type: String,
    enum: ['google', 'yelp', 'user'],
    required: true,
  },
  sourceId: String, // Original review ID from Google/Yelp
  author: {
    type: String,
    default: 'Anonymous',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  text: {
    type: String,
    required: true,
  },
  sentiment: {
    overall: {
      type: Number,
      min: -1,
      max: 1,
      default: 0,
    },
    wifi: {
      type: Number,
      min: -1,
      max: 1,
      default: 0,
    },
    outlets: {
      type: Number,
      min: -1,
      max: 1,
      default: 0,
    },
    seating: {
      type: Number,
      min: -1,
      max: 1,
      default: 0,
    },
    noise: {
      type: Number,
      min: -1,
      max: 1,
      default: 0,
    },
  },
  keywords: [{
    type: String,
  }],
  url: String,
  date: {
    type: Date,
    default: Date.now,
  },
  helpful: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Review', reviewSchema);

