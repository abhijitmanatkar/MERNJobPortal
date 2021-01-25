const express = require("express");
const router = express.Router();

// Authorization middleware
const auth = require("../../middleware/auth");

// models
const JobRating = require("../../models/JobRating");
const ApplicantRating = require("../../models/ApplicantRating");
const Applicant = require("../../models/Applicant");
const Listing = require("../../models/Listing");

// Rate applicant
router.post("/applicant", auth("Recruiter"), async function (req, res) {
  const { value, recruiterId, applicantId } = req.body;
  if (!value || !recruiterId || !applicantId) return res.sendStatus(400);
  if (value < 0 || value > 5)
    return res.status(400).json({ msg: "Rating must be between 0 and 5" });

  let rating = await ApplicantRating.findOne({ applicantId, recruiterId });
  if (!rating) {
    rating = new ApplicantRating({ recruiterId, applicantId, value });
    await Applicant.findByIdAndUpdate(applicantId, {
      $inc: { numRatings: 1, ratingSum: value },
    });
  }
  rating.value = value;
  rating = await rating.save();
  res.json({ rating });
});

// Rate job
router.post("/listing", auth("Applicant"), async function (req, res) {
  const { value, listingId, applicantId } = req.body;
  if (!value || !listingId || !applicantId) return res.sendStatus(400);
  if (value < 0 || value > 5)
    return res.status(400).json({ msg: "Rating must be between 0 and 5" });

  let rating = await JobRating.findOne({ applicantId, listingId });
  if (!rating) {
    rating = new JobRating({ listingId, applicantId, value });
    await Listing.findByIdAndUpdate(listingId, {
      $inc: { numRatings: 1, ratingSum: value },
    });
  }
  rating.value = value;
  rating = await rating.save();
  res.json({ rating });
});

module.exports = router;
