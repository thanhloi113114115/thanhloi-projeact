import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import axios from 'axios';
import { useParams } from "react-router";
import Pagination from "https://cdn.skypack.dev/rc-pagination@3.1.15";
import { ToastContainer } from 'react-toastify';
import formattedPrice from '../common/formattedPrice';
import { notifyError, notifySucces } from "../common/toastify";
import Image from '../common/image';
import { Link } from 'react-router-dom';

function Favorite() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const user_id = localStorage.getItem('user_id');
    if (!isLoggedIn) {
        window.location.href = '/';
    }

    const [datas, setDatas] = useState([]);
    useEffect(() => {
        axios.get(`${API_URL}/favorites/${user_id}`)
            .then((response) => {
                if (response.status == 200) {
                    setDatas(response.data);
                }
            }).catch((e) => {
                if (e.response) {
                    notifyError(e.response.data.message);
                }
            });
    }, []);

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
        <main className="mainContent-theme ">
            <div className="searchPage" id="layout-search">
                <div className="container">
                    <div className="row pd-page">
                        <div className="col-md-12 col-xs-12">
                            <div className="heading-page">
                                <h1>Sản phẩm yêu thích</h1>
                                <p className="subtxt">
                                    Có <span>{datas.length} sản phẩm yêu thích</span>
                                </p>
                            </div>
                            <div className="wrapbox-content-page">
                                <div className="content-page" id="search">
                                    <div className="results content-product-list ">
                                        <div className="content-product-list product-list filter clearfix row">
                                            {
                                                getData(current, size).map((product, index) => (
                                                    <div key={product.id} className="pro-loop animated fadeIn col-md-3">
                                                        <div className="product-block" data-anmation={index + 1}>
                                                            <div className="product-img fade-box">
                                                                <Link to={'/detail/' + product.id}
                                                                    title={product.name}
                                                                    className="image-resize"
                                                                >
                                                                    <picture>
                                                                        <Image imagePath={product.url_image1} className='lazyload' />
                                                                    </picture>
                                                                    <picture>
                                                                        <Image imagePath={product.url_image2} className='lazyload' />
                                                                    </picture>
                                                                </Link>
                                                                <div className="button-add">
                                                                    <button
                                                                        title="Xem chi tiết"
                                                                        className="action"
                                                                    >
                                                                        <Link to={"/detail/" + product.id} style={{ color: 'white' }}>
                                                                            Xem chi tiết
                                                                        </Link>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="product-detail clearfix">
                                                                <div className="box-pro-detail">
                                                                    <h3 className="pro-name">
                                                                        <Link to={`/detail/${product.id}`}
                                                                            title={product.name}
                                                                        >
                                                                            {product.name}
                                                                        </Link>
                                                                    </h3>
                                                                    <div className="box-pro-prices">
                                                                        <p className="pro-price ">{formattedPrice(product.price)}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                        {
                                            datas.length > 0 ?
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
                                                : <p>Không có sản phẩm yêu thích</p>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </main>

    );
}

export default Favorite;