const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

jwtSecret = require("../../config/keys").jwtSecret;

// Models
const Applicant = require("../../models/Applicant");
const Recruiter = require("../../models/Recruiter");

const auth = require("../../middleware/auth");

// Applicant login
router.post("/applicant", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ msg: "Enter all credentials" });

  // TODO: Add validations

  Applicant.findOne({ email })
    .then((user) => {
      if (!user) return res.status(400).json({ msg: "User doesn't exists" });

      bcrypt.compare(password, user.password).then((match) => {
        if (!match) return res.status(400).json({ msg: "Wrong password" });
        const { password, ...userToSend } = user.toObject();
        jwt.sign(
          { id: user.id, type: "Applicant" },
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
      });
    })
    .catch((err) => {
      return res.status(500).json({ msg: "Internal error" });
    });
});

// Recruiter login
router.post("/recruiter", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ msg: "Enter all credentials" });

  // TODO: Add validations

  Recruiter.findOne({ email })
    .then((user) => {
      if (!user) return res.status(400).json({ msg: "User doesn't exists" });

      bcrypt.compare(password, user.password).then((match) => {
        if (!match) return res.status(400).json({ msg: "Wrong password" });
        const { password, ...userToSend } = user.toObject();
        jwt.sign(
          { id: user.id, type: "Recruiter" },
          jwtSecret,
          { expiresIn: 3600 },
          (err, token) => {
            if (err) throw err;
            res.json({
              token,
              user: userToSend,
              userType: "Recruiter",
            });
          }
        );
      });
    })
    .catch((err) => {
      return res.status(500).json({ msg: "Internal error" });
    });
});

// Validate tokens and auth
router.get("/recruiter/:id", auth("Recruiter"), (req, res) => {
  const id = req.params.id;
  if (id == req.user.id) {
    return res.json({ loggedIn: true });
  }
  res.sendStatus(401);
});

router.get("/applicant/:id", auth("Applicant"), (req, res) => {
  const id = req.params.id;
  if (id == req.user.id) {
    return res.json({ loggedIn: true });
  }
  res.sendStatus(401);
});

module.exports = router;
