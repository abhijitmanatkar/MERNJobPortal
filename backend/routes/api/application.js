const express = require("express");
const router = express.Router();

// Authorization middleware
const auth = require("../../middleware/auth");

// models
const Application = require("../../models/Application");
const Applicant = require("../../models/Applicant");
const Listing = require("../../models/Listing");

const statuses = ["Applied", "Shortlisted", "Rejected", "Accepted"];

// Create Application
router.post("/", auth("Applicant"), async function (req, res) {
  const { listingId, applicantId, sop } = req.body;
  if (!sop) return res.status(400).json({ msg: "Please enter SOP" });

  const applicant = await Applicant.findById(applicantId);
  const listing = await Listing.findById(listingId);
  if (!applicant || !listing) return res.sendStatus(400);

  const applicantApplications = await Application.find({ applicantId });
  let numActive = 0;
  for (let application of applicantApplications) {
    if (application.status === "Accepted")
      return res
        .status(400)
        .json({ msg: "Can't apply when already accepted into a job" });
    if (application.status !== "Deleted" || application.status !== "Rejected")
      numActive += 1;
  }
  if (numActive >= 10)
    return res.status(400).json({ msg: "Can't apply to more than 10 jobs" });

  if (listing.deadlineDate < Date.now())
    return res.status(400).json({ msg: "Deadline passed" });

  const application = await Application.findOne({ listingId, applicantId });
  if (application) return res.status(400).json({ msg: "Already applied" });

  if (listing.numApps >= listing.maxApps)
    return res.status(400).json({ msg: "Maximum applications reached" });

  const newApplication = new Application({ listingId, applicantId, sop });
  newApplication
    .save()
    .then((application) => {
      Listing.findByIdAndUpdate(listingId, { $inc: { numApps: 1 } })
        .then(() => res.json({ application }))
        .catch((err) => res.status(500).json({ msg: "Internal error" }));
    })
    .catch((err) => res.status(500).json({ msg: "Internal error" }));
});

// Get applications by applicant
router.get("/byapplicant/:applicantid", (req, res) => {
  const applicantId = req.params.applicantid;
  Application.find({ applicantId: applicantId })
    .lean()
    .then((applications) => res.json({ applications }))
    .catch((err) => {
      return res.sendStatus(400);
    });
});

// Get applications by listing
router.get("/bylisting/:listingid", (req, res) => {
  const listingId = req.params.listingid;
  Application.find({ listingId: listingId })
    .lean()
    .then((applications) => res.json({ applications }))
    .catch((err) => {
      return res.sendStatus(400);
    });
});

// Get applications by recruiter
router.get("/byrecruiter/:recruiterid", async function (req, res) {
  try {
    const recruiterId = req.params.recruiterid;
    let listings = await Listing.find({ "recruiter.id": recruiterId });
    listings = listings.map((listing) => listing.id);
    let applications = await Application.find({ listingId: { $in: listings } });
    return res.json({ applications });
  } catch {
    return res.status(500).json({ msg: "Internal error" });
  }
});

// Update application
router.put("/:id", auth("Recruiter"), async function (req, res) {
  const id = req.params.id;
  const { status } = req.body;

  if (!statuses.includes(status)) return res.sendStatus(400);

  const application = await Application.findById(id);
  if (!application) return res.sendStatus(400);
  if (application.closeDate < Date.now())
    return res.status(400).json({ msg: "Application already closed" });

  if (status === "Accepted") {
    const listing = await Listing.findById(application.listingId);
    if (listing.numAccepted >= listing.maxPos)
      return res.status(400).json({ msg: "Job full" });

    // listing.numAccepted = listing.numAccepted + 1;
    if (listing.numAccepted + 1 >= listing.maxPos) {
      await Application.updateMany(
        {
          listingId: application.listingId,
          status: { $ne: "Accepted" },
          _id: { $ne: id },
        },
        { status: "Rejected", closeDate: Date.now() }
      );
    }
    await Application.updateMany(
      { applicantId: application.applicantId, _id: { $ne: id } },
      { status: "Rejected", closeDate: Date.now() }
    );
    listing.numAccepted += 1;
    await listing.save();
  }
  application.status = status;
  if (status === "Accepted" || status === "Rejected")
    application.closeDate = Date.now();
  const updatedApplication = await application.save();
  res.json({ application: updatedApplication });
});

module.exports = router;
