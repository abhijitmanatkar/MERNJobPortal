const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ApplicantRatingSchema = new Schema({
  applicantId: {
    type: Schema.Types.ObjectId,
    ref: "Applicant",
    required: true,
  },
  recruiterId: {
    type: Schema.Types.ObjectId,
    ref: "Recruiter",
    required: true,
  },
  value: { type: Number, required: true, default: 0 },
});

module.exports = ApplicantRating = mongoose.model(
  "ApplicantRating",
  ApplicantRatingSchema
);
