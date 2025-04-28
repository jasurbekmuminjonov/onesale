const Expense = require('../models/ExpenseModel');

exports.getExpenses = async (req, res) => {
    try {
        const { storeId } = req.user;

        const expenses = await Expense.find({ storeId }).sort({ date: -1 });
        if (!expenses || expenses.length === 0) {
            return res.status(404).json({ message: 'Xarajatlar topilmadi' });
        }

        res.status(200).json({ message: 'Xarajatlar muvaffaqiyatli olindi', expenses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server xatosi', error: error.message });
    }
};

exports.createExpense = async (req, res) => {
    try {
        const { amount, description } = req.body;
        const { storeId } = req.user;

        const newExpense = new Expense({
            amount,
            description,
            storeId,
        });

        await newExpense.save();

        res.status(201).json({ message: 'Xarajat muvaffaqiyatli yaratildi', expense: newExpense });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server xatosi', error: error.message });
    }
};
