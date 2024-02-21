import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import axios from 'axios';
import { useParams } from "react-router";
import Pagination from "https://cdn.skypack.dev/rc-pagination@3.1.15";
import Image from '../common/image';
import formattedPrice from '../common/formattedPrice';
import { notifyError, notifySucces } from "../common/toastify";
import { Link } from 'react-router-dom';

function Search() {
    let { keyword } = useParams();

    const [dataSearch, setDataSearch] = useState([]);
    useEffect(() => {
        axios.get(`${API_URL}/search/${keyword}`)
            .then((response) => {
                setDataSearch(response.data);
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
        const newPerPage = Math.ceil(dataSearch.length / value);
        if (current > newPerPage) {
            setCurrent(newPerPage);
        }
    }

    const getData = (current, pageSize) => {
        return dataSearch.slice((current - 1) * pageSize, current * pageSize);
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
                                <h1>Tìm kiếm</h1>
                                <p className="subtxt">
                                    Có <span>{dataSearch.length} sản phẩm</span> cho tìm kiếm
                                </p>
                            </div>
                            <div className="wrapbox-content-page">
                                <div className="content-page" id="search">
                                    <p className="subtext-result">
                                        {" "}
                                        Kết quả tìm kiếm cho <strong>"{keyword}"</strong>.{" "}
                                    </p>
                                    <div className="results content-product-list ">
                                        <div className=" search-list-results row">
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
                                            dataSearch.length > 0 ?
                                                <div className="table-filter-info">
                                                    <Pagination
                                                        className="pagination-data"
                                                        showTotal={(total, range) => `Showing ${range[0]}-${range[1]} of ${total}`}
                                                        onChange={PaginationChange}
                                                        total={dataSearch.length}
                                                        current={current}
                                                        pageSize={size}
                                                        showSizeChanger={false}
                                                        itemRender={PrevNextArrow}
                                                        onShowSizeChange={PerPageChange}
                                                    />
                                                </div>
                                                : <p>Không có kết quả phù hợp</p>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

    );
}

export default Search;