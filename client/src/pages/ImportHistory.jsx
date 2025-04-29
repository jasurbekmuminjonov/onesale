import React, { useState } from 'react';
import { useCancelImportMutation, useCompleteImportMutation, useGetImportsQuery, usePayImportDebtMutation } from '../context/service/import.service';
import { Button, message, Modal, Popconfirm, Space, Table, Form, Input, Select, Row, Col, Popover } from 'antd'
import { FaCheck, FaDollarSign, FaList, FaX } from "react-icons/fa6";
import { TbClockDollar } from "react-icons/tb";
import moment from 'moment';
const ImportHistory = () => {
    const { data: imports = [], isLoading } = useGetImportsQuery();
    const [completeImport] = useCompleteImportMutation();
    const [cancelImport] = useCancelImportMutation();
    const [payImportDebt] = usePayImportDebtMutation();
    const [payModal, setPayModal] = useState(false);
    const [payId, setPayId] = useState(null);
    const [paymentForm] = Form.useForm()

    const [productsModal, setProductsModal] = useState(false);
    const [products, setProducts] = useState([]);

    const statusTypes = {
        pending: (<p style={{ paddingBlock: "2px", paddingInline: "2px", width: "100px", textAlign: "center", color: "white", borderRadius: "6px", background: "#ffe2b0", color: "#ff8c00" }}>Kutilmoqda</p>),
        completed: (<p style={{ paddingBlock: "2px", paddingInline: "2px", width: "100px", textAlign: "center", color: "white", borderRadius: "6px", background: "#e9f9ea", color: "#588d60" }}>Yetkazilgan</p>),
        cancelled: (<p style={{ paddingBlock: "2px", paddingInline: "2px", width: "100px", textAlign: "center", color: "white", borderRadius: "6px", background: "#fadbe5", color: "#b85657" }}>Qaytarilgan</p>)
    }

    const columns = [
        { title: "№", render: (text, record, index) => (index + 1) },
        { title: "Yetkazib beruvchi", render: (_, record) => record.supplierId.supplierName },
        { title: "Import sanasi", render: (_, record) => moment(record.date).format("DD.MM.YYYY HH:mm") },
        { title: "Umumiy to'lov", render: (_, record) => record.totalAmount.toLocaleString() },
        { title: "To'langan summa", render: (_, record) => record.paidAmount.toLocaleString() },
        { title: "Qarz", render: (_, record) => record.isDebt ? (<p style={{ paddingBlock: "2px", paddingInline: "2px", width: "100px", textAlign: "center", color: "white", borderRadius: "6px", background: "#fadbe5", color: "#b85657" }}>{(record.totalAmount - record.paidAmount).toLocaleString()}</p>) : (<p style={{ paddingBlock: "2px", paddingInline: "2px", width: "100px", textAlign: "center", color: "white", borderRadius: "6px", background: "#e9f9ea", color: "#588d60" }}>To'langan</p>) },
        { title: "Holat", render: (_, record) => statusTypes[record.status] },
        {
            title: "Amallar", render: (_, record) => (
                <Space size='small'>
                    <Button type='primary' onClick={() => {
                        setProducts(record.products);
                        setProductsModal(true);
                    }}>
                        <FaList />
                    </Button>
                    <Popconfirm cancelText="Yo'q" okText="Ha" title="Importni kelgan etib belgilamoqchimisiz?" onConfirm={() => {
                        completeImport({ id: record._id }).unwrap()
                            .then(() => {
                                message.success("Import tasdiqlandi");
                            })
                            .catch((error) => {
                                message.error("Importni tasdiqlashda xatolik yuz berdi");
                                console.log(error);
                            });
                    }} onCancel={() => { }}>
                        <Button disabled={record.status !== "pending"} color='success' type='primary'>
                            <FaCheck />
                        </Button>
                    </Popconfirm>
                    <Popconfirm cancelText="Yo'q" okText="Ha" title="Importni bekor qilasizmi?" onConfirm={() => {
                        cancelImport({ id: record._id }).unwrap()
                            .then(() => {
                                message.success("Import bekor qilindi");
                            })
                            .catch((error) => {
                                message.error("Importni bekor qilishda xatolik yuz berdi");
                                console.log(error);
                            });
                    }} onCancel={() => { }}>
                        <Button disabled={record.status !== "pending"} color="danger" variant="filled">
                            <FaX />
                        </Button>
                    </Popconfirm>
                    <Button disabled={record.status === "cancelled" || record.isDebt === false} type='primary' onClick={() => {
                        setPayModal(true);
                        setPayId(record._id);
                        paymentForm.resetFields()

                    }}>
                        <FaDollarSign />
                    </Button>
                    <Popover trigger='click' title="To'lovlar tarixi" content={<Table size='small' dataSource={record.paymentLog} columns={[
                        { title: "To'lov summasi", render: (_, record) => record.amount.toLocaleString() },
                        { title: "To'lov usuli", render: (_, record) => record.paymentMethod === "cash" ? "Naqd" : "Karta" },
                        { title: "To'lov sanasi", render: (_, record) => moment(record.date).format("DD.MM.YYYY HH:mm") },
                    ]} />} placement='bottom'>
                        <Button>
                            <TbClockDollar />
                        </Button>
                    </Popover>
                </Space>
            )
        }

    ]

    function handlePayment(values) {
        payImportDebt({ id: payId, body: { paidAmount: Number(values.paidAmount), paymentMethod: values.paymentMethod } }).unwrap()
            .then(() => {
                message.success("To'lov amalga oshirildi");
                setPayModal(false);
                setPayId(null);
                paymentForm.resetFields()
            })
            .catch((error) => {
                message.error("To'lovda xatolik yuz berdi");
                console.log(error);
            });
    }
    return (
        <div className='import-history'>
            <Modal open={payModal} title="Qarzni to'lash" onCancel={() => { setPayModal(false); setPayId(null); paymentForm.resetFields() }} footer={[]}>
                <Form form={paymentForm} onFinish={handlePayment}>
                    <Form.Item name='paidAmount' rules={[{ required: true, message: "To'lov summasini kiriting" }]}>
                        <Input placeholder="To'lov summasi" type='number' />
                    </Form.Item>
                    <Form.Item name='paymentMethod' rules={[{ required: true, message: "To'lov usulini tanlang" }]}>
                        <Select placeholder="To'lov usuli" options={[
                            { label: "Naqd", value: "cash" },
                            { label: "Plastik karta", value: "card" },
                        ]} />
                    </Form.Item>
                    <Form.Item>
                        <Button type='primary' htmlType='submit'>Saqlash</Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal open={productsModal} title="Import qilingan tovarlar" onCancel={() => {
                setProductsModal(false);
                setProducts([]);
            }} footer={[]}>
                <Table size='small' dataSource={products} columns={[
                    { title: "Tovar", render: (_, record) => record.productId.productName },
                    { title: "Miqdor", render: (_, record) => record.quantity?.toLocaleString() },
                    { title: "Narx", render: (_, record) => record.purchasePrice?.toLocaleString() },
                    { title: "Umumiy narx", render: (_, record) => (record.purchasePrice * record.quantity)?.toLocaleString() },
                ]} />
            </Modal>
            <Table size='small' dataSource={imports} columns={columns} loading={isLoading} />
        </div>
    );
};


export default ImportHistory;