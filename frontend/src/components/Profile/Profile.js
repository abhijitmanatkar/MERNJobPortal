import React, { useEffect, useState } from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Chip from "@material-ui/core/Chip";
import IconButton from "@material-ui/core/IconButton";
import Navbar from "../Navbar/Navbar";
import "./Profile.css";
import { AuthContext } from "../../App";
import swal from "sweetalert";
import axios from "axios";

/*
const defaultFormData = {
  name: "",
  email: "",
  contactNo: "",
  bio: "",
  education: [
    {
      instituteName: "SXBA",
      startYear: "2014",
      endYear: "2018",
    },
    {
      instituteName: "Pace",
      startYear: "2019",
      endYear: "2020",
    },
  ],
  skills: ["Python", "C", "C++", "Java"],
  userType: "applicant",
  currInstituteName: "",
  currStartYear: "",
  currEndYear: "",
  currSkill: "",
  userType: "applicant",
};
*/

const languageList = [
  "Python",
  "C",
  "Javascript",
  "C++",
  "HTML",
  "CSS",
  "Java",
  "Rust",
  "Kotlin",
  "PHP",
];

function Profile() {
  const { auth, setAuth } = React.useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: auth.user.name,
    email: auth.user.email,
    contactNo: auth.user.contactNo,
    bio: auth.user.bio,
    education: auth.user.education,
    skills: auth.user.skills,
    userType: auth.userType,
    currInstituteName: "",
    currStartYear: "",
    currEndYear: "",
    currSkill: "",
  });

  const onChangeHandler = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const bioNumWords = () => {
    let words = formData.bio.split(/\s+/);
    words.pop();
    return words.length;
  };

  const addSkill = () => {
    if (!formData.currSkill.trim())
      return swal("Error", "skill can't be empty", "error");
    let newSkills = formData.skills;
    newSkills.push(formData.currSkill);
    setFormData({
      ...formData,
      skills: newSkills,
      currSkill: "",
    });
  };

  const handleSkillDelete = (skill) => {
    let newSkills = formData.skills.filter((sk) => sk !== skill);
    setFormData({
      ...formData,
      skills: newSkills,
    });
  };

  const addEducation = () => {
    if (!formData.currInstituteName.trim())
      return swal("Error", "Institute can't be empty", "error");

    let re = /^(19|20)\d{2}$/;

    // start year
    if (!re.test(formData.currStartYear)) {
      return swal("Error", "Invalid start year", "error");
    }
    if (Number(formData.currStartYear) > 2021) {
      return swal("Error", "Invalid start year", "error");
    }
    // end year
    if (formData.currEndYear.trim() !== "") {
      if (!re.test(formData.currEndYear)) {
        return swal("Error", "Invalid end year", "error");
      }
      if (Number(formData.currEndYear) < Number(formData.currStartYear))
        return swal("Error", "Invalid start and end years", "error");
    }
    let newEducation = formData.education;
    newEducation.push({
      instituteName: formData.currInstituteName,
      startYear: formData.currStartYear,
      endYear: formData.currEndYear,
    });
    setFormData({
      ...formData,
      education: newEducation,
      currInstituteName: "",
      currEndYear: "",
      currStartYear: "",
    });
  };

  const handleEducationDelete = (edu) => {
    let newEducation = formData.education.filter((ed) => ed !== edu);
    setFormData({
      ...formData,
      education: newEducation,
    });
  };

  const updateUser = () => {
    let url = `/api/${auth.userType}/${auth.user._id.toString()}`;
    console.log(url);
    let config = {
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
    };
    let data = formData;
    axios
      .put(url, data, config)
      .then((response) => {
        swal("Updated user", "", "success");
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setAuth({ ...auth, user: response.data.user });
      })
      .catch((error) => {
        if (error.response.data.msg) {
          swal("Error", error.response.data.msg, "error");
        } else {
          swal("Error", "Something went wrong", "error");
        }
      });
  };

  const validateForm = () => {
    // email
    let emailRe = /\S+@\S+\.\S+/;
    if (!emailRe.test(formData.email))
      return swal("Error", "Invalid email", "error");

    if (formData.userType === "Recruiter") {
      let phoneRe = /^\d{10}$/;
      if (!phoneRe.test(formData.contactNo))
        return swal("Error", "Invalid contact no", "error");
      if (bioNumWords() > 250)
        return swal("Error", "Bio must be less than 250 words", "error");
    }

    updateUser();
  };

  return (
    <>
      <Navbar />
      <div className="Profile">
        <div className="Profile-side"></div>
        <div className="Profile-header">
          <Typography variant="h1">Profile</Typography>
        </div>
        <div className="Profile-main">
          <Typography variant="h4">Basic details</Typography>
          <br />
          <form autoComplete="off">
            <TextField
              fullWidth
              variant="outlined"
              label="Name"
              name="name"
              value={formData.name}
              onChange={onChangeHandler}
            />
            <br />
            <br />
            <TextField
              fullWidth
              variant="outlined"
              label="Email"
              name="email"
              value={formData.email}
              onChange={onChangeHandler}
            />
            <br />
            <br />
            {formData.userType == "Recruiter" && (
              <>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Contact No"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={onChangeHandler}
                />
                <br />
                <br />
              </>
            )}
            {formData.userType == "Recruiter" && (
              <>
                <FormControl fullWidth>
                  <TextField
                    fullWidth
                    variant="outlined"
                    multiline
                    rows="8"
                    label="Bio"
                    name="bio"
                    value={formData.bio}
                    onChange={onChangeHandler}
                  />
                  <FormHelperText>{bioNumWords()}/250</FormHelperText>
                </FormControl>
                <br />
                <br />
              </>
            )}
          </form>
          <br />
          <br />
          {formData.userType == "Applicant" && (
            <>
              <Typography variant="h4">Education</Typography>
              <br />
              <div className="EducationForm">
                <TextField
                  variant="outlined"
                  label="Institute name"
                  name="currInstituteName"
                  value={formData.currInstituteName}
                  onChange={onChangeHandler}
                />
                <TextField
                  variant="outlined"
                  label="Start Year"
                  name="currStartYear"
                  value={formData.currStartYear}
                  onChange={onChangeHandler}
                />
                <TextField
                  variant="outlined"
                  label="End Year"
                  name="currEndYear"
                  value={formData.currEndYear}
                  onChange={onChangeHandler}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={addEducation}
                >
                  Add
                </Button>
              </div>
              <List className="EducationList" dense>
                {formData.education.map((edu) => {
                  return (
                    <ListItem
                      key={`${edu.instituteName}${edu.startYear}-${edu.endYear}`}
                    >
                      <ListItemText
                        primary={edu.instituteName}
                        secondary={`${edu.startYear}-${edu.endYear}`}
                      />
                      <IconButton
                        aria-label="delete"
                        onClick={() => handleEducationDelete(edu)}
                      >
                        X
                      </IconButton>
                    </ListItem>
                  );
                })}
              </List>
              <br />
              <br />

              <Typography variant="h4">Skills</Typography>
              <br />
              <div className="SkillForm">
                <Autocomplete
                  freeSolo
                  options={languageList}
                  name="currSkill"
                  inputValue={formData.currSkill}
                  onInputChange={(e, newValue) => {
                    setFormData({ ...formData, currSkill: newValue });
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Skill" variant="outlined" />
                  )}
                />
                <Button variant="contained" color="primary" onClick={addSkill}>
                  Add
                </Button>
              </div>
              <br />
              {formData.skills.map((skill) => {
                return (
                  <>
                    <Chip
                      className="SkillChip"
                      key={skill}
                      label={skill}
                      onDelete={() => handleSkillDelete(skill)}
                    />
                    <span></span>
                  </>
                );
              })}
              <br />
              <br />
              <br />
              <br />
            </>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={validateForm}
            style={{ marginRight: 20, marginBottom: 160 }}
          >
            Update
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => (window.location = "/")}
            style={{ marginRight: 20, marginBottom: 160 }}
          >
            Cancel
          </Button>
          <br />
          <br />
        </div>
      </div>
    </>
  );
}

export default Profile;
