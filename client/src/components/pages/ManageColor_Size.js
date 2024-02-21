import React, { useState, useRef, useEffect } from "react";
import '../../App.css';
import { API_URL } from '../../config';
import axios from 'axios';
import Pagination from "https://cdn.skypack.dev/rc-pagination@3.1.15";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { notifyError, notifySucces } from "../common/toastify";

function ManageColor_Size() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const role = localStorage.getItem('role');
    if (!isLoggedIn && role !== "admin") {
        window.location.href = '/';
    }
    const [isVisible, setVisible] = useState(false);
    const [idItem, setIdItem] = useState(0);
    const [isReload, setIsReload] = useState(false);
    const nameRef = useRef(null);

    const [datas, setDatas] = useState([]);

    const [selectedOption, setSelectedOption] = useState('color');

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };
    useEffect(() => {
        const fetchData = async () => {
            try {
                const endpoint = `${API_URL}/${selectedOption}s`;
                const response = await axios.get(endpoint);
                setDatas(response.data);
            } catch (e) {
                setDatas([]);
                if (e.response) {
                    notifyError(e.response.data.message);
                }
            }
        };

        fetchData();
    }, [isReload, selectedOption]);

    const fetchData = async (id, url, errorMessage) => {
        try {
            const response = await axios.get(url);

            if (response.status === 200) {
                setVisible(true);
                setTimeout(() => {
                    nameRef.current.value = selectedOption === 'color' ? response.data.color_name : response.data.size_name;
                });

                setIdItem(id);
            } else {
                notifyError(errorMessage);
            }
        } catch (e) {
            if (e.response) {
                notifyError(e.response.data.message);
            }
        }
    };

    const handleClickEdit = async (id) => {
        const url = selectedOption === 'color' ? `${API_URL}/colors/${id}` : `${API_URL}/sizes/${id}`;
        const errorMessage = selectedOption === 'color' ? 'Lỗi khi lấy thông tin màu sắc' : 'Lỗi khi lấy thông tin kích thước';

        await fetchData(id, url, errorMessage);
    };

    const handleClickDelete = async (id) => {
        confirmAlert({
            title: "Xác nhận xóa",
            message: "Bạn muốn xóa dữ liệu?",
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
            let endpoint;
            let successMessage;

            if (selectedOption === 'color') {
                endpoint = `${API_URL}/colors/${id}`;
                successMessage = 'màu sắc';
            } else {
                endpoint = `${API_URL}/sizes/${id}`;
                successMessage = 'kích thước';
            }

            const response = await axios.delete(endpoint);

            if (response.status === 200) {
                notifySucces(`Xóa dữ liệu ${successMessage} thành công`);
                setIsReload(!isReload);
            } else {
                notifyError(`Lỗi khi xóa ${successMessage}`);
            }
        } catch (e) {
            if (e.response) {
                notifyError(e.response.data.message);
            }
        }
    };

    const handleCancelDelete = () => {
    };

    const clickSetVisible = () => {
        setIdItem(0);
        setVisible(!isVisible);
    }

    const clickBtnAdd_Edit = () => {
        const name = nameRef.current.value;

        if (!name) {
            notifyError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        const updatedInfo = {
            name: name
        };

        let endpoint;

        if (selectedOption === 'color') {
            endpoint = `${API_URL}/colors`;
        } else {
            endpoint = `${API_URL}/sizes`;
        }

        if (idItem === 0) {
            axios.post(endpoint, updatedInfo)
                .then((response) => {
                    if (response.status === 201) {
                        clickSetVisible();
                        notifySucces('Thêm mới dữ liệu thành công');
                        setIsReload(!isReload);
                    } else {
                        notifyError('Lỗi khi thêm mới dữ liệu');
                    }
                }).catch((e) => {
                    if (e.response) {
                        notifyError(e.response.data.message);
                    }
                });

        }
        else {
            axios.put(`${endpoint}/${idItem}`, updatedInfo).then((response) => {
                if (response.status === 200) {
                    clickSetVisible();
                    notifySucces(`Cập nhật dữ liệu thành công`);
                    setIsReload(!isReload);
                } else {
                    notifyError('Lỗi khi cập nhật dữ liệu');
                }
            }).catch((e) => {
                if (e.response) {
                    notifyError(e.response.data.message);
                }
            });
            setIdItem(0);
        }
    };

    const [perPage, setPerPage] = useState(10);
    const [size, setSize] = useState(perPage);
    const [current, setCurrent] = useState(1);

    const PerPageChange = (value) => {
        setSize(value);
        const newPerPage = Math.ceil(datas.length / value);
        if (current > newPerPage) {
            setCurrent(newPerPage);
        }
    }

    const getData = (current, pageSize) => {
        return datas.slice((current - 1) * pageSize, current * pageSize);
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
                                            <h1>QUẢN LÍ MÀU SẮC - KÍCH THƯỚC</h1>

                                            {isVisible ? (
                                                <>
                                                    <div className="mt-3 row">
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Tên <b style={{ color: "red" }}>*</b></label>
                                                                <input type="text" className="form-control" ref={nameRef} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            ) :
                                                <button type="button" className="btn btn-outline-primary" onClick={clickSetVisible}>Thêm mới</button>
                                            }
                                            {isVisible && <div className="form-group">
                                                <button type="button" className="btn btn-outline-success mr-3" onClick={clickBtnAdd_Edit}>Thực thi</button>
                                                <button type="button" className="btn btn-outline-warning" onClick={clickSetVisible}>Hủy</button>
                                            </div>}
                                            <br />
                                            <label>
                                                <input
                                                    type="radio"
                                                    value="color"
                                                    checked={selectedOption === 'color'}
                                                    onChange={handleOptionChange}
                                                />
                                                Màu sắc
                                            </label>

                                            <label className="ml-2">
                                                <input
                                                    type="radio"
                                                    value="size"
                                                    checked={selectedOption === 'size'}
                                                    onChange={handleOptionChange}
                                                />
                                                Kích thước
                                            </label>

                                            <Pagination
                                                className="pagination-data"
                                                showTotal={(total, range) => `Showing ${range[0]}-${range[1]} of ${total}`}
                                                onChange={PaginationChange}
                                                total={datas.length}
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
                                                        <th>Tên</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        getData(current, size).map((data, index) => {
                                                            return (
                                                                <tr key={data.id}>
                                                                    <td>{index + 1}</td>
                                                                    {
                                                                        selectedOption === 'color' ?
                                                                            <td>{data.color_name}</td>
                                                                            :
                                                                            <td>{data.size_name}</td>

                                                                    }
                                                                    <td style={{ display: 'flex' }}>
                                                                        <button className="btn btn-warning" onClick={() => handleClickEdit(data.id)}>Sửa</button>
                                                                        <button className="btn btn-danger ml-2" onClick={() => handleClickDelete(data.id)}>Xóa</button>
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
                                                total={datas.length}
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
        </>
    );

}

export default ManageColor_Size;