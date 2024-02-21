import React, { useState, useRef, useEffect } from "react";
import '../../App.css';
import { API_URL } from '../../config';
import axios from 'axios';
import Pagination from "https://cdn.skypack.dev/rc-pagination@3.1.15";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import formattedPrice from '../common/formattedPrice';
import formatDate from '../common/formatDate';
import { notifyError, notifySucces } from "../common/toastify";
import getImageUrlFromStorage from "../common/getImageUrlFromStorage";

function ManageOrder() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const role = localStorage.getItem('role');
    if (!isLoggedIn && role !== "admin") {
        window.location.href = '/';
    }
    const [show, setShow] = useState(false);
    const [contentDetail, setContentDetail] = useState('');
    const [status, setStatus] = useState('Tất cả');
    const [isReload, setIsReload] = useState(false);
    const [orders, setOrders] = useState([]);


    useEffect(() => {
        axios.get(`${API_URL}/orders/${status}`)
            .then((response) => setOrders(response.data))
            .catch((e) => {
                if (e.response) {
                    notifyError(e.response.data.message);
                }
            });
    }, [isReload, status]);

    const handleClickDelete = async (id) => {
        confirmAlert({
            title: "Xác nhận xóa",
            message: "Bạn muốn xóa đơn hàng?",
            buttons: [
                {
                    label: 'Xác nhận',
                    onClick: () => handleConfirmDelete(id)
                },
                {
                    label: 'Hủy',
                    onClick: () => handleCancelDelete()
                }
            ],
            closeOnEscape: true,
            closeOnClickOutside: true,
            keyCodeForClose: [8, 32],
            willUnmount: () => { },
            afterClose: () => { },
            onClickOutside: () => { },
            onKeypress: () => { },
            onKeypressEscape: () => { },
            overlayClassName: "overlay-custom-class-name"
        });
    };

    const handleConfirmDelete = async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/orders/${id}`);
            if (response.status === 200) {
                notifySucces('Xóa dữ liệu thành công');
                setIsReload(!isReload);
            } else {
                notifyError('Lỗi khi xóa đơn hàng');
            }
        } catch (e) {
            if (e.response) {
                notifyError(e.response.data.message);
            }
        }
    };

    const handleCancelDelete = () => {
    };

    const handleClose = () => setShow(false);

    const handleShowDetail = (id) => {
        setShow(true);
        axios.get(`${API_URL}/orderItemByOrderId/${id}`)
            .then(async (response) => {
                if (response.status === 200) {
                    var orderDetail = response.data;
                    var n = 1;
                    var html = '';
                    html += '<table class="table">'
                    html += '<thead>'
                    html += '<tr>'
                    html += '<th>#</th>'
                    html += '<th>Tên sản phẩm</th>'
                    html += '<th>Hình ảnh</th>'
                    html += '<th>Màu sắc</th>'
                    html += '<th>Kích thước</th>'
                    html += '<th>Giá</th>'
                    html += '<th>Số lượng</th>'
                    html += '</tr>'
                    html += '</thead>'
                    html += '<tbody>'
                    for (const item of orderDetail) {
                        const url = await getImageUrlFromStorage(item.url_image1);

                        html += '<tr>'
                        html += '<td>' + n + '</td>'
                        html += '<td>' + item.product_name + '</td>'
                        html += '<td><img style="width: 100px;" src="' + url + '"/></td>'
                        html += '<td>' + item.color + '</td>'
                        html += '<td>' + item.size + '</td>'
                        html += '<td>' + formattedPrice(item.price) + '</td>'
                        html += '<td>' + item.quantity + '</td>'
                        html += '</tr>'
                        n++;
                    }
                    html += '</tbody>'
                    html += '</table>'
                    setContentDetail(html);
                } else {
                    notifyError('Lỗi khi lấy thông tin đơn hàng chi tiết');
                }
            }).catch((e) => {
                if (e.response) {
                    notifyError(e.response.data.message);
                }
            });
    }

    const changeStatus = (e, id, originalStatus) => {
        confirmAlert({
            title: "Xác nhận",
            message: "Bạn muốn thay đổi trạng thái đơn hàng?",
            buttons: [
                {
                    label: 'Xác nhận',
                    onClick: () => {
                        axios.put(`${API_URL}/changeStatus/${id}/${e.target.value}`)
                            .then((response) => {
                                const message = response.data.message;
                                notifySucces(message);
                                setIsReload(!isReload);
                            }).catch((e) => {
                                if (e.response) {
                                    notifyError(e.response.data.message);
                                }
                            });
                    }
                },
                {
                    label: 'Hủy',
                    onClick: () => {
                        e.target.value = originalStatus;
                    }
                }
            ],
            closeOnEscape: true,
            closeOnClickOutside: true,
            keyCodeForClose: [8, 32],
            willUnmount: () => { },
            afterClose: () => { },
            onClickOutside: () => { },
            onKeypress: () => { },
            onKeypressEscape: () => { },
            overlayClassName: "overlay-custom-class-name"
        });
    }

    const [perPage, setPerPage] = useState(10);
    const [size, setSize] = useState(perPage);
    const [current, setCurrent] = useState(1);

    const PerPageChange = (value) => {
        setSize(value);
        const newPerPage = Math.ceil(orders.length / value);
        if (current > newPerPage) {
            setCurrent(newPerPage);
        }
    }

    const getData = (current, pageSize) => {
        return orders.slice((current - 1) * pageSize, current * pageSize);
    };

    const PaginationChange = (page, pageSize) => {
        setCurrent(page);
        setSize(pageSize)
    }

    const PrevNextArrow = (current, type, originalElement) => {
        if (type === 'prev') {
            return <button><i className="fa fa-angle-double-left"></i></button>;
        }
        if (type === 'next') {
            return <button><i className="fa fa-angle-double-right"></i></button>;
        }
        return originalElement;
    }

    return (
        <>
            <div className="container-fluid mt-5 mb-5">
                {role === "admin" ?
                    <>
                        <div className="row justify-content-center">
                            <div className="col-md-10">
                                <div className="card">
                                    <div className="card-body p-0">

                                        <div className="table-filter-info">
                                            <h1>QUẢN LÍ ĐƠN HÀNG</h1>
                                            <div className="col-md-3 mb-2">
                                                <label>Trạng thái:</label>
                                                <select className="form-control" onChange={(e) => setStatus(e.target.value)}>
                                                    <option value="Tất cả">Tất cả</option>
                                                    <option value="Chờ xác nhận">Chờ xác nhận</option>
                                                    <option value="Đã xác nhận">Đã xác nhận</option>
                                                    <option value="Đang giao hàng">Đang giao hàng</option>
                                                    <option value="Đã giao hàng">Đã giao hàng</option>
                                                    <option value="Đã thanh toán">Đã thanh toán</option>
                                                    <option value="Hủy đơn">Hủy đơn</option>
                                                </select>
                                            </div>
                                            <Pagination
                                                className="pagination-data"
                                                showTotal={(total, range) => `Showing ${range[0]}-${range[1]} of ${total}`}
                                                onChange={PaginationChange}
                                                total={orders.length}
                                                current={current}
                                                pageSize={size}
                                                showSizeChanger={false}
                                                itemRender={PrevNextArrow}
                                                onShowSizeChange={PerPageChange}
                                            />
                                        </div>
                                        <div className="table-responsive">
                                            <table className="table table-text-small mb-0">
                                                <thead className="thead-primary table-sorting">
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Tên người mua</th>
                                                        <th>Ngày mua</th>
                                                        <th>Địa chỉ</th>
                                                        <th>Ghi chú</th>
                                                        <th>Trạng thái</th>
                                                        <th>Tổng tiền</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getData(current, size).map((order, index) => {
                                                        return (
                                                            <tr key={order.id}>
                                                                <td>{index + 1}</td>
                                                                <td>{order.receiver}</td>
                                                                <td>{formatDate(order.order_date)}</td>
                                                                <td>{order.address}</td>
                                                                <td>{order.note}</td>
                                                                <td>
                                                                    <select className="form-control" onChange={(e) => changeStatus(e, order.id, order.status)}>
                                                                        <option value="Chờ xác nhận" selected={order.status === 'Chờ xác nhận'}>Chờ xác nhận</option>
                                                                        <option value="Đã xác nhận" selected={order.status === 'Đã xác nhận'}>Đã xác nhận</option>
                                                                        <option value="Đang giao hàng" selected={order.status === 'Đang giao hàng'}>Đang giao hàng</option>
                                                                        <option value="Đã giao hàng" selected={order.status === 'Đã giao hàng'}>Đã giao hàng</option>
                                                                        <option value="Đã thanh toán" selected={order.status === 'Đã thanh toán'}>Đã thanh toán</option>
                                                                        <option value="Hủy đơn" selected={order.status === 'Hủy đơn'}>Hủy đơn</option>
                                                                    </select>
                                                                </td>
                                                                <td>{formattedPrice(order.total_price)}</td>
                                                                <td style={{ display: 'flex' }}>
                                                                    <button className="btn btn-success" onClick={() => handleShowDetail(order.id)}>Chi tiết</button>
                                                                    <button className="btn btn-danger ml-2" onClick={() => handleClickDelete(order.id)}>Xóa</button>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="table-filter-info">
                                            <Pagination
                                                className="pagination-data"
                                                showTotal={(total, range) => `Showing ${range[0]}-${range[1]} of ${total}`}
                                                onChange={PaginationChange}
                                                total={orders.length}
                                                current={current}
                                                pageSize={size}
                                                showSizeChanger={false}
                                                itemRender={PrevNextArrow}
                                                onShowSizeChange={PerPageChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                    : <h2>Không có quyền truy cập</h2>
                }
            </div>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header>
                    <Modal.Title>Chi tiết đơn hàng</Modal.Title>
                </Modal.Header>
                <Modal.Body><div dangerouslySetInnerHTML={{ __html: contentDetail }} /></Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );

}

export default ManageOrder;