import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import Home from "./components/Home/Home";
import Profile from "./components/Profile/Profile";
import FindJobs from "./components/FindJobs/FindJobs";
import MyApplications from "./components/MyApplications/MyApplications";
import CreateListing from "./components/CreateListing/CreateListing";
import MyListings from "./components/MyListings/MyListings";
import Applications from "./components/Applications/Applications";
import AcceptedEmployees from "./components/AcceptedEmployees/AcceptedEmployees";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";

const defaultAuth = {
  loggedIn: false,
  token: {},
  user: {},
  userType: "",
};

export const AuthContext = React.createContext(null);

function App() {
  const [auth, setAuth] = useState(defaultAuth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (
      localStorage.getItem("token") &&
      localStorage.getItem("userType") &&
      localStorage.getItem("user")
    ) {
      let userType = localStorage.getItem("userType");
      let user = JSON.parse(localStorage.getItem("user"));
      let token = localStorage.getItem("token");
      if (userType === "Recruiter" || userType === "Applicant") {
        let url = `/api/auth/${userType}/${user._id}`;
        let config = {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        };
        //setLoading(true);
        axios
          .get(url, config)
          .then((response) => {
            setAuth({
              loggedIn: true,
              user: user,
              token: token,
              userType: userType,
            });
          })
          .catch((error) => {
            localStorage.removeItem("user");
            localStorage.removeItem("userType");
            localStorage.removeItem("token");
            setAuth(defaultAuth);
          });
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("userType");
        localStorage.removeItem("token");
        setAuth(defaultAuth);
      }
    }
  }, []);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, [auth]);

  if (loading) return <LoadingScreen />;
  else
    return (
      <AuthContext.Provider value={{ auth, setAuth }}>
        <Switch>
          <Route path="/acceptedemployees">
            {() => {
              if (auth.loggedIn && auth.userType === "Recruiter")
                return <AcceptedEmployees />;
              else return <Redirect to="/" />;
            }}
          </Route>
          <Route path="/applications/:listingId">
            {() => {
              if (auth.loggedIn && auth.userType === "Recruiter")
                return <Applications />;
              else return <Redirect to="/" />;
            }}
          </Route>
          <Route path="/myapplications">
            {() => {
              if (auth.loggedIn && auth.userType === "Applicant")
                return <MyApplications />;
              else return <Redirect to="/" />;
            }}
          </Route>
          <Route path="/mylistings">
            {() => {
              if (auth.loggedIn && auth.userType === "Recruiter")
                return <MyListings />;
              else return <Redirect to="/" />;
            }}
          </Route>
          <Route path="/profile">
            <Profile />
          </Route>
          <Route path="/">
            {() => {
              if (auth.loggedIn) {
                if (auth.userType === "Recruiter") {
                  return <CreateListing />;
                } else {
                  return <FindJobs />;
                }
              } else return <Home />;
            }}
          </Route>
        </Switch>
      </AuthContext.Provider>
    );
}

export default App;
