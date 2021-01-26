import React, { useEffect, useState } from "react";
import Typography from "@material-ui/core/Typography";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Rating from "@material-ui/lab/Rating";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import swal from "sweetalert";
import { AuthContext } from "../../App";
import "./AcceptedEmployees.css";

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

const actionButtons = (row) => {
  if (row.status === "Applied") {
    return (
      <>
        <Button variant="contained" color="primary">
          Shortlist
        </Button>
        <Button variant="contained" color="secondary">
          Reject
        </Button>
      </>
    );
  } else if (row.status === "Shortlisted") {
    return (
      <>
        <Button
          variant="contained"
          style={{ color: "white", backgroundColor: "lightgreen" }}
        >
          Accept
        </Button>
        <Button variant="contained" color="secondary">
          Reject
        </Button>
      </>
    );
  }
  return "--";
};

const application = {
  name: "Guy Name",
  jobType: "Part time",
  joiningDate: Date.now(),
  rating: 3.45,
  title: "Job Title",
};

const defaultRows = [application, application, application, application];

const defaultSort = {
  sortField: "name",
  sortOrder: "ascending",
};

function AcceptedEmployees() {
  const [sort, setSort] = useState(defaultSort);
  const [rows, setRows] = useState([]);
  const { auth, setAuth } = React.useContext(AuthContext);

  const getEmployees = async function () {
    try {
      // Get from backend
      let applicants = await axios.get(
        `/api/applicant/byrecruiter/${auth.user._id}`
      );
      applicants = applicants.data.applicants;

      let ratings = await axios.get(
        `/api/rating/applicant/byrecruiter/${auth.user._id}`
      );
      ratings = ratings.data.ratings;

      applicants = applicants.map((applicant) => {
        let myRating = ratings.find((r) => r.applicantId === applicant.id);
        if (myRating) applicant.myRating = myRating.value;
        else applicant.myRating = 0;
        return applicant;
      });
      //Sort
      applicants.sort((a, b) =>
        a[sort.sortField] < b[sort.sortField]
          ? sort.sortOrder === "ascending"
            ? -1
            : 1
          : sort.sortOrder === "ascending"
          ? 1
          : -1
      );
      console.log(applicants);
      setRows(applicants);
    } catch (error) {
      console.log(error);
    }
  };

  const updateMyRatingLocal = (row, newRating) => {
    let newRows = rows.map((r) => {
      if (r.id === row.id) r.myRating = newRating;
      return r;
    });
    setRows(newRows);
  };

  const updateMyRating = (row, newRating) => {
    let oldRating = row.myRating;
    updateMyRatingLocal(row, newRating);
    let url = "/api/rating/applicant";
    let data = {
      value: newRating,
      applicantId: row.id,
      recruiterId: auth.user._id,
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
        swal("Rating changed", "", "success").then(() => getEmployees());
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.data) {
            if (error.response.data.msg) {
              swal("Error", error.response.data.msg, "error").then(() =>
                updateMyRatingLocal(row, oldRating)
              );
            }
          }
        } else {
          swal("Error", "Something went wrong", "error").then(() =>
            updateMyRatingLocal(row, oldRating)
          );
        }
      });
  };

  useEffect(getEmployees, []);
  //useEffect(getEmployees, [sort]);

  const onSortChange = (e) => {
    setSort({
      ...sort,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <Navbar />
      <div className="AcceptedEmployees">
        <div className="FilterPanel">
          <h1>Sort By</h1>
          <Select
            name="sortField"
            value={sort.sortField}
            onChange={onSortChange}
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="title">Job Title</MenuItem>
            <MenuItem value="joiningDate">Joining Date</MenuItem>
            <MenuItem value="rating">Rating</MenuItem>
          </Select>
          <RadioGroup
            row
            value={sort.sortOrder}
            name="sortOrder"
            onChange={onSortChange}
          >
            <FormControlLabel
              value="ascending"
              control={<Radio />}
              label="Ascending"
            />
            <FormControlLabel
              value="descending"
              control={<Radio />}
              label="Descending"
            />
          </RadioGroup>
          <br />
          <br />
          <div className="BottomButtons">
            <Button
              variant="contained"
              color="primary"
              style={{ marginRight: 10 }}
              onClick={getEmployees}
            >
              Apply
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                setSort(defaultSort);
                //getEmployees();
              }}
            >
              Reset
            </Button>
          </div>
        </div>
        <Divider
          orientation="vertical"
          flexItem
          style={{ position: "fixed", height: "100%" }}
        />
        <div className="Employees">
          <Typography variant="h1" gutterBottom>
            Accepted Employees
          </Typography>
          <br />
          <br />
          <TableContainer component={Paper}>
            <Table className="ApplicationTable">
              <TableHead>
                <TableRow>
                  <TableCell align="right">Applicant Name</TableCell>
                  <TableCell align="right">Joining date</TableCell>
                  <TableCell align="right">Job Type</TableCell>
                  <TableCell align="right">Job Title</TableCell>
                  <TableCell align="right">Rating</TableCell>
                  <TableCell align="right">Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell align="right">{toDt(row.joiningDate)}</TableCell>
                    <TableCell align="right">{row.jobType}</TableCell>
                    <TableCell align="right">{row.title}</TableCell>
                    <TableCell align="right">
                      <Rating readOnly value={row.rating} precision={0.25} />
                    </TableCell>
                    <TableCell>
                      <Rating
                        name={row.id}
                        value={row.myRating}
                        onChange={(e, newRating) =>
                          updateMyRating(row, newRating)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </>
  );
}

export default AcceptedEmployees;
