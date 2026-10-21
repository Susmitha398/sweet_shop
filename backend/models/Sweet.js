const mongoose = require('mongoose');

const weightOptionSchema = new mongoose.Schema({
  weight: { type: String, required: true }, // '250g', '500g', '1kg'
  multiplier: { type: Number, required: true },
  label: { type: String }
});

const sweetSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  categorySlug: { type: String, required: true },
  description: { type: String, required: true },
  detailedDescription: { type: String },
  shopLocation: { type: String, required: true }, // e.g. "T. Nagar Flagship Store, Chennai"
  shopCoordinates: {
    lat: { type: Number, default: 13.0418 },
    lng: { type: Number, default: 80.2341 }
  },
  distanceBaseKm: { type: Number, default: 2.5 }, // Base distance from downtown
  deliveryTimeMins: { type: Number, default: 25 },
  pricePerKg: { type: Number, required: true },
  originalPricePerKg: { type: Number },
  offer: { type: String, default: '10% OFF' }, // e.g. "15% OFF • Festive Special"
  rating: { type: Number, default: 4.8 },
  reviewsCount: { type: Number, default: 350 },
  weightOptions: [weightOptionSchema],
  image: { type: String, required: true },
  ingredients: [{ type: String }],
  shelfLife: { type: String, default: '15 Days at room temperature' },
  dietary: { type: String, default: 'Pure Desi Ghee' },
  isFeatured: { type: Boolean, default: false },
  isBestseller: { type: Boolean, default: false },
  inStock: { type: Boolean, default: true },
  tags: [{ type: String }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Sweet', sweetSchema);
