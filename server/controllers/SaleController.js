const Sale = require('../models/SaleModel');
const Product = require('../models/ProductModel');
const DailySale = require('../models/DailySaleModel');
const ReturnedProduct = require('../models/ReturnedProductModel');
const moment = require("moment");
const momentTz = require('moment-timezone');


exports.createSale = async (req, res) => {
    try {
        const { products, totalAmount, customerId, paymentMethod, paymentAmount } = req.body;
        const { storeId, employeeId } = req.user;
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

        const savedSale = await Sale.findById(sale._id)
            .populate('products.productId')
            .populate('customerId');

        const todaySale = await DailySale.findOne({
            date: momentTz().tz("Asia/Tashkent").format("DD.MM.YYYY"),
            employeeId
        });

        todaySale.sales.push(sale._id)
        await todaySale.save()
        res.status(201).json({ message: 'Savdo muvaffaqiyatli yaratildi', sale: savedSale });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getDailySale = async (req, res) => {
    try {
        const { employeeId } = req.user

        const todaySale = await DailySale.findOne({
            date: momentTz().tz("Asia/Tashkent").format("DD.MM.YYYY"),
            employeeId
        });
        return res.json(todaySale)

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}

exports.getDailySales = async (req, res) => {
    try {
        const todaySale = await DailySale.find({
            date: momentTz().tz("Asia/Tashkent").format("DD.MM.YYYY")
        }).populate('sales');
        return res.json(todaySale)

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}

exports.createDailySale = async (req, res) => {
    try {
        const { employeeId, storeId } = req.user
        await DailySale.create({
            employeeId,
            storeId,
            status: 'active',
            sales: [],
            date: momentTz().tz("Asia/Tashkent").format("DD.MM.YYYY")
        })
        return res.json({ message: "Kassa ochildi" })

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}

exports.endDailySale = async (req, res) => {
    try {
        const { employeeId, storeId } = req.user
        await DailySale.findOneAndUpdate({
            employeeId,
            storeId,
            status: 'active',
            date: momentTz().tz("Asia/Tashkent").format("DD.MM.YYYY")
        }, { status: 'inactive' })
        return res.json({ message: "Kassa yopildi" })


    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}

exports.createReturn = async (req, res) => {
  try {
    const { products, saleId } = req.body;
    const { storeId } = req.user;

    const sale = await Sale.findById(saleId);
    if (!sale) return res.status(404).json({ message: "Sotuv topilmadi" });

    for (const returned of products) {
      const { productId, stockDate, quantity, reason } = returned;

      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: `Mahsulot topilmadi: ${productId}` });

      const soldProduct = sale.products.find(p =>
        p.productId.toString() === productId.toString() &&
        new Date(p.stockDate).getTime() === new Date(stockDate).getTime()
      );

      if (!soldProduct || soldProduct.quantity < quantity) {
        return res.status(400).json({ message: 'Qaytarilayotgan mahsulot mos kelmadi yoki miqdor xato' });
      }

      // Ombordagi mahsulotni yangilash
      const formatDate = d => new Date(d).toISOString().split('T')[0];
      const stockItem = product.stock.find(s => formatDate(s.date) === formatDate(stockDate));
      if (!stockItem) return res.status(400).json({ message: 'Omborda mos sana topilmadi' });

      stockItem.quantity += quantity;
      stockItem.totalSold -= quantity;
      await product.save();

      // Sotuvni yangilash
      soldProduct.quantity -= quantity;
      sale.totalAmount -= (soldProduct.price * quantity);
      sale.paidAmount = Math.min(sale.paidAmount, sale.totalAmount);
    }

    await sale.save();
    if (sale.totalAmount <= 0) await Sale.findByIdAndDelete(sale._id);

    const returnedProduct = new ReturnedProduct({
      saleId,
      storeId,
      products
    });
    await returnedProduct.save();

    res.status(201).json({ message: "Mahsulotlar muvaffaqiyatli qaytarildi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server xatosi", error: error.message });
  }
};





exports.getReturns = async (req, res) => {
  try {
    const { storeId } = req.user;

    const returns = await ReturnedProduct.find({ storeId })
      .populate('saleId')
      .populate('products.productId');

    res.json(returns);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Serverda xatolik" });
  }
};



exports.getSalesByDateRange = async (req, res) => {
    try {
        const { storeId } = req.user;
        const { start, end } = req.query;

        if (!start || !end) {
            return res.status(400).json({ message: "start va end query parametrlar kerak" });
        }

        const startDate = moment(start, "DD.MM.YYYY").startOf('day').toDate();
        const endDate = moment(end, "DD.MM.YYYY").endOf('day').toDate();

        const sales = await Sale.find({
            storeId,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate("products.productId").lean();
        res.status(200).json(sales);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Serverda xatolik" });
    }
};

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
