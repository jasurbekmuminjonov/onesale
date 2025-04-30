import React, { useMemo, useState } from 'react';
import { Table, Button, Modal, Popconfirm, message, Space, Form, Input, Select, Popover } from 'antd';
import { useGetSalesQuery, usePayDebtMutation } from '../context/service/sale.service';
import { FaDollarSign, FaFilter, FaList } from 'react-icons/fa6';
import { TbClockDollar } from 'react-icons/tb';
import moment from 'moment';
import { useSearchParams, useNavigate } from 'react-router-dom';


const SaleHistory = () => {
    const { data: sales = [], isLoading } = useGetSalesQuery();
    const [payModal, setPayModal] = useState(false);
    const [payId, setPayId] = useState(null);
    const [paymentForm] = Form.useForm();
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [productsModal, setProductsModal] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [paySaleDebt] = usePayDebtMutation();
    const saleId = searchParams.get("saleId");
    const filteredSales = useMemo(() => {
        if (saleId) {
            return sales.filter((sale) => sale._id === saleId);
        }
        return sales;
    }, [sales, saleId])

    const columns = [
        { title: "№", render: (text, record, index) => index + 1 },
        { title: "Mijoz", render: (_, record) => record.customerId?.customerName || "-" },
        { title: "Telefon", render: (_, record) => record.customerId?.customerPhone || "-" },
        { title: "Sana", render: (_, record) => moment(record.date).format("DD.MM.YYYY HH:mm") },
        { title: "Umumiy summa", render: (_, record) => record.totalAmount.toLocaleString() },
        { title: "To'langan", render: (_, record) => record.paidAmount.toLocaleString() },
        {
            title: "Qarz",
            render: (_, record) =>
                record.isDebt
                    ? <p style={{ padding: "2px 6px", borderRadius: "6px", background: "#fadbe5", color: "#b85657", textAlign: "center" }}>{(record.totalAmount - record.paidAmount).toLocaleString()}</p>
                    : <p style={{ padding: "2px 6px", borderRadius: "6px", background: "#e9f9ea", color: "#588d60", textAlign: "center" }}>To‘langan</p>
        },
        {
            title: "Amallar",
            render: (_, record) => (
                <Space size="small">
                    <Button onClick={() => {
                        setSelectedProducts(record.products);
                        setProductsModal(true);
                    }}>
                        <FaList />
                    </Button>
                    <Button
                        disabled={!record.isDebt}
                        type="primary"
                        onClick={() => {
                            setPayModal(true);
                            setPayId(record._id);
                            paymentForm.resetFields();
                        }}
                    >
                        <FaDollarSign />
                    </Button>
                    <Popover trigger='click' title="To'lovlar tarixi" content={<Table size='small' pagination={false} dataSource={record.paymentLog} columns={[
                        { title: "Summasi", render: (_, log) => log.amount.toLocaleString() },
                        { title: "Usuli", render: (_, log) => log.paymentMethod === "cash" ? "Naqd" : "Karta" },
                        { title: "Sana", render: (_, log) => moment(log.date).format("DD.MM.YYYY HH:mm") },
                    ]} />} placement='bottom'>
                        <Button>
                            <TbClockDollar />
                        </Button>
                    </Popover>
                </Space>
            )
        }
    ];

    const handlePayment = (values) => {
        paySaleDebt({ id: payId, body: { amount: Number(values.paidAmount), paymentMethod: values.paymentMethod } }).unwrap()
            .then(() => {
                message.success("To‘lov amalga oshirildi");
                setPayModal(false);
                setPayId(null);
                paymentForm.resetFields();
            })
            .catch((err) => {
                message.error("To‘lovda xatolik yuz berdi");
                console.log(err);
            });
    };

    return (
        <div className='sale-history'>
            <Modal open={payModal} title="Qarzni to‘lash" onCancel={() => {
                setPayModal(false);
                setPayId(null);
                paymentForm.resetFields();
            }} footer={null}>
                <Form form={paymentForm} onFinish={handlePayment}>
                    <Form.Item name='paidAmount' rules={[{ required: true, message: "To‘lov summasini kiriting" }]}>
                        <Input type="number" placeholder="To‘lov summasi" />
                    </Form.Item>
                    <Form.Item name='paymentMethod' rules={[{ required: true, message: "To‘lov usulini tanlang" }]}>
                        <Select placeholder="To‘lov usuli" options={[
                            { label: "Naqd", value: "cash" },
                            { label: "Plastik karta", value: "card" },
                        ]} />
                    </Form.Item>
                    <Form.Item>
                        <Button type='primary' htmlType='submit'>Saqlash</Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal open={productsModal} title="Sotilgan tovarlar" onCancel={() => {
                setProductsModal(false);
                setSelectedProducts([]);
            }} footer={null}>
                <Table
                    size='small'
                    dataSource={selectedProducts}
                    pagination={false}
                    columns={[
                        { title: "Tovar", render: (_, item) => item.productId?.productName || "-" },
                        { title: "Miqdor", render: (_, item) => item.quantity.toLocaleString() },
                        { title: "Narx", render: (_, item) => item.price.toLocaleString() },
                        { title: "Umumiy", render: (_, item) => (item.quantity * item.price).toLocaleString() },
                    ]}
                />
            </Modal>

            <Table
                size='small'
                dataSource={filteredSales}
                columns={columns}
                loading={isLoading}
                rowKey="_id"
            />
            <div style={{ marginTop: 16, textAlign: 'right' }}>
                <Button
                    type="default"
                    disabled={!saleId}
                    onClick={() => navigate('/sale-history')}
                >
                    <FaFilter />
                </Button>
            </div>
        </div>
    );
};

export default SaleHistory;
