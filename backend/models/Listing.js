const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ListingSchema = new Schema({
  title: { type: String, required: true },
  jobType: { type: String, required: true },
  maxApps: { type: Number, required: true },
  numApps: { type: Number, required: true, default: 0 },
  maxPos: { type: Number, required: true },
  numAccepted: { type: Number, required: true, default: 0 },
  postingDate: { type: Date, required: true, default: Date.now },
  deadlineDate: { type: Date, required: true },
  requiredSkills: [String],
  duration: { type: Number, required: true, default: 0, min: 0, max: 6 },
  salary: { type: Number, required: true },
  numRatings: { type: Number, required: true, default: 0 },
  ratingSum: { type: Number, required: true, default: 0 },
  recruiter: {
    id: { type: Schema.Types.ObjectId, ref: "Recruiter", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  deleted: { type: Boolean, default: false },
});

module.exports = Listing = mongoose.model("Listing", ListingSchema);
