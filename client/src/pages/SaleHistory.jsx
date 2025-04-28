import React, { useEffect, useState } from 'react';
import { useGetSalesQuery, usePaymentSaleMutation } from '../context/service/sale.service';
import { Button, Popover, Table, Form, message, Modal, Input } from 'antd';
import { FaDollarSign, FaFilter, FaList } from 'react-icons/fa';
import { IoMdDocument } from "react-icons/io";
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';

const SaleHistory = () => {
    const { data: sales = [], isLoading, refetch } = useGetSalesQuery();
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const saleId = searchParams.get('saleId');

    const [form] = Form.useForm();
    const [paymentSale] = usePaymentSaleMutation();
    const [filteredSales, setFilteredSales] = useState([]);
    const [paymentModal, setPaymentModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState("");

    useEffect(() => {
        if (saleId) {
            const filtered = sales.filter(sale => sale._id === saleId);
            setFilteredSales(filtered);
        } else {
            setFilteredSales(sales);
        }
    }, [sales, saleId]);

    const packageTypes = {
        piece: "Dona",
        box: "Quti"
    }
    const statusTypes = {
        inprogress: "Jarayonda",
        delivered: "Yetkazilgan"
    }
    async function handlePayment(values) {
        try {
            const data = {
                paymentAmount: Number(values.paymentAmount),
            }
            await paymentSale({ id: selectedItem, body: data }).unwrap()
            message.success("To'lov muvaffaqiyatli amalga oshirildi")
            form.resetFields()
            setSelectedItem("")
            setPaymentModal(false)
            refetch()

        } catch (error) {
            console.log(error)
            message.error("Xatolik yuz berdi")
        }

    }
    const columns = [
        { title: "Agent", dataIndex: "distributorId", render: (text) => text.fullname },
        { title: "Xaridor", dataIndex: "clientId", render: (text) => text.fullname },
        {
            title: "Mahsulotlar", dataIndex: "products", render: (text) => (
                <Popover trigger='click' title="Sotilgan mahsulotlar" content={
                    <Table style={{ overflowX: "auto" }} dataSource={text} columns={[
                        { title: "Mahsulot", dataIndex: "productName" },
                        { title: "Qadoq turi", dataIndex: "productId", render: (text) => packageTypes[text.productTypeId.packageType] },
                        { title: "Sotilgan miqdor", dataIndex: "quantity" },
                        { title: "Sotilgan quti soni", render: (_, record) => record.productId.productTypeId.packageType === "box" ? record.quantity / record.productId.productTypeId.pieceQuantityPerBox : "-" },
                        { title: "Sotilgan narx", dataIndex: "sellingPrice" },
                        { title: "Jami sof foyda", dataIndex: "netProfit" }
                    ]} />
                }>
                    <Button><FaList /></Button>
                </Popover>
            )
        },
        { title: "Jami qilinadigan to'lov", dataIndex: "totalAmountToPaid", render: (text) => text.toLocaleString() },
        { title: "To'lovning qilingan qismi", dataIndex: "totalAmountPaid", render: (text) => text.toLocaleString() },
        { title: "Qolgan to'lov", render: (_, record) => (record.totalAmountToPaid - record.totalAmountPaid).toLocaleString() },
        {
            title: "Qilingan to'lovlar", dataIndex: "paymentLog", render: (text) => (
                <Popover trigger='click' title="To'lovlar" content={
                    <Table style={{ overflowX: "auto" }} dataSource={text} columns={[
                        { title: "To'lov miqdori", dataIndex: "paymentAmount", render: (text) => text.toLocaleString() },
                        { title: "To'lov sanasi", dataIndex: "paymentDate", render: (text) => moment(text).format("DD.MM.YYYY") },
                    ]} />
                }>
                    <Button><FaList /></Button>
                </Popover>
            )
        },
        {
            title: "To'lov qilish", render: (_, record) => (
                <Button disabled={!record.isDebt} type='primary' onClick={() => {
                    setPaymentModal(true)
                    setSelectedItem(record._id)
                }}>
                    <FaDollarSign />
                </Button>
            )
        },
        {
            title: "Hisob faktura", render: (_, record) => (
                <Button type='primary' onClick={() => generateInvoice(record)}>
                    <IoMdDocument />
                </Button>
            )
        },
        { title: "Sana", dataIndex: "createdAt", render: (text) => moment(text).format("DD.MM.YYYY") },
        { title: "Holat", dataIndex: "status", render: (text) => statusTypes[text] },
    ]

    function generateInvoice(record) {
        const invoiceWindow = window.open('', '_blank');
        const invoiceHTML = `
        <html>
        <head>
            <title>Hisob-faktura</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 40px;
                    width: 210mm;
                    height: 297mm;
                    box-sizing: border-box;
                }
                h1 {
                    text-align: center;
                }
                .info {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 20px;
                    font-size: 14px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 30px;
                }
                th, td {
                    border: 1px solid #333;
                    padding: 8px;
                    text-align: left;
                    font-size: 14px;
                }
                .totals {
                    margin-top: 20px;
                    font-size: 14px;
                }
                .totals div {
                    margin-bottom: 5px;
                }
            </style>
        </head>
        <body>
            <h1>Hisob-faktura</h1>
            <div class="info">
                <div>
                    <strong>Xaridor:</strong> ${record.clientId.fullname}<br>
                    <strong>Telefon:</strong> ${record.clientId.phone}
                </div>
                <div>
                    <strong>Agent:</strong> ${record.distributorId.fullname}<br>
                    <strong>Telefon:</strong> ${record.distributorId.phone}
                </div>
            </div>
    
            <table border="1">
                <thead>
                    <tr>
                        <th>Mahsulot</th>
                        <th>Narxi</th>
                        <th>Qadoqlash turi</th>
                        <th>Dona soni</th>
                        <th>Quti soni</th>
                        <th>Jami</th>
                    </tr>
                </thead>
                <tbody>
                    ${record.products.map(product => {
            const total = product.sellingPrice * product.quantity;
            return `
                            <tr>
                                <td>${product.productName}</td>
                                <td>${product.sellingPrice.toLocaleString()} so'm</td>
                                <td>${packageTypes[product.productId.productTypeId.packageType]}</td>
                                <td>${product.quantity}</td>
                                <td>${product.productId.productTypeId.packageType === "box" ? product.quantity / product.productId.productTypeId.pieceQuantityPerBox : "-"}</td>
                                <td>${total.toLocaleString()} so'm</td>
                            </tr>
                        `;
        }).join('')}
                </tbody>
            </table>
    
            <div class="totals">
                <div><strong>Jami to'lov:</strong> ${record.totalAmountToPaid.toLocaleString()} so'm</div>
                <div><strong>To'langan:</strong> ${record.totalAmountPaid.toLocaleString()} so'm</div>
                <div><strong>Qoldiq:</strong> ${(record.totalAmountToPaid - record.totalAmountPaid).toLocaleString()} so'm</div>
                <div><strong>Sotilgan sana:</strong> ${moment(record.createdAt).format("DD.MM.YYYY")}</div>
            </div>
    
            <script>
                window.onload = function() {
                    window.print();
                }
            </script>
        </body>
        </html>`;

        invoiceWindow.document.open();
        invoiceWindow.document.write(invoiceHTML);
        invoiceWindow.document.close();
    }

    return (
        <div className='sale-history'>
            <Modal open={paymentModal} onCancel={() => {
                setPaymentModal(false)
                form.resetFields()
                setSelectedItem("")
            }} title="To'lov qilish" footer={[]}>
                <Form form={form} onFinish={handlePayment} layout='vertical' autoComplete='off'>
                    <Form.Item name="paymentAmount" label="To'lov miqdori" rules={[{ required: true, message: "To'lov miqdorini kiriting" }]}>
                        <Input type="number" placeholder='100000' />
                    </Form.Item>
                    <Button htmlType='submit' type='primary'>Saqlash</Button>
                </Form>

            </Modal>
            <Table
                style={{ overflowX: "auto" }}
                columns={columns}
                dataSource={[...filteredSales].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))}
                loading={isLoading}
            />
            <Button onClick={() => navigate('/sale-history')} type='primary' disabled={!saleId} style={{ display: "flex", justifySelf: "end" }}>
                <FaFilter />
            </Button>
        </div>
    );
};

export default SaleHistory;