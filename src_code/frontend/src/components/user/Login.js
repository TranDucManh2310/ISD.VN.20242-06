import React, { Fragment, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";

import { useAlert } from "react-alert";
import { useDispatch, useSelector } from "react-redux";
import { login,loginWithGoogle, clearErrors } from "../../actions/userActions";
import {  useGoogleLogin } from "@react-oauth/google";
import Swal from "sweetalert2";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const alert = useAlert();
  const dispatch = useDispatch();
  const history = useNavigate();
  const loginSuccess = async ({ access_token }) => {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/json",
        },
      }
    );
    const data = await response.json();
    dispatch(loginWithGoogle(data));
    Swal.fire({
      title: "Thành công",
      text: "Đăng nhập tài khoản",
      icon: "success"
    });
  };
  const loginFailure = (response) => {
    console.log("Login failure", response);
    Swal.fire({
      title: "Oh no...",
      text: "Đăng nhập ko thành công",
      icon: "error"
    });
  };
  const loginGoogle = useGoogleLogin({
    onSuccess: loginSuccess,
    onError: loginFailure,
  });
  const { isAuthenticated, error, loading } = useSelector(
    (state) => state.auth
  );
  const location = useLocation();
  const redirect = location.search ? location.search.split("=")[1] : "/";

  useEffect(() => {
    if (isAuthenticated) {
      Swal.fire({
        title: "Thành công",
        text: "Đăng nhập tài khoản thành công",
        icon: "success"
      });
      history(redirect);
    } else if (error) {
      // Đảm bảo errorMessage là chuỗi
      const errorMessage = error && error.response && error.response.data && error.response.data.error
      ? error.response.data.error
      : "Có lỗi xảy ra";  
      // Debug kiểm tra giá trị của errorMessage
      console.log("errorMessage:", errorMessage);
  
      // Kiểm tra lỗi tài khoản
      if (typeof errorMessage === "string" ) {
        Swal.fire({
          title: "Lỗi",
          text: "Tài khoản không đúng",
          icon: "error"
        });
      }
      else {
        alert.error(errorMessage);  // Nếu không phải lỗi tài khoản hoặc mật khẩu, hiển thị lỗi chung
      }
  
      dispatch(clearErrors());
    }
  }, [dispatch, alert, isAuthenticated, error, history, redirect]);
  
  
  
  const submitHandler = (e) => {
    e.preventDefault();

    // Kiểm tra nếu email hoặc mật khẩu không được nhập
    if (!email || !password) {
      Swal.fire({
        title: "Lỗi",
        text: "Vui lòng nhập đầy đủ email và mật khẩu",
        icon: "error"
      });
      return; // Ngừng xử lý nếu thiếu thông tin
    }

    // Gửi yêu cầu login tới backend
    dispatch(login(email, password));
  };
  

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title={"Login"} />

          <h3 className="title-30 text-center mb-35">Đăng nhập tài khoản</h3>
          <form className="login-form" onSubmit={submitHandler}>
            <div className="row">
              <div className="col-12">
                <div className="form-inner">
                  <label htmlFor="email_field">Email</label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    name="fname"
                    placeholder="Email"
                  />
                </div>
              </div>
              <div className="col-12">
                  <label htmlFor="email_password">Mật khẩu</label>
                <div className="form-inner flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="name"
                    placeholder="abcdef*****"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                <div
            className="absolute right-[32px] "
            onClick={() => {
              setShowPassword(!showPassword);
            }}
          >
            {showPassword ? (
              <i className="fa-solid fa-eye-slash"></i>
            ) : (
              <i className="fa-solid fa-eye"></i>
            )}
          </div>
                </div>
              </div>
              <div className="col-12">
                <div className="form-inner d-flex justify-content-between">
                  <label></label>
                  <Link to="/password/forgot" className="forget-password">
                    Quên mật khẩu?
                  </Link>
                </div>
              </div>
            
              <div className="col-12">
                <div className="form-inner flex justify-center">
                  <button
                    className="px-[20px] py-[10px] text-[white] hover:text-[#1976D2] bg-[#1976D2] border-[1px] border-[#1976D2]  hover:bg-[white]"
                    type="submit"
                  >
                
                     Đăng nhập 
                   
                  </button>
                </div>
              </div>
              <div className="w-[100%] text-center">Hoặc</div>
              <div className="flex justify-center w-[100%]">

              <button
          className="hover:opacity-[0.9] flex justify-center bg-[#3f81f9] text-white py-[10px] mt-[25px] rounded px-[10px]"
          onClick={() => {
            loginGoogle();
          }}
        >
          <img
            src="images/google.png"
            className="w-[30px] h-[30px] bg-white rounded p-[5px] mr-[15px]"
            />
          Đăng nhập với google
        </button>
            </div>
            </div>
          </form>
        </Fragment>
      )}
    </Fragment>
  );
};

export default Login;
