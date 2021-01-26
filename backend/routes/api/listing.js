const express = require("express");
const router = express.Router();

// Authorization middleware
const auth = require("../../middleware/auth");

// Listing model
const Listing = require("../../models/Listing");

// Create listing
router.post("/", auth("Recruiter"), (req, res) => {
  const {
    title,
    jobType,
    maxApps,
    maxPos,
    deadlineDate,
    requiredSkills,
    duration,
    salary,
    recruiter,
  } = req.body;

  if (
    !title ||
    !jobType ||
    !maxApps ||
    !maxPos ||
    deadlineDate === null ||
    !salary ||
    !recruiter
  ) {
    return res.status(400).json({ msg: "Enter all fields" });
  }

  // TODO validations

  const newListing = new Listing({
    title,
    jobType,
    maxApps,
    maxPos,
    deadlineDate,
    requiredSkills: requiredSkills || [],
    duration,
    salary,
    recruiter: {
      id: recruiter._id,
      name: recruiter.name,
      email: recruiter.email,
    },
  });
  newListing
    .save()
    .then((listing) => res.json(listing))
    .catch((err) => res.status(500).json({ msg: err }));
});

// Get all listings
router.get("/", (req, res) => {
  Listing.find({})
    .then((listings) => res.json({ listings }))
    .catch((err) => res.sendStatus(400));
});

// Get listing by Id
router.get("/:id", (req, res) => {
  const id = req.params.id;
  Listing.findById(id)
    .lean()
    .then((listing) => res.json({ listing }))
    .catch((err) => {
      return res.sendStatus(400);
    });
});

// Get Listing by recruiter
router.get("/byrecruiter/:recruiterid", (req, res) => {
  const recruiterId = req.params.recruiterid;
  Listing.find({ "recruiter.id": recruiterId })
    .lean()
    .then((listings) => res.json({ listings }))
    .catch((err) => {
      return res.sendStatus(400);
    });
});

// Update listing
router.put("/:id", auth("Recruiter"), (req, res) => {
  const id = req.params.id;
  const { maxApps, maxPos, deadlineDate } = req.body;
  const errors = [];
  Listing.findById(id)
    .then((listing) => {
      if (maxApps) {
        if (maxApps < listing.numApps)
          errors.push(`Already more applications than ${maxApps}`);
        else listing.maxApps = maxApps;
      }
      if (maxPos) {
        if (maxPos < listing.numAccepted)
          errors.push(`Already more acceptances than ${maxPos}`);
        else listing.maxPos = maxPos;
      }
      if (deadlineDate) {
        if (deadlineDate < Date.now())
          errors.push("Deadline date cannot be in the past");
        else listing.deadlineDate = deadlineDate;
      }
      if (errors.length != 0) return res.status(400).json({ errors });
      else {
        listing
          .save()
          .then((newListing) => res.json({ newListing }))
          .catch((err) => res.status(500).json({ msg: "Internal error" }));
      }
    })
    .catch((err) => {
      return res.status(404).json({ msg: "Not found" });
    });
});

// Delete listing
router.delete("/:id", auth("Recruiter"), async function (req, res) {
  try {
    const id = req.params.id;
    let listing = await Listing.findByIdAndUpdate(id, { deleted: true });
    await Application.updateMany(
      { listingId: listing.id },
      { status: "Deleted", closeDate: Date.now() }
    );
    res.json({ listing });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Internal error" });
  }
});

module.exports = router;
