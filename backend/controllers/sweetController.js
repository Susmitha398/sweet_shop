const Sweet = require('../models/Sweet');
const Category = require('../models/Category');
const { getDbStatus } = require('../config/db');
const { categories: seedCategories, sweets: seedSweets } = require('../data/seedData');

// Haversine formula for distance calculation in KM
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // Round to 1 decimal
}

// In-memory active stores for fallback
let memorySweets = [...seedSweets];
let memoryCategories = [...seedCategories];

// Auto-seed if Mongo is connected
async function ensureMongoSeeded() {
  if (!getDbStatus()) return;
  try {
    const sweetCount = await Sweet.countDocuments();
    if (sweetCount === 0) {
      await Sweet.insertMany(seedSweets);
      console.log('[Seed] Seeded sweets into MongoDB');
    }
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      await Category.insertMany(seedCategories);
      console.log('[Seed] Seeded categories into MongoDB');
    }
    // Refresh this product image even when the rest of the catalog already
    // exists, so older MongoDB records do not keep serving a stale image URL.
    const asokaHalwa = seedSweets.find(sweet => sweet.slug === 'thiruvaiyaru-asoka-halwa');
    if (asokaHalwa) {
      await Sweet.updateOne(
        { slug: asokaHalwa.slug },
        { $set: { image: asokaHalwa.image } }
      );
    }
  } catch (err) {
    console.warn('[Seed Warning]', err.message);
  }
}

// GET all sweets with category, search, sorting and distance calculation
const getAllSweets = async (req, res) => {
  try {
    const { category, search, featured, bestseller, sort, userLat, userLng } = req.query;

    let sweetsList = [];
    if (getDbStatus()) {
      let filter = {};
      if (category && category !== 'all') {
        filter.categorySlug = category.toLowerCase();
      }
      if (featured === 'true') filter.isFeatured = true;
      if (bestseller === 'true') filter.isBestseller = true;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ];
      }
      sweetsList = await Sweet.find(filter).lean();
    } else {
      sweetsList = [...memorySweets];
      if (category && category !== 'all') {
        sweetsList = sweetsList.filter(s => s.categorySlug.toLowerCase() === category.toLowerCase());
      }
      if (featured === 'true') {
        sweetsList = sweetsList.filter(s => s.isFeatured);
      }
      if (bestseller === 'true') {
        sweetsList = sweetsList.filter(s => s.isBestseller);
      }
      if (search) {
        const query = search.toLowerCase();
        sweetsList = sweetsList.filter(s =>
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query)
        );
      }
    }

    // Attach dynamic live distance if user coordinates provided
    const uLat = parseFloat(userLat);
    const uLng = parseFloat(userLng);

    sweetsList = sweetsList.map(sweet => {
      let liveDistance = sweet.distanceBaseKm || 2.5;
      if (!isNaN(uLat) && !isNaN(uLng) && sweet.shopCoordinates?.lat && sweet.shopCoordinates?.lng) {
        const calcDist = calculateDistanceKm(uLat, uLng, sweet.shopCoordinates.lat, sweet.shopCoordinates.lng);
        if (calcDist !== null) {
          liveDistance = calcDist;
        }
      }
      // Estimate delivery time roughly 15 mins base + 4 mins per km
      const estimatedMins = Math.max(15, Math.round(15 + liveDistance * 4));
      return {
        ...sweet,
        distanceKm: liveDistance,
        deliveryTimeMins: estimatedMins
      };
    });

    // Sorting
    if (sort === 'price-asc') {
      sweetsList.sort((a, b) => a.pricePerKg - b.pricePerKg);
    } else if (sort === 'price-desc') {
      sweetsList.sort((a, b) => b.pricePerKg - a.pricePerKg);
    } else if (sort === 'rating') {
      sweetsList.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'distance') {
      sweetsList.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    res.json({
      success: true,
      count: sweetsList.length,
      data: sweetsList
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET single sweet by id or slug
const getSweetByIdOrSlug = async (req, res) => {
  try {
    const { identifier } = req.params;
    const { userLat, userLng } = req.query;

    let sweet = null;
    if (getDbStatus()) {
      sweet = await Sweet.findOne({
        $or: [{ _id: identifier.match(/^[0-9a-fA-F]{24}$/) ? identifier : null }, { slug: identifier }, { id: identifier }]
      }).lean();
    }
    if (!sweet) {
      sweet = memorySweets.find(s => s.id === identifier || s.slug === identifier || (s._id && s._id.toString() === identifier));
    }

    if (!sweet) {
      return res.status(404).json({ success: false, message: 'Sweet not found' });
    }

    const uLat = parseFloat(userLat);
    const uLng = parseFloat(userLng);
    let liveDistance = sweet.distanceBaseKm || 2.5;
    if (!isNaN(uLat) && !isNaN(uLng) && sweet.shopCoordinates?.lat && sweet.shopCoordinates?.lng) {
      const calcDist = calculateDistanceKm(uLat, uLng, sweet.shopCoordinates.lat, sweet.shopCoordinates.lng);
      if (calcDist !== null) liveDistance = calcDist;
    }
    const estimatedMins = Math.max(15, Math.round(15 + liveDistance * 4));

    res.json({
      success: true,
      data: {
        ...sweet,
        distanceKm: liveDistance,
        deliveryTimeMins: estimatedMins
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET all categories
const getAllCategories = async (req, res) => {
  try {
    let cats = [];
    if (getDbStatus()) {
      cats = await Category.find().sort({ displayOrder: 1 }).lean();
    }
    if (!cats || cats.length === 0) {
      cats = [...memoryCategories];
    }

    // Attach item count per category
    const catsWithCount = cats.map(cat => {
      const count = memorySweets.filter(s => s.categorySlug === cat.slug).length;
      return {
        ...cat,
        itemCount: count
      };
    });

    res.json({
      success: true,
      data: catsWithCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET single category by slug
const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    let cat = null;
    if (getDbStatus()) {
      cat = await Category.findOne({ slug: slug.toLowerCase() }).lean();
    }
    if (!cat) {
      cat = memoryCategories.find(c => c.slug.toLowerCase() === slug.toLowerCase());
    }

    if (!cat) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const count = memorySweets.filter(s => s.categorySlug === cat.slug).length;
    res.json({
      success: true,
      data: { ...cat, itemCount: count }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllSweets,
  getSweetByIdOrSlug,
  getAllCategories,
  getCategoryBySlug,
  ensureMongoSeeded
};
