import React, { useState, useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Rating from "@material-ui/lab/Rating";
import Navbar from "../Navbar/Navbar";
import "./MyApplications.css";
import axios from "axios";
import { AuthContext } from "../../App";
import swal from "sweetalert";

const toDt = (dt) => {
  if (!dt) return "--";
  let d = new Date(dt);
  return d.toDateString();
};

const getColor = (status) => {
  switch (status) {
    case "Applied":
      return "black";
    case "Shortlisted":
      return "blue";
    case "Rejected":
      return "red";
    case "Accepted":
      return "green";
  }
};

const rateButton = (row) => {
  if (row.status === "Accepted") {
    return (
      <Rating
        value={row.rating}
        name={row.id}
        onChange={(e, newValue) => {
          row.rating = newValue;
        }}
      />
    );
  }
  return "--";
};

const defaultRows = [
  {
    title: "Big Job",
    recruiterName: "XYZ recruiter",
    status: "Applied",
    salary: 2000,
    closureDate: null,
  },
  {
    title: "Amazing Job",
    recruiterName: "XYZ recruiter",
    status: "Shortlisted",
    salary: 2000,
    closureDate: null,
  },
  {
    title: "YOu Want This Job",
    recruiterName: "XYZ recruiter",
    status: "Rejected",
    salary: 2000,
    closureDate: 1611149627670,
  },
  {
    title: "JobbbNiggabbb",
    recruiterName: "XYZ recruiter",
    status: "Accepted",
    salary: 2000,
    closureDate: 1611149627670,
    rating: 4.2,
  },
];

function MyApplications() {
  const [rows, setRows] = useState([]);
  const { auth, setAuth } = React.useContext(AuthContext);

  const updateRatingLocal = (row, newRating) => {
    let newRows = rows.map((r) => {
      if (r.id === row.id) r.rating = newRating;
      return r;
    });
    setRows(newRows);
  };

  const updateRating = (row, newRating) => {
    let oldRating = row.rating;
    updateRatingLocal(row, newRating);
    let url = "/api/rating/listing";
    let data = {
      value: newRating,
      listingId: row.listingId,
      applicantId: auth.user._id,
    };
    let config = {
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
    };
    axios
      .post(url, data, config)
      .then((response) => {
        swal("Rating changed", "", "success");
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.data) {
            if (error.response.data.msg) {
              swal("Error", error.response.data.msg, "error").then(() =>
                updateRatingLocal(row, oldRating)
              );
            }
          }
        } else {
          swal("Error", "Something went wrong", "error").then(() =>
            updateRatingLocal(row, oldRating)
          );
        }
      });
  };

  useEffect(async function () {
    try {
      let applications = await axios.get(
        `/api/application/byapplicant/${auth.user._id}`
      );
      applications = applications.data.applications;
      console.log(applications);
      let appliedListingIds = applications.map(
        (application) => application.listingId
      );

      let listings = await axios.get("api/listing");
      listings = listings.data.listings.filter(
        (listing) => appliedListingIds.indexOf(listing._id) !== -1
      );

      let ratings = await axios.get(
        `/api/rating/listing/byapplicant/${auth.user._id}`
      );
      ratings = ratings.data.ratings;
      //console.log(ratings);

      let rows = applications.map((application) => {
        let listing = listings.find((l) => l._id === application.listingId);
        let rating = 0;
        if (ratings) rating = ratings.find((r) => r.listingId === listing._id);
        console.log(rating);
        let row = {
          id: application._id,
          title: listing.title,
          recruiterName: listing.recruiter.name,
          status: application.status,
          salary: listing.salary,
          closeDate: application.closeDate,
          rating: rating ? rating.value : 0,
          listingId: listing._id,
          /*
          rating:
            listing.numRatings === 0
              ? 0
              : listing.ratingSum / listing.numRatings,
          */
        };
        return row;
      });
      setRows(rows);
    } catch (error) {
      console.log(error);
    }
  }, []);

  return (
    <>
      <Navbar />
      <div className="MyApplications">
        <Typography variant="h1" gutterBottom>
          My Applications
        </Typography>
        <br />
        <br />
        <TableContainer component={Paper}>
          <Table className="ApplicationTable">
            <TableHead>
              <TableRow>
                <TableCell>Job Title</TableCell>
                <TableCell align="right">Recruiter Name</TableCell>
                <TableCell align="right">Status</TableCell>
                <TableCell align="right">Salary per month</TableCell>
                <TableCell align="right">Date of Joining</TableCell>
                <TableCell align="right">Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell component="th" scope="row">
                    {row.title}
                  </TableCell>
                  <TableCell align="right">{row.recruiterName}</TableCell>
                  <TableCell
                    align="right"
                    style={{ color: getColor(row.status) }}
                  >
                    {row.status}
                  </TableCell>
                  <TableCell align="right">₹{row.salary}</TableCell>
                  <TableCell align="right">
                    {row.status === "Accepted" ? toDt(row.closeDate) : "--"}
                  </TableCell>
                  <TableCell align="right">
                    {row.status === "Accepted" ? (
                      <Rating
                        value={row.rating}
                        name={row.id}
                        onChange={(e, newRating) =>
                          updateRating(row, newRating)
                        }
                      />
                    ) : (
                      "--"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
}

export default MyApplications;
