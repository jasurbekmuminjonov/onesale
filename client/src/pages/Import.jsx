import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Input, message, Row, Space, Table, Typography, Form, Select, Modal, Switch } from 'antd'
import { FaMinus, FaPlus } from 'react-icons/fa';
import { useLazyGetProductByBarcodeQuery, useLazyGetProductByNameQuery, useLazyGetProductByPageQuery } from '../context/service/product.service';
import { useCreateSupplierMutation, useGetSuppliersQuery } from '../context/service/user.service';
import { useCreateImportMutation } from '../context/service/import.service';
import { MdOutlineClear } from 'react-icons/md';

const Import = () => {
    const [getProductByBarcode, { data: barcodeData, isLoading: barcodeIsLoading, isFetching: barcodeIsFetching, error: barcodeError }] = useLazyGetProductByBarcodeQuery()
    const [getProductByPage, { data: pageData, isLoading: pageIsLoading, isFetching: pageIsFetching, error: pageError }] = useLazyGetProductByPageQuery()
    const [getProductByName, { data: nameData, isLoading: nameIsLoading, isFetching: nameIsFetching, error: nameError }] = useLazyGetProductByNameQuery()
    const [data, setData] = useState([])
    const inputRef = useRef()
    const [userType, setUserType] = useState("")
    const [createSupplierModal, setCreateSupplierModal] = useState(false)
    const [createSupplier] = useCreateSupplierMutation()
    const [createImport] = useCreateImportMutation()
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [value, setValue] = useState('');

    const { data: suppliers, isLoading: suppliersLoading } = useGetSuppliersQuery()
    const [userCreateForm] = Form.useForm()
    const [form] = Form.useForm();
    const [basket, setBasket] = useState([])
    const [searchType, setSearchType] = useState(false)
    const [searchValue, setSearchValue] = useState('');


    const handleTableChange = async (pagination) => {
        setPagination(pagination);
        try {
            const isBarcode = /^\d{5,}$/.test(value);
            if (value.trim()) {
                if (isBarcode) {
                    const res = await getProductByBarcode({
                        barcode: value,
                        page: 1,
                        limit: pagination.pageSize,
                    }).unwrap();
                    setData(res.data || []);
                    setPagination((prev) => ({
                        ...prev,
                        total: res?.total || 0,
                    }));

                } else {
                    const res = await getProductByName({
                        name: value,
                        page: pagination.current,
                        limit: pagination.pageSize,
                    }).unwrap();
                    setData(res.data || []);
                    setPagination((prev) => ({
                        ...prev,
                        total: res?.total || 0,
                    }));
                }
            } else {
                const res = await getProductByPage({
                    page: pagination.current,
                    limit: pagination.pageSize,
                }).unwrap();
                setData(res.data || []);
                setPagination((prev) => ({
                    ...prev,
                    total: res?.total || 0,
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

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

    async function fetchProducts() {
        try {
            const isBarcode = /^\d{5,}$/.test(searchValue);
            const params = { page: pagination.current, limit: pagination.pageSize };
            let res;
            if (searchValue.trim()) {
                if (isBarcode) {
                    res = await getProductByBarcode({ barcode: searchValue, ...params }).unwrap();
                } else {
                    res = await getProductByName({ name: searchValue, ...params }).unwrap();
                }
                setData(res.data || []);
                setPagination(prev => ({ ...prev, total: res.total || 0 }));
            } else {
                setData([]);
                setPagination(prev => ({ ...prev, total: 0 }));
            }
        } catch (err) {
            console.error(err);
            message.error("Qidirishda xatolik yuz berdi");
        }
    }
    async function handleSearch(value) {
        setValue(value);
        setPagination((prev) => ({ ...prev, current: 1 }));
        try {
            if (!value.trim()) {
                const res = await getProductByPage({
                    page: 1,
                    limit: pagination.pageSize,
                }).unwrap();
                setData(res.data || []);
                setPagination((prev) => ({
                    ...prev,
                    total: res?.total || 0,
                }));
                return;
            }

            const isBarcode = /^\d{5,}$/.test(value);
            if (isBarcode) {
                const res = await getProductByBarcode({
                    barcode: value,
                    page: 1,
                    limit: pagination.pageSize,
                }).unwrap();
                setData(res.data || []);
                setPagination((prev) => ({
                    ...prev,
                    total: res?.total || 0,
                }));

            } else {
                const res = await getProductByName({
                    name: value,
                    page: 1,
                    limit: pagination.pageSize,
                }).unwrap();
                setData(res.data || []);
                setPagination((prev) => ({
                    ...prev,
                    total: res?.total || 0,
                }));
            }
        } catch (err) {
            console.error(err);
        }
    }

    // async function handleSearch(e) {
    //     try {
    //         if (!searchType) {
    //             const res = await getProductByBarcode(e.target.value).unwrap()
    //             if (res.length === 1) {
    //                 const existingProduct = basket.find(item => item._id === res[0]._id)
    //                 if (existingProduct) {
    //                     message.error("Mahsulot allaqachon tanlangan")
    //                 } else {
    //                     setBasket([...basket, { ...res[0], quantity: 1 }])
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
            title: "Tanlash", render: (_, record) => (
                <Button type='primary' onClick={() => {
                    const existingProduct = basket.find(item => item._id === record._id)
                    // if (existingProduct) {
                    //     const newBasket = basket.map(item => item._id === record._id ? { ...item, totalPieceQuantity: item.totalPieceQuantity + 1 } : item)
                    //     setBasket(newBasket)
                    // } else {
                    //     setBasket([...basket, { ...record, totalPieceQuantity: 1, unitSellingPrice: record.salePrice }])
                    // }
                    if (existingProduct) {
                        message.error("Mahsulot allaqachon tanlangan")
                    } else {
                        setBasket([...basket, { ...record, quantity: 1 }])
                    }

                }}>
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
        {
            title: "Import miqdori",
            dataIndex: "quantity",
            render: (text, record) => (
                <Input
                    min={1}
                    value={record.quantity}
                    onChange={(e) =>
                        handleInputChange(e.target.value, record.key, "quantity")
                    }
                />
            ),
        },
        {
            title: "Sotib olish narxi",
            dataIndex: "purchasePrice",
            render: (text, record) => (
                <Input
                    min={1}
                    value={record.purchasePrice}
                    onChange={(e) =>
                        handleInputChange(e.target.value, record.key, "purchasePrice")
                    }
                />
            ),
        },
        {
            title: "Sotish narxi",
            dataIndex: "salePrice",
            render: (text, record) => (
                <Input
                    min={1}
                    value={record.salePrice}
                    onChange={(e) =>
                        handleInputChange(e.target.value, record.key, "salePrice")
                    }
                />
            ),
        },
        {
            title: "Optom sotish narxi",
            dataIndex: "salePriceOptom",
            render: (text, record) => (
                <Input
                    min={1}
                    value={record.salePriceOptom}
                    onChange={(e) =>
                        handleInputChange(e.target.value, record.key, "salePriceOptom")
                    }
                />
            ),
        },
        { title: "Jami sotib olish summasi", render: (_, record) => (record.purchasePrice * record.quantity).toLocaleString() },
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
    async function handleSubmit(values) {
        try {
            const products = basket.map((item) => ({
                productId: item._id,
                quantity: item.quantity,
                purchasePrice: item.purchasePrice,
                salePriceOptom: item.salePriceOptom,
                salePrice: item.salePrice,
            }));
            values.products = products
            values.paidAmount = Number(values.paidAmount)
            values.totalAmount = basket.reduce((acc, item) => acc + item.quantity * item.purchasePrice, 0)
            const res = await createImport(values).unwrap()
            message.success(res.message)
            setBasket([])
            form.resetFields()
            inputRef.current.focus()

        } catch (error) {
            message.error("Xatolik yuz berdi")
            console.log(error);
        }

    }

    async function handleUserCreate(values) {
        try {
            const res = await createSupplier(values).unwrap()
            message.success(res.message)
            userCreateForm.resetFields()
            setCreateSupplierModal(false)
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
    const handleClear = async () => {
        setValue("");
        if (inputRef.current) {
            inputRef.current.focus();
        }
        try {
            const data = await getProductByPage(pagination.current).unwrap();
            setData(data.data || []);
            setPagination({ ...pagination, total: data.total || 0 });
        } catch (err) {
            console.error('Ma\'lumotni olishda xatolik:', err);
        }
    };

    return (
        <div className='sale' style={{ display: "flex", height: "100%" }} >
            <Modal open={createSupplierModal} title="Yangi yetkazib beruvchi qo'shish" footer={[]} onCancel={() => {
                userCreateForm.resetFields();
                setCreateSupplierModal(false)
            }}>
                <Form form={userCreateForm} onFinish={handleUserCreate} layout='vertical' autoComplete='off'>
                    <Space direction='vertical' style={{ width: "100%" }}>
                        <Form.Item
                            label="To'liq ism"
                            name={"supplierName"}
                            rules={[
                                { required: true, message: "To'liq ismni kiritish shart" }
                            ]}
                        >
                            <Input placeholder='Ali Valiyev' />
                        </Form.Item>
                        <Form.Item
                            label="Telefon"
                            name={"supplierPhone"}
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
            <div style={{ width: "50%", borderRight: "1px solid #ccc", padding: "0 5px" }}>
                <div className="products-header" style={{ display: "flex", gap: "12px", padding: "12px" }}>
                    <Space>
                        <Input value={value} onChange={(e) => { setValue(e.target.value); handleSearch(e.target.value) }} suffix={
                            (
                                <MdOutlineClear onClick={handleClear} style={{ color: 'rgba(0,0,0,.45)', cursor: 'pointer' }} />
                            )
                        } ref={inputRef} onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch(e.target.value);
                            }
                        }} autoFocus style={{ width: "500px", height: "50px", fontSize: "20px" }} placeholder={"Barkod yoki nomi bilan qidirish"} onSubmit={(value) => handleSearch(value)} />
                        {/* <Switch title="Qidiruv turini almashtirish" value={searchType} checkedChildren="Nomi" unCheckedChildren="Barkod" onChange={(value) => setSearchType(value)} /> */}
                    </Space>
                </div>
                <Table pagination={pagination}
                    onChange={handleTableChange} style={{ overflowX: "auto" }} size="small" dataSource={data} loading={barcodeIsLoading || nameIsLoading || barcodeIsFetching || nameIsFetching || pageIsFetching} columns={productsColumns} />            </div>
            <div style={{ width: "50%", minHeight: "100%", padding: "5px 5px", display: "flex", flexDirection: "column", gap: "5px" }}>
                <Table pagination={false} size='small' style={{ overflowX: "auto", height: "80%" }} columns={basketColumns} dataSource={basket} />
                <p>Jami to'lov: {basket.reduce((acc, item) => acc + item.quantity * item.purchasePrice, 0).toLocaleString()}</p>
                <Form onFinish={handleSubmit} autoComplete='off' style={{ height: "35%", padding: "5px 0", borderTop: "1px solid #ccc" }} form={form} layout='vertical'>
                    <Space direction='vertical' style={{ width: "100%" }}>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item label="Yetkazib beruvchi" name="supplierId" rules={[{ required: true, message: "Yetkazib beruvchini tanlang" }]}>
                                    <Select loading={suppliersLoading}>
                                        {
                                            suppliers?.map((item) => (
                                                <Select.Option key={item._id} value={item._id}>
                                                    {item.supplierName + " - " + item.supplierPhone}
                                                </Select.Option>
                                            ))
                                        }
                                    </Select>
                                </Form.Item>
                                <Button onClick={() => {
                                    setCreateSupplierModal(true);
                                    userCreateForm.resetFields()
                                }} style={{ color: "#1677ff", border: "1px dashed #1677ff" }} ghost type='dashed'>
                                    Yangi yet. ber. qo'shish
                                </Button>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="To'lov miqdori" name="paidAmount" initialValue={0}>
                                    <Input type='number' />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
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
                                    <Button htmlType='submit' type='primary'>Import</Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Space>
                </Form>
            </div>
        </div>
    );
};


export default Import;