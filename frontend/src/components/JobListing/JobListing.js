import React, { useState } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Rating from "@material-ui/lab/Rating";
import Chip from "@material-ui/core/Chip";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import axios from "axios";
import swal from "sweetalert";
import { AuthContext } from "../../App";

const defaultListing = {
  id: "123456",
  title: "Job Title",
  jobType: "Full time",
  maxApps: 10,
  numApps: 4,
  maxPos: 10,
  numAccepted: 1,
  postingDate: 1611146620579,
  deadlineDate: 1611146620579,
  requiredSkills: ["Python", "Data Science", "Javascript"],
  duration: 3,
  salary: 5000,
  numRatings: 4,
  ratingSum: 17,
  recruiter: {
    id: "1234556",
    name: "XYZ Recruiters",
    email: "xyzrecruiters@recruiter.com",
  },
  applied: false,
};

const dt = (x) => {
  let a = new Date(x);
  return a.toLocaleString();
};

function JobListing(props) {
  const [listing, setListing] = useState(
    props.listing ? props.listing : defaultListing
  );
  const [editing, setEditing] = useState(false);
  const [sop, setSop] = useState("");
  const { auth, setAuth } = React.useContext(AuthContext);

  const sopNumWords = () => {
    let words = sop.split(/\s+/);
    words.pop();
    return words.length;
  };

  const makeApplication = () => {
    if (sopNumWords() >= 250)
      return swal("Error", "SOP must be less than 250 words", "error");

    let url = "/api/application";
    let config = {
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
    };
    let data = {
      listingId: listing._id,
      applicantId: auth.user._id,
      sop: sop,
    };
    axios
      .post(url, data, config)
      .then(() => {
        return swal("Application successfully made", "", "success").then(
          () => (window.location = "/")
        );
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

  return (
    <>
      <Card style={{ marginBottom: 60 }}>
        <CardContent>
          <div>
            <Typography variant="h4" color="textPrimary" display="inline">
              {listing.title}
            </Typography>
            <Rating
              readOnly
              value={listing.ratingSum / listing.numRatings}
              style={{ float: "right" }}
            />
          </div>
          <Typography style={{ marginBottom: -5 }} color="textSecondary">
            Posted by:{" "}
            <span style={{ color: "#800080", fontSize: "1.1rem" }}>
              {listing.recruiter.name}{" "}
            </span>
          </Typography>
          <Typography color="textPrimary" style={{ marginBottom: -5 }}>
            {listing.jobType}
          </Typography>
          <Typography color="textSecondary" style={{ marginBottom: -5 }}>
            Duration:{" "}
            {listing.duration === 0
              ? "Indefinite"
              : `${listing.duration} months`}
          </Typography>
          <Typography color="textSecondary" style={{ marginBottom: 5 }}>
            Remaining Positions: {listing.maxPos - listing.numAccepted}
          </Typography>
          <div style={{ marginBottom: 5 }}>
            {listing.requiredSkills.map((skill) => {
              return (
                <>
                  <Chip key={skill} label={skill} />{" "}
                </>
              );
            })}
          </div>
          <Typography
            variant="h4"
            style={{ color: "lightgreen", marginBottom: -5 }}
          >
            ₹{listing.salary}
          </Typography>

          <span style={{ color: "red", fontSize: 14 }}>
            Apply before {dt(listing.deadlineDate)}
          </span>
          {editing && (
            <FormControl fullWidth style={{ marginTop: 20 }}>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                rows="8"
                label="Statement of purpose"
                name="bio"
                value={sop}
                onChange={(e) => setSop(e.target.value)}
              />
              <FormHelperText>{sopNumWords()}/250</FormHelperText>
            </FormControl>
          )}
          {!editing && (
            <Button
              variant="contained"
              style={{
                float: "right",
                color: "white",
                marginBottom: 10,
                backgroundColor: listing.applied
                  ? "#f50057"
                  : listing.maxPos - listing.numAccepted > 0 &&
                    listing.maxApps - listing.numApps > 0
                  ? "#1769aa"
                  : "lightgrey",
              }}
              display="inline"
              disabled={
                listing.applied ||
                !(listing.maxPos - listing.numAccepted) ||
                !(listing.maxApps - listing.numApps)
              }
              onClick={() => setEditing(true)}
            >
              {listing.applied
                ? "Applied"
                : listing.maxPos - listing.numAccepted > 0 &&
                  listing.maxApps - listing.numApps > 0
                ? "Apply"
                : "Full"}
            </Button>
          )}
          {editing && (
            <>
              <Button
                variant="contained"
                style={{
                  float: "right",
                  marginBottom: 10,
                  color: "white",
                  backgroundColor: "lightgreen",
                }}
                onClick={makeApplication}
              >
                Confirm
              </Button>

              <Button
                variant="contained"
                color="secondary"
                style={{ float: "right", marginBottom: 10, marginRight: 10 }}
                onClick={() => {
                  setSop("");
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default JobListing;
