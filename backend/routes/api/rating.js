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
    rating = await rating.save();
    return res.json({ rating });
  }
  await Applicant.findByIdAndUpdate(applicantId, {
    $inc: { ratingSum: value - rating.value },
  });
  rating.value = value;
  rating = await rating.save();
  return res.json({ rating });
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

// Find job ratings by applicant
router.get("/listing/byapplicant/:applicantid", async function (req, res) {
  const applicantId = req.params.applicantid;
  const ratings = await JobRating.find({ applicantId });
  res.json({ ratings });
});

// Find applicant ratings by recruiter
router.get("/applicant/byrecruiter/:recruiterid", async function (req, res) {
  const recruiterId = req.params.recruiterid;
  const ratings = await ApplicantRating.find({ recruiterId });
  res.json({ ratings });
});

// Find job rating
router.get("/listing/:listingid/:applicantid", async function (req, res) {
  const applicantId = req.params.applicantid;
  const listingId = req.params.applicantid;
  let rating = await JobRating.findOne({ applicantId, listingId });
  res.json({ rating });
});

// Find applicant rating
router.get("/applicant/:applicantid/:recruiterid", async function (req, res) {
  const applicantId = req.params.applicantid;
  const recruiterId = req.params.recruiterid;
  let rating = await ApplicantRating.findOne({ applicantId, recruiterId });
  res.json({ rating });
});

module.exports = router;
