import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { ToastContainer } from 'react-toastify';
import Image from '../common/image';
import formattedPrice from '../common/formattedPrice';
import { notifyError, notifySucces } from "../common/toastify";
import { Link } from 'react-router-dom';

function Home() {
    const [listProduct, setListProduct] = useState([]);

    useEffect(() => {
        axios.get(`${API_URL}/products`)
            .then(response => {
                const data = response.data;
                const sortedProducts = data.sort((a, b) => b.id - a.id);

                // Lấy ra 8 sản phẩm đầu tiên
                const top8Products = sortedProducts.slice(0, 8);
                setListProduct(top8Products);
            }).catch((e) => {
                if (e.response) {
                    notifyError(e.response.data.message);
                }
            });
    }, []);

    return (
        <>
            <main className="mainContent-theme  mainContent-index">
                {/* 1. Slide */}
                <section className="section-slider">
                    <div className="sliderBanner" id="home-slider">
                        <div className="slider-owl owl-carousel owl-theme">
                            {/* Banener 1 */}
                            <div className="slider-item">
                                <div className="slide--image">
                                    <a style={{ cursor: "pointer" }} title="">
                                        <picture>
                                            <source media="(max-width: 600px)" srcSet="" />
                                            <source
                                                media="(min-width: 601px)"
                                                srcSet="https://images.unsplash.com/photo-1515355758951-b4b20ba84c1e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8NXxIZG9xLVJ2MDBCUXx8ZW58MHx8fHx8"
                                            />
                                            <img
                                                src="https://images.unsplash.com/photo-1515355758951-b4b20ba84c1e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8NXxIZG9xLVJ2MDBCUXx8ZW58MHx8fHx8"
                                                alt=""
                                            />
                                        </picture>
                                    </a>
                                </div>
                                <div className="slide--content">
                                    <div className="group-button"></div>
                                </div>
                            </div>
                            <div className="slider-item fade-box">
                                <div className="slide--image">
                                    <a style={{ cursor: "pointer" }} title="">
                                        <picture>
                                            <source media="(max-width: 600px)" data-srcset="" />
                                            <source
                                                media="(min-width: 601px)"
                                                data-srcset="https://images.unsplash.com/photo-1599117573949-63e225331c7b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8NnxIZG9xLVJ2MDBCUXx8ZW58MHx8fHx8"
                                            />
                                            <img
                                                data-src="https://images.unsplash.com/photo-1599117573949-63e225331c7b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8NnxIZG9xLVJ2MDBCUXx8ZW58MHx8fHx8"
                                                className="lazyload"
                                                alt=""
                                            />
                                        </picture>
                                    </a>
                                </div>
                                <div className="slide--content">
                                    <div className="group-button"></div>
                                </div>
                            </div>
                            <div className="slider-item fade-box">
                                <div className="slide--image">
                                    <a style={{ cursor: "pointer" }} title="">
                                        <picture>
                                            <source media="(max-width: 600px)" data-srcset="" />
                                            <source
                                                media="(min-width: 601px)"
                                                data-srcset="https://images.unsplash.com/photo-1545934507-f92bae3d18b7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MTB8MzczMTkzNXx8ZW58MHx8fHx8"
                                            />
                                            <img
                                                data-src="https://images.unsplash.com/photo-1545934507-f92bae3d18b7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MTB8MzczMTkzNXx8ZW58MHx8fHx8"
                                                className="lazyload"
                                                alt=""
                                            />
                                        </picture>
                                    </a>
                                </div>
                                <div className="slide--content">
                                    <div className="group-button"></div>
                                </div>
                            </div>
                            <div className="slider-item fade-box">
                                <div className="slide--image">
                                    <a style={{ cursor: "pointer" }} title="">
                                        <picture>
                                            <source media="(max-width: 600px)" data-srcset="" />
                                            <source
                                                media="(min-width: 601px)"
                                                data-srcset="https://images.unsplash.com/photo-1552346154-7841f684d259?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8OXwzNzMxOTM1fHxlbnwwfHx8fHw%3D"
                                            />
                                            <img
                                                data-src="https://images.unsplash.com/photo-1552346154-7841f684d259?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8OXwzNzMxOTM1fHxlbnwwfHx8fHw%3D"
                                                className="lazyload"
                                                alt=""
                                            />
                                        </picture>
                                    </a>
                                </div>
                                <div className="slide--content">
                                    <div className="group-button"></div>
                                </div>
                            </div>
                        </div>
                        <div className="slider-circle-scroll">
                            <a className="scroll-downs" href="">
                                <svg role="presentation" viewBox="0 0 21 11">
                                    <polyline
                                        fill="none"
                                        stroke="currentColor"
                                        points="0.5 0.5 10.5 10.5 20.5 0.5"
                                        strokeWidth="1.25"
                                    />
                                </svg>
                            </a>
                        </div>
                    </div>
                </section>
                <div className="hrv-pmo-coupon" data-hrvpmo-layout="grids" />
                <div className="hrv-pmo-discount" data-hrvpmo-layout="grids" />
                {/* 2. Nhom tabs collection */}
                <section className="section wrapper-hometabs-collection">
                    <div className="container">
                        <div className="wrapper-heading-home">
                            <h1>SẢN PHẨM MỚI</h1>
                        </div>
                        <div className="tab-content tabs-products">
                            <div className="tab-item active" id="tab1" data-get="true">
                                <div className="listProduct-carousel--overflow">
                                    <div className="product-lists row">
                                        {listProduct.map((product, index) => (
                                            <div key={product.id} className="pro-loop animated fadeIn col-md-3">
                                                <div className="product-block" data-anmation={index + 1}>
                                                    <div className="product-img fade-box">
                                                        <Link to={'/detail/' + product.id}
                                                            title={product.product_name}
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
                                                                    title={product.product_name}
                                                                >
                                                                    {product.product_name}
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
                    </div>
                </section>
                {/* 3. Nhóm san phẩm 1 */}
                {/* 4. Nhóm banner */}
                <section className="section no-border wrapper-home-banner">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-xs-12 col-sm-4 home-banner-pd">
                                <figure className="block-banner-category">
                                    <a
                                        className="link-banner"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="fg-image fade-box">
                                            <picture>
                                                <source
                                                    data-srcset="https://images.unsplash.com/photo-1536129808005-fae894214c73?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8M3xIZG9xLVJ2MDBCUXx8ZW58MHx8fHx8"
                                                    media="(max-width: 500px)"
                                                />
                                                <source data-srcset="https://images.unsplash.com/photo-1536129808005-fae894214c73?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8M3xIZG9xLVJ2MDBCUXx8ZW58MHx8fHx8" />
                                                <img
                                                    data-src="https://images.unsplash.com/photo-1536129808005-fae894214c73?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8M3xIZG9xLVJ2MDBCUXx8ZW58MHx8fHx8"
                                                    className="lazyload"
                                                    alt=""
                                                />
                                            </picture>
                                        </div>
                                        <figcaption className="caption_banner site-animation">
                                            <p />
                                            <h2 />
                                        </figcaption>
                                    </a>
                                </figure>
                            </div>
                            <div className="col-xs-12 col-sm-4 home-banner-pd">
                                <figure className="block-banner-category">
                                    <a
                                        className="link-banner "
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="fg-image fade-box">
                                            <picture>
                                                <source
                                                    data-srcset="https://images.unsplash.com/photo-1521093470119-a3acdc43374a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8M3w1OTM5MDgyMHx8ZW58MHx8fHx8"
                                                    media="(max-width: 500px)"
                                                />
                                                <source data-srcset="https://images.unsplash.com/photo-1521093470119-a3acdc43374a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8M3w1OTM5MDgyMHx8ZW58MHx8fHx8" />
                                                <img
                                                    data-src="https://images.unsplash.com/photo-1521093470119-a3acdc43374a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8M3w1OTM5MDgyMHx8ZW58MHx8fHx8"
                                                    className="lazyload"
                                                    alt=""
                                                />
                                            </picture>
                                        </div>
                                        <figcaption className="caption_banner site-animation">
                                            <p />
                                            <h2 />
                                        </figcaption>
                                    </a>
                                </figure>
                            </div>
                            <div className="col-xs-12 col-sm-4 home-banner-pd">
                                <figure className="block-banner-category">
                                    <a
                                        className="link-banner "
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="fg-image fade-box">
                                            <picture>
                                                <source
                                                    data-srcset="https://images.unsplash.com/photo-1500468756762-a401b6f17b46?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXxIZG9xLVJ2MDBCUXx8ZW58MHx8fHx8"
                                                    media="(max-width: 500px)"
                                                />
                                                <source data-srcset="https://images.unsplash.com/photo-1500468756762-a401b6f17b46?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXxIZG9xLVJ2MDBCUXx8ZW58MHx8fHx8" />
                                                <img
                                                    data-src="https://images.unsplash.com/photo-1500468756762-a401b6f17b46?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXxIZG9xLVJ2MDBCUXx8ZW58MHx8fHx8"
                                                    className="lazyload"
                                                    alt=""
                                                />
                                            </picture>
                                        </div>
                                        <figcaption className="caption_banner site-animation">
                                            <p />
                                            <h2 />
                                        </figcaption>
                                    </a>
                                </figure>
                            </div>
                        </div>
                    </div>
                </section>
                {/* 5. Nhóm san phẩm 1 */}
                {/* 6. Nhóm san phẩm 3 */}
                {/* Blog */}
            </main>
            <ToastContainer />

        </>
    );
}

export default Home;