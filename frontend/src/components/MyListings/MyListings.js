import React, { useState, useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import axios from "axios";

import EditableListing from "../EditableListing/EditableListing";
import Navbar from "../Navbar/Navbar";
import "./MyListings.css";
import { AuthContext } from "../../App";

function MyListings() {
  const [listings, setListings] = useState([]);
  const { auth, setAuth } = React.useContext(AuthContext);
  useEffect(() => {
    let url = `/api/listing/byrecruiter/${auth.user._id}`;
    axios
      .get(url)
      .then((response) => {
        setListings(
          response.data.listings.filter((listing) => {
            return !listing.deleted && listing.numAccepted < listing.maxPos;
          })
        );
      })
      .catch((error) => console.log(error));
  }, []);
  return (
    <>
      <Navbar />
      <div className="MyListings">
        <div className="Listings">
          <Typography variant="h1" gutterBottom>
            My Listings
          </Typography>
          {listings.map((listing) => (
            <EditableListing key={listing._id} listing={listing} />
          ))}
        </div>
      </div>
    </>
  );
}

export default MyListings;
