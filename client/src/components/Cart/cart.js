import React, { useState, useRef, useEffect } from "react";
import { ToastContainer } from 'react-toastify';
import { useCart } from './CartContext';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { CLIENT_ID, API_URL } from '../../config';
import axios from 'axios';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import formattedPrice from '../common/formattedPrice';
import { notifyError, notifySucces } from "../common/toastify";
import Image from "../common/image";

const Cart = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const phoneLocal = localStorage.getItem('phone');
    const firstnameLocal = localStorage.getItem('firstname');
    const lastnameLocal = localStorage.getItem('lastname');
    const emailLocal = localStorage.getItem('email');
    const user_id = localStorage.getItem('user_id');

    const phoneRef = useRef(null);
    const addressRef = useRef(null);
    const noteRef = useRef(null);
    const receiverRef = useRef(null);
    const emailRef = useRef(null);

    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState('');
    const [nameCity, setNameCity] = useState('');
    const [districts, setDistricts] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [nameDistrict, setNameDistrict] = useState('');
    const [wards, setWards] = useState([]);
    const [selectedWard, setSelectedWard] = useState('');
    const [nameWard, setNameWard] = useState('');

    useEffect(() => {
        if (emailLocal && emailRef.current) {
            emailRef.current.value = emailLocal;
        }
        if (phoneLocal && phoneRef.current) {
            phoneRef.current.value = phoneLocal;
        }
        if (firstnameLocal && lastnameLocal && receiverRef.current) {
            receiverRef.current.value = firstnameLocal + " " + lastnameLocal;
        }
        if (isLoggedIn) {
            const fetchData = async () => {
                try {
                    const response = await axios.get('https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json');
                    setCities(response.data);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };

            fetchData();
        }
    }, [phoneLocal, firstnameLocal, lastnameLocal]);

    const { productsCount, updateToCart } = useCart();

    let productData = JSON.parse(localStorage.getItem('cart')) || [];
    const [products, SetProducts] = useState(productData);

    // -----Increment Event------
    const increaseQuantity = async (i, id) => {
        const storedCount = localStorage.getItem('count');

        localStorage.setItem('count', parseInt(storedCount, 10) + 1);
        updateToCart();

        const updatedProducts = await Promise.all(
            products.map(async (data, o) => {
                if (i === o) {
                    const storedData = JSON.parse(localStorage.getItem('cart')) || [];
                    const itemIndex = storedData.findIndex(item => item.id === id);

                    if (itemIndex !== -1) {
                        try {
                            const response = await axios.put(`${API_URL}/updateCart/${id}`, { quantity: data.qty + 1 });

                            if (response.status === 200) {
                                storedData[itemIndex].qty = data.qty + 1;
                                localStorage.setItem('cart', JSON.stringify(storedData));
                                return {
                                    ...data,
                                    qty: data.qty + 1
                                };
                            } else {
                                notifyError('Lỗi khi cập nhật giỏ hàng');
                                return data;
                            }
                        } catch (error) {
                            notifyError('Lỗi khi cập nhật giỏ hàng');
                            return data;
                        }
                    }
                }
                return data;
            })
        );

        SetProducts(updatedProducts);
    };

    // -----Decrement Event------
    const decreaseQuantity = async (i, id) => {
        const storedCount = localStorage.getItem('count');
        if (parseInt(storedCount, 10) > 1) {
            localStorage.setItem('count', parseInt(storedCount, 10) - 1);
            updateToCart();
        }

        const updatedProducts = await Promise.all(
            products.map(async (data, o) => {
                if (i === o && data.qty > 1) {
                    const storedData = JSON.parse(localStorage.getItem('cart')) || [];
                    const itemIndex = storedData.findIndex(item => item.id === id);

                    if (itemIndex !== -1) {
                        try {
                            const response = await axios.put(`${API_URL}/updateCart/${id}`, { quantity: data.qty - 1 });

                            if (response.status === 200) {
                                storedData[itemIndex].qty = data.qty - 1;
                                localStorage.setItem('cart', JSON.stringify(storedData));
                                return {
                                    ...data,
                                    qty: data.qty - 1
                                };
                            } else {
                                notifyError('Lỗi khi cập nhật giỏ hàng');
                                return data;
                            }
                        } catch (error) {
                            notifyError('Lỗi khi cập nhật giỏ hàng');
                            return data;
                        }
                    }
                }

                return data;
            })
        );

        SetProducts(updatedProducts);
    };

    // -----Remove Event------
    const removeFromCart = async (i, id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm khỏi giỏ hàng của mình không?")) {
            SetProducts(prevCart =>
                prevCart.filter((item, o) => {
                    return i !== o;
                })
            );
            const storedData = JSON.parse(localStorage.getItem('cart')) || [];

            const itemIndexToRemove = storedData.findIndex((item) => item.id == id);

            if (itemIndexToRemove !== -1) {

                const response = await axios.delete(`${API_URL}/deleteCartItem/${id}`);
                if (response.status === 200) {
                    const storedCount = localStorage.getItem('count');
                    localStorage.setItem('count', (parseInt(storedCount, 10) - storedData[itemIndexToRemove].qty).toString());
                    updateToCart();
                    storedData.splice(itemIndexToRemove, 1);
                    localStorage.setItem('cart', JSON.stringify(storedData));
                    notifySucces('Xóa sản phẩm khỏi giỏ hàng thành công');
                } else {
                    notifySucces('Lỗi khi xóa sản phẩm khỏi giỏ hàng');
                }
            }

        }
    };

    // -empty-cart--------
    const emptycart = () => {
        confirmAlert({
            title: "Xác nhận",
            message: "Xóa tất cả các mặt hàng vào giỏ hàng của bạn?",
            buttons: [
                {
                    label: 'Xác nhận',
                    onClick: () => {
                        confirmEmtyCart()
                    }
                },
                {
                    label: 'Hủy'
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

    const confirmEmtyCart = async () => {
        const response = await axios.delete(`${API_URL}/deleteCart/${user_id}`);
        if (response.status === 200) {
            SetProducts([]);
            localStorage.removeItem('cart');
            localStorage.setItem('count', 0);
            updateToCart();
            notifySucces('Xóa giỏ hàng thành công');
            return;
        } else {
            notifySucces('Lỗi khi xóa giỏ hàng');
        }
    }
    // ------Total Product Incart and Total Price of cart
    const cartTotalQty = products.reduce((acc, data) => acc + data.qty, 0);
    const cartTotalAmount = products.reduce((acc, data) => acc + data.price * data.qty, 0);

    const checkout = async (status) => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const phone = phoneRef.current.value;
        const address = addressRef.current.value;
        const receiver = receiverRef.current.value;
        const email = emailRef.current.value;
        if (phone == "" || address == "" || receiver == "" || nameCity == "" || nameDistrict == "" || nameWard == "") {
            notifyError("Vui lòng nhập thông tin");
            return;
        }
        if (!isLoggedIn) {
            notifyError("Vui lòng đăng nhập trước khi đặt hàng");
            return;
        }
        const userid = localStorage.getItem('user_id') || 0;
        let dataOrderDetail = [];
        let shouldContinue = true;
        await Promise.all(
            productData.map(async (item) => {
                if (!shouldContinue) return;
                const sizeText = item.size;
                const colorMatch = sizeText.match(/Màu: (\S+)/);
                const sizeMatch = sizeText.match(/Kích thước: (\S+)/);

                const color = colorMatch[1];
                var size = sizeMatch[1];

                if (size === "NO") {
                    size = "NO SIZE";
                }

                try {
                    const response = await axios.get(`${API_URL}/getQuantity/${item.size_color}`);

                    if (response.status === 200) {
                        if (response.data.quantity >= item.qty) {
                            const newData = {
                                product_id: item.product_id,
                                price: item.price,
                                color: color,
                                size: size,
                                quantity: item.qty,
                                name: item.name
                            };

                            dataOrderDetail.push(newData);
                        } else {
                            notifyError(`Sản phẩm ${item.name} chỉ còn ${response.data.quantity} sản phẩm`);
                            shouldContinue = false;
                        }
                    }
                } catch (error) {
                    console.log(error);
                    shouldContinue = false;
                }
            })
        );
        if (!shouldContinue) return;
        const currentTime = new Date();

        const newData = {
            user_id: userid,
            receiver: receiver,
            phone: phone,
            address: `${address}, ${nameWard}, ${nameWard}, ${nameCity}`,
            order_date: currentTime,
            total_price: cartTotalAmount,
            status: status,
            note: noteRef.current.value,
            order_items: dataOrderDetail,
            email: email
        };

        axios.post(`${API_URL}/orders`, newData).then(async (response) => {
            if (response.status === 200) {
                SetProducts([]);
                localStorage.removeItem('cart');
                localStorage.setItem('count', 0);
                updateToCart();
                const response = await axios.delete(`${API_URL}/deleteCart/${user_id}`);
                if (response.status === 200) {
                    SetProducts([]);
                    localStorage.removeItem('cart');
                    localStorage.setItem('count', 0);
                    updateToCart();
                }
                notifySucces('Đặt đơn hàng thành công');
            } else {
                notifyError('Lỗi khi đặt hàng');
            }
        }).catch((e) => {
            if (e.response) {
                notifyError(e.response.data.message);
            }
        });

    }

    const [success, setSuccess] = useState(false);
    const [ErrorMessage, setErrorMessage] = useState("");
    const [orderID, setOrderID] = useState(false);

    // creates a paypal order
    const createOrder = async (data, actions) => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const phone = phoneRef.current.value;
        const address = addressRef.current.value;
        const receiver = receiverRef.current.value;
        const email = emailRef.current.value;
        if (phone == "" || address == "" || receiver == "" || nameCity == "" || nameDistrict == "" || nameWard == "") {
            notifyError("Vui lòng nhập thông tin");
            return;
        }
        if (!isLoggedIn) {
            notifyError("Vui lòng đăng nhập trước khi đặt hàng");
            return;
        }
        const response = await axios.get(
            "https://api.exchangerate-api.com/v4/latest/USD"
        );
        const usdAmount = (cartTotalAmount / response.data.rates.VND).toFixed(2);

        return actions.order
            .create({
                purchase_units: [
                    {
                        description: "Sunflower",
                        amount: {
                            currency_code: "USD",
                            value: usdAmount,
                        },
                    },
                ],
            })
            .then((orderID) => {
                setOrderID(orderID);
                return orderID;
            });
    };

    // check Approval
    const onApprove = (data, actions) => {
        return actions.order.capture().then(function (details) {
            const { payer } = details;
            setSuccess(true);
        });
    };

    //capture likely error
    const onError = (data, actions) => {
        setErrorMessage("An Error occured with your payment ");
    };

    useEffect(() => {
        if (success) {
            checkout('Đã thanh toán');
        }
    }, [success]);

    const handleCityChange = (e) => {
        const selectedCityId = e.target.value;
        setSelectedCity(selectedCityId);

        // Find districts for the selected city
        const selectedCityData = cities.find(city => city.Id === selectedCityId);
        if (selectedCityData) {
            setNameCity(selectedCityData.Name);
        }
        setDistricts(selectedCityData ? selectedCityData.Districts : []);
    };

    const handleDistrictChange = (e) => {
        const selectedDistrictId = e.target.value;
        setSelectedDistrict(selectedDistrictId);

        // Find wards for the selected district
        const selectedDistrictData = districts.find(district => district.Id === selectedDistrictId);
        if (selectedDistrictData) {
            setNameDistrict(selectedDistrictData.Name);
        }
        setWards(selectedDistrictData ? selectedDistrictData.Wards : []);
    };
    const handleWardChange = (e) => {
        const selectedWardId = e.target.value;
        setSelectedWard(selectedWardId);
        const selectedWardData = wards.find(ward => ward.Id === selectedWardId);

        if (selectedWardData) {
            setNameWard(selectedWardData.Name);
        }
    };

    return (
        <>
            <PayPalScriptProvider options={{ "client-id": CLIENT_ID }}>
                <div className="sec_row container">
                    <div className="justify-content-center m-0">
                        <div className="mt-5 mb-5">
                            <div className="card">
                                <div className="card-header bg-dark p-3">
                                    <div className="card-header-flex">
                                        <h5 className="text-white m-0">Giỏ hàng {products.length > 0 ? `(${products.length})` : ''}</h5>
                                        {
                                            products.length > 0 ? <button className="btn btn-danger mt-0 btn-sm" onClick={() => emptycart()}><i className="fa fa-trash-alt mr-2"></i><span>Làm trống giỏ hàng</span></button> : ''}
                                    </div>
                                </div>
                                <div className="card-body p-0 table-responsive">
                                    {
                                        products.length === 0 ?
                                            <table className="table cart-table mb-0">
                                                <tbody>
                                                    <tr>
                                                        <td colSpan="6">
                                                            <div className="cart-empty">
                                                                <i className="fa fa-shopping-cart"></i>
                                                                <p>Giỏ hàng trống</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table> :
                                            <>
                                                <table className="table cart-table mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th>Xóa</th>
                                                            <th>Hình ảnh</th>
                                                            <th>Tên sản phẩm</th>
                                                            <th>Kích thước</th>
                                                            <th>Giá</th>
                                                            <th>Số lượng</th>
                                                            <th className="text-right"><span id="amount" className="amount">Tổng giá</span></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            products.map((data, index) => {
                                                                const { id, image, name, price, qty, size } = data;
                                                                return (
                                                                    <tr key={index}>
                                                                        <td><button className="prdct-delete" onClick={() => removeFromCart(index, id)}><i className="fa fa-trash"></i></button></td>
                                                                        <td>
                                                                            <div className="product-img">
                                                                                <Image imagePath={image} style={{ width: '100px' }} />
                                                                            </div>
                                                                        </td>
                                                                        <td><div className="product-name"><p>{name}</p></div></td>
                                                                        <td><p>{size}</p></td>
                                                                        <td>{formattedPrice(price)}</td>
                                                                        <td>
                                                                            <div className="prdct-qty-container">
                                                                                <button className="prdct-qty-btn" type="button" onClick={() => decreaseQuantity(index, id)}>
                                                                                    <i className="fa fa-minus"></i>
                                                                                </button>
                                                                                <input type="text" name="qty" className="qty-input-box" value={qty} disabled />
                                                                                <button className="prdct-qty-btn" type="button" onClick={() => increaseQuantity(index, id)}>
                                                                                    <i className="fa fa-plus"></i>
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                        <td className="text-right">{formattedPrice(qty * price)}</td>
                                                                    </tr>
                                                                )
                                                            })
                                                        }
                                                    </tbody>
                                                    <tfoot>
                                                        <tr>
                                                            <th>&nbsp;</th>
                                                            <th colSpan="4">&nbsp;</th>
                                                            <th>Tổng<span className="ml-2 mr-2">:</span><span className="text-danger">{cartTotalQty}</span></th>
                                                            <th className="text-right"><span className="text-danger">{formattedPrice(cartTotalAmount)}</span></th>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                                {
                                                    isLoggedIn ?
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Người nhận <b style={{ color: "red" }}>*</b></label>
                                                                <input type="text" className="form-control" ref={receiverRef} />
                                                            </div>
                                                            <div className="form-group">
                                                                <label>Số điện thoại <b style={{ color: "red" }}>*</b></label>
                                                                <input type="tel" className="form-control" ref={phoneRef} />
                                                            </div>
                                                            <div className="form-group">
                                                                <label>Email <b style={{ color: "red" }}>*</b></label>
                                                                <input type="email" className="form-control" ref={emailRef} />
                                                            </div>
                                                            <div className="form-group">
                                                                <label>Tỉnh/Thành phố <b style={{ color: "red" }}>*</b></label>
                                                                <select
                                                                    className="form-control"
                                                                    value={selectedCity}
                                                                    onChange={handleCityChange}
                                                                >
                                                                    <option value="" selected>Chọn tỉnh thành</option>
                                                                    {cities.map(city => (
                                                                        <option key={city.Id} value={city.Id}>{city.Name}</option>
                                                                    ))}
                                                                </select>

                                                            </div>
                                                            <div className="form-group">
                                                                <label>Quận/Huyện <b style={{ color: "red" }}>*</b></label>
                                                                <select
                                                                    className="form-control"
                                                                    value={selectedDistrict}
                                                                    onChange={handleDistrictChange}
                                                                >
                                                                    <option value="" selected>Chọn quận huyện</option>
                                                                    {districts.map(district => (
                                                                        <option key={district.Id} value={district.Id}>{district.Name}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div className="form-group">
                                                                <label>Xã/Phường <b style={{ color: "red" }}>*</b></label>
                                                                <select
                                                                    className="form-control"
                                                                    value={selectedWard}
                                                                    onChange={handleWardChange}
                                                                >
                                                                    <option value="" selected>Chọn phường xã</option>
                                                                    {wards.map(ward => (
                                                                        <option key={ward.Id} value={ward.Id}>{ward.Name}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div className="form-group">
                                                                <label>Địa chỉ <b style={{ color: "red" }}>*</b></label>
                                                                <textarea className="form-control" ref={addressRef} />
                                                            </div>

                                                            <div className="form-group">
                                                                <label>Ghi chú</label>
                                                                <textarea className="form-control" ref={noteRef} />
                                                            </div>
                                                            <div className="form-group">
                                                                <button className="btn btn-success" onClick={() => checkout('Chờ xác nhận')}>Đặt hàng</button>
                                                            </div>

                                                            <div className="form-group">
                                                                <PayPalButtons
                                                                    style={{ layout: "vertical" }}
                                                                    createOrder={createOrder}
                                                                    onApprove={onApprove}
                                                                />
                                                            </div>
                                                        </div>
                                                        : <a href='/login' className="btn btn-success">Đăng nhập trước khi đặt hàng</a>
                                                }
                                            </>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <ToastContainer />
            </PayPalScriptProvider >
        </>
    );
}

export default Cart;