const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

jwtSecret = require("../../config/keys").jwtSecret;

// Authorization middleware
const auth = require("../../middleware/auth");

// Recruiter model
const Recruiter = require("../../models/Recruiter");

// Listing model
const Listing = require("../../models/Listing");

// Register Recruiter
router.post("/", (req, res) => {
  let { name, email, password, contactNo } = req.body;

  if (!name || !email || !password || !contactNo)
    return res.status(400).json({ msg: "Enter all credentials" });

  // Validations
  const emailRe = /\S+@\S+\.\S+/;
  email = email.trim();
  if (!emailRe.test(email)) {
    return res.status(400).json({ msg: "Invalid email" });
  }

  contactNo = contactNo.trim();
  const phoneRe = /^[0-9]{4}$/;
  if (!phoneRe.test(contactNo)) {
    return res.status(400).json({ msg: "Invalid phone number" });
  }

  Recruiter.findOne({ email })
    .then((user) => {
      if (user) return res.status(400).json({ msg: "User already exists" });
      const newUser = new Recruiter({ name, email, password, contactNo });
      newUser.bio = "";
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
                { id: newUser.id, type: "Recruiter" },
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

// Get a recruiter
router.get("/:id", (req, res) => {
  const id = req.params.id;
  Recruiter.findById(id)
    .select("-password")
    .lean()
    .then((user) => res.json({ user }))
    .catch((err) => {
      return res.sendStatus(400);
    });
});

// Update recruiter
router.put("/:id", auth("Recruiter"), (req, res) => {
  const id = req.params.id;
  const { name, email, contactNo, bio } = req.body;
  Recruiter.findById(id)
    .then((user) => {
      const updateListings = user.name !== name || user.email !== email;
      if (name) user.name = name;
      if (email) user.email = email;
      if (contactNo) user.contactNo = contactNo;
      if (bio || bio === "") user.bio = bio;
      user.save().then((updatedUser) => {
        //const {password, ...userToSend} = updatedUser.toObject();
        if (updateListings) {
          Listing.updateMany(
            { "recruiter.id": updatedUser.id },
            {
              "recruiter.name": updatedUser.name,
              "recruiter.email": updatedUser.email,
            }
          ).then(() => {
            const { password, ...userToSend } = updatedUser.toObject();
            return res.json({ user: userToSend });
          });
        } else {
          const { password, ...userToSend } = updatedUser.toObject();
          res.json({ user: userToSend });
        }
      });
    })
    .catch((err) => {
      return res.status(404).json({ msg: "Not found" });
    });
});

module.exports = router;
