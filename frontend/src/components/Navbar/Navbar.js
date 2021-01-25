import React, { useState } from "react";
import { AuthContext } from "../../App";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { Link as RouterLink } from "react-router-dom";
import Link from "@material-ui/core/Link";
import "./Navbar.css";

function Navbar() {
  const { auth, setAuth } = React.useContext(AuthContext);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    localStorage.removeItem("token");
    setAuth({
      loggedIn: false,
      token: {},
      user: {},
      userType: "",
    });
    window.location = "/";
  };

  const button = () => <Button>asdf</Button>;
  if (auth.loggedIn && auth.userType === "Recruiter") {
    return (
      <AppBar position="static">
        <Toolbar className="Navbar">
          <h1 style={{ flexGrow: 1 }}>Jobs for the Boss</h1>
          <Link component={RouterLink} to="/">
            <Button
              variant="contained"
              style={{
                color: "white",
                backgroundColor: "rgb(143, 1, 143)",
                marginRight: 10,
              }}
            >
              Create Listing
            </Button>
          </Link>
          <Link component={RouterLink} to="/mylistings">
            <Button
              variant="contained"
              style={{
                color: "white",
                backgroundColor: "rgb(143, 1, 143)",
                marginRight: 10,
              }}
            >
              My Listings
            </Button>
          </Link>
          <Link component={RouterLink} to="/acceptedemployees">
            <Button
              variant="contained"
              style={{
                color: "white",
                backgroundColor: "rgb(143, 1, 143)",
                marginRight: 10,
              }}
            >
              Accepted Employees
            </Button>
          </Link>
          <Link component={RouterLink} to="/profile">
            <Button
              variant="contained"
              color="primary"
              style={{
                marginRight: 10,
              }}
            >
              Profile
            </Button>
          </Link>
          <Button color="secondary" variant="contained" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
    );
  } else if (auth.loggedIn && auth.userType === "Applicant") {
    return (
      <AppBar position="static">
        <Toolbar className="Navbar">
          <h1 style={{ flexGrow: 1 }}>Jobs for the Boss</h1>
          <Link component={RouterLink} to="/">
            <Button
              variant="contained"
              style={{
                color: "white",
                backgroundColor: "rgb(143, 1, 143)",
                marginRight: 10,
              }}
            >
              Find Jobs
            </Button>
          </Link>
          <Link component={RouterLink} to="/myapplications">
            <Button
              variant="contained"
              style={{
                color: "white",
                backgroundColor: "rgb(143, 1, 143)",
                marginRight: 10,
              }}
            >
              My Applications
            </Button>
          </Link>
          <Link component={RouterLink} to="/profile">
            <Button
              variant="contained"
              color="primary"
              style={{
                marginRight: 10,
              }}
            >
              Profile
            </Button>
          </Link>
          <Button color="secondary" variant="contained" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
    );
  } else return null;
}

export default Navbar;
