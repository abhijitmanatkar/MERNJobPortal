const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ApplicationSchema = new Schema({
  listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
  applicantId: {
    type: Schema.Types.ObjectId,
    ref: "Applicant",
    required: true,
  },
  status: { type: String, required: true, default: "Applied" },
  appDate: { type: Date, required: true, default: Date.now },
  closeDate: {
    type: Date,
    default: () => Date.now() + 2 * 365 * 24 * 3600 * 1000,
  },
  sop: { type: String, default: "" },
});

module.exports = Application = mongoose.model("Application", ApplicationSchema);
