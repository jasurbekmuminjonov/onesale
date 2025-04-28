import React, { useEffect, useState } from 'react';
import { useGetProductsQuery } from '../context/service/products.service';
import { Button, Card, Col, Input, message, Row, Space, Table, Typography, Form, Select, Modal } from 'antd'
import moment from 'moment';
import { FaAsterisk, FaPlus } from 'react-icons/fa';
import { FaX } from 'react-icons/fa6';
import { useCreateUserMutation, useGetUsersQuery } from '../context/service/user.service';
import { useCreateSaleMutation } from '../context/service/sale.service';
import { useGetProductTypesQuery } from '../context/service/productType.service';
const { Title, Text } = Typography;
const Sale = () => {
    const { data: products = [], isLoading, refetch } = useGetProductsQuery();
    const { data: users = [], refetch: userRefetch } = useGetUsersQuery()
    const [userType, setUserType] = useState("")
    const [userCreateModal, setUserCreateModal] = useState(false)
    const [userCreateForm] = Form.useForm()
    const [form] = Form.useForm();
    const [filteredProducts, setFilteredProducts] = useState(products)
    const { data: productTypeData = [] } = useGetProductTypesQuery()
    const [createSale] = useCreateSaleMutation()
    const [createUser] = useCreateUserMutation()
    const [basket, setBasket] = useState([])
    const packageTypes = {
        piece: "Dona",
        box: "Quti"
    }
    useEffect(() => {
        setFilteredProducts(products)
    }, [products])

    const productsColumns = [
        { title: "Mahsulot nomi", dataIndex: "productTypeId", render: (text) => text.name },
        { title: "Qadoq turi", dataIndex: "productTypeId", render: (text) => packageTypes[text.packageType] },
        { title: "Jami dona soni", dataIndex: "totalPieceQuantity" },
        { title: "Qutidagi dona soni", dataIndex: "productTypeId", render: (text) => text.packageType === "piece" ? "-" : text.pieceQuantityPerBox },
        { title: "Jami quti soni", dataIndex: "productTypeId", render: (text, record) => text.packageType === "piece" ? "-" : (record.totalPieceQuantity / text.pieceQuantityPerBox).toFixed() },
        { title: "Sotish narxi", dataIndex: "unitSellingPrice" },
        { title: "Kiritilgan sana", dataIndex: "createdAt", render: (text) => moment(text).format("DD.MM.YYYY") },
        { title: "Tanlash", render: (_, record) => (<Button type='primary' onClick={() => basket.find(item => item._id === record._id) ? message.error("Mahsulot allaqachon tanlangan") : setBasket([...basket, record])}><FaPlus /></Button>) },
    ]
    async function handleSubmit(values) {
        try {
            if (basket.length === 0) return message.error("Tanlangan mahsulotlar yo'q")
            const data = {
                clientId: values.clientId,
                distributorId: values.distributorId,
                products: basket.map(item => ({
                    productId: item._id,
                    sellingPrice: item.unitSellingPrice,
                    quantity: item.totalPieceQuantity
                }))
            }
            const res = await createSale(data).unwrap()
            message.success("Sotuv muvaffaqiyatli amalga oshirildi")
            setBasket([])
            form.resetFields()
            refetch()
            setFilteredProducts(products)
            generateInvoice(res.record)
        } catch (error) {
            message.error("Xatolik yuz berdi")
            console.log(error);
        }

    }

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

    async function handleUserCreate(values) {
        try {
            await createUser({ ...values, role: userType }).unwrap()
            message.success("Foydalanuvchi muvaffaqiyatli yaratildi")
            setUserCreateModal(false)
            userCreateForm.resetFields()
            userRefetch()
        } catch (error) {
            message.error("Xatolik yuz berdi")
            console.log(error);
        }
    }

    return (
        <div className='sale' style={{ display: "flex", height: "100%" }}>
            <Modal open={userCreateModal} title={userType === "client" ? "Yangi xaridor qo'shish" : "Yangi agent qo'shish"} footer={[]} onCancel={() => {
                setUserType("");
                setUserCreateModal(false);
                userCreateForm.resetFields()
            }}>
                <Form form={userCreateForm} onFinish={handleUserCreate} layout='vertical' autoComplete='off'>
                    <Space direction='vertical' style={{ width: "100%" }}>
                        <Form.Item
                            label="To'liq ism"
                            name={"fullname"}
                            rules={[
                                { required: true, message: "To'liq ismni kiritish shart" }
                            ]}
                        >
                            <Input placeholder='Ali Valiyev' />
                        </Form.Item>
                        <Form.Item
                            label="Telefon"
                            name={"phone"}
                            rules={[
                                { required: true, message: "Telefon kiritish shart" },
                                {
                                    pattern: /^\+998[0-9]{9}$/,
                                    message:
                                        "Telefon raqami +998 bilan boshlanib, 9 ta raqam bo'lishi kerak",
                                },
                            ]}
                        >
                            <Input placeholder="+998901234567" />
                        </Form.Item>
                        {
                            userType === "distributor" && (
                                <Form.Item
                                    label="Parol"
                                    name={"password"}
                                    rules={[
                                        { required: true, message: "Parolni kiritish shart" },
                                        { minLength: 4, message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" }
                                    ]}
                                >
                                    <Input type='password' placeholder='****' />
                                </Form.Item>
                            )
                        }
                        <Form.Item>
                            <Button type='primary' htmlType='submit'>Saqlash</Button>
                        </Form.Item>
                    </Space>

                </Form>
            </Modal>
            <div style={{ width: "60%", borderRight: "1px solid #ccc", padding: "0 5px" }}>
                <Input
                    onChange={(e) => {
                        const value = e.target.value.toLowerCase();
                        setFilteredProducts(
                            products.filter((item) => item.productTypeId.name.toLowerCase().includes(value))
                        );
                    }}
                    placeholder='Mahsulot qidirish'
                    style={{ margin: "10px 0" }}
                />
                <Table style={{ overflowX: "auto" }} columns={productsColumns} dataSource={filteredProducts} loading={isLoading} />
            </div>
            <div style={{ width: "40%", minHeight: "100%", padding: "5px 5px", display: "flex", flexDirection: "column", gap: "5px" }}>
                <Space direction='vertical' style={{ width: "100%", height: "65%", overflowY: "auto" }}>
                    {basket.length > 0 ? basket.map((item) => (
                        <Card key={item._id}>
                            <Row style={{ alignItems: "end" }} gutter={24} align="middle">
                                <Col span={7}>
                                    <Title level={5}>{item.productTypeId.name}</Title>
                                </Col>
                                <Col span={7}>
                                    <p>Sotish narxi</p>
                                    <Input
                                        type="number"
                                        value={item.unitSellingPrice}
                                        max={item.unitSellingPrice}
                                        min={1}
                                        onChange={(e) => {
                                            const newBasket = basket.map(b => b._id === item._id ? { ...b, unitSellingPrice: Number(e.target.value) } : b)
                                            setBasket(newBasket)
                                        }}
                                    />
                                </Col>
                                <Col span={7}>
                                    <p>Sotilayotgan soni</p>
                                    <p><FaAsterisk size={8} color='orange' />{item.productTypeId.packageType === 'box' ? "Quti soni" : "Dona soni"}</p>
                                    <Input
                                        type="number"
                                        value={item.productTypeId.packageType === 'box' ? item.totalPieceQuantity / item.productTypeId.pieceQuantityPerBox : item.totalPieceQuantity}
                                        max={item.productTypeId.packageType === 'box' ? item.totalPieceQuantity / item.productTypeId.pieceQuantityPerBox : item.totalPieceQuantity}
                                        min={1}
                                        onChange={(e) => {
                                            const newBasket = basket.map(b => b._id === item._id ? { ...b, totalPieceQuantity: item.productTypeId.packageType === 'box' ? Number(e.target.value * item.productTypeId.pieceQuantityPerBox) : Number(e.target.value) } : b)
                                            setBasket(newBasket)
                                        }}
                                    />
                                </Col>
                                <Col span={3}>
                                    <Button danger type='primary' onClick={() => setBasket(basket.filter(b => b._id !== item._id))}>
                                        <FaX />
                                    </Button>
                                </Col>
                            </Row>
                        </Card>

                    )) : (
                        <Text level={5} style={{ textAlign: "center" }}>Tanlangan mahsulotlar yo'q</Text>
                    )}
                </Space>
                <Form onFinish={handleSubmit} autoComplete='off' style={{ height: "35%", padding: "5px 0", borderTop: "1px solid #ccc" }} form={form} layout='vertical'>
                    <Space direction='vertical' style={{ width: "100%" }}>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Xaridor" name="clientId" rules={[{ required: true, message: "Xaridorni tanlang" }]}>
                                    <Select
                                        placeholder='Xaridorni tanlang'
                                        options={users.filter(user => user.role === "client").map(user => ({ label: user.fullname, value: user._id }))}
                                    />
                                </Form.Item>
                                <Button variant='dashed' onClick={() => {
                                    setUserType("client")
                                    setUserCreateModal(true)
                                    userCreateForm.resetFields()
                                }}>
                                    Xaridor qo'shish
                                </Button>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Agent" name="distributorId" rules={[{ required: true, message: "Agentni tanlang" }]}>
                                    <Select
                                        placeholder='Agentni tanlang'
                                        options={users.filter(user => user.role === "distributor").map(user => ({ label: user.fullname, value: user._id }))}
                                    />
                                </Form.Item>
                                <Button variant='dashed' onClick={() => {
                                    setUserType("distributor")
                                    setUserCreateModal(true)
                                    userCreateForm.resetFields()
                                }}>
                                    Agent qo'shish
                                </Button>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item>
                                    <Button htmlType='submit' type='primary'>Sotish</Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Space>
                </Form>
            </div>
        </div>
    );
};


export default Sale;