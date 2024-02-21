const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const bcrypt = require('bcrypt');
const cors = require("cors");
const nodemailer = require('nodemailer');
const passport = require("passport");
const cookieSession = require("cookie-session");
const passportStrategy = require("./auth/passport");
const fs = require('fs');

const app = express();

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://fir-project-6eb27.firebaseio.com'
});

const db = admin.firestore();

app.use(express.json()); // Enable parsing JSON requests

//category
app.get('/categoriesWithSubcategories', async (req, res) => {
    try {
        const categoriesSnapshot = await db.collection('categories').where('is_delete', '==', 0).get();
        const categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const categoriesWithSubcategories = await Promise.all(categories.map(async category => {
            const subcategoriesSnapshot = await db.collection('subcategories').where('category_id', '==', category.id).where('is_delete', '==', 0).get();
            const subcategories = subcategoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            return {
                category: category,
                subcategories: subcategories
            };
        }));

        res.header("Access-Control-Allow-Origin", "*");
        res.json(categoriesWithSubcategories);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.get('/categories', async (req, res) => {
    try {
        const categoriesSnapshot = await db.collection('categories').where('is_delete', '==', 0).get();
        const categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.header("Access-Control-Allow-Origin", "*");
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.get('/categories/:category_id', async (req, res) => {
    try {
        const categoryId = req.params.category_id;
        const categorySnapshot = await db.collection('categories').doc(categoryId).get();
        res.header("Access-Control-Allow-Origin", "*");

        if (categorySnapshot.exists) {
            const categoryData = categorySnapshot.data();
            const category = { _id: categorySnapshot.id, ...categoryData };
            res.status(200).json(category);
        } else {
            res.status(404).json({ error: 'Category not found' });
        }

    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.delete('/deleteCategory/:category_id', async (req, res) => {
    try {
        const categoryId = req.params.category_id;

        res.header("Access-Control-Allow-Origin", "*");

        // Xoá category
        await db.collection('categories').doc(categoryId).update({ is_delete: 1 });

        // Xoá subcategories và products tương ứng
        const subcategoriesSnapshot = await db.collection('subcategories').where('category_id', '==', categoryId).get();

        await Promise.all(subcategoriesSnapshot.docs.map(async (subcategoryDoc) => {

            const subcategoryId = subcategoryDoc.id;

            // Xoá subcategory
            await db.collection('subcategories').doc(subcategoryId).update({ is_delete: 1 });

            // Xoá products
            const productsSnapshot = await db.collection('products').where('subcategory_id', '==', subcategoryId).get();

            await Promise.all(productsSnapshot.docs.map(async (productDoc) => {
                const productId = productDoc.id;

                // Xoá product
                await db.collection('products').doc(productId).update({ is_delete: 1 });
            }));
        }));

        res.json({ message: "Success" });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.post('/addCategory', async (req, res) => {
    try {
        res.header("Access-Control-Allow-Origin", "*");
        const { categoryName } = req.body;

        const newData = {
            name: categoryName,
            is_delete: 0
        };

        // Thêm category vào Firestore
        const categoryRef = await db.collection('categories').add(newData);

        res.status(201).json({ message: 'Thêm thành công!', categoryId: categoryRef.id });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.put('/updateCategory/:category_id', async (req, res) => {
    try {
        const categoryId = req.params.category_id;
        res.header("Access-Control-Allow-Origin", "*");
        const { categoryName } = req.body;

        // Cập nhật category trong Firestore
        await db.collection('categories').doc(categoryId).update({ name: categoryName });

        res.status(200).json({ message: 'Success' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

//sub category
app.get('/subcategories/:subcategory_id', async (req, res) => {
    try {
        const subcategorySnapshot = await db.collection('subcategories')
            .doc(req.params.subcategory_id)
            .get();

        res.header('Access-Control-Allow-Origin', '*');

        if (!subcategorySnapshot.exists) {
            res.status(404).json({ error: 'Subcategory not found' });
            return;
        }

        const subcategory = subcategorySnapshot.data();

        res.json(subcategory);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.get('/subcategoryByCategoryId/:category_id', async (req, res) => {
    try {
        const subcategorySnapshot = await db.collection('subcategories')
            .where('category_id', '==', req.params.category_id)
            .where('is_delete', '==', 0)
            .get();

        const subcategories = [];

        subcategorySnapshot.forEach(doc => {
            subcategories.push({ id: doc.id, ...doc.data() });
        });

        res.header('Access-Control-Allow-Origin', '*');
        res.json(subcategories);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.delete('/deleteSubCategory/:subcategory_id', async (req, res) => {
    try {
        const subcategoryRef = db.collection('subcategories').doc(req.params.subcategory_id);

        // Update subcategory to mark it as deleted
        await subcategoryRef.update({ is_delete: 1 });

        // Find products associated with the subcategory
        const productsSnapshot = await app.collection('products')
            .where('subcategory_id', '==', req.params.subcategory_id)
            .get();

        // Update each product to mark it as deleted
        const batch = app.batch();
        productsSnapshot.forEach(productDoc => {
            const productRef = app.collection('products').doc(productDoc.id);
            batch.update(productRef, { is_delete: 1 });
        });

        // Commit the batch update for products
        await batch.commit();

        res.header('Access-Control-Allow-Origin', '*');
        res.json({ message: 'Success' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.post('/addSubCategory', async (req, res) => {
    try {
        res.header('Access-Control-Allow-Origin', '*');
        const { subCategoryName, category_id } = req.body;

        const newData = {
            category_id,
            name: subCategoryName,
            is_delete: 0
        };

        // Add a new subcategory document to Firestore
        const subcategoryRef = await db.collection('subcategories').add(newData);

        res.status(201).json({ message: 'Thêm thành công!', subcategoryId: subcategoryRef.id });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.put('/updateSubCategory/:subcategory_id', async (req, res) => {
    try {
        const subcategory_id = req.params.subcategory_id;
        res.header('Access-Control-Allow-Origin', '*');
        const { subCategoryName } = req.body;

        const subcategoryRef = db.collection('subcategories').doc(subcategory_id);

        // Update the subcategory document in Firestore
        await subcategoryRef.update({ name: subCategoryName });

        res.status(200).json({ message: 'Success' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});
// Product
app.get('/products', async (req, res) => {
    try {
        res.header('Access-Control-Allow-Origin', '*');

        const productsSnapshot = await db.collection('products')
            .where('is_delete', '==', 0)
            .get();

        const data = await Promise.all(productsSnapshot.docs.map(async (productDoc) => {
            const product = productDoc.data();
            const subcategoriesSnapshot = await db.collection('subcategories').doc(product.subcategory_id).get();
            const subcategories = subcategoriesSnapshot.data();
            const categoriesSnapshot = await db.collection('categories').doc(subcategories.category_id).get();
            const categories = categoriesSnapshot.data();

            return {
                id: productDoc.id,
                product_name: product.name,
                price: product.price,
                description: product.description,
                url_image1: product.url_image1,
                url_image2: product.url_image2,
                category_name: categories.name,
                subcategory_name: subcategories.name,
            };
        }));

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.get('/products/:categoryName/:orderby/categories', async (req, res) => {
    try {
        const categoryName = req.params.categoryName;
        const orderBy = req.params.orderby;
        let sortField = '';

        if (orderBy === 'manual') {
        } else if (orderBy === 'price-ascending') {
            sortField = 'price';
        } else if (orderBy === 'price-descending') {
            sortField = 'price';
        } else if (orderBy === 'title-ascending') {
            sortField = 'name';
        } else if (orderBy === 'title-descending') {
            sortField = 'name';
        }

        res.header("Access-Control-Allow-Origin", "*");

        const categorySnapshot = await db.collection('categories')
            .where('name', '==', categoryName)
            .where('is_delete', '==', 0)
            .get();
        if (categorySnapshot.empty) {
            return res.status(404).json({ message: 'Danh mục con không tồn tại' });
        }

        const categoryId = categorySnapshot.docs[0].id;
        const subcategoriesSnapshot = await db.collection('subcategories')
            .where('category_id', '==', categoryId)
            .where('is_delete', '==', 0)
            .get();

        const subcategoryIds = subcategoriesSnapshot.docs.map(doc => doc.id);

        const productsSnapshot = await db.collection('products')
            .where('subcategory_id', 'in', subcategoryIds)
            .where('is_delete', '==', 0)
            .get();

        const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const sortedProducts = products.sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];
            return aValue - bValue;
        });

        res.json(sortedProducts);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.get('/products/:subCategoryName/:orderby/subcategories', async (req, res) => {
    try {
        const subCategoryName = req.params.subCategoryName;
        const orderBy = req.params.orderby;
        let sortOptions = {};

        if (orderBy === 'manual') {
        } else if (orderBy === 'price-ascending') {
            sortOptions = { field: 'price', direction: 'asc' };
        } else if (orderBy === 'price-descending') {
            sortOptions = { field: 'price', direction: 'desc' };
        } else if (orderBy === 'title-ascending') {
            sortOptions = { field: 'name', direction: 'asc' };
        } else if (orderBy === 'title-descending') {
            sortOptions = { field: 'name', direction: 'desc' };
        }

        // Fetch subcategory from Firestore
        const subcategorySnapshot = await db.collection('subcategories')
            .where('name', '==', subCategoryName)
            .where('is_delete', '==', 0)
            .get();

        const subcategoryDocs = subcategorySnapshot.docs;

        res.header('Access-Control-Allow-Origin', '*');
        if (subcategoryDocs.length === 0) {
            return res.status(404).json({ message: 'Danh mục con không tồn tại' });
        }

        const subcategoryId = subcategoryDocs[0].id;

        // Fetch products from Firestore
        const productsSnapshot = await db.collection('products')
            .where('subcategory_id', '==', subcategoryId)
            .where('is_delete', '==', 0)
            .get();

        const products = productsSnapshot.docs.map(productDoc => {
            const product = productDoc.data();
            return {
                id: productDoc.id,
                name: product.name,
                price: product.price,
                description: product.description,
                url_image1: product.url_image1,
                url_image2: product.url_image2,
            };
        });

        const sortedProducts = products.sort((a, b) => {
            const aValue = a[sortOptions.field];
            const bValue = b[sortOptions.field];
            return sortOptions.direction === 'asc' ? aValue - bValue : bValue - aValue;
        });

        res.json(sortedProducts);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.get('/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        // Fetch product from Firestore
        const productDoc = await db.collection('products').doc(productId).get();

        res.header('Access-Control-Allow-Origin', '*');
        if (!productDoc) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        const product = productDoc.data();

        // Fetch subcategory from Firestore
        const subcategoriesDoc = await db.collection('subcategories')
            .doc(product.subcategory_id)
            .get();


        if (!subcategoriesDoc) {
            return res.status(404).json({ message: 'Danh mục con không tồn tại' });
        }

        const subcategories = subcategoriesDoc.data();

        // Fetch category from Firestore
        const categoriesDoc = await db.collection('categories')
            .doc(subcategories.category_id)
            .get();


        if (!categoriesDoc) {
            return res.status(404).json({ message: 'Danh mục không tồn tại' });
        }

        const categories = categoriesDoc.data();

        res.json({
            id: productId,
            product_name: product.name,
            price: product.price,
            description: product.description,
            url_image1: product.url_image1,
            url_image2: product.url_image2,
            category_id: categoriesDoc.id,
            subcategory_id: subcategoriesDoc.id,
            category_name: categories.name,
            subcategory_name: subcategories.name
        });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.get('/checkUserHasPurchased/:user_id/:product_id', async (req, res) => {
    try {
        const { product_id, user_id } = req.params;

        res.header('Access-Control-Allow-Origin', '*');
        // Fetch order items for the specified product
        const orderItemsSnapshot = await db.collection('orderitems')
            .where('product_id', '==', product_id)
            .get();
        const orderItemsDocs = orderItemsSnapshot.docs;

        // Fetch orders for the specified user and product
        const data = await Promise.all(orderItemsDocs.map(async (orderItemDoc) => {

            const orderItem = orderItemDoc.data();

            const orderSnapshot = await db.collection('orders')
                .doc(orderItem.order_id)
                .get();

            if (orderSnapshot.exists && orderSnapshot.data().user_id === user_id && orderSnapshot.data().status === 'Đã thanh toán') {
                return orderSnapshot ? orderSnapshot.data() : undefined;
            } else {
                return undefined;
            }
        }));

        const allUndefined = data.every(item => typeof item === 'undefined');
        if (!allUndefined) {
            res.json({ message: 'Success', data: data });
        } else {
            res.json({ message: 'Null' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.get('/isProductFavorite/:user_id/:product_id', async (req, res) => {
    try {
        const { product_id, user_id } = req.params;

        // Check if the product is a favorite for the specified user
        const favoriteSnapshot = await db.collection('favorites')
            .where('product_id', '==', product_id)
            .where('user_id', '==', user_id)
            .get();

        const favoriteDocs = favoriteSnapshot.docs;

        res.header('Access-Control-Allow-Origin', '*');
        if (favoriteDocs.length > 0) {
            res.json({ message: 'Success' });
        } else {
            res.json({ message: 'Null' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.get('/getProductFavorite/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;

        // Fetch favorites for the specified user
        const favoritesSnapshot = await db.collection('favorites')
            .where('user_id', '==', user_id)
            .get();

        const favoritesDocs = favoritesSnapshot.docs;

        res.header('Access-Control-Allow-Origin', '*');
        if (favoritesDocs.length === 0) {
            res.json({ message: 'Null' });
            return;
        }

        // Fetch product data for each favorite
        const productIds = favoritesDocs.map(favoriteDoc => favoriteDoc.data().product_id);
        const productsSnapshot = await db.collection('products')
            .where(admin.firestore.FieldPath.documentId(), 'in', productIds)
            .get();

        const productsDocs = productsSnapshot.docs;

        // Prepare the final data
        const data = productsDocs.map(productDoc => {
            const product = productDoc.data();
            return {
                id: productDoc.id,
                product_name: product.name,
                price: product.price,
                description: product.description,
                url_image1: product.url_image1,
                url_image2: product.url_image2,
            };
        });

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.get('/ratingByProductId/:product_id', async (req, res) => {
    try {
        const { product_id } = req.params;

        // Fetch ratings for the specified product
        const ratingsSnapshot = await db.collection('ratings')
            .where('product_id', '==', product_id)
            .get();

        const ratingsDocs = ratingsSnapshot.docs;

        res.header('Access-Control-Allow-Origin', '*');
        if (ratingsDocs.length === 0) {
            res.json({ message: 'Null' });
            return;
        }

        // Fetch user data for each rating
        const data = await Promise.all(ratingsDocs.map(async (ratingDoc) => {
            const rating = ratingDoc.data();

            const userDoc = await db.collection('users')
                .doc(rating.user_id)
                .get();

            if (userDoc.exists) {
                const user = userDoc.data();
                return {
                    id: ratingDoc.id,
                    product_id: rating.product_id,
                    user_id: rating.user_id,
                    rating: rating.rating,
                    comment: rating.comment,
                    created_at: rating.created_at,
                    firstname: user.firstname,
                    lastname: user.lastname
                };
            } else {
                return null;
            }
        }));

        // Filter out null values (users not found)
        const filteredData = data.filter(item => item !== null);

        res.json(filteredData);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.get('/search/:keyword', async (req, res) => {
    try {
        const keyword = req.params.keyword.toLowerCase();

        // Fetch products from Firestore that match the keyword and are not deleted
        const productsSnapshot = await db.collection('products')
            .where('is_delete', '==', 0)
            .get();

        const productsDocs = productsSnapshot.docs;

        const results = productsDocs
            .filter(productDoc => productDoc.data().name.toLowerCase().includes(keyword))
            .map(productDoc => {
                const product = productDoc.data();
                return {
                    id: productDoc.id,
                    product_name: product.name,
                    price: product.price,
                    description: product.description,
                    url_image1: product.url_image1,
                    url_image2: product.url_image2,
                };
            });

        res.header('Access-Control-Allow-Origin', '*');
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.delete('/favorites/:user_id/:product_id', async (req, res) => {
    try {
        const { product_id, user_id } = req.params;

        // Fetch favorite documents for the specified product_id
        const favoritesSnapshot = await db.collection('favorites')
            .where('product_id', '==', product_id)
            .where('user_id', '==', user_id)
            .get();

        const favoritesDocs = favoritesSnapshot.docs;

        res.header('Access-Control-Allow-Origin', '*');
        if (favoritesDocs.length === 0) {
            return res.status(404).json({ message: 'Favorite not found' });
        }

        // Delete each favorite document
        const deletePromises = favoritesDocs.map(favoriteDoc => favoriteDoc.ref.delete());
        await Promise.all(deletePromises);

        res.status(200).json({ message: 'Success' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.delete('/products/:product_id', async (req, res) => {
    try {
        const { product_id } = req.params;

        // Fetch product document for the specified product_id
        const productSnapshot = await db.collection('products')
            .doc(product_id)
            .get();

        res.header('Access-Control-Allow-Origin', '*');
        if (!productSnapshot.exists) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update the is_delete field to 1
        await productSnapshot.ref.update({ is_delete: 1 });

        res.json({ message: 'Success' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.delete('/ratings/:rating_id', async (req, res) => {
    try {
        const { rating_id } = req.params;

        // Fetch rating document for the specified rating_id
        const ratingSnapshot = await db.collection('ratings')
            .doc(rating_id)
            .get();

        res.header('Access-Control-Allow-Origin', '*');
        if (!ratingSnapshot.exists) {
            return res.status(404).json({ message: 'Rating not found' });
        }

        // Delete the rating document
        await ratingSnapshot.ref.delete();

        res.json({ message: 'Success' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.post('/favorites', async (req, res) => {
    try {
        res.header('Access-Control-Allow-Origin', '*');
        const { product_id, user_id, created_at } = req.body;

        // Check if the favorite already exists
        const existingFavoriteSnapshot = await db.collection('favorites')
            .where('product_id', '==', product_id)
            .where('user_id', '==', user_id)
            .get();

        if (!existingFavoriteSnapshot.empty) {
            return res.status(400).json({ error: 'Favorite already exists' });
        }

        // Add a new favorite document
        await db.collection('favorites').add({
            product_id,
            user_id,
            created_at,
        });

        res.status(201).json({ message: 'Thêm thành công!' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.get('/favorites/:user_id', async (req, res) => {
    try {
        const user_id = req.params.user_id;
        // Fetch product from Firestore
        const productDoc = await db.collection('favorites').where('user_id', '==', user_id).get();

        res.header('Access-Control-Allow-Origin', '*');
        if (!productDoc) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }
        const products = await Promise.all(productDoc.docs.map(async (productDoc) => {
            const item = productDoc.data();
            const product = await db.collection('products').doc(item.product_id).get();
            if (product.exists && product.data().is_delete == 0) {
                return {
                    id: item.product_id,
                    name: product.data().name,
                    price: product.data().price,
                    description: product.data().description,
                    url_image1: product.data().url_image1,
                    url_image2: product.data().url_image2,
                };
            }
        }));

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.post('/products', async (req, res) => {
    try {
        res.header('Access-Control-Allow-Origin', '*');
        const { name, price, description, subcategory_id, images, color_size } = req.body;

        // Add a new product document
        const productRef = await db.collection('products').add({
            name,
            price,
            description,
            subcategory_id,
            url_image1: images[0].url,
            url_image2: images[1].url,
            is_delete: 0,
        });

        const newProduct = await productRef.get();

        // Add image documents for the product
        for (const image of images) {
            await db.collection('images').add({
                product_id: newProduct.id,
                image_url: image.url,
            });
        }

        // Add product size/color documents
        for (const colorSize of color_size) {
            await db.collection('productsizecolors').add({
                product_id: newProduct.id,
                size_id: colorSize.size,
                color_id: colorSize.color,
                quantity: parseInt(colorSize.quantity),
            });
        }

        res.status(200).json({ message: 'Thêm thành công!', data: newProduct.data() });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.put('/products/:product_id', async (req, res) => {
    try {
        const product_id = req.params.product_id;
        res.header('Access-Control-Allow-Origin', '*');
        const { name, price, description, subcategory_id, images, color_size } = req.body;

        // Update the product document
        await db.collection('products')
            .doc(product_id)
            .update({
                name,
                price,
                description,
                subcategory_id,
            });

        // Add new image documents for the product
        if (images.length > 0) {
            for (const image of images) {
                await db.collection('images').add({
                    product_id,
                    image_url: image.url,
                });
            }
        }

        // Remove existing product size/color documents
        const existingProductSizeColorsSnapshot = await db.collection('productsizecolors')
            .where('product_id', '==', product_id)
            .get();

        const existingProductSizeColorsDocs = existingProductSizeColorsSnapshot.docs;
        const deletePromises = existingProductSizeColorsDocs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);

        // Add new product size/color documents
        for (const colorSize of color_size) {
            await db.collection('productsizecolors').add({
                product_id,
                size_id: colorSize.size,
                color_id: colorSize.color,
                quantity: colorSize.quantity,
            });
        }

        res.status(200).json({ message: 'Success' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

// Images
app.get('/imagesByProductId/:product_id', async (req, res) => {
    try {
        const product_id = req.params.product_id;

        // Fetch images for the specified product_id
        const imagesSnapshot = await db.collection('images')
            .where('product_id', '==', product_id)
            .get();

        const imagesDocs = imagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.header('Access-Control-Allow-Origin', '*');
        if (imagesDocs.length === 0) {
            return res.status(404).json({ message: 'Hình ảnh sản phẩm không tồn tại' });
        }

        res.json(imagesDocs);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.delete('/deleteImage/:image_id', async (req, res) => {
    try {
        const { image_id } = req.params;
        res.header('Access-Control-Allow-Origin', '*');

        // Fetch the product_id before deleting the image
        const imageSnapshot = await db.collection('images')
            .doc(image_id)
            .get();

        if (!imageSnapshot.exists) {
            return res.status(404).json({ message: 'Image not found' });
        }

        const product_id = imageSnapshot.data().product_id;

        // Delete the image document
        await db.collection('images')
            .doc(image_id)
            .delete();

        // Fetch remaining images for the specified product_id
        const remainingImagesSnapshot = await db.collection('images')
            .where('product_id', '==', product_id)
            .get();
        await db.collection('products')
            .doc(product_id)
            .update({
                url_image1: remainingImagesSnapshot.docs[0].data().image_url,
                url_image2: remainingImagesSnapshot.docs[1].data().image_url
            });

        const remainingImagesDocs = remainingImagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.json(remainingImagesDocs);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

//Product-Size-Color
app.get('/size_colorByProductId/:product_id', async (req, res) => {
    try {
        const product_id = req.params.product_id;

        // Fetch product size/color information for the specified product_id
        const productSizeColorsSnapshot = await db.collection('productsizecolors')
            .where('product_id', '==', product_id)
            .get();

        const productSizeColorsDocs = productSizeColorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.header('Access-Control-Allow-Origin', '*');
        if (productSizeColorsDocs.length === 0) {
            return res.status(404).json({ message: 'Không tồn tại' });
        }
        const data = await Promise.all(productSizeColorsDocs.map(async item => {
            // Fetch size information
            const sizeSnapshot = await db.collection('sizes')
                .doc(item.size_id)
                .get();

            const sizeData = sizeSnapshot.data();

            // Fetch color information
            const colorSnapshot = await db.collection('colors')
                .doc(item.color_id)
                .get();

            const colorData = colorSnapshot.data();

            return {
                id: item.id,
                size_id: item.size_id,
                color_id: item.color_id,
                quantity: item.quantity,
                size_name: sizeData.size_name,
                color_name: colorData.color_name,
            };
        }));

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.get('/sizes', async (req, res) => {
    try {
        // Fetch sizes
        const sizesSnapshot = await db.collection('sizes')
            .where('is_delete', '==', 0)
            .get();

        const sizesDocs = sizesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.header('Access-Control-Allow-Origin', '*');
        if (sizesDocs.length === 0) {
            return res.status(404).json({ message: 'Không tồn tại' });
        }

        res.json(sizesDocs);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.get('/colors', async (req, res) => {
    try {
        // Fetch colors
        const colorsSnapshot = await db.collection('colors')
            .where('is_delete', '==', 0)
            .get();

        const colorsDocs = colorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.header('Access-Control-Allow-Origin', '*');
        if (colorsDocs.length === 0) {
            return res.status(404).json({ message: 'Không tồn tại' });
        }

        res.json(colorsDocs);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.delete('/colors/:color_id', async (req, res) => {
    try {
        const { color_id } = req.params;

        // Fetch the color document before updating is_delete
        const colorSnapshot = await db.collection('colors')
            .doc(color_id)
            .get();

        res.header('Access-Control-Allow-Origin', '*');
        if (!colorSnapshot.exists) {
            return res.status(404).json({ message: 'Color not found' });
        }

        // Update the color document to set is_delete to 1
        await db.collection('colors')
            .doc(color_id)
            .update({ is_delete: 1 });

        // Fetch the updated color document
        const updatedColorSnapshot = await db.collection('colors')
            .doc(color_id)
            .get();

        const updatedColorData = updatedColorSnapshot.data();

        res.json(updatedColorData);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.delete('/sizes/:size_id', async (req, res) => {
    try {
        const { size_id } = req.params;

        // Fetch the size document before updating is_delete
        const sizeSnapshot = await db.collection('sizes')
            .doc(size_id)
            .get();

        res.header('Access-Control-Allow-Origin', '*');
        if (!sizeSnapshot.exists) {
            return res.status(404).json({ message: 'Size not found' });
        }

        // Update the size document to set is_delete to 1
        await db.collection('sizes')
            .doc(size_id)
            .update({ is_delete: 1 });

        // Fetch the updated size document
        const updatedSizeSnapshot = await db.collection('sizes')
            .doc(size_id)
            .get();

        const updatedSizeData = updatedSizeSnapshot.data();

        res.json(updatedSizeData);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.get('/sizes/:_id', async (req, res) => {
    try {
        const size_id = req.params._id;

        // Fetch the size document
        const sizeSnapshot = await db.collection('sizes')
            .doc(size_id)
            .get();

        res.header('Access-Control-Allow-Origin', '*');
        if (!sizeSnapshot.exists) {
            return res.status(404).json({ message: 'Size not found' });
        }

        const sizeData = sizeSnapshot.data();

        res.json(sizeData);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.get('/colors/:_id', async (req, res) => {
    try {
        const color_id = req.params._id;

        // Fetch the color document
        const colorSnapshot = await db.collection('colors')
            .doc(color_id)
            .get();

        res.header('Access-Control-Allow-Origin', '*');
        if (!colorSnapshot.exists) {
            return res.status(404).json({ message: 'Color not found' });
        }

        const colorData = colorSnapshot.data();

        res.json(colorData);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.post('/colors', async (req, res) => {
    try {
        const { name } = req.body;

        // Create a new color document
        const newColorRef = await db.collection('colors').add({
            color_name: name,
            is_delete: 0,
        });

        res.header('Access-Control-Allow-Origin', '*');
        res.status(201).json({ message: 'Thêm thành công!', color_id: newColorRef.id });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.post('/sizes', async (req, res) => {
    try {
        const { name } = req.body;

        // Create a new size document
        const newSizeRef = await db.collection('sizes').add({
            size_name: name,
            is_delete: 0,
        });

        res.header('Access-Control-Allow-Origin', '*');
        res.status(201).json({ message: 'Thêm thành công!', size_id: newSizeRef.id });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.put('/colors/:color_id', async (req, res) => {
    try {
        const color_id = req.params.color_id;
        const { name } = req.body;

        // Update the color document in Firestore
        await db.collection('colors').doc(color_id).update({
            color_name: name,
        });

        res.header('Access-Control-Allow-Origin', '*');
        res.status(200).json({ message: 'Success' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.put('/sizes/:size_id', async (req, res) => {
    try {
        const size_id = req.params.size_id;
        const { name } = req.body;

        // Update the size document in Firestore
        await db.collection('sizes').doc(size_id).update({
            size_name: name,
        });

        res.header('Access-Control-Allow-Origin', '*');
        res.status(200).json({ message: 'Success' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

//order
app.get('/orders/:status', async (req, res) => {
    try {
        const status = req.params.status;

        // Fetch orders from Firestore
        const ordersSnapshot = await db.collection('orders').where('is_delete', '==', 0).get();
        const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.header('Access-Control-Allow-Origin', '*');

        if (status !== 'Tất cả') {
            // Filter orders by status
            const filteredOrders = orders.filter(order => order.status === status);
            return res.json(filteredOrders);
        }

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.get('/orderByUserId/:user_id', async (req, res) => {
    try {
        const user_id = req.params.user_id;

        // Fetch orders from Firestore
        const ordersSnapshot = await db.collection('orders').where('user_id', '==', user_id).where('is_delete', '==', 0).get();
        const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.header('Access-Control-Allow-Origin', '*');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.get('/orderItemByOrderId/:order_id', async (req, res) => {
    try {
        const order_id = req.params.order_id;
        // Fetch order items from Firestore
        const orderItemsSnapshot = await db.collection('orderitems').where('order_id', '==', order_id).get();
        const orderItems = orderItemsSnapshot.docs.map(doc => doc.data());

        const data = await Promise.all(orderItems.map(async orderitem => {
            // Fetch product details from Firestore
            const productSnapshot = await db.collection('products').doc(orderitem.product_id).get();
            const product = productSnapshot.data();

            return {
                product_name: product.name,
                url_image1: product.url_image1,
                color: orderitem.color,
                size: orderitem.size,
                price: product.price,
                quantity: orderitem.quantity
            };
        }));

        res.header('Access-Control-Allow-Origin', '*');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.delete('/orders/:order_id', async (req, res) => {
    try {
        const order_id = req.params.order_id;

        // Check if the order exists
        const orderSnapshot = await db.collection('orders').doc(order_id).get();
        const order = orderSnapshot.data();

        res.header('Access-Control-Allow-Origin', '*');
        if (!order) {
            return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
        }

        // Update the order in Firestore (set is_delete to true)
        await db.collection('orders').doc(order_id).update({ is_delete: true });

        res.json({ message: 'Đã xóa đơn hàng thành công' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

function generateProductList(products) {
    // Tạo danh sách sản phẩm từ mảng products
    const listProduct = products.map(product => `<tr class="alignleft">
    <td>${product.name}</td>
    <td>${product.color}</td>
    <td>${product.size}</td>
    <td>${formattedPrice(product.price)}</td>
    <td>${product.quantity}</td>
    </tr>`).join('');

    // HTML cho danh sách sản phẩm
    return `${listProduct}`;
}
const formattedPrice = (price) => {
    const priceAsNumber = parseFloat(price);
    if (!isNaN(priceAsNumber)) {
        const formattedPrice = priceAsNumber.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
        return formattedPrice;
    }
    return "";
}
app.post('/orders', async (req, res) => {
    try {
        res.header('Access-Control-Allow-Origin', '*');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: true,
            auth: {
                user: 'thangcao1906@gmail.com',
                pass: 'uhlydqasvvkklfth',
            },
        });
        let htmlContent = fs.readFileSync('./emailTemplate.html', 'utf8');
        htmlContent = htmlContent.replace('{{listProduct}}', generateProductList(req.body.order_items));
        htmlContent = htmlContent.replace('{{totalAmount}}', formattedPrice(req.body.total_price));
        htmlContent = htmlContent.replace('{{receiver}}', req.body.receiver);
        htmlContent = htmlContent.replace('{{note}}', req.body.note);
        htmlContent = htmlContent.replace('{{address}}', req.body.address);
        htmlContent = htmlContent.replace('{{phone}}', req.body.phone);
        htmlContent = htmlContent.replace('{{email}}', req.body.email);

        const mailOptions = {
            from: 'thangcao1906@gmail.com',
            to: req.body.email,
            subject: 'THÔNG BÁO ĐƠN HÀNG',
            // html: `<html>
            //          <body>
            //            <h2>Đặt hàng thành công</h2>
            //            <p>Trạng thái đơn hàng ${req.body.status}</p>
            //          </body>
            //        </html>`,
            html: htmlContent
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.status(500).send({ message: "Email không tồn tại" });
            }
        });

        const newOrderData = {
            user_id: req.body.user_id,
            receiver: req.body.receiver,
            phone: req.body.phone,
            address: req.body.address,
            order_date: req.body.order_date,
            total_price: req.body.total_price,
            status: req.body.status,
            note: req.body.note,
            is_delete: 0,
        };

        // Add new order to Firestore
        const orderRef = await db.collection('orders').add(newOrderData);
        const orderId = orderRef.id;

        for (const orderItem of req.body.order_items) {
            const newItem = {
                order_id: orderId,
                product_id: orderItem.product_id,
                color: orderItem.color,
                size: orderItem.size,
                quantity: orderItem.quantity,
            };

            // Add new order item to Firestore
            await db.collection('orderitems').add(newItem);

            // Update corresponding data
            const colorsSnapshot = await db.collection('colors').where('color_name', '==', orderItem.color).get();
            const sizesSnapshot = await db.collection('sizes').where('size_name', '==', orderItem.size).get();

            const colorId = colorsSnapshot.docs[0].id;

            const sizeId = sizesSnapshot.docs[0].id;

            // Update ProductSizeColor in Firestore
            const productSizeColorRef = db.collection('productsizecolors')
                .where('product_id', '==', orderItem.product_id)
                .where('color_id', '==', colorId)
                .where('size_id', '==', sizeId);

            const productSizeColorSnapshot = await productSizeColorRef.get();
            const productSizeColorId = productSizeColorSnapshot.docs[0].id;

            await db.collection('productsizecolors').doc(productSizeColorId).update({
                quantity: admin.firestore.FieldValue.increment(-orderItem.quantity),
            });

        }

        res.json({ message: 'Đã thêm đơn hàng mới thành công' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.put('/changeStatus/:id/:status', async (req, res) => {
    try {
        const { id, status } = req.params;
        res.header('Access-Control-Allow-Origin', '*');

        // Update order status in Firestore
        await db.collection('orders').doc(id).update({ status: status });
        res.status(200).json({ message: 'Thay đổi trạng thái đơn hàng thành công' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

//rating
app.get('/ratingByUser_Product/:user/:product', async (req, res) => {
    try {
        const ratingsSnapshot = await db.collection('ratings').get();
        const usersSnapshot = await db.collection('users').get();

        const ratings = ratingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const usersMap = new Map(usersSnapshot.docs.map(doc => [doc.id, doc.data()]));
        res.header('Access-Control-Allow-Origin', '*');

        if (!ratings) {
            return res.json({ message: 'Null' });
        }

        let filteredRatings = [...ratings];

        if (req.params.user !== 'All') {
            filteredRatings = filteredRatings.filter(rating => rating.user_id === req.params.user);
        }

        if (req.params.product !== 'All') {
            filteredRatings = filteredRatings.filter(rating => rating.product_id === req.params.product);
        }

        const data = filteredRatings.map(rating => {
            const user = usersMap.get(rating.user_id);
            return {
                id: rating.id,
                product_id: rating.product_id,
                user_id: rating.user_id,
                rating: rating.rating,
                comment: rating.comment,
                created_at: rating.created_at,
                firstname: user.firstname,
                lastname: user.lastname,
            };
        });

        return res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.post('/ratings', async (req, res) => {
    try {
        res.header('Access-Control-Allow-Origin', '*');
        const { product_id, user_id, rating, comment, created_at } = req.body;

        const newData = {
            product_id,
            user_id,
            rating,
            comment,
            created_at,
        };

        await db.collection('ratings').add(newData);

        res.status(201).json({ message: 'Đánh giá đã được thêm thành công!' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

//users
app.get('/users', async (req, res) => {
    try {

        res.header('Access-Control-Allow-Origin', '*')

        const usersSnapshot = await db.collection('users').where('is_delete', '==', 0).get();

        const data = await Promise.all(usersSnapshot.docs.map(async (doc) => {
            const user = doc.data();
            const role = await db.collection('roles').doc(user.idRole).get();
            return {
                id: doc.id,
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                phone: user.phone,
                email: user.email,
                address: user.address,
                roleName: role.data().roleName,
            };
        }));

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.get('/roles', async (req, res) => {
    try {
        const rolesSnapshot = await db.collection('roles').get();

        const roles = rolesSnapshot.docs.map(doc => ({
            id: doc.id,
            roleName: doc.data().roleName,
        }));

        res.header('Access-Control-Allow-Origin', '*');
        res.json(roles);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.get('/users/:_id', async (req, res) => {
    try {
        const userId = req.params._id;
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        const userData = {
            id: userDoc.id,
            ...userDoc.data(),
        };

        res.header('Access-Control-Allow-Origin', '*');
        res.json(userData);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.get('/checkUserName/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const userQuery = await db.collection('users').where('username', '==', username).where('is_delete', '==', 0).get();
        res.header("Access-Control-Allow-Origin", "*");

        if (userQuery.empty) {
            return res.json('Null');
        }

        // Assuming there's only one matching user, retrieve the email
        const userDoc = userQuery.docs[0];
        const userEmail = userDoc.get('email');

        res.json(userEmail);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.delete('/users/:user_id', async (req, res) => {
    try {
        const user_id = req.params.user_id;

        // Update the user document by setting is_delete to 1
        await db.collection('users').doc(user_id).update({ is_delete: 1 });

        res.header('Access-Control-Allow-Origin', '*');
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.post('/users', async (req, res) => {
    try {
        res.header("Access-Control-Allow-Origin", "*");
        const { firstname, lastname, username, password, phone, email, address, idRole } = req.body;

        // Check if the username is already taken
        const usernameSnapshot = await db.collection('users').where('username', '==', username).get();
        if (!usernameSnapshot.empty) {
            return res.status(401).json({ message: 'Người dùng đã tồn tại!' });
        }

        // Check if the email is already taken
        const emailSnapshot = await db.collection('users').where('email', '==', email).get();
        if (!emailSnapshot.empty) {
            return res.status(401).json({ message: 'Email đã tồn tại!' });
        }

        let userRole = idRole;

        if (idRole == '') {
            const defaultRoleSnapshot = await db.collection('roles').where('roleName', '==', 'user').get();
            if (!defaultRoleSnapshot.empty) {
                userRole = defaultRoleSnapshot.docs[0].id;
            }
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = {
            firstname,
            lastname,
            username,
            password: hashedPassword,
            phone,
            email,
            address,
            idRole: userRole,
            is_delete: 0
        };

        await db.collection('users').add(newUser);

        res.status(201).json({ message: 'Người dùng đã được thêm thành công!' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.put('/users/:user_id', async (req, res) => {
    try {
        const user_id = req.params.user_id;
        res.header("Access-Control-Allow-Origin", "*");
        const { firstname, lastname, username, password, phone, email, address, idRole, flgEmail, flgUserName } = req.body;

        // Retrieve user data
        const userRef = db.collection('users').doc(user_id);
        const userData = (await userRef.get()).data();

        if (!userData) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (flgUserName) {
            // Check if the new username already exists
            const usernameSnapshot = await db.collection('users').where('username', '==', username).get();
            if (!usernameSnapshot.empty && usernameSnapshot.docs[0].id !== user_id) {
                return res.status(401).json({ message: 'Người dùng đã tồn tại!' });
            }
        }

        if (flgEmail) {
            // Check if the new email already exists
            const emailSnapshot = await db.collection('users').where('email', '==', email).get();
            if (!emailSnapshot.empty && emailSnapshot.docs[0].id !== user_id) {
                return res.status(401).json({ message: 'Email đã tồn tại!' });
            }
        }

        // Update user data
        const updatedUserData = {
            firstname,
            lastname,
            username,
            phone,
            email,
            address,
        };

        if (password) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            updatedUserData.password = hashedPassword;
        }

        if (idRole !== undefined) {
            updatedUserData.idRole = idRole;
        }

        await userRef.update(updatedUserData);

        res.status(200).json({ message: 'Success' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        res.header("Access-Control-Allow-Origin", "*");
        // Retrieve user data from Firebase
        const usersRef = db.collection('users');
        const userSnapshot = await usersRef.where('username', '==', username)
            .limit(1)
            .get();
        var userData = {};
        var id = '';
        if (userSnapshot.empty) {
            const emailSnapshot = await usersRef.where('email', '==', username)
                .limit(1)
                .get();

            if (emailSnapshot.empty) {
                return res.status(401).json({ message: 'Tên người dùng không tồn tại' });
            }
            else {
                userData = emailSnapshot.docs[0].data();
                id = emailSnapshot.docs[0].id;
            }
        }
        else {
            userData = userSnapshot.docs[0].data();
            id = userSnapshot.docs[0].id;
        }

        // Check if the provided password is valid
        const isPasswordValid = await bcrypt.compare(password, userData.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Mật khẩu không đúng' });
        }

        // Retrieve user role from Firebase
        const roleSnapshot = await db.collection('roles').doc(userData.idRole).get();
        const roleData = roleSnapshot.data();

        res.json({
            user: {
                id: id,
                firstname: userData.firstname,
                lastname: userData.lastname,
                username: userData.username,
                phone: userData.phone,
                email: userData.email,
                address: userData.address,
                idRole: userData.idRole,
                is_delete: userData.is_delete,
            },
            roleName: roleData ? roleData.roleName : '',
            message: 'Đăng nhập thành công'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.post('/send-email', async (req, res) => {
    try {

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: true,
            auth: {
                user: 'thangcao1906@gmail.com',
                pass: 'uhlydqasvvkklfth',
            },
        });
        const { recipient_email, OTP } = req.body;
        const mailOptions = {
            from: 'thangcao1906@gmail.com',
            to: recipient_email,
            subject: 'PASSWORD RESET',
            html: `<html>
                     <body>
                       <h2>Password Recovery</h2>
                       <p>Use this OTP to reset your password. OTP is valid for 1 minute</p>
                       <h3>${OTP}</h3>
                     </body>
                   </html>`,
        };
        res.header("Access-Control-Allow-Origin", "*");

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.status(500).send({ message: "Lỗi trong quá trình gửi email" });
            } else {
                res.status(200).send({ message: "Email được gửi thành công" });
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.put('/resetPassword', async (req, res) => {
    try {
        const { username, newPassword } = req.body;
        res.header("Access-Control-Allow-Origin", "*");

        // Retrieve user data from Firebase
        const usersRef = db.collection('users');
        const userSnapshot = await usersRef.where('username', '==', username).limit(1).get();

        if (userSnapshot.empty) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();

        // Update password in Firebase
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        await userDoc.ref.update({
            password: hashedPassword
        });

        res.status(200).json({ message: 'Cập nhật mật khẩu thành công' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

//revenue
app.post('/getRevenue', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    const data = req.body;

    if (data) {
        try {
            if (data.startDate && data.endDate) {
                const startDate = new Date(data.startDate);
                const endDate = new Date(data.endDate);

                const orderItemsSnapshot = await db.collection('orderitems').get();
                const ordersSnapshot = await db.collection('orders').get();
                const productsSnapshot = await db.collection('products').get();

                const orderItems = orderItemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const filteredOrderItems = orderItems
                    .filter(item => {
                        const order = orders.find(o => o.id === item.order_id);
                        return (
                            order &&
                            order.order_date &&
                            new Date(order.order_date) >= startDate &&
                            new Date(order.order_date) < endDate
                        );
                    })
                    .map(item => {
                        const product = products.find(p => p.id === item.product_id);
                        return {
                            product_id: item.product_id,
                            productName: product ? product.name : '',
                            totalQuantity: item.quantity,
                            totalPrice: item.quantity * product.price,
                        };
                    });
                if (filteredOrderItems.length === 0) {
                    return res.json({ revenue: '0 đồng' });
                }

                const groupedSalesData = filteredOrderItems.reduce((acc, item) => {
                    const existingItem = acc.find(x => x.product_id === item.product_id);
                    if (existingItem) {
                        existingItem.totalQuantity += item.totalQuantity;
                        existingItem.totalPrice += item.totalPrice;
                    } else {
                        acc.push({
                            product_id: item.product_id,
                            productName: item.productName,
                            totalQuantity: item.totalQuantity,
                            totalPrice: item.totalPrice,
                        });
                    }
                    return acc;
                }, []);

                // Sort the grouped sales data by total quantity
                const sortedSalesData = groupedSalesData.sort((a, b) => b.totalQuantity - a.totalQuantity);

                // Calculate total sales
                const totalSales = groupedSalesData.reduce((acc, item) => acc + item.totalPrice, 0);

                // Format the total sales amount
                const formattedData = new Intl.NumberFormat('vi-VN').format(totalSales) + ' đồng';

                res.json({ revenue: formattedData, salesData: sortedSalesData });

            } else if (data.date) {
                const date = new Date(data.date);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();

                const orderItemsSnapshot = await db.collection('orderitems').get();
                const ordersSnapshot = await db.collection('orders').get();
                const productsSnapshot = await db.collection('products').get();

                const orderItems = orderItemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const filteredOrderItems = orderItems
                    .filter(item => {
                        const order = orders.find(o => o.id === item.order_id);
                        return (
                            order &&
                            order.order_date &&
                            new Date(order.order_date).getFullYear() === year &&
                            new Date(order.order_date).getMonth() + 1 === month &&
                            new Date(order.order_date).getDate() === day
                        );
                    })
                    .map(item => {
                        const product = products.find(p => p.id === item.product_id);
                        return {
                            product_id: item.product_id,
                            productName: product ? product.name : '',
                            totalQuantity: item.quantity,
                            totalPrice: item.quantity * product.price,
                        };
                    });

                if (filteredOrderItems.length === 0) {
                    return res.json({ revenue: '0 đồng' });
                }

                const groupedSalesData = filteredOrderItems.reduce((acc, item) => {
                    const existingItem = acc.find(x => x.product_id === item.product_id);
                    if (existingItem) {
                        existingItem.totalQuantity += item.totalQuantity;
                        existingItem.totalPrice += item.totalPrice;
                    } else {
                        acc.push({
                            product_id: item.product_id,
                            productName: item.productName,
                            totalQuantity: item.totalQuantity,
                            totalPrice: item.totalPrice,
                        });
                    }
                    return acc;
                }, []);

                const sortedSalesData = groupedSalesData.sort((a, b) => b.totalQuantity - a.totalQuantity);

                const totalSales = groupedSalesData.reduce((acc, item) => acc + item.totalPrice, 0);

                const formattedData = new Intl.NumberFormat('vi-VN').format(totalSales) + ' đồng';
                res.json({ revenue: formattedData, salesData: sortedSalesData });

            } else if (data.month && data.year) {
                const year = parseInt(data.year);
                const month = parseInt(data.month);

                const orderItemsSnapshot = await db.collection('orderitems').get();
                const ordersSnapshot = await db.collection('orders').get();
                const productsSnapshot = await db.collection('products').get();

                const orderItems = orderItemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const filteredOrderItems = orderItems
                    .filter(item => {
                        const order = orders.find(o => o.id === item.order_id);
                        return (
                            order &&
                            order.order_date &&
                            new Date(order.order_date).getFullYear() === year &&
                            new Date(order.order_date).getMonth() + 1 === month
                        );
                    })
                    .map(item => {
                        const product = products.find(p => p.id === item.product_id);
                        return {
                            product_id: item.product_id,
                            productName: product ? product.name : '',
                            totalQuantity: item.quantity,
                            totalPrice: item.quantity * product.price,
                        };
                    });

                if (filteredOrderItems.length === 0) {
                    return res.json({ revenue: '0 đồng' });
                }

                const groupedSalesData = filteredOrderItems.reduce((acc, item) => {
                    const existingItem = acc.find(x => x.product_id === item.product_id);
                    if (existingItem) {
                        existingItem.totalQuantity += item.totalQuantity;
                        existingItem.totalPrice += item.totalPrice;
                    } else {
                        acc.push({
                            product_id: item.product_id,
                            productName: item.productName,
                            totalQuantity: item.totalQuantity,
                            totalPrice: item.totalPrice,
                        });
                    }
                    return acc;
                }, []);

                const sortedSalesData = groupedSalesData.sort((a, b) => b.totalQuantity - a.totalQuantity);

                const totalSales = groupedSalesData.reduce((acc, item) => acc + item.totalPrice, 0);

                const formattedData = new Intl.NumberFormat('vi-VN').format(totalSales) + ' đồng';
                res.json({ revenue: formattedData, salesData: sortedSalesData });
            }
            else if (data.year) {
                const year = parseInt(data.year);

                const orderItemsSnapshot = await db.collection('orderitems').get();
                const ordersSnapshot = await db.collection('orders').get();
                const productsSnapshot = await db.collection('products').get();

                const orderItems = orderItemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const filteredOrderItems = orderItems
                    .filter(item => {
                        const order = orders.find(o => o.id === item.order_id);
                        return (
                            order &&
                            order.order_date &&
                            new Date(order.order_date).getFullYear() === year
                        );
                    })
                    .map(item => {
                        const product = products.find(p => p.id === item.product_id);

                        return {
                            product_id: item.product_id,
                            productName: product ? product.name : '',
                            totalQuantity: item.quantity,
                            totalPrice: item.quantity * product.price,
                        };
                    });

                if (filteredOrderItems.length === 0) {
                    return res.json({ revenue: '0 đồng' });
                }

                const groupedSalesData = filteredOrderItems.reduce((acc, item) => {
                    const existingItem = acc.find(x => x.product_id === item.product_id);
                    if (existingItem) {
                        existingItem.totalQuantity += item.totalQuantity;
                        existingItem.totalPrice += item.totalPrice;
                    } else {
                        acc.push({
                            product_id: item.product_id,
                            productName: item.productName,
                            totalQuantity: item.totalQuantity,
                            totalPrice: item.totalPrice,
                        });
                    }
                    return acc;
                }, []);

                const sortedSalesData = groupedSalesData.sort((a, b) => b.totalQuantity - a.totalQuantity);

                const totalSales = groupedSalesData.reduce((acc, item) => acc + item.totalPrice, 0);

                const formattedData = new Intl.NumberFormat('vi-VN').format(totalSales) + ' đồng';
                res.json({ revenue: formattedData, salesData: sortedSalesData });
            }
        } catch (error) {
            res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
        }
    } else {
        res.status(400).json({ error: 'Không có dữ liệu hoặc dữ liệu không hợp lệ.' });
    }
});


app.use(
    cookieSession({
        name: "session",
        keys: ["cyberwolve"],
        maxAge: 24 * 60 * 60 * 100,
    })
);
app.use(passport.initialize());
app.use(passport.session());

app.get(
    '/api/google/callback',
    passport.authenticate('google', { session: false }),
    async (req, res) => {
        try {
            const user = req.user;
            const existingUserSnapshot = await db.collection('users').where('email', '==', user.emails[0].value).get();

            if (existingUserSnapshot.empty) {
                const defaultRoleSnapshot = await db.collection('roles').where('roleName', '==', 'user').get();

                let userRole = null;
                if (!defaultRoleSnapshot.empty) {
                    userRole = defaultRoleSnapshot.docs[0].id;
                }

                const newUser = {
                    firstname: user.name.givenName,
                    lastname: user.name.familyName,
                    username: user.emails[0].value,
                    password: '',
                    phone: '',
                    email: user.emails[0].value,
                    address: '',
                    idRole: userRole,
                    is_delete: 0
                };

                const newUserRef = await db.collection('users').add(newUser);

                res.redirect(`http://localhost:3000/auth/callback?id=${newUserRef.id}&firstname=${newUser.firstname}&lastname=${newUser.lastname}&email=${newUser.email}&phone=${newUser.phone}&address=${newUser.address}&role=user`);
            } else {
                const existingUser = existingUserSnapshot.docs[0].data();

                res.redirect(`http://localhost:3000/auth/callback?id=${existingUserSnapshot.docs[0].id}&firstname=${existingUser.firstname}&lastname=${existingUser.lastname}&email=${existingUser.email}&phone=${existingUser.phone}&address=${existingUser.address}&role=${existingUser.idRole}`);
            }
        } catch (error) {
            res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
        }

    }
);
// cart

app.get('/cartByUser/:user_id', async (req, res) => {
    try {
        const cartSnapshot = await db.collection('cart').where('user_id', '==', req.params.user_id).get();
        const cart = cartSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.header("Access-Control-Allow-Origin", "*");
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.get('/cart/:cart_id', async (req, res) => {
    try {
        const cart_id = req.params.cart_id;
        const cartSnapshot = await db.collection('cart').doc(cart_id).get();
        res.header("Access-Control-Allow-Origin", "*");

        if (cartSnapshot.exists) {
            const cartData = cartSnapshot.data();
            const cart = { id: cartSnapshot.id, ...cartData };
            res.status(200).json(cart);
        } else {
            res.status(404).json({ error: 'cart not found' });
        }

    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.delete('/deleteCartItem/:cart_id', async (req, res) => {
    try {
        const cartId = req.params.cart_id;

        res.header("Access-Control-Allow-Origin", "*");

        // Xoá cart
        const cartSnapshot = await db.collection('cart').doc(cartId).get();
        await cartSnapshot.ref.delete();

        res.json({ message: "Success" });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.delete('/deleteCart/:user_id', async (req, res) => {
    try {
        const user_id = req.params.user_id;

        res.header("Access-Control-Allow-Origin", "*");

        // Xoá cart
        const cartSnapshot = await db.collection('cart').where('user_id', '==', user_id).get();
        const deletePromises = cartSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);

        res.json({ message: "Success" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.post('/addCart', async (req, res) => {
    try {
        res.header("Access-Control-Allow-Origin", "*");
        const { user_id, image, product_id, name, price, qty, size, size_color } = req.body;

        const newData = {
            user_id,
            image,
            product_id,
            name,
            price,
            qty,
            size,
            size_color
        };

        // Thêm cart vào Firestore
        const cartRef = await db.collection('cart').add(newData);

        res.status(201).json({ message: 'Thêm thành công!', cartId: cartRef.id });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.put('/updateCart/:cart_id', async (req, res) => {
    try {
        const cart_id = req.params.cart_id;
        res.header("Access-Control-Allow-Origin", "*");
        const { quantity } = req.body;

        // Cập nhật category trong Firestore
        await db.collection('cart').doc(cart_id).update({ qty: quantity });

        res.status(200).json({ message: 'Success' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.get('/getQuantity/:size_color', async (req, res) => {
    try {
        const cartSnapshot = await db.collection('productsizecolors').doc(req.params.size_color).get();

        res.header("Access-Control-Allow-Origin", "*");
        res.status(200).json({ quantity: cartSnapshot.data().quantity });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

app.use(cors());
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`JSON Server is running on port ${PORT}`);
});
