const Store = require("../models/StoreModel")
const Employee = require("../models/EmployeeModel")
const Customer = require("../models/CustomerModel")
const Supplier = require("../models/SupplierModel")
const Import = require("../models/ImportModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

exports.createStore = async (req, res) => {
    try {
        const { password } = req.body
        req.body.password = await bcrypt.hash(password, 10)
        await Store.create(req.body)
        return res.status(201).json({ message: "Do'kon yaratildi" });

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}

exports.createEmployee = async (req, res) => {
    try {
        const { storeId } = req.user
        const { password, phone } = req.body
        const employee = await Employee.findOne({ phone })
        if (employee) return res.status(400).json({ message: "Bunday telefon raqam bilan xodim mavjud" });
        req.body.password = await bcrypt.hash(password, 10)
        req.body.storeId = storeId
        await Employee.create(req.body)
        return res.status(201).json({ message: "Xodim yaratildi" });


    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}

exports.loginUser = async (req, res) => {
    try {
        const { phone, password } = req.body;

        let user = await Store.findOne({ phone });
        let role = 'admin';

        if (!user) {
            user = await Employee.findOne({ phone });
            role = user?.role;
        }

        if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Parol xato" });

        let payload = {};
        if (role === 'admin') {
            payload = { storeId: user._id };
        } else {
            payload = { employeeId: user._id, storeId: user.storeId };
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET);

        return res.status(200).json({
            message: "Hisobga muvaffaqiyatli kirdingiz",
            token,
            role,
            fullname: user.name
        });

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}

exports.createCustomer = async (req, res) => {
    try {
        const { storeId } = req.user
        req.body.storeId = storeId
        await Customer.create(req.body)
        return res.status(201).json({ message: "Mijoz yaratildi" });

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}
exports.createSupplier = async (req, res) => {
    try {
        const { storeId } = req.user
        req.body.storeId = storeId
        await Supplier.create(req.body)
        return res.status(201).json({ message: "Yetkazib beruvchi yaratildi" });

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}

exports.getSuppliers = async (req, res) => {
    try {
        const { storeId } = req.user;

        const suppliers = await Supplier.find({ storeId });

        const suppliersWithTotals = await Promise.all(suppliers.map(async (supplier) => {
            const imports = await Import.find({ supplierId: supplier._id, storeId });

            const totalPurchaseAmount = imports.reduce((acc, curr) => acc + curr.totalAmount, 0);

            const totalDebtAmount = imports.reduce((acc, curr) => {
                if (curr.isDebt) {
                    return acc + (curr.totalAmount - curr.paidAmount);
                }
                return acc;
            }, 0);

            return {
                ...supplier.toObject(),
                totalPurchaseAmount,
                totalDebtAmount
            };
        }));

        return res.status(200).json(suppliersWithTotals);
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: "Serverda xatolik" });
    }
};
exports.getCustomers = async (req, res) => {
    try {
        const { storeId } = req.user
        const customers = await Customer.find({ storeId })
        return res.status(200).json(customers)

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}

exports.getStore = async (req, res) => {
    try {
        const { storeId } = req.user
        const store = await Store.findById(storeId)
        if (!store) return res.status(404).json({ message: "Do'kon topilmadi" });
        return res.status(200).json(store)

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}

exports.getEmployees = async (req, res) => {
    try {
        const { storeId } = req.user
        const employees = await Employee.find({ storeId })
        return res.status(200).json(employees)

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}
exports.getEmployee = async (req, res) => {
    try {
        const { employeeId } = req.user
        const employee = await Employee.findById(employeeId)
        if (!employee) return res.status(404).json({ message: "Xodim topilmadi" });
        return res.status(200).json(employee)

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}