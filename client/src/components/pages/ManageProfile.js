import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios';
import { API_URL } from '../../config';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { notifyError, notifySucces } from "../common/toastify";

const ManageProfile = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = '/';
    }
    const [idItem, setIdItem] = useState(0);
    const [userName, setUserName] = useState('')
    const [firstname, setFirstName] = useState('')
    const [lastname, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [oldEmail, setOldEmail] = useState('');
    const [show, setShow] = useState(false);

    const firstNameRef = useRef(null);
    const lastNameRef = useRef(null);
    const addressRef = useRef(null);
    const phoneRef = useRef(null);
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const [isReload, setIsReload] = useState(false);

    useEffect(() => {
        setUserName(localStorage.getItem('username'))
        setFirstName(localStorage.getItem('firstname'))
        setLastName(localStorage.getItem('lastname'))
        setEmail(localStorage.getItem('email'))
        setPhone(localStorage.getItem('phone'))
        setAddress(localStorage.getItem('address'))
        setIdItem(localStorage.getItem('user_id'))
        setOldEmail(localStorage.getItem('email'))
    }, [isReload])

    const handleEditClick = () => {
        setTimeout(() => {
            firstNameRef.current.value = firstname;
            lastNameRef.current.value = lastname;
            addressRef.current.value = address;
            phoneRef.current.value = phone;
            emailRef.current.value = email;
        })
        setShow(true);
    }
    const handleClose = () => setShow(false);

    const handleUpdate = () => {
        const firstName = firstNameRef.current.value;
        const lastName = lastNameRef.current.value;
        const address = addressRef.current.value;
        const phone = phoneRef.current.value;
        const email = emailRef.current.value;
        const password = passwordRef.current.value;

        if (!firstName || !lastName || !address || !phone || !email) {
            notifyError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        const phonePattern = /^[0-9]{10}$/;
        if (!phone.match(phonePattern)) {
            notifyError('Số điện thoại không hợp lệ');
            return;
        }

        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if (!email.match(emailPattern)) {
            notifyError('Email không hợp lệ');
            return;
        }
        var flgEmail = false
        if (email != oldEmail) {
            flgEmail = true;
        }
        if (password != "" && password.length < 8) {
            notifyError('Vui lòng nhập mật khẩu ít nhất 8 kí tự');
                return;
            }
        const updatedInfo = {
            firstname: firstName,
            lastname: lastName,
            phone: phone,
            email: email,
            address: address,
            username: userName,
            password: password,
            flgEmail: flgEmail,
            flgUserName: false
        };
        axios.put(`${API_URL}/users/${idItem}`, updatedInfo).then((response) => {
            if (response.status === 200) {
                handleClose();
                notifySucces(`Cập nhật dữ liệu thành công`);
                localStorage.setItem('firstname', firstName);
                localStorage.setItem('lastname', lastName);
                localStorage.setItem('email', email);
                localStorage.setItem('address', address);
                localStorage.setItem('phone', phone);
                setIsReload(!isReload);
            } else {
                notifyError('Lỗi khi cập nhật thông tin người dùng');
            }
        }).catch((e) => {
            if (e.response) {
                notifyError(e.response.data.message);
            }
        });
    };

    return (
        <div className='container mt-4'>
            <div className="col-md-3"></div>
            <div className="col-md-6">
                <div className="card">
                    <div className='card-header'>
                        <strong>THÔNG TIN TÀI KHOẢN</strong>
                    </div>
                    <div className="card-body">
                        <p className="card-text">Họ: {firstname}</p>
                        <p className="card-text">Tên: {lastname}</p>
                        <p className="card-text">Tên đăng nhập: {userName}</p>
                        <p className="card-text">Email: {email}</p>
                        <p className="card-text">Số điện thoại: {phone}</p>
                        <p className="card-text">Địa chỉ: {address}</p>
                        <a
                            style={{ cursor: "pointer" }}
                            onClick={handleEditClick}
                            className="btn btn-primary"
                        >
                            Chỉnh sửa thông tin
                        </a>
                    </div>
                </div>
            </div>
            <div className="col-md-3"></div>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header>
                    <Modal.Title>CẬP NHẬT THÔNG TIN</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <div className="mb-3">
                            <label>Họ</label>
                            <input
                                className='form-control'
                                ref={firstNameRef}
                                type="text"
                                placeholder="Họ"
                            />
                        </div>
                        <div className="mb-3">
                            <label>Tên</label>
                            <input
                                className='form-control'
                                ref={lastNameRef}
                                type="text"
                                placeholder="Tên"
                            />
                        </div>
                        <div className="mb-3">
                            <label>Email</label>
                            <input
                                className='form-control'
                                ref={emailRef}
                                type="email"
                                placeholder='Email'
                            />
                        </div>
                        <div className="mb-3">
                            <label>Số điện thoại</label>
                            <input
                                className='form-control'
                                ref={phoneRef}
                                type="tel"
                                placeholder='Số điện thoại'
                            />
                        </div>
                        <div className="mb-3">
                            <label>Địa chỉ</label>
                            <input
                                className='form-control'
                                ref={addressRef}
                                type="text"
                                placeholder='Địa chỉ'
                            />
                        </div>
                        <div className="mb-3">
                            <label>Mật khẩu</label>
                            <input
                                className='form-control'
                                ref={passwordRef}
                                type="password"
                                placeholder="Mật khẩu"
                            />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleUpdate}>
                        Cập nhật
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default ManageProfile
