import React, { useState, useEffect } from "react";
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
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Navbar from "../Navbar/Navbar";
import { useParams } from "react-router-dom";
import "./Applications.css";
import axios from "axios";

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

const defaultApplication = {
  name: "Guy Name",
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
  sop:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  applicationDate: Date.now(),
  rating: 3.45,
  status: "Applied",
};

const defaultRows = [
  defaultApplication,
  defaultApplication,
  defaultApplication,
  defaultApplication,
];

const defaultSort = {
  sortField: "name",
  sortOrder: "ascending",
};

function Applications() {
  const [sort, setSort] = useState(defaultSort);
  const [rows, setRows] = useState([]);
  const { listingId } = useParams();

  const getApplications = async function () {
    try {
      let applications = await axios.get(
        `/api/application/bylisting/${listingId}`
      );
      applications = applications.data.applications;
      console.log(applications);

      let applicants = await axios.get(`/api/applicant/bylisting/${listingId}`);
      applicants = applicants.data.users;
      console.log(applicants);

      let rows = applications.map((application) => {
        let applicant = applicants.find(
          (a) => a._id === application.applicantId
        );
        let row = {
          id: application._id,
          name: applicant.name,
          education: applicant.education,
          skills: applicant.skills,
          sop: application.sop,
          applicationDate: application.appDate,
          rating:
            applicant.numRatings === 0
              ? 0
              : applicant.ratingSum / applicant.numRatings,
          status: application.status,
        };
        return row;
      });
      rows.sort((a, b) =>
        a[sort.sortField] < b[sort.sortField]
          ? sort.sortOrder === "ascending"
            ? -1
            : 1
          : sort.sortOrder === "ascending"
          ? 1
          : -1
      );
      setRows(rows);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(getApplications, []);

  const updateApplication = (applicationId, newStatus) => {
    let url = `/api/application/${applicationId}`;
    let data = { status: newStatus };
    let config = {
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
    };
    axios
      .put(url, data, config)
      .then(() => {
        swal(`Candidate ${newStatus}`, "", "success").then(() =>
          location.reload()
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

  const actionButtons = (row) => {
    if (row.status === "Applied") {
      return (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={() => updateApplication(row.id, "Shortlisted")}
          >
            Shortlist
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => updateApplication(row.id, "Rejected")}
          >
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
            onClick={() => updateApplication(row.id, "Accepted")}
          >
            Accept
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => updateApplication(row.id, "Rejected")}
          >
            Reject
          </Button>
        </>
      );
    }
    return "--";
  };

  const onSortChange = (e) => {
    setSort({
      ...sort,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <Navbar />
      <div className="Applications">
        <div className="FilterPanel">
          <h1>Sort By</h1>
          <Select
            name="sortField"
            value={sort.sortField}
            onChange={onSortChange}
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="applicationDate">Application Date</MenuItem>
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
              onClick={getApplications}
            >
              Apply
            </Button>
          </div>
        </div>
        <Divider
          orientation="vertical"
          flexItem
          style={{ position: "fixed", height: "100%" }}
        />
        <div className="MyApplications">
          <Typography variant="h1" gutterBottom>
            Applications
          </Typography>
          <br />
          <br />
          <TableContainer component={Paper}>
            <Table className="ApplicationTable">
              <TableHead>
                <TableRow>
                  <TableCell align="right">Applicant Name</TableCell>
                  <TableCell align="right">Skills</TableCell>
                  <TableCell align="right">Education</TableCell>
                  <TableCell align="right">Application Date</TableCell>
                  <TableCell align="right">SOP</TableCell>
                  <TableCell align="right">Rating</TableCell>
                  <TableCell align="right">Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell align="right">
                      <List dense>
                        {row.skills.map((skill) => (
                          <ListItem key={`${skill}${row.name}`}>
                            <ListItemText primary={skill} />
                          </ListItem>
                        ))}
                      </List>
                    </TableCell>
                    <TableCell align="right">
                      <List dense>
                        {row.education.map((edu) => (
                          <ListItem
                            key={`${edu.instituteName}${edu.startYear}-${edu.endYear}`}
                          >
                            <ListItemText
                              primary={edu.instituteName}
                              secondary={`${edu.startYear}-${edu.endYear}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </TableCell>
                    <TableCell align="right">
                      {toDt(row.applicationDate)}
                    </TableCell>
                    <TableCell align="right">{row.sop}</TableCell>
                    <TableCell align="right">
                      <Rating readOnly value={row.rating} />
                    </TableCell>
                    <TableCell
                      align="right"
                      style={{ color: getColor(row.status) }}
                    >
                      {row.status}
                    </TableCell>
                    <TableCell align="right">{actionButtons(row)}</TableCell>
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

export default Applications;
