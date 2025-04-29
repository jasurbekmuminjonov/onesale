const ImportModel = require('../models/ImportModel');
const Product = require('../models/ProductModel');


exports.createImport = async (req, res) => {
    try {
        const { paidAmount, paymentMethod } = req.body;
        const { storeId } = req.user
        req.body.storeId = storeId
        let isDebt = false
        if (paidAmount < req.body.totalAmount) {
            isDebt = true
        }
        req.body.isDebt = isDebt
        if (paidAmount > 0) {
            req.body.paymentLog = [
                {
                    paymentMethod,
                    amount: paidAmount,
                    date: Date.now()
                }
            ]
        }
        await ImportModel.create(req.body);
        return res.status(201).json({ message: "Import muvaffaqiyatli amalga oshirildi" });

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}

exports.getImports = async (req, res) => {
    try {
        const { storeId } = req.user
        const imports = await ImportModel.find({ storeId }).populate('products.productId').populate("supplierId").sort({ date: -1 });
        return res.status(200).json(imports);

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}

exports.completeImport = async (req, res) => {
    try {
        const { id } = req.params;
        const importData = await ImportModel.findById(id);

        for (const item of importData.products) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Tovar topilmadi` });
            }

            const existingStock = product.stock.find(stockItem =>
                stockItem.purchasePrice === item.purchasePrice &&
                stockItem.salePrice === item.salePrice &&
                stockItem.salePriceOptom === item.salePriceOptom
            );

            if (existingStock) {
                existingStock.quantity += item.quantity;
            } else {
                product.stock.push({
                    quantity: item.quantity,
                    purchasePrice: item.purchasePrice,
                    salePrice: item.salePrice,
                    salePriceOptom: item.salePriceOptom,
                });
            }

            await product.save();
        }

        importData.status = 'completed';
        await importData.save();
        return res.status(200).json({ message: "Import muvaffaqiyatli tugallandi" });

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}


exports.cancelImport = async (req, res) => {
    try {
        const { id } = req.params;
        const importData = await ImportModel.findById(id);
        importData.status = 'cancelled'
        await importData.save();
        return res.status(200).json({ message: "Import muvaffaqiyatli bekor qilindi" });

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}

exports.payImportDebt = async (req, res) => {
    try {
        const { id } = req.params;
        const { paidAmount, paymentMethod } = req.body;
        const importData = await ImportModel.findById(id);

        importData.paidAmount += paidAmount;
        importData.paymentLog.push({
            paymentMethod,
            amount: paidAmount
        });

        if (importData.paidAmount >= importData.totalAmount) {
            importData.isDebt = false;
        }

        await importData.save();
        return res.status(200).json({ message: "Import qarzi muvaffaqiyatli to'landi" });

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}