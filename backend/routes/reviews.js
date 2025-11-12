const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Cafe = require('../models/Cafe');
const { body, validationResult } = require('express-validator');

// GET /api/reviews - Get reviews (with optional café filter)
router.get('/', async (req, res) => {
  try {
    const { cafeId, limit = 20 } = req.query;
    let query = {};

    if (cafeId) {
      query.cafe = cafeId;
    }

    const reviews = await Review.find(query)
      .populate('cafe', 'name address')
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/reviews - Create user review
router.post('/', [
  body('cafe').notEmpty().isMongoId(),
  body('text').trim().notEmpty().isLength({ min: 10 }),
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('author').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if café exists
    const cafe = await Cafe.findById(req.body.cafe);
    if (!cafe) {
      return res.status(404).json({ success: false, error: 'Café not found' });
    }

    const review = new Review({
      ...req.body,
      source: 'user',
      date: new Date(),
    });

    await review.save();

    // Add review to café
    cafe.reviews.push(review._id);
    await cafe.save();

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/reviews/:id/helpful - Mark review as helpful
router.post('/:id/helpful', async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    res.json({ success: true, data: review });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

