const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RecruiterSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contactNo: { type: String, required: true },
  bio: { type: String, default: "" },
});

module.exports = Recruiter = mongoose.model("Recruiter", RecruiterSchema);
