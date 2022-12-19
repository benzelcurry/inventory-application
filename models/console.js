const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const ConsoleSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  about: { type: String, required: false, maxLength: 1000 },
  release: { type: Date },
});

// Virtual for console's URL
ConsoleSchema.virtual('url').get(function() {
  return `/catalog/consoles/${this._id}`;
});

// Virtual for formatted release date of console
ConsoleSchema.virtual('release-formatted').get(function() {
  return DateTime.fromJSDate(this.release).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model('Console', ConsoleSchema);