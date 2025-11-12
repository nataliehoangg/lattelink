const express = require('express');
const router = express.Router();
const Cafe = require('../models/Cafe');
const { body, validationResult, query } = require('express-validator');

// GET /api/cafes - Get cafés with filters
router.get('/', [
  query('city').optional().trim(),
  query('neighborhood').optional().trim(),
  query('q').optional().trim(),
  query('wifi').optional().isIn(['excellent', 'good', 'spotty', 'poor']),
  query('outlets').optional().isBoolean(),
  query('noise').optional().isIn(['quiet', 'moderate', 'loud']),
  query('lat').optional().isFloat(),
  query('lng').optional().isFloat(),
  query('radius').optional().isFloat(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      city,
      neighborhood,
      q,
      wifi,
      outlets,
      noise,
      lat,
      lng,
      radius = 5000, // meters
      limit = 50,
      sort = 'workabilityScore',
    } = req.query;

    let query = {};

    // Text search
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { address: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ];
    }

    // Location filters
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    if (neighborhood) {
      query.neighborhood = { $regex: neighborhood, $options: 'i' };
    }

    // Geospatial query
    if (lat && lng) {
      query.coordinates = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseFloat(radius),
        },
      };
    }

    // Amenity filters
    if (wifi) {
      query['amenities.wifi.quality'] = wifi;
    }
    if (outlets === 'true') {
      query['amenities.outlets.available'] = true;
    }
    if (noise) {
      query['amenities.noise.level'] = noise;
    }

    // Sort options - default to workabilityScore (highest first)
    let sortOption = { workabilityScore: -1 }; // Default: sort by workability (descending)
    if (sort === 'name') {
      sortOption = { name: 1 };
    } else if (sort === 'workabilityScore') {
      sortOption = { workabilityScore: -1 };
    }

    const cafes = await Cafe.find(query)
      .populate('reviews', 'text rating sentiment date')
      .sort(sortOption)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: cafes.length,
      data: cafes,
    });
  } catch (error) {
    console.error('Error fetching cafes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/cafes/:id - Get single café
router.get('/:id', async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id)
      .populate({
        path: 'reviews',
        options: { sort: { date: -1 }, limit: 20 },
      });

    if (!cafe) {
      return res.status(404).json({ success: false, error: 'Café not found' });
    }

    res.json({ success: true, data: cafe });
  } catch (error) {
    console.error('Error fetching café:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/cafes - Create new café (admin/scraper)
router.post('/', [
  body('name').trim().notEmpty(),
  body('address').trim().notEmpty(),
  body('city').trim().notEmpty(),
  body('coordinates.lat').isFloat(),
  body('coordinates.lng').isFloat(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const cafe = new Cafe(req.body);
    await cafe.save();

    res.status(201).json({ success: true, data: cafe });
  } catch (error) {
    console.error('Error creating café:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/cafes/:id - Update café
router.put('/:id', async (req, res) => {
  try {
    const cafe = await Cafe.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );

    if (!cafe) {
      return res.status(404).json({ success: false, error: 'Café not found' });
    }

    res.json({ success: true, data: cafe });
  } catch (error) {
    console.error('Error updating café:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

