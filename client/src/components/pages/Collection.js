import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../../config';
import axios from 'axios';
import { useParams } from "react-router";
import Pagination from "https://cdn.skypack.dev/rc-pagination@3.1.15";
import Image from '../common/image';
import formattedPrice from '../common/formattedPrice';
import { notifyError, notifySucces } from "../common/toastify";
import { Link } from 'react-router-dom';

function Collection() {
    let { name, category } = useParams();

    const [dataByCategory, setDataByCategory] = useState([]);
    useEffect(() => {
        if (category && name) {
            axios.get(`${API_URL}/products/${name}/manual/subcategories`)
                .then((response) => {
                    setDataByCategory(response.data);
                }).catch((e) => {
                    if (e.response) {
                        notifyError(e.response.data.message);
                    }
                });
        }
        else {
            axios.get(`${API_URL}/products/${name}/manual/categories`)
                .then((response) => {
                    setDataByCategory(response.data);
                }).catch((e) => {
                    if (e.response) {
                        notifyError(e.response.data.message);
                    }
                });
        }

    }, []);

    const [perPage, setPerPage] = useState(10);
    const [size, setSize] = useState(perPage);
    const [current, setCurrent] = useState(1);

    const PerPageChange = (value) => {
        setSize(value);
        const newPerPage = Math.ceil(dataByCategory.length / value);
        if (current > newPerPage) {
            setCurrent(newPerPage);
        }
    }

    const getData = (current, pageSize) => {
        return dataByCategory.slice((current - 1) * pageSize, current * pageSize);
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
            <div id="collection" className="collection-page">
                <div className="main-content">
                    <div className="breadcrumb-shop">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 pd5  ">
                                    <ol
                                        className="breadcrumb breadcrumb-arrows"
                                        itemScope=""
                                        itemType="http://schema.org/BreadcrumbList"
                                    >
                                        <li
                                            itemProp="itemListElement"
                                            itemScope=""
                                            itemType="http://schema.org/ListItem"
                                        >
                                            <Link to="/" target="_self" itemProp="item">
                                                <span itemProp="name">Trang chủ</span>
                                            </Link>
                                            <meta itemProp="position" content={1} />
                                        </li>
                                        {
                                            category &&
                                            <li
                                                itemProp="itemListElement"
                                                itemScope=""
                                                itemType="http://schema.org/ListItem"
                                            >
                                                <Link to={"/collection/" + category} target="_self" itemProp="item">
                                                    <span itemProp="name">{category}</span>
                                                </Link>
                                                <meta itemProp="position" content={1} />
                                            </li>
                                        }
                                        <li
                                            className="active"
                                            itemProp="itemListElement"
                                            itemScope=""
                                            itemType="http://schema.org/ListItem"
                                        >
                                            <span
                                                itemProp="item"
                                            >
                                                <span itemProp="name">{name}</span>
                                            </span>
                                            <meta itemProp="position" content={3} />
                                        </li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="listing-collection-body">
                        <div className="container">
                            <div className="">
                                {dataByCategory.length > 0 ?
                                    <div id="collection-body" className="wrap-collection-body clearfix">
                                        <div className="col-md-12 col-sm-12 col-xs-12">
                                            <div className="wrap-collection-title">
                                                <div className="heading-collection row">
                                                    <div className="col-md-8 col-sm-12 col-xs-12">
                                                        <h1 className="title">{name}</h1>
                                                        <div className="alert-no-filter" />
                                                    </div>
                                                    <div className="col-md-4 hidden-sm hidden-xs">
                                                        <div className="option browse-tags">
                                                            <label className="lb-filter hide">Sắp xếp theo:</label>
                                                            <span className="custom-dropdown custom-dropdown--grey">
                                                                <select className="sort-by custom-dropdown__select" onChange={(e) => {
                                                                    if (category && name) {
                                                                        axios.get(`${API_URL}/products/${name}/${e.target.value}/subcategories`)
                                                                            .then((response) => {
                                                                                setDataByCategory(response.data);
                                                                            }).catch((e) => {
                                                                                if (e.response) {
                                                                                    notifyError(e.response.data.message);
                                                                                }
                                                                            });
                                                                    }
                                                                    else {
                                                                        axios.get(`${API_URL}/products/${name}/${e.target.value}/categories`)
                                                                            .then((response) => {
                                                                                setDataByCategory(response.data);
                                                                            }).catch((e) => {
                                                                                if (e.response) {
                                                                                    notifyError(e.response.data.message);
                                                                                }
                                                                            });
                                                                    }
                                                                }}>
                                                                    <option value="manual">Sản phẩm mới nhất</option>
                                                                    <option value="price-ascending">Giá: Tăng dần</option>
                                                                    <option value="price-descending">Giá: Giảm dần</option>
                                                                    <option value="title-ascending">Tên: A-Z</option>
                                                                    <option value="title-descending">Tên: Z-A</option>
                                                                </select>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="">
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
                                            </div>
                                        </div>
                                    </div>
                                    : <h2>Không có sản phẩm nào thuộc danh mục {name}</h2>
                                }
                            </div>
                            {dataByCategory.length > 0 &&
                                <div className="table-filter-info">
                                    <Pagination
                                        className="pagination-data"
                                        showTotal={(total, range) => `Showing ${range[0]}-${range[1]} of ${total}`}
                                        onChange={PaginationChange}
                                        total={dataByCategory.length}
                                        current={current}
                                        pageSize={size}
                                        showSizeChanger={false}
                                        itemRender={PrevNextArrow}
                                        onShowSizeChange={PerPageChange}
                                    />
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </main>

    );
}

export default Collection;