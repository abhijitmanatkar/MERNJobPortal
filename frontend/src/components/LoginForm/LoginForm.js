import React, { useState } from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import axios from "axios";
import swal from "sweetalert";
import { AuthContext } from "../../App";

const defaultFormData = {
  name: "",
  email: "",
  password: "",
  contactNo: "",
  userType: "recruiter",
  formType: "Login",
};

function LoginForm() {
  const [formData, setFormData] = useState(defaultFormData);
  const { auth, setAuth } = React.useContext(AuthContext);

  const login = () => {
    let config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    let data = {
      email: formData.email,
      password: formData.password,
    };
    let url = `/api/auth/${formData.userType}`;
    axios
      .post(url, data, config)
      .then((response) => {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userType", response.data.userType);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setAuth({
          loggedIn: true,
          user: response.data.user,
          token: response.data.token,
          userType: response.data.userType,
        });
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

  const signUp = () => {
    let config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    let data = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      contactNo: formData.contactNo,
    };
    let url = `/api/${formData.userType}`;
    axios
      .post(url, data, config)
      .then((response) => {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userType", response.data.userType);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setAuth({
          loggedIn: true,
          user: response.data.user,
          token: response.data.token,
          userType: response.data.userType,
        });
      })
      .catch((error) => {
        if (error.response.data.msg) {
          swal("Error", error.response.data.msg, "error");
        } else {
          swal("Error", "Something went wrong", "error");
        }
      });
  };

  const changeTypeHandle = (e) => {
    e.preventDefault();
    setFormData({
      ...defaultFormData,
      formType: formData.formType == "Login" ? "Sign up" : "Login",
    });
  };

  const onChangeHandler = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="LoginForm">
      <h1>{formData.formType}</h1>
      <h1>{auth.userType.toString()}</h1>
      <br />
      <br />
      <form noValidate autoComplete="off">
        {formData.formType == "Sign up" && (
          <>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={onChangeHandler}
            />
            <br />
            <br />
          </>
        )}
        <TextField
          fullWidth
          label="Email"
          name="email"
          value={formData.email}
          onChange={onChangeHandler}
        />
        <br />
        <br />
        {formData.formType == "Sign up" && formData.userType == "recruiter" && (
          <>
            <TextField
              fullWidth
              label="Contact No"
              name="contactNo"
              value={formData.contactNo}
              onChange={onChangeHandler}
            />
            <br />
            <br />
          </>
        )}
        <TextField
          fullWidth
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={onChangeHandler}
        />
        <br />
        <br />
        <RadioGroup
          row
          value={formData.userType}
          name="userType"
          onChange={onChangeHandler}
        >
          <FormControlLabel
            value="recruiter"
            control={<Radio />}
            label="Recruiter"
          />
          <FormControlLabel
            value="applicant"
            control={<Radio />}
            label="Applicant"
          />
        </RadioGroup>
        <br />
        <Button
          variant="contained"
          color="primary"
          onClick={formData.formType == "Login" ? login : signUp}
        >
          {formData.formType}
        </Button>
        <br />
        <br />
        <a href="#" onClick={changeTypeHandle}>
          {formData.formType == "Login" ? "Sign up" : "Login"} instead
        </a>
      </form>
    </div>
  );
}

export default LoginForm;
