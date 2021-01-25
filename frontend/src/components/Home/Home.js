import React from "react";
import LoginForm from "../LoginForm/LoginForm";
import "./Home.css";

function Home() {
  return (
    <div className="Home">
      <div className="Home-left"></div>
      <div className="Home-right">
        <LoginForm />
      </div>
    </div>
  );
}

export default Home;
