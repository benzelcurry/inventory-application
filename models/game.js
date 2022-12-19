const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

// Will probably come back and add option to upload image for cover
const GameSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  studio: { type: Schema.Types.ObjectId, ref: 'Studio', required: true },
  about: { type: String, required: false, maxLength: 1000 },
  release: { type: Date },
});

GameSchema.virtual('url').get(function() {
  return `/catalog/book/${this._id}`;
});

module.exports = mongoose.model('Game', GameSchema);