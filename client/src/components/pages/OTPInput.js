
import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from '../../config';
import './loading.css';
import { notifyError, notifySucces } from "../common/toastify";

export default function OTPInput() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const email_resetPass = localStorage.getItem('email_resetPass');
  if (isLoggedIn) {
    window.location.href = '/';
  }

  const [OTPinput, setOTPinput] = useState("");
  const [disable, setDisable] = useState(true);
  const [timerCount, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);

  //function to verify OTP
  function verifyOTP() {
    if (OTPinput === localStorage.getItem('otp')) {
      localStorage.setItem('success_reset', true);
      window.location.href = '/reset';
    } else {
      alert("Mã bạn nhập không chính xác, vui lòng thử lại hoặc gửi lại liên kết");
    }
  }

  //function to resend OTP 
  function resendOTP() {
    if (disable) return;
    setIsLoading(true);
    const OTP = Math.floor(Math.random() * 9000 + 1000);
    axios
      .post(`${API_URL}/send-email`, {
        OTP: OTP,
        recipient_email: email_resetPass,
      })
      .then(() => {
        localStorage.setItem('otp', OTP);
        setDisable(true);
        alert("Một OTP mới đã được gửi thành công đến email của bạn.");
        setTimer(60);
      }).catch((e) => {
        if (e.response) {
            notifyError(e.response.data.message);
        }
    });
    setIsLoading(false);
  }
  //timer function
  useEffect(() => {
    let interval = setInterval(() => {
      setTimer(lastTimerCount => {
        lastTimerCount <= 1 && clearInterval(interval);
        if (lastTimerCount <= 1) {
          setDisable(false);
          localStorage.removeItem('otp');
        }
        return lastTimerCount - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [disable]);

  return (
    <>
      {
        isLoading &&
        <div class="loading">Loading&#8230;</div>
      }
      <div className="container row mt-4 mb-4">
        <div className="col-md-3"></div>
        <div className="col-md-6">
          <h3>Email xác thực</h3>
          <p>Chúng tôi đã gửi mã xác minh tới email của bạn.</p>
          <input type="text" className="form-control" value={OTPinput} onChange={(e) => { setOTPinput(e.target.value) }} />
          <button className="btn btn-primary mt-2" onClick={() => verifyOTP()}>Xác nhận tài khoản</button>

          <a className="mt-2" onClick={() => resendOTP()} > Không nhận được mã?
            {disable ? `Gửi lại OTP trong ${timerCount}s` : " Gửi lại OTP"}
          </a>

        </div>
        <div className="col-md-3"></div>
      </div>
    </>
  );
}
