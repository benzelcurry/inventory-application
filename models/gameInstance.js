const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GameInstanceSchema = new Schema({
  game: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
  condition: { 
    type: String,
    required: true,
    enum: ['Mint', 'NM (Near Mint)', 'EX (Excellent', 'GD (Good)', 'PR (Poor)'],
    default: 'GD (Good)',
  },
  // Will need to round to two decimals and display as USD
  price: { type: Number, required: true, min: 0.01, max: 10000}
});

// Virtual for game instance URL
GameInstanceSchema.virtual('url').get(function() {
  return `/catalog/listings/${this._id}`;
});

// Virtual for formatted price
GameInstanceSchema.virtual('formatted_price').get(function() {
  const newPrice = this.price.toFixed(2);

  return `$${newPrice}`;
});

module.exports = mongoose.model('GameInstance', GameInstanceSchema);