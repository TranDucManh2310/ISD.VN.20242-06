import React, { Fragment, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "react-alert";
import { Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { newProduct, clearErrors } from "../../actions/productActions";
import { NEW_PRODUCT_RESET } from "../../constants/productConstants";
import Sidebar from "./Sidebar";
import MetaData from "../layout/MetaData";
import Swal from 'sweetalert2';

const NewProduct = () => {
    const navigate = useNavigate();
    
    // State variables
    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [salePrice, setSalePrice] = useState(0);
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState(""); 
    const [stock, setStock] = useState(0);
    const [seller, setSeller] = useState("");
    const [images, setImages] = useState([]);
    const [imagesPreview, setImagesPreview] = useState([]);

    // Redux selectors
    const { category: categories } = useSelector((state) => state.category);
    const { loading, error, success } = useSelector((state) => state.newProduct);

    const alert = useAlert();
    const dispatch = useDispatch();

    // Categories list - thêm danh sách categories mẫu nếu cần
    const categoryOptions = [
        'Sách văn học',
        'Sách khoa học',
        'Sách thiếu nhi',
        'Sách học tập',
        'Sách kỹ năng sống',
        'Sách lịch sử',
        'Sách tâm lý',
        'Sách kinh tế'
    ];

    useEffect(() => {
        if (error) {
            alert.error(error);
            dispatch(clearErrors());
        }

        if (success) {
    Swal.fire({
        title: "Đã thêm!",
        text: "Thêm thành công sản phẩm.",
        icon: "success"
    }).then(() => {
        navigate("/admin/products");
    });
     dispatch({ type: NEW_PRODUCT_RESET });
        }
    }, [dispatch, alert, error, success, navigate]);


    // Nén ảnh function
    const compressImage = (file, maxWidth = 800, quality = 0.8) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            
            img.src = URL.createObjectURL(file);
        });
    };

    const submitHandler = (e) => {
        e.preventDefault();

        // Validation
        if (!name.trim()) {
            alert.error("Vui lòng nhập tên sản phẩm");
            return;
        }
        if (price <= 0) {
            alert.error("Giá sản phẩm phải lớn hơn 0");
            return;
        }
        if (!description.trim()) {
            alert.error("Vui lòng nhập mô tả sản phẩm");
            return;
        }
        if (!category) {
            alert.error("Vui lòng chọn danh mục");
            return;
        }
        if (!seller.trim()) {
            alert.error("Vui lòng nhập tên người bán");
            return;
        }
        if (images.length === 0) {
            alert.error("Vui lòng chọn ít nhất một hình ảnh");
            return;
        }

        const productData = {
            name: name.trim(),
            price: Number(price),
            description: description.trim(),
            category: category,
            stock: Number(stock),
            seller: seller.trim(),
            salePrice: Number(salePrice) || 0,
            images: images
        };

        console.log('🚀 Sending product data:', productData);
        console.log('Images count:', images.length);
        
        dispatch(newProduct(productData));
    };

    const onChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setImagesPreview([]);
        setImages([]);

        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                alert.error(`File ${file.name} không phải là hình ảnh`);
                continue;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert.error(`File ${file.name} quá lớn. Kích thước tối đa là 5MB`);
                continue;
            }

            try {
                // Nén ảnh để giảm kích thước
                const compressedImage = await compressImage(file);
                
                setImagesPreview(prev => [...prev, compressedImage]);
                setImages(prev => [...prev, compressedImage]);
            } catch (error) {
                console.error('Error compressing image:', error);
                alert.error(`Lỗi xử lý file ${file.name}`);
            }
        }
    };

    return (
        <Fragment>
            <MetaData title={"Thêm sản phẩm mới"} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>

                <div className="col-12 col-md-10">
                    <Fragment>
                        <div className="wrapper my-5">
                            <form
                                className="shadow-lg"
                                onSubmit={submitHandler}
                                encType="multipart/form-data"
                            >
                                <h1 className="mb-4">Thêm sản phẩm mới</h1>

                                <div className="form-group">
                                    <label htmlFor="name_field">Tên sản phẩm</label>
                                    <input
                                        type="text"
                                        id="name_field"
                                        className="form-control"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Nhập tên sản phẩm"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="price_field">Giá gốc (VNĐ)</label>
                                    <input
                                        type="number"
                                        id="price_field"
                                        className="form-control"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        min="0"
                                        step="1000"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="sale_price_field">Giá khuyến mãi (VNĐ) - Tùy chọn</label>
                                    <input
                                        type="number"
                                        id="sale_price_field"
                                        className="form-control"
                                        value={salePrice}
                                        onChange={(e) => setSalePrice(e.target.value)}
                                        min="0"
                                        step="1000"
                                        placeholder="0 (để trống nếu không có khuyến mãi)"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="description_field">Mô tả</label>
                                    <textarea
                                        className="form-control"
                                        id="description_field"
                                        rows="8"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Nhập mô tả chi tiết về sản phẩm"
                                    ></textarea>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="category_field">Danh mục</label>
                                    <select
                                        className="form-control"
                                        id="category_field"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {/* Sử dụng categories từ Redux nếu có, nếu không dùng mảng mặc định */}
                                        {(categories && categories.length > 0 ? categories : categoryOptions).map((cat, index) => (
                                            <option key={index} value={typeof cat === 'object' ? cat.name : cat}>
                                                {typeof cat === 'object' ? cat.name : cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="stock_field">Số lượng trong kho</label>
                                    <input
                                        type="number"
                                        id="stock_field"
                                        className="form-control"
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                        min="0"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="seller_field">Nhà cung cấp/Tác giả</label>
                                    <input
                                        type="text"
                                        id="seller_field"
                                        className="form-control"
                                        value={seller}
                                        onChange={(e) => setSeller(e.target.value)}
                                        placeholder="Nhập tên nhà cung cấp hoặc tác giả"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Hình ảnh sản phẩm</label>
                                    <div className="custom-file">
                                        <input
                                            type="file"
                                            name="product_images"
                                            className="custom-file-input"
                                            id="customFile"
                                            onChange={onChange}
                                            multiple
                                            accept="image/*"
                                        />
                                        <label className="custom-file-label" htmlFor="customFile">
                                            {images.length > 0 ? `Đã chọn ${images.length} hình ảnh` : 'Chọn hình ảnh'}
                                        </label>
                                    </div>

                                    {imagesPreview.length > 0 && (
                                        <div className="mt-3">
                                            <h6>Xem trước hình ảnh:</h6>
                                            <div className="d-flex flex-wrap">
                                                {imagesPreview.map((img, index) => (
                                                    <div key={index} className="mr-2 mb-2">
                                                        <img
                                                            src={img}
                                                            alt={`Preview ${index + 1}`}
                                                            className="img-thumbnail"
                                                            width="100"
                                                            height="100"
                                                            style={{ objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    id="login_button"
                                    type="submit"
                                    className="btn btn-block py-3"
                                    disabled={loading}
                                    style={{
                                        backgroundColor: loading ? '#ccc' : '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        padding: '10px 20px',
                                        fontSize: '16px',
                                        cursor: loading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {loading ? "Đang tạo sản phẩm..." : "Tạo sản phẩm"}
                                </Button>
                            </form>
                        </div>
                    </Fragment>
                </div>
            </div>
        </Fragment>
    );
};

export default NewProduct;