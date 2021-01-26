import React, { useState } from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Chip from "@material-ui/core/Chip";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import "./CreateListing.css";
import Navbar from "../Navbar/Navbar";
import swal from "sweetalert";
import axios from "axios";
import { AuthContext } from "../../App";

const defaultFormData = {
  title: "",
  requiredSkills: [],
  currSkill: "",
  jobType: "Full Time",
  maxApps: 0,
  maxPos: 0,
  duration: 0,
  salary: 1000,
  deadlineDate: Date.now(),
};

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

function CreateListing() {
  const [formData, setFormData] = useState(defaultFormData);
  const { auth, setAuth } = React.useContext(AuthContext);

  const addSkill = () => {
    if (!formData.currSkill.trim())
      return swal("Error", "skill can't be empty", "error");
    let newSkills = formData.requiredSkills;
    newSkills.push(formData.currSkill);
    setFormData({
      ...formData,
      requiredSkills: newSkills,
      currSkill: "",
    });
  };

  const handleSkillDelete = (skill) => {
    let newSkills = formData.requiredSkills.filter((sk) => sk !== skill);
    setFormData({
      ...formData,
      requiredSkills: newSkills,
    });
  };

  const getDate = (d) => {
    let dt = new Date(d);
    return dt;
  };

  const onChangeHandler = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDateChange = (newDate) => {
    setFormData({
      ...formData,
      deadlineDate: newDate,
    });
  };

  const createListing = () => {
    let url = "/api/listing";
    let config = {
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
    };
    let data = {
      ...formData,
      maxPos: Number(formData.maxPos),
      maxApps: Number(formData.maxApps),
      salary: Number(formData.salary),
      recruiter: auth.user,
    };

    axios
      .post(url, data, config)
      .then((response) => {
        //setFormData(response.data.listing);
        swal("Listing created successfully", "", "success");
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.data) {
            if (error.response.data.msg) {
              swal("Error", error.response.data.msg, "error");
            }
          }
        } else {
          swal("Error", "Something went wrong", "error");
        }
      });
  };

  const validateForm = () => {
    if (
      Number(formData.maxPos) === NaN ||
      Number(formData.maxApps) === NaN ||
      Number(formData.salary) === NaN
    ) {
      return swal("Error", "Please enter NUMBERS", "error");
    }
    if (
      Number(formData.maxPos) <= 0 ||
      Number(formData.maxApps) <= 0 ||
      formData.salary <= 0
    )
      return swal("Error", "Value greater than 0 required", "error");
    if (Number(formData.maxPos) > Number(formData.maxApps)) {
      console.log(formData.maxPos);
      console.log(formData.maxApps);
      return swal(
        "Error",
        "Positions can't be mor than allowed applications",
        "error"
      );
    }
    if (formData.deadlineDate < Date.now())
      return swal("Error", "Deadline must be in future", "error");
    createListing();
  };

  return (
    <>
      <Navbar />
      <div className="CreateListing">
        <div className="CreateListing-side"></div>
        <div className="CreateListing-header">
          <Typography variant="h1">Create Listing</Typography>
        </div>
        <div className="CreateListing-main">
          <form autoComplete="off">
            <TextField
              variant="outlined"
              label="Job Title"
              name="title"
              value={formData.title}
              onChange={onChangeHandler}
              className="FormElement"
            />
            <FormControl variant="outlined" className="FormElement">
              <InputLabel>Job Type</InputLabel>
              <Select
                name="jobType"
                value={formData.jobType}
                onChange={onChangeHandler}
                label="Job Type"
              >
                <MenuItem value="Full Time">Full Time</MenuItem>
                <MenuItem value="Part Time">Part Time</MenuItem>
                <MenuItem value="WFH">Work From Home</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" className="FormElement">
              <InputLabel>Duration</InputLabel>
              <Select
                name="duration"
                value={formData.duration}
                onChange={onChangeHandler}
                label="Maximum Duration"
              >
                {[...Array(7).keys()].map((i) => (
                  <MenuItem value={i} key={i}>
                    {i}
                    {!i && "(Indefinite)"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <br />
            <TextField
              variant="outlined"
              label="Salary (₹)"
              name="salary"
              value={formData.salary}
              onChange={onChangeHandler}
              className="FormElement"
            />
            <TextField
              variant="outlined"
              label="Number of positions"
              name="maxPos"
              value={formData.maxPos}
              onChange={onChangeHandler}
              className="FormElement"
              className="FormElement"
            />
            <TextField
              variant="outlined"
              label="Maximum Applications"
              name="maxApps"
              value={formData.maxApps}
              onChange={onChangeHandler}
              className="FormElement"
            />
            <br />
            <br />
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                className="FormElement"
                disableToolbar
                variant="inline"
                inputVariant="outlined"
                format="MM/dd/yyyy"
                margin="normal"
                id="date-picker-inline"
                label="Deadline date"
                value={getDate(formData.deadlineDate)}
                onChange={handleDateChange}
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
              />
              <KeyboardTimePicker
                className="FormElement"
                margin="normal"
                id="time-picker"
                label="Deadline time"
                inputVariant="outlined"
                value={getDate(formData.deadlineDate)}
                onChange={handleDateChange}
                KeyboardButtonProps={{
                  "aria-label": "change time",
                }}
              />
            </MuiPickersUtilsProvider>
          </form>
          <Typography variant="h5">Required Skills</Typography>
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
          {formData.requiredSkills.map((skill) => {
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

          <Button
            variant="contained"
            color="primary"
            onClick={validateForm}
            style={{ marginRight: 20 }}
          >
            Post
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setFormData(defaultFormData)}
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

export default CreateListing;
