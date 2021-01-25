import React, { useState } from "react";
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

const rows = [application, application, application, application];

const defaultSort = {
  sortField: "name",
  sortOrder: "ascending",
};

function AcceptedEmployees() {
  const [sort, setSort] = useState(defaultSort);

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
            >
              Apply
            </Button>
            <Button variant="contained" color="secondary">
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
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell align="right">{toDt(row.joiningDate)}</TableCell>
                    <TableCell align="right">{row.jobType}</TableCell>
                    <TableCell align="right">{row.title}</TableCell>
                    <TableCell align="right">
                      <Rating value={row.rating} />
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
