import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Input, message, Row, Space, Table, Form, Select, Modal, Switch, Popconfirm } from 'antd'
import { FaCashRegister, FaMinus, FaPlus } from 'react-icons/fa';
import { useLazyGetProductByBarcodeQuery, useLazyGetProductByNameQuery } from '../context/service/product.service';
import { useCreateCustomerMutation, useGetCustomersQuery } from '../context/service/user.service';
import moment from 'moment';
import { useCreateDailySaleMutation, useCreateSaleMutation, useEndDailySaleMutation, useGetDailySaleQuery } from '../context/service/sale.service';
import emptyCart from '../assets/cart.png'
import { PiCashRegisterBold } from "react-icons/pi";
import { AutoComplete } from "antd";


const Sale = () => {
    const [getProductByBarcode, { data: barcodeData, isLoading: barcodeIsLoading, error: barcodeError }] = useLazyGetProductByBarcodeQuery()
    const [getProductByName, { data: nameData, isLoading: nameIsLoading, error: nameError }] = useLazyGetProductByNameQuery()
    const [data, setData] = useState([])
    const inputRef = useRef()
    const [useOptomPrice, setUseOptomPrice] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [suggestions, setSuggestions] = useState([]);

const handleSearchSuggestions = async (text) => {
    setSearchText(text);
    try {
        const isBarcode = /^\d{5,}$/.test(text);
        let res;
        if (isBarcode) {
            res = await getProductByBarcode({ barcode: text, page: 1, limit: 10 }).unwrap();
        } else {
            res = await getProductByName({ name: text, page: 1, limit: 10 }).unwrap();
        }

        const results = res?.data || [];

        if (results.length === 1) {
            const product = results[0];
            const availableStocks = product.stock?.filter(s => s.quantity > 0) || [];

            if (availableStocks.length === 0) {
                message.error("Omborda mavjud mahsulot yo'q");
                return;
            }

            const selectedStock =
                availableStocks.length === 1
                    ? availableStocks[0]
                    : availableStocks.sort((a, b) => new Date(a.date) - new Date(b.date))[0];

            const alreadyInBasket = basket.find(
                item =>
                    item._id === product._id &&
                    new Date(item.stockDate).getTime() === new Date(selectedStock.date).getTime()
            );

            if (alreadyInBasket) {
                message.error("Mahsulot allaqachon tanlangan");
            } else {
                setBasket([
                    ...basket,
                    {
                        ...product,
                        quantity: 1,
                        stockDate: selectedStock.date,
                        price: useOptomPrice ? selectedStock.salePriceOptom : selectedStock.salePrice,
                        priceType: useOptomPrice ? 'saleOptom' : 'sale',
                    }
                ]);
            }

            // input tozalash
            setSearchText("");
            setSuggestions([]);
        } else {
            // Ko‘p natija bo‘lsa — foydalanuvchiga tanlash imkoniyati uchun ko‘rsatamiz
            setSuggestions(results);
        }
    } catch (err) {
        console.error("Qidiruvda xatolik:", err);
        setSuggestions([]);
    }
};


    const { data: dailySale = {} } = useGetDailySaleQuery()
    const [createDailySale] = useCreateDailySaleMutation()
    const [endDailySale] = useEndDailySaleMutation()
    const [isDaily, setIsDaily] = useState(false)

    useEffect(() => {
        if (dailySale) {
            setIsDaily(true)
        } else {
            setIsDaily(false)
        }
    }, [dailySale])

    const [createCustomerModal, setCreateCustomerModal] = useState(false)
    const [createCustomer] = useCreateCustomerMutation()
    const [createSale] = useCreateSaleMutation()
    const { data: customers, isLoading: customersLoading } = useGetCustomersQuery()
    const [userCreateForm] = Form.useForm()
    const [form] = Form.useForm();
    const [basket, setBasket] = useState([])
    const [searchType, setSearchType] = useState(false)
    const [stockSelectModal, setStockSelectModal] = useState(false)
    const [stockSelectData, setStockSelectData] = useState({})

    useEffect(() => {
        const handleContextMenu = (e) => {
            e.preventDefault();
            setSearchType(prev => !prev);
            inputRef.current?.focus();
        };

        window.addEventListener('contextmenu', handleContextMenu);

        return () => {
            window.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    // async function handleSearch(e) {
    //     try {
    //         if (!searchType) {
    //             const res = await getProductByBarcode(e.target.value).unwrap()
    //             if (res.length === 1) {
    //                 const product = res[0]
    //                 const availableStocks = product.stock.filter(item => item.quantity > 0)

    //                 if (availableStocks.length > 1) {
    //                     setStockSelectData(product)
    //                     setStockSelectModal(true)
    //                 } else if (availableStocks.length === 1) {
    //                     const stock = availableStocks[0]
    //                     const existingProduct = basket.find(
    //                         item =>
    //                             item._id === product._id &&
    //                             new Date(item.stockDate).getTime() === new Date(stock.date).getTime()
    //                     )

    //                     if (existingProduct) {
    //                         message.error("Mahsulot allaqachon tanlangan")
    //                     } else {
    //                         setBasket([
    //                             ...basket,
    //                             {
    //                                 ...product,
    //                                 quantity: 1,
    //                                 stockDate: stock.date,
    //                                 price: useOptomPrice ? stock.salePriceOptom : stock.salePrice,
    //                                 priceType: useOptomPrice ? 'saleOptom' : 'sale'

    //                             }
    //                         ])
    //                     }
    //                 } else {
    //                     message.error("Omborda mavjud mahsulot yo'q")
    //                 }
    //             } else {
    //                 setData(res)
    //             }
    //             e.target.value = ""
    //             e.current.focus()
    //         } else {
    //             const res = await getProductByName(e.target.value).unwrap()
    //             setData(res)
    //         }
    //     } catch (err) {
    //         console.log(err)
    //     }
    // }

    const productsColumns = [
        { title: "№", render: (text, record, index) => (index + 1) },
        { title: "Mahsulot nomi", dataIndex: "productName" },
        { title: "Jami miqdori", dataIndex: "stock", render: (text) => text.reduce((acc, item) => acc + item.quantity, 0) },
        { title: "Sotib olish narxi", dataIndex: "purchasePrice", render: (text) => text.toLocaleString() },
        { title: "Sotish narxi", dataIndex: "salePrice", render: (text) => text.toLocaleString() },
        { title: "Optom sotish narxi", dataIndex: "salePriceOptom", render: (text) => text.toLocaleString() },
        { title: "Barkod", dataIndex: "barcode" },
        { title: "O'lchov birligi", dataIndex: "unitMeasure" },
        {
            title: "Tanlash",
            render: (_, record) => (
                <Button
                    type='primary'
                    onClick={() => {
                        const availableStocks = record.stock?.filter(item => item.quantity > 0) || []

                        if (availableStocks.length > 1) {
                            setStockSelectData(record)
                            setStockSelectModal(true)
                        } else if (availableStocks.length === 1) {
                            const stock = availableStocks[0]

                            const existingProduct = basket.find(
                                item =>
                                    item._id === record._id &&
                                    new Date(item.stockDate).getTime() === new Date(stock.date).getTime()

                            )
                            console.log(stock)
                            if (existingProduct) {
                                message.error("Mahsulot allaqachon tanlangan")
                            } else {
                                setBasket([
                                    ...basket,
                                    {
                                        ...record,
                                        quantity: 1,
                                        stockDate: stock.date,
                                        price: useOptomPrice ? stock.salePriceOptom : stock.salePrice,
                                        priceType: useOptomPrice ? 'saleOptom' : 'sale'

                                    }
                                ])
                            }
                        } else {
                            message.error("Omborda mavjud mahsulot yo'q")
                        }
                    }}
                >
                    <FaPlus />
                </Button>
            )
        }

    ]
    const handleInputChange = (value, key, dataIndex) => {
        const newData = basket.map((item) => {
            if (item.key === key) {
                return { ...item, [dataIndex]: Number(value) };
            }
            return item;
        });
        setBasket(newData);
    };
    const basketColumns = [
        { title: "№", render: (text, record, index) => (index + 1) },
        { title: "Mahsulot nomi", dataIndex: "productName" },
        // {
        //     title: "Sotib olish narxi",
        //     dataIndex: "purchasePrice",
        //     render: (text) => text.toLocaleString(),
        // },
        {
            title: "Sotuv miqdori",
            dataIndex: "quantity",
            render: (text, record) => (
                <Input
                    value={record.quantity}
                    onChange={(e) =>
                        handleInputChange(e.target.value, record.key, "quantity")
                    }
                />
            ),
        },
        {
            title: "Sotish narxi",
            dataIndex: "price",
            render: (text, record) => (
                <Input
                    value={record.price}
                    onChange={(e) =>
                        handleInputChange(e.target.value, record.key, "price")
                    }
                />
            ),
        },
        { title: "Jami sotish summasi", render: (_, record) => (record.price * record.quantity).toLocaleString() },
        {
            title: "O'chirish", render: (_, record) => (
                <Button type='primary' onClick={() => {
                    const newBasket = basket.filter(item => item._id !== record._id)
                    setBasket(newBasket)
                }}>
                    <FaMinus />
                </Button>
            )
        }
    ]
    function printReceipt(sale) {
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${sale._id}`;
        const printWindow = window.open('', '', 'width=300,height=400');

        let receiptHtml = `
            <html>
            <head>
                <style>
                    body { font-family: 'Roboto', sans-serif; font-size: 12px; color: #333; }
                    .center { text-align: center; }
                    table { width: 100%; border-collapse: collapse; font-size: 10px; }
                    td { padding: 2px; }
                </style>
            </head>
            <body>
                <div style="width: 70mm;">
                    <div class="center">
                        <h3 style="margin: 0; font-size: 16px; font-weight: bold;">Anor parumeriya do'koni</h3>
                    </div>
                    <p style="font-size: 10px; margin: 2px 0;"><strong>Jami to'lov:</strong> ${sale.totalAmount} so'm</p>
                    <p style="font-size: 10px; margin: 2px 0;"><strong>To'langan summa:</strong> ${sale.paidAmount} so'm</p>
                    <p style="font-size: 10px; margin: 2px 0;"><strong>Qarz summasi:</strong> ${sale.totalAmount - sale.paidAmount} so'm</p>
                    <p style="font-size: 10px; margin: 2px 0;"><strong>Sana:</strong> ${moment(sale.date).format("DD.MM.YYYY HH:mm")}</p>
                    <div style="margin: 10px 0;">
                        <table border="1">
                            <tbody>`;

        sale?.products.forEach(product => {
            receiptHtml += `
                                <tr>
                                    <td style="text-align: left;">${product.productId.productName}</td>
                                    <td style="text-align: right;">${product.quantity}X${product.price}=${product.quantity * product.price}</td>
                                </tr>`;
        });

        receiptHtml += `
                            </tbody>
                        </table>
                    </div>
                    <div style="padding-top: 10px; display: flex; justify-content: center;">
                        <img id="qr-code" src="${qrCodeUrl}" alt="QR Code" style="width: 100px; height: 100px;" />
                    </div>
                </div>
                <script>
                    const qrImg = document.getElementById('qr-code');
                    qrImg.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(receiptHtml);
        printWindow.document.close();
    }




    async function handleSubmit(values) {
        try {
            const products = basket.map((item) => ({
                productId: item._id,
                quantity: item.quantity,
                stockDate: item.stockDate,
                price: item.price
            }));
            values.products = products
            values.paymentAmount = Number(values.paidAmount)
            values.totalAmount = basket.reduce((acc, item) => acc + item.quantity * item.price, 0)
            const res = await createSale(values).unwrap()
            message.success(res.message)
            setBasket([])
            form.resetFields()
            inputRef.current.focus()
            printReceipt(res.sale)

        } catch (error) {
            message.error(error.data.message)
            console.log(error);
        }

    }

    async function handleUserCreate(values) {
        try {
            const res = await createCustomer(values).unwrap()
            message.success(res.message)
            userCreateForm.resetFields()
            setCreateCustomerModal(false)
        } catch (error) {
            message.error("Xatolik yuz berdi")
            console.log(error);
        }
    }

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === "Space") {
                const active = document.activeElement;
                const isFormElement =
                    active.tagName === "INPUT" ||
                    active.tagName === "TEXTAREA" ||
                    active.tagName === "SELECT" ||
                    active.isContentEditable;
                if (!isFormElement) {
                    e.preventDefault();
                    inputRef.current?.focus();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleSelectProduct = (productId) => {
        const selectedProduct = suggestions.find((item) => item._id === productId);
        if (!selectedProduct) return;

        const availableStocks = selectedProduct.stock?.filter(item => item.quantity > 0) || [];
        if (availableStocks.length === 0) {
            return message.error("Omborda mavjud mahsulot yo'q");
        }

        const selectedStock = availableStocks.sort((a, b) => new Date(a.date) - new Date(b.date))[0];

        const alreadyInBasket = basket.find(
            item =>
                item._id === selectedProduct._id &&
                new Date(item.stockDate).getTime() === new Date(selectedStock.date).getTime()
        );
        if (alreadyInBasket) {
            return message.error("Mahsulot allaqachon tanlangan");
        }

        setBasket([
            ...basket,
            {
                ...selectedProduct,
                quantity: 1,
                stockDate: selectedStock.date,
                price: useOptomPrice ? selectedStock.salePriceOptom : selectedStock.salePrice,
                priceType: useOptomPrice ? "saleOptom" : "sale"
            }
        ]);

        setSearchText("");
        setSuggestions([]);
    };


    return (
        <div className='sale' style={{ display: "flex", height: "100%" }} >
            <Modal open={createCustomerModal} title="Yangi xaridor qo'shish" footer={[]} onCancel={() => {
                userCreateForm.resetFields();
                setCreateCustomerModal(false)
            }}>
                <Form form={userCreateForm} onFinish={handleUserCreate} layout='vertical' autoComplete='off'>
                    <Space direction='vertical' style={{ width: "100%" }}>
                        <Form.Item
                            label="To'liq ism"
                            name={"customerName"}
                            rules={[
                                { required: true, message: "To'liq ismni kiritish shart" }
                            ]}
                        >
                            <Input placeholder='Ali Valiyev' />
                        </Form.Item>
                        <Form.Item
                            label="Telefon"
                            name={"customerPhone"}
                            rules={[
                                { required: true, message: "Telefon kiritish shart" },
                                {
                                    pattern: /^[0-9]{9}$/,
                                    message: "Kerakli format: 901234567",
                                },
                            ]}
                        >
                            <Input placeholder="901234567" />
                        </Form.Item>
                        <Form.Item>
                            <Button type='primary' htmlType='submit'>Saqlash</Button>
                        </Form.Item>
                    </Space>
                </Form>
            </Modal>
            <Modal
                open={stockSelectModal}
                width={700}
                title="Mahsulot tanlash"
                footer={[]}
                onCancel={() => {
                    setStockSelectModal(false)
                    setStockSelectData({})
                }}
            >
                <Table
                    size='small'
                    dataSource={stockSelectData.stock}
                    columns={[
                        { title: "Miqdori", dataIndex: "quantity" },
                        { title: "Sotib olish narxi", dataIndex: "purchasePrice", render: (text) => text.toLocaleString() },
                        { title: "Sotish narxi", dataIndex: "salePrice", render: (text) => text.toLocaleString() },
                        { title: "Optom sotish narxi", dataIndex: "salePriceOptom", render: (text) => text.toLocaleString() },
                        { title: "Sana", dataIndex: "date", render: (text) => moment(text).format("DD.MM.YYYY HH:mm") },
                        {
                            title: "Tanlash", render: (_, record) => (
                                <Button
                                    onClick={() => {
                                        const existingProduct = basket.find(
                                            item =>
                                                item._id === stockSelectData._id &&
                                                new Date(item.stockDate).getTime() === new Date(record.date).getTime()
                                        );

                                        if (existingProduct) {
                                            message.error("Bu narxdagi mahsulot allaqachon tanlangan");
                                        } else {
                                            setBasket([...basket, {
                                                productName: stockSelectData.productName,
                                                _id: stockSelectData._id,
                                                quantity: 1,
                                                stock: record.quantity,
                                                purchasePrice: record.purchasePrice,
                                                salePrice: record.salePrice,
                                                salePriceOptom: record.salePriceOptom,
                                                stockDate: record.date,
                                                price: record.salePrice,
                                                priceType: 'sale'

                                            }]);
                                            setStockSelectModal(false);
                                            setStockSelectData({});
                                        }
                                    }}
                                    type='primary'
                                >
                                    <FaPlus />
                                </Button>
                            )
                        }
                    ]}
                />
            </Modal>

            <div style={{ width: "70%", borderRight: "1px solid #ccc", padding: "0 5px" }}>
                <div className="products-header" style={{ display: "flex", gap: "12px", padding: "12px" }}>
                    <Space>
                        <AutoComplete
                            ref={inputRef}
                            style={{ width: 500, height: 50, fontSize: 20 }}
                            placeholder={"Barkod yoki nomi bilan qidirish"}
                            value={searchText}
                            onChange={(text) => setSearchText(text)}
                            onSearch={handleSearchSuggestions}
                            onSelect={handleSelectProduct}
                            options={suggestions?.map((item) => ({
                                value: item._id,
                                label: `${item.productName} (${item.barcode})`,
                            }))}
                        />
                        {/* <Switch title="Qidiruv turini almashtirish" value={searchType} checkedChildren="Nomi" unCheckedChildren="Barkod" onChange={(value) => setSearchType(value)} /> */}
                        <Popconfirm
                            title={!isDaily ? "Chindan ham kassani ochmoqchimisiz?" : "Chindan ham kassani yopmoqchimisiz?"}
                            onConfirm={async () => {
                                try {
                                    if (!isDaily) {
                                        await createDailySale();
                                    } else {
                                        await endDailySale();
                                    }
                                } catch (error) {
                                    console.error("Error handling daily sale:", error);
                                }
                            }}
                            okText="Ha"
                            cancelText="Yo'q"
                        >
                            <Button disabled={isDaily && dailySale?.status === 'inactive'}>
                                <div
                                    className="dot"
                                    style={{
                                        borderRadius: "10px",
                                        width: "10px",
                                        height: "10px",
                                        background: !isDaily ? "red" : "green",
                                        marginRight: "5px",
                                    }}
                                ></div>
                                <PiCashRegisterBold />
                            </Button>
                        </Popconfirm>
                        <Switch
                            checked={useOptomPrice}
                            onChange={(checked) => setUseOptomPrice(checked)}
                            checkedChildren="Optom"
                            unCheckedChildren="Oddiy"
                            title="Optom narxda qo‘shish"
                        />

                    </Space>
                </div>
                <Table locale={{
                    emptyText:
                        (
                            <div style={{
                                textAlign: "center",
                                display: 'flex',
                                alignItems: "center",
                                flexDirection: "column",
                            }}>
                                <img
                                    src={emptyCart}
                                    alt="Tanlangan tovar yo'q"
                                    style={{ width: 150, marginBottom: 10 }}
                                />
                                <p>Tanlangan tovar yo'q</p>
                            </div>
                        )
                }} pagination={false} size='small' style={{ overflowX: "auto", height: "80%" }} columns={basketColumns} dataSource={basket} />
            </div>
            <div style={{ width: "30%", minHeight: "100%", padding: "5px 5px", display: "flex", flexDirection: "column", gap: "5px" }}>
                <p>Jami to'lov: {basket.reduce((acc, item) => acc + item.quantity * item.price, 0).toLocaleString()}</p>
                <Form onFinish={handleSubmit} autoComplete='off' style={{ height: "35%", padding: "5px 0", borderTop: "1px solid #ccc" }} form={form} layout='vertical'>
                    <Space direction='vertical' style={{ width: "100%" }}>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item label="Xaridor(ixtiyoriy)" name="customerId">
                                    <Select loading={customersLoading}>
                                        {
                                            customers?.map((item) => (
                                                <Select.Option key={item._id} value={item._id}>
                                                    {item.customerName + " - " + item.customerPhone}
                                                </Select.Option>
                                            ))
                                        }
                                    </Select>
                                </Form.Item>
                                <Button onClick={() => {
                                    setCreateCustomerModal(true);
                                    userCreateForm.resetFields()
                                }} style={{ color: "#1677ff", border: "1px dashed #1677ff" }} ghost type='dashed'>
                                    Yangi xaridor qo'shish
                                </Button>
                            </Col>
                            <Col span={24}>
                                <Form.Item initialValue={0} label="To'lov miqdori" name="paidAmount">
                                    <Input type='number' />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label="To'lov usuli" name="paymentMethod" initialValue={'cash'} rules={[{ required: true, message: "To'lov usulini tanlang" }]}>
                                    <Select options={[
                                        { label: "Naqd", value: "cash" },
                                        { label: "Plastik karta", value: "card" }
                                    ]} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16} >
                            <Col span={12} >
                                <Form.Item>
                                    <Button title={!isDaily || dailySale?.status === 'inactive' ? "Kassa yopilgan" : ""} disabled={!isDaily || dailySale?.status === 'inactive'} htmlType='submit' type='primary'>Sotish</Button>
                                    <p>{!isDaily || dailySale?.status === 'inactive' ? "Kassa yopilgan" : ""}</p>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Space>
                </Form>
            </div>
        </div >
    );
};


export default Sale;