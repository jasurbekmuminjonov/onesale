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
        const { barcode } = req.params;
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
