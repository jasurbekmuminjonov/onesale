const Sale = require('../models/SaleModel');
const Product = require('../models/ProductModel');
const ReturnedProduct = require('../models/ReturnedProductModel');

exports.createSale = async (req, res) => {
    try {
        const { products, totalAmount, customerId, paymentMethod, paymentAmount } = req.body;
        const { storeId } = req.user;
        let paymentLog = [];
        const isDebt = paymentAmount < totalAmount;

        if (paymentAmount > 0) {
            paymentLog.push({
                paymentMethod,
                amount: paymentAmount
            });
        }

        for (const soldProduct of products) {
            const { productId, stockDate, quantity } = soldProduct;

            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ message: 'Tovar topilmadi' });
            }

            const stockItem = product.stock.find(item =>
                new Date(item.date).getTime() === new Date(stockDate).getTime()
            );

            if (!stockItem) {
                return res.status(400).json({ message: 'Mahsulot uchun mos zaxira topilmadi' });
            }

            if (stockItem.quantity < quantity) {
                return res.status(400).json({ message: `Mahsulot uchun zaxira yetarli emas: ${product.productName}` });
            }

            stockItem.quantity -= quantity;
            stockItem.totalSold += quantity;
            await product.save();
        }

        const sale = new Sale({
            products,
            totalAmount,
            paidAmount: paymentAmount,
            isDebt,
            customerId,
            paymentLog,
            storeId
        });

        await sale.save();

        res.status(201).json({ message: 'Savdo muvaffaqiyatli yaratildi' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createReturn = async (req, res) => {
    try {
        const { productId, stockDate, saleId, quantity, reason } = req.body;
        const { storeId } = req.user;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Mahsulot topilmadi' });
        }

        const sale = await Sale.findById(saleId);
        if (!sale) {
            return res.status(404).json({ message: 'Sotuv topilmadi' });
        }

        const soldProduct = sale.products.find(item =>
            item.productId.toString() === productId.toString() &&
            new Date(item.stockDate).getTime() === new Date(stockDate).getTime()
        );

        if (!soldProduct) {
            return res.status(400).json({ message: 'Sotuv ichida mos mahsulot topilmadi' });
        }

        if (soldProduct.quantity < quantity) {
            return res.status(400).json({ message: 'Qaytarilayotgan miqdor sotilganidan ko\'p bo\'lishi mumkin emas' });
        }

        const stockItem = product.stock.find(item =>
            new Date(item.date).getTime() === new Date(stockDate).getTime()
        );

        if (!stockItem) {
            return res.status(400).json({ message: 'Mahsulot omborida mos sana topilmadi' });
        }

        stockItem.quantity += quantity;
        stockItem.totalSold -= quantity;

        await product.save();

        soldProduct.quantity -= quantity;
        sale.totalAmount -= (soldProduct.price * quantity);
        sale.paidAmount = Math.min(sale.paidAmount, sale.totalAmount);
        await sale.save();

        if (sale.totalAmount === 0) {
            await sale.remove();
        }


        const returnedProduct = new ReturnedProduct({
            productId,
            stockDate,
            saleId,
            quantity,
            reason,
            storeId
        });

        await returnedProduct.save();

        res.status(201).json({ message: 'Mahsulot muvaffaqiyatli qaytarildi' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server xatosi', error: error.message });
    }
};




exports.getReturns = async (req, res) => {
    try {
        const { storeId } = req.user;
        const returns = await ReturnedProduct.find({ storeId }).populate('productId').populate('saleId');
        res.json(returns);

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}

exports.getSales = async (req, res) => {
    try {
        const { storeId } = req.user;

        const sales = await Sale.find({ storeId })
            .populate('products.productId')
            .populate('customerId')
            .sort({ date: -1 });


        res.status(200).json(sales);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server xatosi', error: error.message });
    }
};



exports.payDebt = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentMethod, amount } = req.body;
        const sale = await Sale.findById(id);
        sale.paidAmount += amount;
        sale.paymentLog.push({
            paymentMethod,
            amount
        });
        if (sale.paidAmount >= sale.totalAmount) {
            sale.isDebt = false;
        }
        await sale.save();
        res.json({ message: 'Qarz to\'lovi saqlandi' });

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}
