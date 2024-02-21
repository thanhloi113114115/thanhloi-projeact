import React, { useState } from 'react'
import axios from 'axios';
import { API_URL } from '../../config';
import formattedPrice from '../common/formattedPrice';
import { notifyError, notifySucces } from "../common/toastify";

const ManageRevenue = () => {
    const [selectedType, setSelectedType] = useState('byPeriod');
    const [inputDate, setInputDate] = useState('');
    const [inputMonth, setInputMonth] = useState('');
    const [inputYear, setInputYear] = useState('');
    const [content, setContent] = useState('');
    const [salesData, setSalesData] = useState([]);
    const [selectedOption, setSelectedOption] = useState('Tất cả');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const showInputField = (value) => {
        setSelectedType(value);
        setContent('');
        setSalesData([]);
    };

    const revenueManagement = () => {
        let data;
        if (selectedType === 'byPeriod') {
            if (startDate.trim() !== '' && endDate.trim() !== '') {
                data = {
                    startDate: startDate,
                    endDate: endDate
                };
            }
        } else if (selectedType === 'byDate') {
            if (inputDate.trim() !== '') {
                data = {
                    date: inputDate,
                };
            }
        } else if (selectedType === 'byMonth') {
            if (inputMonth.trim() !== '') {
                const [year, month] = inputMonth.split('-');
                data = {
                    year,
                    month,
                };
            }
        } else if (selectedType === 'byYear') {
            if (inputYear.trim() !== '') {
                data = {
                    year: inputYear,
                };
            }
        }

        if (data) {
            axios.post(`${API_URL}/getRevenue`, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => {
                    if (response.data.revenue === '0 đồng') {
                        setContent('0 đồng');
                        setSalesData([]);
                    }
                    else {
                        setContent(response.data.revenue);
                        setSalesData(response.data.salesData);
                    }
                }).catch((e) => {
                    if(e.response.data.message){
                        notifyError(e.response.data.message);
                    }
                });
        } else {
            alert('Vui lòng chọn thời gian');
        }
    };

    const handleStartDateChange = (e) => {
        const newStartDate = e.target.value;
        if (newStartDate <= endDate || !endDate) {
            setStartDate(newStartDate);
        } else {
            alert('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
        }
    };

    const handleEndDateChange = (e) => {
        const newEndDate = e.target.value;
        if (newEndDate >= startDate || !startDate) {
            setEndDate(newEndDate);
        } else {
            alert('Ngày kết thúc phải lớn hơn ngày bắt đầu');
        }
    };

    const filterData = () => {
        switch (selectedOption) {
            case 'Top 1':
                return salesData.slice(0, 1);
            case 'Top 3':
                return salesData.slice(0, 3);
            case 'Top 5':
                return salesData.slice(0, 5);
            case 'Top 10':
                return salesData.slice(0, 10);
            default:
                return salesData;
        }
    };
    const filteredData = filterData();

    return (
        <div className='container mt-4'>
            <div className="col-md-3"></div>
            <div className="col-md-6">
                <div className="card">
                    <div className='card-header'>
                        <strong>QUẢN LÝ DOANH THU</strong>
                    </div>
                    <div className="card-body">
                        <div>
                            <label htmlFor="inputType">Chọn loại thống kê:</label>
                            <select
                                name="inputType"
                                id="inputType"
                                className="form-control"
                                onChange={(e) => showInputField(e.target.value)}
                                value={selectedType}
                            >
                                <option value="byPeriod">Theo khoảng thời gian</option>
                                <option value="byDate">Theo ngày</option>
                                <option value="byMonth">Theo tháng</option>
                                <option value="byYear">Theo năm</option>
                            </select>

                            <div id="divPeriod" style={{ display: selectedType === 'byPeriod' ? 'block' : 'none' }}>
                                <div>
                                    <label htmlFor="inputStartDate">Ngày bắt đầu:</label>
                                    <input
                                        type="date"
                                        name="inputStartDate"
                                        id="inputStartDate"
                                        className="form-control"
                                        value={startDate}
                                        onChange={handleStartDateChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="inputEndDate">Ngày kết thúc:</label>
                                    <input
                                        type="date"
                                        name="inputEndDate"
                                        id="inputEndDate"
                                        className="form-control"
                                        value={endDate}
                                        onChange={handleEndDateChange}
                                    />
                                </div>
                            </div>

                            <div id="divDate" style={{ display: selectedType === 'byDate' ? 'block' : 'none' }}>
                                <label htmlFor="inputDate">Ngày:</label>
                                <input
                                    type="date"
                                    name="inputDate"
                                    id="inputDate"
                                    className="form-control"
                                    value={inputDate}
                                    onChange={(e) => setInputDate(e.target.value)}
                                />
                            </div>

                            <div id="divMonth" style={{ display: selectedType === 'byMonth' ? 'block' : 'none' }}>
                                <label htmlFor="inputMonth">Tháng:</label>
                                <input
                                    type="month"
                                    name="inputMonth"
                                    id="inputMonth"
                                    className="form-control"
                                    value={inputMonth}
                                    onChange={(e) => setInputMonth(e.target.value)}
                                />
                            </div>

                            <div id="divYear" style={{ display: selectedType === 'byYear' ? 'block' : 'none' }}>
                                <label htmlFor="inputYear">Năm:</label>
                                <input
                                    type="number"
                                    name="inputYear"
                                    id="inputYear"
                                    min="1900"
                                    max="2099"
                                    className="form-control"
                                    value={inputYear}
                                    onChange={(e) => setInputYear(e.target.value)}
                                />
                            </div>

                            <button onClick={revenueManagement} type="button" id="btnSubmit" className="btn btn-primary mt-2">
                                Thống kê
                            </button>

                            {
                                content &&
                                <div id="result" className='mt-4'>
                                    Doanh thu: {content}
                                </div>
                            }
                            {
                                salesData.length !== 0 &&
                                <>
                                    <h3>Danh sách sản phẩm</h3>
                                    <select
                                        className='form-control mb-2'
                                        value={selectedOption}
                                        onChange={(e) => setSelectedOption(e.target.value)}
                                    >
                                        <option>Tất cả</option>
                                        <option>Top 1</option>
                                        <option>Top 3</option>
                                        <option>Top 5</option>
                                        <option>Top 10</option>
                                    </select>
                                    <div className="table-responsive">
                                        <table className="table table-text-small mb-0">
                                            <thead className="thead-primary table-sorting">
                                                <tr>
                                                    <th>#</th>
                                                    <th>Tên sản phẩm</th>
                                                    <th>Số lượng bán</th>
                                                    <th>Tổng tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    filteredData.map((data, index) => {
                                                        return (
                                                            <tr key={index}>
                                                                <td>{index + 1}</td>
                                                                <td>{data.productName}</td>
                                                                <td>{data.totalQuantity}</td>
                                                                <td>{formattedPrice(data.totalPrice)}</td>
                                                            </tr>
                                                        )
                                                    })
                                                }

                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-md-3"></div>
        </div>
    )
}

export default ManageRevenue
