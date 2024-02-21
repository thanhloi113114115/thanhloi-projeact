import React, { Component } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import Detail from './components/pages/Detail';
import Search from './components/pages/Search';
import Collection from './components/pages/Collection';
import Cart from './components/Cart/cart';
import ManageUser from './components/pages/ManageUser';
import ManageOrder from './components/pages/ManageOrder';
import ManageProduct from './components/pages/ManageProduct';
import PurchaseOrder from './components/pages/PurchaseOrder';
import OTPInput from './components/pages/OTPInput';
import Reset from './components/pages/Reset';
import ManageProfile from './components/pages/ManageProfile';
import ManageCategory from './components/pages/ManageCategory';
import ManageRevenue from './components/pages/ManageRevenue';
import ManageRating from './components/pages/ManageRating';
import ManageColor_Size from './components/pages/ManageColor_Size';
import Favorite from './components/pages/Favorite';
import Callback from './components/auth/callback';

class DieuHuongURL extends Component {
    render() {
        return (
            <Routes>
                <Route path="/auth/callback" element={<Callback />} />
                <Route path="/favorite" element={<Favorite />} />
                <Route path="/manage-color-size" element={<ManageColor_Size />} />
                <Route path="/manage-rating" element={<ManageRating />} />
                <Route path="/manage-revenue" element={<ManageRevenue />} />
                <Route path="/manage-category" element={<ManageCategory />} />
                <Route path="/manage-profile" element={<ManageProfile />} />
                <Route path="/otpinput" element={<OTPInput />} />
                <Route path="/reset" element={<Reset />} />
                <Route path="/purchase-order" element={<PurchaseOrder />} />
                <Route path="/purchase-order" element={<PurchaseOrder />} />
                <Route path="/manage-product" element={<ManageProduct />} />
                <Route path="/manage-order" element={<ManageOrder />} />
                <Route path="/manage-user" element={<ManageUser />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/collection/:name" element={<Collection />} />
                <Route path="/collection/:category/:name" element={<Collection />} />
                <Route path="/search/:keyword" element={<Search />} />
                <Route path="/detail/:id" element={<Detail />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Home />} />
            </Routes>
        );
    }
}

export default DieuHuongURL;