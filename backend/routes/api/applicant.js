const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

jwtSecret = require("../../config/keys").jwtSecret;

// Authorization middleware
const auth = require("../../middleware/auth");

// Applicant model
const Applicant = require("../../models/Applicant");
const Application = require("../../models/Application");
const Listing = require("../../models/Listing");

// Register applicant
router.post("/", (req, res) => {
  let { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ msg: "Enter all credentials" });

  // Validations
  const emailRe = /\S+@\S+\.\S+/;
  email = email.trim();
  if (!emailRe.test(email)) {
    return res.status(400).json({ msg: "Invalid email" });
  }

  Applicant.findOne({ email })
    .then((user) => {
      if (user) return res.status(400).json({ msg: "User already exists" });
      const newUser = new Applicant({ name, email, password });
      newUser.skills = [];
      newUser.education = [];
      bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((user) => {
              const { password, ...userToSend } = user.toObject();
              jwt.sign(
                { id: newUser.id, type: "Applicant" },
                jwtSecret,
                { expiresIn: 3600 },
                (err, token) => {
                  if (err) throw err;
                  res.json({
                    token,
                    user: userToSend,
                    userType: "Applicant",
                  });
                }
              );
            })
            .catch((err) => {
              return res.status(500).json({ msg: "Internal error" });
            });
        });
      });
    })
    .catch((err) => {
      return res.status(500).json({ msg: "Internal error" });
    });
});

// Get all applicants
router.get("/", (req, res) => {
  Applicant.find({})
    .then((applicants) => res.send({ applicants }))
    .catch((err) => res.sendStatus(400));
});

// Get a applicant
router.get("/:id", (req, res) => {
  const id = req.params.id;
  Applicant.findById(id)
    .select("-password")
    .lean()
    .then((user) => res.json({ user }))
    .catch((err) => {
      return res.sendStatus(400);
    });
});

// Get applicants by listing
router.get("/bylisting/:listingid", async function (req, res) {
  const listingId = req.params.listingid;
  let applications = await Application.find({ listingId });
  applications = applications.map((application) => application.applicantId);
  Applicant.find({ _id: { $in: applications } })
    .select("-password")
    .lean()
    .then((users) => res.json({ users }))
    .catch((err) => {
      return res.sendStatus(400);
    });
});

// Get applicants accepted by recruiter
router.get("/byrecruiter/:recruiterid", async function (req, res) {
  try {
    const recruiterId = req.params.recruiterid;
    let listings = await Listing.find({ "recruiter.id": recruiterId });
    const listingIds = listings.map((listing) => listing.id);
    let applications = await Application.find({
      listingId: { $in: listingIds },
    });
    applications = applications.filter(
      (application) => application.status === "Accepted"
    );
    const acceptedIds = applications.map(
      (application) => application.applicantId
    );
    let applicants = await Applicant.find({ _id: { $in: acceptedIds } });
    applicants = applicants.map((applicant) => {
      let application = applications.find(
        (application) => application.applicantId == applicant.id
      );
      let listing = listings.find((l) => l.id == application.listingId);
      return {
        id: applicant.id,
        name: applicant.name,
        jobType: listing.jobType,
        title: listing.title,
        joiningDate: application.closeDate,
        rating:
          applicant.numRatings === 0
            ? 0
            : applicant.ratingSum / applicant.numRatings,
      };
    });
    return res.json({ applicants });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Internal error" });
  }
});

// Update applicant
router.put("/:id", auth("Applicant"), (req, res) => {
  const id = req.params.id;
  const { name, email, skills, education } = req.body;

  // TODO Validation

  Applicant.findById(id)
    .then((user) => {
      if (name) user.name = name;
      if (email) user.email = email;
      if (skills) user.skills = skills;
      if (education) user.education = education;
      user.save().then((updatedUser) => {
        const { password, ...userToSend } = updatedUser.toObject();
        res.json({ user: userToSend });
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(404).json({ msg: "Not found" });
    });
});

module.exports = router;
