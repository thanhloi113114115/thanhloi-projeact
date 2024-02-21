import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import './loading.css';
import { notifyError, notifySucces } from "../common/toastify";
import { Link } from 'react-router-dom';

function Login() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (isLoggedIn) {
        window.location.href = '/';
    }
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        try {
            if (username === '' || password === '') {
                notifyError('Vui lòng nhập đầy đủ thông tin');
                return;
            }
            if (password.length < 8) {
                notifyError('Vui lòng nhập mật khẩu với ít nhất 8 kí tự');
                return;
            }
            const response = await axios.post(`${API_URL}/login`, { username, password });

            if (response.status === 200) {
                localStorage.setItem('user_id', response.data.user.id);
                localStorage.setItem('username', response.data.user.username);
                localStorage.setItem('firstname', response.data.user.firstname);
                localStorage.setItem('lastname', response.data.user.lastname);
                localStorage.setItem('email', response.data.user.email);
                localStorage.setItem('address', response.data.user.address);
                localStorage.setItem('phone', response.data.user.phone);
                localStorage.setItem('role', response.data.roleName);
                localStorage.setItem('isLoggedIn', true);
                notifySucces('Đăng nhập thành công');
                window.location.href = '/';
            }
            else {
                notifyError('Đăng nhập không thành công');
            }
        } catch (error) {
            console.log(error);
            if (error.response) {
                notifyError(error.response.data.message);
            }
        }
    }

    function sendOtp() {
        if (username) {
            setIsLoading(true);

            axios.get(`${API_URL}/checkUserName/${username}`).then((response) => {
                if (response.status === 200) {
                    const OTP = Math.floor(Math.random() * 9000 + 1000);
                    localStorage.setItem('otp', OTP);
                    localStorage.setItem('email_resetPass', response.data);
                    localStorage.setItem('username_resetPass', username);

                    axios.post(`${API_URL}/send-email`, {
                        OTP: OTP,
                        recipient_email: response.data,
                    }, {
                        headers: {
                            'Content-Type': "application/json",
                        },
                    })
                        .then(() => window.location.href = '/otpinput')
                        .catch((e) => {
                            setIsLoading(false);

                            if (e.response) {
                                notifyError(e.response.data.message);
                            }
                        });
                } else {
                    setIsLoading(false);

                    notifyError("Người dùng có tên đăng nhập này không tồn tại!");
                }
            }).catch((e) => {
                setIsLoading(false);

                if (e.response) {
                    notifyError(e.response.data.message);
                }
            });
        } else {
            setIsLoading(false);
            notifyError("Vui lòng nhập tên đăng nhập");
        }
    }

    const googleAuth = () => {
        window.open(
            `${API_URL}/api/google/callback`,
            "_self"
        );
    };

    return (
        <>
            {
                isLoading &&
                <div className="loading">Loading&#8230;</div>
            }
            <>
                <main className="mainContent-theme ">
                    <div className="layout-account">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-6 col-xs-12 wrapbox-heading-account">
                                    <div className="header-page clearfix">
                                        <h1>Đăng nhập</h1>
                                    </div>
                                </div>
                                <div className="col-md-6 col-xs-12 wrapbox-content-account">
                                    <div id="customer-login">
                                        <div id="login" className="userbox">
                                            <div className="clearfix large_form">
                                                <label htmlFor="customer_email" className="icon-field">
                                                    <i className="icon-login icon-envelope " />
                                                </label>
                                                <input
                                                    required
                                                    type="text"
                                                    name="customer[email]"
                                                    id="customer_email"
                                                    placeholder="Tên đăng nhập"
                                                    className="text"
                                                    value={username} onChange={e => setUsername(e.target.value)}
                                                />
                                            </div>
                                            <div className="clearfix large_form">
                                                <label htmlFor="customer_password" className="icon-field">
                                                    <i className="icon-login icon-shield" />
                                                </label>
                                                <input
                                                    required
                                                    type="password"
                                                    name="customer[password]"
                                                    id="customer_password"
                                                    placeholder="Mật khẩu"
                                                    className="text"
                                                    size={16}
                                                    value={password} onChange={e => setPassword(e.target.value)}
                                                />
                                            </div>
                                            <div className="clearfix action_account_custommer">
                                                <div className="">
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={handleLogin}
                                                    >ĐĂNG NHẬP</button>
                                                </div>
                                                <div className="">
                                                    <p className='text'>Hoặc</p>
                                                    <button className='google_btn' onClick={googleAuth}>
                                                        <img src="./assets/images/google.png" alt="google icon" />
                                                        <span>Sign up with Google</span>
                                                    </button>
                                                </div>
                                                <div className="">
                                                    <a
                                                        style={{ cursor: 'pointer' }} onClick={() => sendOtp()}
                                                    >
                                                        Quên mật khẩu?
                                                    </a>
                                                    <br />
                                                    hoặc{" "}
                                                    <Link to="/register" title="Đăng ký">
                                                        Đăng ký
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </>
        </>
    )
}

export default Login;