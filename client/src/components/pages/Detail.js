import React, { useRef, useState, useEffect } from 'react';
import { useParams } from "react-router";
import { API_URL } from '../../config';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import { useCart } from '../Cart/CartContext';
import ReviewAndRatingComponent from '../common/ReviewAndRatingComponent';
import Heart from "react-animated-heart";
import Image from '../common/image';
import formatDate from '../common/formatDate';
import formattedPrice from '../common/formattedPrice';
import { notifyError, notifySucces } from "../common/toastify";
import { Link } from 'react-router-dom';

function Detail() {
    const user_id = localStorage.getItem('user_id');
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    const { productsCount, updateToCart } = useCart();

    const [comments, setComments] = useState([]);
    const [product, setProduct] = useState({});
    const [images, setImages] = useState([]);
    const [listProduct, setListProduct] = useState([]);
    const [productSizeColor, setProductSizeColor] = useState([]);
    const contentRef = useRef(null);
    const sizeRef = new useRef(null);
    const [checkUserHasPurchased, setCheckUserHasPurchased] = useState(false);

    const [isClick, setClick] = useState(false);

    let { id } = useParams();
    useEffect(() => {
        axios.get(`${API_URL}/products/${id}`)
            .then(response => {
                const data = response.data;

                setProduct(data);

                axios.get(`${API_URL}/products/${data.subcategory_name}/manual/subcategories`)
                    .then(response => {
                        const filteredData = response.data.filter(item => item.id !== id);

                        setListProduct(filteredData);
                    }).catch((e) => {
                        if (e.response) {
                            notifyError(e.response.data.message);
                        }
                    });
            }).catch((e) => {
                if (e.response) {
                    notifyError(e.response.data.message);
                }
            });
        axios.get(`${API_URL}/imagesByProductId/${id}`)
            .then(response => { setImages(response.data); })
            .catch((e) => {
                if (e.response) {
                    notifyError(e.response.data.message);
                }
            });
        axios.get(`${API_URL}/size_colorByProductId/${id}`)
            .then((response) => {
                if (response.status === 200) {
                    setProductSizeColor(response.data);
                }
            }).catch((e) => {
                if (e.response) {
                    notifyError(e.response.data.message);
                }
            });
        setTimeout(() => {
            if (user_id != null) {
                axios.get(`${API_URL}/checkUserHasPurchased/${user_id}/${id}`)
                    .then(response => {
                        if (response.data.message == 'Success') {
                            setCheckUserHasPurchased(true);
                        }
                    }).catch((e) => {
                        if (e.response) {
                            notifyError(e.response.data.message);
                        }
                    });
                axios.get(`${API_URL}/isProductFavorite/${user_id}/${id}`)
                    .then(response => {
                        if (response.data.message == 'Success') {
                            setClick(true);
                        }
                    }).catch((e) => {
                        if (e.response) {
                            notifyError(e.response.data.message);
                        }
                    });
            }
        }, 100);
    }, []);

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const addToCart = () => {
        const sizeR = sizeRef.current.value;
        const colorMatch = sizeR.match(/Màu: (\S+)/);
        const sizeMatch = sizeR.match(/Kích thước: (\S+)/);

        const color = colorMatch[1];
        var size = sizeMatch[1];

        if (size === "NO") {
            size = "NO SIZE";
        }

        const foundProduct = productSizeColor.find(item => item.size_name === size && item.color_name === color);
        
        if (!isLoggedIn) {
            notifyError("Vui lòng đăng nhập trước khi mua hàng");
            return;
        }
        const name = product.product_name;
        const product_id = product.id;
        const image = product.url_image1;
        const price = product.price;

        const existingItem = cart.find(item => item.name === name && item.size === sizeR);

        if (existingItem) {
            var n = parseInt(existingItem.qty) + parseInt(quantity);
            axios.put(`${API_URL}/updateCart/${existingItem.id}`, { quantity: n }).then((response) => {
                if (response.status === 200) {
                    existingItem.qty = n;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    const storedCount = localStorage.getItem('count');
                    const parsedCount = parseInt(storedCount, 10);

                    if (!isNaN(parsedCount)) {
                        localStorage.setItem('count', parsedCount + quantity);
                    } else {
                        localStorage.setItem('count', quantity);
                    }
                    updateToCart();
                    notifySucces('Cập nhật giỏ hàng thành công');
                } else {
                    notifyError('Lỗi khi cập nhật giỏ hàng');
                }
            }).catch((e) => {
                notifyError('Lỗi khi cập nhật giỏ hàng');
            });
        } else {
            const newData = {
                user_id: user_id,
                image: image,
                product_id: product_id,
                name: name,
                price: price,
                qty: quantity,
                size: sizeR,
                size_color: foundProduct.id
            };

            axios.post(`${API_URL}/addCart`, newData).then((response) => {
                if (response.status === 201) {

                    cart.push({
                        id: response.data.cartId, ...newData
                    });
                    localStorage.setItem('cart', JSON.stringify(cart));

                    const storedCount = localStorage.getItem('count');
                    const parsedCount = parseInt(storedCount, 10);

                    if (!isNaN(parsedCount)) {
                        localStorage.setItem('count', parsedCount + quantity);
                    } else {
                        localStorage.setItem('count', quantity);
                    }
                    updateToCart();
                    notifySucces('Thêm sản phẩm vào giỏ hàng thành công');
                } else {
                    notifyError('Lỗi khi thêm sản phẩm vào giỏ hàng');
                }
            }).catch((e) => {
                notifyError('Lỗi khi thêm sản phẩm vào giỏ hàng');
            });
        }

    }

    const [quantity, setQuantity] = useState(1);

    const handleIncreaseQuantity = () => {
        setQuantity(quantity + 1);
    };

    const handleDecreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const [isReload, setIsReload] = useState(false);

    useEffect(() => {
        axios.get(`${API_URL}/ratingByProductId/${id}`)
            .then(response => {
                if (response.data.message != 'Null') {
                    setComments(response.data)
                }
            }).catch((e) => {
                if (e.response) {
                    notifyError(e.response.data.message);
                }
            });
    }, [isReload]);

    const handleComment = (rate, message) => {
        const currentTime = new Date();
        const newData = {
            product_id: id,
            user_id: user_id,
            rating: rate,
            comment: message,
            created_at: currentTime
        };

        axios.post(`${API_URL}/ratings`, newData)
            .then(response => {
                setIsReload(!isReload);
                document.querySelector('.rating-component').style.display = 'none';
                document.querySelector('.feedback-tags').style.display = 'none';
                document.querySelector('.button-box').style.display = 'none';
                document.querySelector('.submited-box').style.display = 'block';
                document.querySelector('.submited-box .loader').style.display = 'block';

                setTimeout(() => {
                    document.querySelector('.submited-box .loader').style.display = 'none';
                    document.querySelector('.submited-box .success-message').style.display = 'block';
                }, 1500);
                notifySucces("Đánh giá thành công!");
            }).catch((e) => {
                if (e.response) {
                    notifyError(e.response.data.message);
                }
            });
    };

    const handleClickFavorite = () => {
        if (isClick) {
            axios.delete(`${API_URL}/favorites/${user_id}/${id}`)
                .then(response => {
                    if (response.status == 200) {
                        setClick(false);
                    }
                }).catch((e) => {
                    if (e.response) {
                        notifyError(e.response.data.message);
                    }
                });
        }
        else {
            const currentTime = new Date();
            const newData = {
                product_id: id,
                user_id: user_id,
                created_at: currentTime
            };

            axios.post(`${API_URL}/favorites`, newData)
                .then(response => {
                    if (response.status == 201) {
                        setClick(true);
                    }
                }).catch((e) => {
                    if (e.response) {
                        notifyError(e.response.data.message);
                    }
                });
        }
    }

    return (
        <main className="mainContent-theme ">
            <div id="product" className="productDetail-page">
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
                                    <li
                                        itemProp="itemListElement"
                                        itemScope=""
                                        itemType="http://schema.org/ListItem"
                                    >
                                        <Link to={"/collection/" + product.category_name}
                                            target="_self"
                                            itemProp="item"
                                        >
                                            <span itemProp="name">{product.category_name}</span>
                                        </Link>
                                        <meta itemProp="position" content={2} />
                                    </li>
                                    <li
                                        itemProp="itemListElement"
                                        itemScope=""
                                        itemType="http://schema.org/ListItem"
                                    >
                                        <Link to={"/collection/" + product.category_name + "/" + product.subcategory_name}
                                            target="_self"
                                            itemProp="item"
                                        >
                                            <span itemProp="name">{product.subcategory_name}</span>
                                        </Link>
                                        <meta itemProp="position" content={3} />
                                    </li>
                                    <li
                                        className="active"
                                        itemProp="itemListElement"
                                        itemScope=""
                                        itemType="http://schema.org/ListItem"
                                    >
                                        <span
                                            itemProp="item"
                                        >
                                            <span itemProp="name">
                                                {product.product_name}
                                            </span>
                                        </span>
                                        <meta itemProp="position" content={4} />
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container">
                    <div className="row product-detail-wrapper">
                        <div className="col-md-12 col-sm-12 col-xs-12">
                            <div className="row product-detail-main pr_style_01">
                                <div className="col-md-7 col-sm-12 col-xs-12">
                                    <div className="product-gallery">
                                        <div className="product-image-detail box__product-gallery scroll">
                                            <ul
                                                id="sliderproduct"
                                                className="site-box-content 2 slide_product"
                                            >
                                                {images.map(image => (
                                                    <li className="product-gallery-item gallery-item" key={image.id}>
                                                        <Image imagePath={image.image_url} className="product-image-feature" />
                                                    </li>
                                                ))}
                                                <li className="product-gallery-item gallery-item" ref={contentRef}>
                                                    <img
                                                        className="product-image-feature"
                                                        src="https://giaycaosmartmen.com/wp-content/uploads/2020/09/bang-size-giay-Fila.png"
                                                        alt={product.product_name}
                                                    />
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="col-md-5 col-sm-12 col-xs-12"
                                    id="detail-product"
                                >
                                    {
                                        user_id !== null && <Heart isClick={isClick} onClick={() => handleClickFavorite()} />
                                    }

                                    <div className="product-title">
                                        <h1>{product.product_name}</h1>
                                        <span id="pro_sku">
                                            <strong>SKU:</strong> ATN0146MMDE
                                        </span>
                                    </div>

                                    <div className="product-price" id="price-preview">
                                        <span className="pro-price">{formattedPrice(product.price)}</span>
                                    </div>
                                    <div className="clearfix">
                                        <select className='form-control' ref={sizeRef}>
                                            {productSizeColor.map(size => (
                                                <option key={size.id}>Màu: {size.color_name} / Kích thước: {size.size_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="select-swatch clearfix">
                                        <div
                                            id="variant-swatch-0"
                                            className="swatch clearfix swarch-size"
                                            data-option="option1"
                                            data-option-index={0}
                                        >
                                            <a
                                                className="pull-right"
                                                style={{ margin: "10px 25px", cursor: "pointer" }}
                                                onClick={() => {
                                                    contentRef.current.scrollIntoView({ behavior: 'smooth' })
                                                }}
                                            >
                                                CÁCH CHỌN SIZE
                                            </a>
                                        </div>
                                    </div>
                                    <div className="selector-actions">
                                        <div className="quantity-area clearfix">
                                            <input
                                                type="button"
                                                defaultValue="-"
                                                className="qty-btn"
                                                onClick={handleDecreaseQuantity}
                                            />
                                            <input
                                                value={quantity}
                                                type="text"
                                                id="quantity"
                                                name="quantity"
                                                min={1}
                                                className="quantity-selector"
                                            />
                                            <input
                                                type="button"
                                                defaultValue="+"
                                                className="qty-btn"
                                                onClick={handleIncreaseQuantity}
                                            />
                                        </div>
                                        <div className="wrap-addcart clearfix">
                                            <div className="row-flex">
                                                <button
                                                    type="button"
                                                    id="add-to-cart"
                                                    className=" add-to-cartProduct button btn-addtocart addtocart-modal "
                                                    name="add"
                                                    onClick={addToCart}
                                                >
                                                    <span> Thêm vào giỏ </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="product-action-bottom visible-xs">
                                        <button
                                            type="button"
                                            id="add-to-cartbottom"
                                            className=" add-to-cartProduct add-cart-bottom button dark addtocart-modal"
                                            name="add"
                                        >
                                            <span> Thêm vào giỏ </span>
                                        </button>
                                    </div>
                                    <div className="hrv-pmo-coupon" data-hrvpmo-layout="minimum" />
                                    <div className="hrv-pmo-discount" data-hrvpmo-layout="minimum" />
                                    <div className="product-description">
                                        <div className="title-bl">
                                            <h2>Mô tả</h2>
                                        </div>
                                        <div className="description-content">
                                            <div className="description-productdetail">
                                                <p>
                                                    {product.description}
                                                </p>
                                                <p>
                                                    <strong>Hướng dẫn bảo quản:</strong>
                                                </p>
                                                <p>- Không dùng hóa chất tẩy.</p>
                                                <p>- Ủi ở nhiệt độ thích hợp, hạn chế dùng máy sấy.</p>
                                                <p>
                                                    - Giặt ở chế độ bình thường, với đồ có màu tương tự.
                                                    <br />
                                                </p>
                                            </div>
                                            <a id="detail_more">
                                                <span className="btn-effect">Xem thêm</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <hr />
                            {
                                checkUserHasPurchased &&
                                <>

                                    <ReviewAndRatingComponent onComment={handleComment} />
                                    <hr />
                                </>
                            }
                            <div>
                                {comments.map(comment => (
                                    <>
                                        <div key={comment.id}>
                                            <img
                                                alt={comment.firstname + comment.lastname}
                                                src="https://lh4.googleusercontent.com/-T3-L8KezLEg/AAAAAAAAAAI/AAAAAAAAAAA/6385upYGISk/s40-c-k/photo.jpg"
                                            />
                                            <div>
                                                <div>
                                                    <a
                                                        style={{ cursor: 'pointer', color: "blue" }}
                                                    >
                                                        {comment.firstname + " " + comment.lastname}
                                                    </a>
                                                </div>
                                                <div>
                                                    <span>{formatDate(comment.created_at)}</span>
                                                    <span>
                                                        <a
                                                            style={{ cursor: 'pointer' }} title="Flag as inappropriate"
                                                        />
                                                    </span>
                                                </div>
                                                <div>
                                                    <g id="G-REVIEW-STARS_21">
                                                        <span id="SPAN_22">
                                                            <span id="SPAN_23" />
                                                        </span>
                                                    </g>
                                                    <div>
                                                        <span>{comment.comment}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <hr />
                                    </>
                                ))}
                            </div>

                            <div className="list-productRelated clearfix">
                                <div className="heading-title text-center">
                                    <h2>Sản phẩm liên quan</h2>
                                </div>
                                <div className="content-product-list row">
                                    {listProduct.map(product => (
                                        <div className="col-md-3 col-sm-6 col-xs-6 pro-loop" key={product.id}>
                                            <div className="product-block product-resize">
                                                <div className="product-img">
                                                    <Link to={`/detail/${product.id}`}
                                                        title={product.name}
                                                        className="image-resize"
                                                    >
                                                        <picture>
                                                                <Image imagePath={product.url_image1} className="img-loop"/>
                                                        </picture>
                                                        <picture>
                                                        <Image imagePath={product.url_image2} className="img-loop img-hover"/>
                                                        </picture>
                                                    </Link>
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
                                                            <p className="pro-price ">
                                                                {formattedPrice(product.price)}
                                                                <span className="pro-price-del" />
                                                            </p>
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
            </div>
            <ToastContainer />
        </main>

    );
}

export default Detail;
