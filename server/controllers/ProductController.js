const Product = require('../models/ProductModel');

exports.createProduct = async (req, res) => {
    try {
        const { storeId } = req.user;
        req.body.storeId = storeId;

        await Product.create(req.body);
        return res.status(201).json({ message: "Mahsulot yaratildi" });

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}

exports.getProductByBarcode = async (req, res) => {
    try {
        const { barcode } = req.query;
        if (!barcode) return res.json([])
        const { storeId } = req.user;
        const product = await Product.find({ barcode });
        if (!product) return res.status(404).json({ message: "Mahsulot topilmadi" });

        return res.status(200).json(product.filter((item) => item.storeId.toString() === storeId.toString()));

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await Product.findByIdAndUpdate(id, req.body);
        return res.status(200).json({ message: "Mahsulot tahrirlandi" });

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}
exports.updateProductStock = async (req, res) => {
    try {
        const { productId, stockDate, quantity } = req.body;
        const product = await Product.findById(productId);
        const stockItem = product.stock.find(item =>
            new Date(item.date).getTime() === new Date(stockDate).getTime()
        );
        stockItem.quantity = quantity;
        stockItem.totalSold = 0;
        await product.save();
        return res.status(200).json({ message: "Mahsulot miqdori tahrirlandi" });

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}
exports.getProductsByName = async (req, res) => {
    const { name } = req.query;
    if (!name) return res.json([])

    const decodedName = decodeURIComponent(name);
    console.log(decodedName);

    const { storeId } = req.user;

    try {
        const products = await Product.find(
            {
                productName: { $regex: decodedName, $options: 'i' },
                // storeId: storeId
            }
        );

        res.status(200).json(products.filter(item => item.storeId.toString() === storeId.toString()));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Serverda xatolik yuz berdi" });
    }
};
// exports.getPaginatedProducts = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const { storeId } = req.user
//         const limit = 10;
//         const skip = (page - 1) * limit;

//         const [products, total] = await Promise.all([
//             Product.find().skip(skip).limit(limit).lean(),
//             Product.countDocuments()
//         ]);

//         res.status(200).json({
//             data: products,
//             total
//         });
//     } catch (error) {
//         res.status(500).json({ message: 'Server xatosi', error });
//     }
// };

exports.getPaginatedProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const { storeId } = req.user;
        const limit = 10;
        const skip = (page - 1) * limit;

        const allProducts = await Product.find().lean();

        const filteredProducts = allProducts.filter(p =>
            p.storeId?.toString() === storeId.toString()
        );

        const paginatedProducts = filteredProducts.slice(skip, skip + limit);

        res.status(200).json({
            data: paginatedProducts,
            total: filteredProducts.length,
            currentPage: page,
            totalPages: Math.ceil(filteredProducts.length / limit)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error: error.message });
    }
};

