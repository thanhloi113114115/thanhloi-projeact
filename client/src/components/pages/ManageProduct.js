import React, { useState, useRef, useEffect } from "react";
import '../../App.css';
import { API_URL, storage } from '../../config';
import axios from 'axios';
import Pagination from "https://cdn.skypack.dev/rc-pagination@3.1.15";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { v4 as uuidv4 } from 'uuid';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { ref, uploadBytes, deleteObject } from "firebase/storage";
import Image from "../common/image";
import formattedPrice from '../common/formattedPrice';
import { notifyError, notifySucces } from "../common/toastify";

function ManageProduct() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const role = localStorage.getItem('role');
    if (!isLoggedIn && role !== "admin") {
        window.location.href = '/';
    }
    const [isVisible, setVisible] = useState(false);
    const [idItem, setIdItem] = useState(0);
    const [isReload, setIsReload] = useState(false);
    const productNameRef = useRef(null);
    const priceRef = useRef(null);
    const descriptionRef = useRef(null);
    const imagesRef = useRef(null);
    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');

    const [categories, setCategories] = useState([]);
    const [categoryItems, setCategoryItems] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [colors, setColors] = useState([]);
    const [products, setProducts] = useState([]);
    const [divColors_Sizes, setDivColors_Sizes] = useState([]);
    const [selectSizes, setSelectSizes] = useState([]);
    const [selectColors, setSelectColors] = useState([]);
    const [selectQuantitys, setSelectQuantitys] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [images, setImages] = useState([]);

    const [show, setShow] = useState(false);
    const [contentDetail, setContentDetail] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const categoriesResponse = await axios.get(`${API_URL}/categories`);
                setCategory(categoriesResponse.data[0].id);
                setCategories(categoriesResponse.data);

                const subcategoriesResponse = await axios.get(`${API_URL}/subcategoryByCategoryId/${categoriesResponse.data[0].id}`);
                setSubCategory(subcategoriesResponse.data[0].id);
                setCategoryItems(subcategoriesResponse.data);

                const colorsResponse = await axios.get(`${API_URL}/colors`);
                setColors(colorsResponse.data);

                const sizesResponse = await axios.get(`${API_URL}/sizes`);
                setSizes(sizesResponse.data);
            } catch (error) {
                if (error.response) {
                    notifyError(error.response.data.message);
                }
            }
        }

        // Call the function
        fetchData();

    }, []);

    useEffect(() => {
        axios.get(`${API_URL}/products`)
            .then((response) => setProducts(response.data))
            .catch((e) => {
                if (e.response) {
                    notifyError(e.response.data.message);
                }
            });
    }, [isReload]);

    const handleClose = () => setShow(false);

    const handleShowInventoryDetails = (id) => {
        setShow(true);
        axios.get(`${API_URL}/size_colorByProductId/${id}`)
            .then((response) => {
                if (response.status === 200) {
                    var orderDetail = response.data;
                    var n = 1;
                    var html = '';
                    html += '<table class="table">'
                    html += '<thead>'
                    html += '<tr>'
                    html += '<th>#</th>'
                    html += '<th>Màu sắc</th>'
                    html += '<th>Kích thước</th>'
                    html += '<th>Số lượng</th>'
                    html += '</tr>'
                    html += '</thead>'
                    html += '<tbody>'
                    orderDetail.forEach((item) => {
                        html += '<tr>'
                        html += '<td>' + n + '</td>'
                        html += '<td>' + item.color_name + '</td>'
                        html += '<td>' + item.size_name + '</td>'
                        html += '<td>' + item.quantity + '</td>'
                        html += '</tr>'
                        n++;
                    });
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

    const handleClickEdit = async (id) => {
        await axios.get(`${API_URL}/products/${id}`)
            .then((response) => {
                if (response.status === 200) {
                    setVisible(true);
                    setTimeout(() => {
                        const { id, product_name, price, description, category_id, subcategory_id } = response.data;

                        axios.get(`${API_URL}/subcategoryByCategoryId/${category_id}`)
                            .then(response => setCategoryItems(response.data))
                            .catch((e) => {
                                if (e.response) {
                                    notifyError(e.response.data.message);
                                }
                            });
                        productNameRef.current.value = product_name;
                        priceRef.current.value = price;
                        descriptionRef.current.value = description;
                        setCategory(category_id);
                        setSubCategory(subcategory_id);

                        const newDivColors_Sizes = [];
                        const selectColors = [];
                        const selectQuantitys = [];
                        const selectSizes = [];

                        axios.get(`${API_URL}/size_colorByProductId/${id}`)
                            .then((response) => {
                                if (response.status === 200) {
                                    const productsizecolors = response.data;

                                    productsizecolors.forEach((size, index) => {
                                        const newSize = {
                                            color: size.color_id.color_name,
                                            size: size.size_id.size_name,
                                            quantity: size.quantity
                                        };
                                        selectColors.push(size.color_id.id);
                                        selectSizes.push(size.size_id.id);
                                        selectQuantitys.push(size.quantity);
                                        newDivColors_Sizes.push(newSize);
                                    });
                                    setDivColors_Sizes(newDivColors_Sizes);
                                    setSelectColors(selectColors);
                                    setSelectSizes(selectSizes);
                                    setSelectQuantitys(selectQuantitys);
                                } else {
                                    notifyError('Lỗi khi lấy thông tin');
                                }
                            }).catch((e) => {
                                if (e.response) {
                                    notifyError(e.response.data.message);
                                }
                            });
                    });

                    setIdItem(id);
                } else {
                    notifyError('Lỗi khi lấy thông tin sản phẩm');
                }
            }).catch((e) => {
                if (e.response) {
                    notifyError(e.response.data.message);
                }
            });
        await axios.get(`${API_URL}/imagesByProductId/${id}`)
            .then(response => { setImages(response.data); })
            .catch((e) => {
                if (e.response) {
                    notifyError(e.response.data.message);
                }
            });
    };

    const handleClickDelete = async (id) => {
        confirmAlert({
            title: "Xác nhận xóa",
            message: "Bạn muốn xóa thông tin sản phẩm?",
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
            const response = await axios.delete(`${API_URL}/products/${id}`);
            if (response.status === 200) {
                notifySucces('Xóa dữ liệu thành công');
                setVisible(false);
                setIsReload(!isReload);
            } else {
                notifyError('Lỗi khi xóa sản phẩm');
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
        setDivColors_Sizes([{ color: '', size: '', quantity: 1 }]);
        setSelectColors([]);
        setSelectSizes([]);
        setSelectQuantitys([]);
        setIdItem(0);
        setVisible(!isVisible);
        setImages([]);
        setSelectedImages([]);
    }

    const clickBtnAdd_Edit = async () => {
        const productName = productNameRef.current.value;
        const price = priceRef.current.value;
        const description = descriptionRef.current.value;
        const images = imagesRef.current.value;

        if (!productName || !price || !description) {
            notifyError('Vui lòng điền đầy đủ thông tin');
            return;
        }
        if (price < 0) {
            notifyError('Vui lòng nhập giá tiền hợp lệ');
            return;
        }
        var color_size = [];
        divColors_Sizes.map((size, index) => (
            color_size.push({ color: document.getElementById("color" + index).value, size: document.getElementById("size" + index).value, quantity: document.getElementById("quantity" + index).value })
        ));

        if (idItem === 0) {

            if (selectedImages.length < 2) {
                notifyError('Vui lòng chọn ít nhất 2 hình ảnh');
                return;
            }
            var url_image = [];
            if (selectedImages.length > 0) {
                for (const image of selectedImages) {
                    url_image.push({ url: `public/learnfirebase/${image.name}` });
                }
            }

            const data = {
                name: productName,
                price: price,
                description: description,
                subcategory_id: subCategory,
                color_size: color_size,
                images: url_image
            };

            axios.post(`${API_URL}/products`, data)
                .then(async (response) => {
                    if (response.status === 200) {
                        await uploadImages();
                        clickSetVisible();
                        notifySucces('Thêm mới dữ liệu thành công');
                        setIsReload(!isReload);
                    } else {
                        notifyError('Lỗi khi thêm mới sản phẩm');
                    }
                }).catch((e) => {
                    if (e.response) {
                        notifyError(e.response.data.message);
                    }
                });

        }
        else {
            var url_image = [];
            if (selectedImages.length > 0) {
                for (const image of selectedImages) {
                    url_image.push({ url: `public/learnfirebase/${image.name}` });
                }
            }

            const data = {
                name: productName,
                price: price,
                description: description,
                subcategory_id: subCategory,
                color_size: color_size,
                images: url_image
            };

            axios.put(`${API_URL}/products/${idItem}`, data)
                .then(async (response) => {
                    if (response.status === 200) {
                        await uploadImages();
                        clickSetVisible();
                        notifySucces(`Cập nhật dữ liệu thành công`);
                        setIsReload(!isReload);
                    } else {
                        notifyError('Lỗi khi cập nhật thông tin sản phẩm');
                    }
                }).catch((e) => {
                    if (e.response) {
                        notifyError(e.response.data.message);
                    }
                });
            setIdItem(0);
        }
    };

    const clickBtnAdd_Div_Color_Size = () => {
        const newSize = { color: '', size: '', quantity: 1 };
        setDivColors_Sizes([...divColors_Sizes, newSize]);
    }

    const clickBtnRemove_Div_Color_Size = (index) => {
        const newSizes = [...divColors_Sizes];
        newSizes.splice(index, 1);
        setDivColors_Sizes(newSizes);
    };

    const handleFileChange = (e) => {
        setSelectedImages(Array.from(e.target.files));
    };

    const [perPage, setPerPage] = useState(10);
    const [size, setSize] = useState(perPage);
    const [current, setCurrent] = useState(1);

    const PerPageChange = (value) => {
        setSize(value);
        const newPerPage = Math.ceil(products.length / value);
        if (current > newPerPage) {
            setCurrent(newPerPage);
        }
    }

    const getData = (current, pageSize) => {
        return products.slice((current - 1) * pageSize, current * pageSize);
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

    const deleteImage = (id, url_image) => {
        if (images.length == 2) {
            notifyError('Mỗi sản phẩm phải có ít nhất 2 hình ảnh');
            return;
        }
        confirmAlert({
            title: "Xác nhận xóa",
            message: "Bạn muốn xóa hình ảnh sản phẩm?",
            buttons: [
                {
                    label: 'Xác nhận',
                    onClick: () => {
                        axios.delete(`${API_URL}/deleteImage/${id}`)
                            .then((response) => {
                                if (response.status === 200) {
                                    const desertRef = ref(storage, url_image);
                                    // Delete the file
                                    deleteObject(desertRef).then(() => {
                                        notifySucces('Xóa hình ảnh thành công');
                                        setImages(response.data);
                                        setIsReload(!isReload);
                                    }).catch((error) => {
                                        console.log(error);
                                    });

                                } else {
                                    notifyError('Lỗi khi xóa hình ảnh');
                                }
                            }).catch((e) => {
                                if (e.response) {
                                    notifyError(e.response.data.message);
                                }
                            });
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

    const uploadImages = async () => {
        var url_image = [];
        if (selectedImages.length > 0) {
            for (const image of selectedImages) {
                const imageRef = ref(storage, `public/learnfirebase/${image.name}`);
                const snapshot = await uploadBytes(imageRef, image);
                url_image.push({ url: snapshot.metadata.fullPath });
            }
        }
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
                                            <h1>QUẢN LÍ SẢN PHẨM</h1>

                                            {isVisible ? (
                                                <>
                                                    <div className="mt-3 row">
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Tên sản phẩm <b style={{ color: "red" }}>*</b></label>
                                                                <input type="text" className="form-control" ref={productNameRef} />
                                                            </div>
                                                            <div className="form-group">
                                                                <label>Danh mục <b style={{ color: "red" }}>*</b></label>
                                                                <select className="form-control" value={category} onChange={(e) => {
                                                                    setCategory(e.target.value);
                                                                    axios.get(`${API_URL}/subcategoryByCategoryId/${e.target.value}`)
                                                                        .then(response => {
                                                                            setCategoryItems(response.data);
                                                                            setSubCategory(response.data[0].id);
                                                                        }).catch((e) => {
                                                                            if (e.response) {
                                                                                notifyError(e.response.data.message);
                                                                            }
                                                                        });
                                                                }}>
                                                                    {categories.map(category => (
                                                                        <option key={category.id} value={category.id}>{category.name}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div className="form-group">
                                                                <label>Mô tả <b style={{ color: "red" }}>*</b></label>
                                                                <textarea type="text" className="form-control" ref={descriptionRef} />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Giá <b style={{ color: "red" }}>*</b></label>
                                                                <input type="number" min='1' className="form-control" ref={priceRef} />
                                                            </div>
                                                            <div className="form-group">
                                                                <label>Danh mục con <b style={{ color: "red" }}>*</b></label>
                                                                <select className="form-control" value={subCategory} onChange={e => {
                                                                    setSubCategory(e.target.value);
                                                                }}>
                                                                    {categoryItems.map(categoryItem => (
                                                                        <option key={categoryItem.id} value={categoryItem.id}>{categoryItem.name}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div className="form-group">
                                                                <label>Hình ảnh
                                                                    {
                                                                        idItem == 0 && <b style={{ color: "red" }}>*</b>
                                                                    }
                                                                </label>
                                                                <input type="file" multiple className="form-control" ref={imagesRef} onChange={handleFileChange} />
                                                            </div>
                                                            <div className="form-group row">
                                                                {selectedImages.map((image, index) => (
                                                                    <img key={index} src={URL.createObjectURL(image)} alt={`Selected ${index + 1}`} style={{ width: '100px' }} />
                                                                ))}
                                                            </div>
                                                            {
                                                                selectedImages && <hr />
                                                            }
                                                            <div className="form-group row">
                                                                {idItem !== 0 && images.map((image, index) => (
                                                                    <div key={index}>
                                                                        <Image imagePath={image.image_url} style={{ width: '100px' }} />
                                                                        <a className="btn btn-danger ml-2" style={{ cursor: 'pointer' }} onClick={() => deleteImage(image.id, image.image_url)}>Xóa</a>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <label>Màu sắc - Kích thước <b style={{ color: "red" }}>*</b></label>
                                                            {divColors_Sizes.map((size, index) => (
                                                                <div className="form-group" key={uuidv4()}>
                                                                    <div className="row">
                                                                        <div className="col-md-3">
                                                                            <select id={`color${index}`} className="form-control" value={selectColors[index] || (colors.length > 0 ? colors[0].id : '')} onChange={(e) => {
                                                                                const newColor = [...selectColors];
                                                                                newColor[index] = e.target.value;
                                                                                setSelectColors(newColor);
                                                                            }}>
                                                                                {colors.map(color => (
                                                                                    <option key={color.id} value={color.id}>{color.color_name}</option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                        <div className="col-md-3">
                                                                            <select id={`size${index}`} className="form-control" value={selectSizes[index] || (sizes.length > 0 ? sizes[0].id : '')} onChange={(e) => {
                                                                                const newSizes = [...selectSizes];
                                                                                newSizes[index] = e.target.value;
                                                                                setSelectSizes(newSizes);
                                                                            }}>
                                                                                {sizes.map(size => (
                                                                                    <option key={size.id} value={size.id}>{size.size_name}</option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                        <div className="col-md-4">
                                                                            <input id={`quantity${index}`} className="form-control"
                                                                                type="number"
                                                                                value={selectQuantitys[index] || size.quantity}
                                                                                onChange={(e) => {
                                                                                    const newQuantity = [...selectQuantitys];
                                                                                    newQuantity[index] = e.target.value;
                                                                                    setSelectQuantitys(newQuantity);
                                                                                }}
                                                                                min='1'
                                                                                placeholder="Số lượng"
                                                                            />
                                                                        </div>
                                                                        <div className="col-md-2">
                                                                            {
                                                                                index !== 0 && <button className="btn btn-danger mr-2" onClick={() => clickBtnRemove_Div_Color_Size(index)}>-</button>
                                                                            }
                                                                            <button className="btn btn-primary" onClick={clickBtnAdd_Div_Color_Size}>+</button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
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
                                            <Pagination
                                                className="pagination-data"
                                                showTotal={(total, range) => `Showing ${range[0]}-${range[1]} of ${total}`}
                                                onChange={PaginationChange}
                                                total={products.length}
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
                                                        <th>Name</th>
                                                        <th>Category</th>
                                                        <th>SubCategory</th>
                                                        <th>Price</th>
                                                        <th>Description</th>
                                                        <th>Image</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        getData(current, size).map((data, index) => {
                                                            return (
                                                                <tr key={data.id}>
                                                                    <td>{index + 1}</td>
                                                                    <td>{data.product_name}</td>
                                                                    <td>{data.category_name}</td>
                                                                    <td>{data.subcategory_name}</td>
                                                                    <td>{formattedPrice(data.price)}</td>
                                                                    <td>{data.description}</td>
                                                                    <td>
                                                                        <Image imagePath={data.url_image1} style={{ width: '100px' }} />
                                                                    </td>
                                                                    <td style={{ display: 'flex' }}>
                                                                        <button className="btn btn-warning" onClick={() => handleClickEdit(data.id)}>Sửa</button>
                                                                        <button className="btn btn-danger ml-2" onClick={() => handleClickDelete(data.id)}>Xóa</button>
                                                                        <button className="btn btn-success ml-2" onClick={() => handleShowInventoryDetails(data.id)}>Tồn kho</button>
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
                                                total={products.length}
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
                        <Modal show={show} onHide={handleClose}>
                            <Modal.Header>
                                <Modal.Title>Chi tiết tồn kho</Modal.Title>
                            </Modal.Header>
                            <Modal.Body><div dangerouslySetInnerHTML={{ __html: contentDetail }} /></Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleClose}>
                                    Đóng
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </>
                    : <h2>Không có quyền truy cập</h2>
                }
            </div>

        </>
    );

}

export default ManageProduct;