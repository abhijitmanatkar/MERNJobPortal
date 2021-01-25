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
    title: "Jobbbbbb",
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

      let rows = applications.map((application) => {
        let listing = listings.find((l) => l._id === application.listingId);
        let row = {
          title: listing.title,
          recruiterName: listing.recruiter.name,
          status: application.status,
          salary: listing.salary,
          closureDate: application.closureDate,
          rating:
            listing.numRatings === 0
              ? 0
              : listing.ratingSum / listing.numRatings,
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
                <TableRow key={row.name}>
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
                  <TableCell align="right">{row.salary}</TableCell>
                  <TableCell align="right">{toDt(row.closureDate)}</TableCell>
                  <TableCell align="right">{rateButton(row)}</TableCell>
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
