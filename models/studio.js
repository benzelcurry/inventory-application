const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const StudioSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  location: { type: String, required: true, maxLength: 100 },
  about: { type: String, required: false, maxLength: 1000 },
  founded: { type: Date },
});

// Virtual for studio's URL
StudioSchema.virtual('url').get(function() {
  return `/catalog/studios/${this._id}`;
});

// Virtual for formatted founded date of studio
StudioSchema.virtual('founded_formatted').get(function() {
  return DateTime.fromJSDate(this.founded).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model('Studio', StudioSchema);