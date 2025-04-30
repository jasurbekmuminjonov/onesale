const express = require("express");
const { createStore, loginUser, createEmployee, createCustomer, createSupplier, getStore, getEmployees, getEmployee, getCustomers, getSuppliers, getDebtCustomers } = require("./controllers/UserController");
const { authMiddleware } = require("./middlewares/authMiddleware");
const { createProduct, getProductByBarcode, updateProduct, getProductsByName, updateProductStock, getPaginatedProducts } = require("./controllers/ProductController");
const { createImport, getImports, completeImport, payImportDebt, cancelImport } = require("./controllers/ImportController");
const { createSale, getSales, payDebt, createReturn, getReturns } = require("./controllers/SaleController");
const { createExpense, getExpenses } = require("./controllers/ExpenseController");
const rt = express.Router();

//no need for service
rt.post("/store/create", createStore)

//user.service.js
rt.post("/login", loginUser)
rt.post("/employee/create", authMiddleware, createEmployee)
rt.post("/customer/create", authMiddleware, createCustomer)
rt.post("/supplier/create", authMiddleware, createSupplier)
rt.get("/store", authMiddleware, getStore)
rt.get("/employees", authMiddleware, getEmployees)
rt.get("/employee", authMiddleware, getEmployee)
rt.get("/customers", authMiddleware, getCustomers)
rt.get("/customers/debt", authMiddleware, getDebtCustomers)
rt.get("/suppliers", authMiddleware, getSuppliers)

//product.service.js
rt.post("/product/create", authMiddleware, createProduct)
rt.get("/product/barcode", authMiddleware, getProductByBarcode)
rt.get("/product/name", authMiddleware, getProductsByName)
rt.put("/product/stock", authMiddleware, updateProductStock)
rt.get("/product", authMiddleware, getPaginatedProducts)
rt.put("/product/:id", authMiddleware, updateProduct)

//import.service.js
rt.post("/import/create", authMiddleware, createImport)
rt.get("/imports", authMiddleware, getImports)
rt.put("/import/complete/:id", authMiddleware, completeImport)
rt.put("/import/cancel/:id", authMiddleware, cancelImport)
rt.put("/import/payment/:id", authMiddleware, payImportDebt)

//sale.service.js
rt.post("/sale/create", authMiddleware, createSale)
rt.get("/sales", authMiddleware, getSales)
rt.put("/sale/payment/:id", authMiddleware, payDebt)

//return.service.js
rt.post("/return/create", authMiddleware, createReturn)
rt.get('/returns', authMiddleware, getReturns)

//expense.service.js
rt.post("/expense/create", authMiddleware, createExpense)
rt.get("/expenses", authMiddleware, getExpenses)


module.exports = rt;