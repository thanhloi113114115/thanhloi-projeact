import React, { useState } from "react";
import axios from "axios";
import { API_URL } from '../../config';
import { notifyError, notifySucces } from "../common/toastify";

export default function Reset() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const success = localStorage.getItem('success_reset');
  const username_resetPass = localStorage.getItem('username_resetPass');
  if (isLoggedIn || !success) {
    window.location.href = '/';
  }

  const [password, setPassword] = useState("");
  const changePassword = () => {
    if (password) {
      try {
        axios.put(`${API_URL}/resetPassword`, {
          username: username_resetPass,
          newPassword: password,
        }).then((response) => {
          if (response.status === 200) {
            localStorage.removeItem('success_reset');
            localStorage.removeItem('username_resetPass');
            alert("Đổi mật khẩu thành công, vui lòng đăng nhập!");
            window.location.href = "/";
          } else {
            alert('Đổi mật khẩu không thành công');
          }
        });

      } catch (e) {
        if (e.response) {
          notifyError(e.response.data.message);
        }
      }
    }
    else alert("Vui lòng nhập Mật khẩu mới của bạn");
  }

  return (
    <div className="container row mt-4 mb-4">
      <div className="col-md-4"></div>
      <div className="col-md-4">
        <h2> THAY ĐỔI MẬT KHẨU </h2>
        <label />  Mật khẩu mới:
        <input className="form-control"
          type="password"
          placeholder="••••••••"
          required=""
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-primary mt-2" onClick={() => changePassword()}>Đặt lại mật khẩu </button>
      </div>
      <div className="col-md-4"></div>
    </div>
  );
}
