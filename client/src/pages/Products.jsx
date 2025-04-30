import React, { useEffect, useRef, useState } from 'react';
import {
    Tabs,
    Table,
    Form,
    Input,
    Button,
    message,
    Row,
    Col,
    Space,
    Switch,
    Modal,
    Select,
} from "antd";
import { MdEdit } from "react-icons/md";
import { useCreateProductMutation, useLazyGetProductByBarcodeQuery, useUpdateProductMutation, useUpdateProductStockMutation, useLazyGetProductByNameQuery, useLazyGetProductByPageQuery } from '../context/service/product.service';
import { LuClipboardList } from "react-icons/lu";
import { FaCheck } from "react-icons/fa";
import { MdOutlineClear } from "react-icons/md";


const Products = () => {
    const [form] = Form.useForm();
    const [createProduct] = useCreateProductMutation()
    const [isOpen, setIsOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [updateProduct] = useUpdateProductMutation()
    const [newQuantities, setNewQuantities] = useState({});
    const [updateProductStock] = useUpdateProductStockMutation()
    const [searchType, setSearchType] = useState(false)
    const [data, setData] = useState([])
    const inputRef = useRef()
    const [getProductByBarcode, { data: barcodeData, isLoading: barcodeIsLoading, error: barcodeError }] = useLazyGetProductByBarcodeQuery()
    const [getProductByPage, { data: pageData, isLoading: pageIsLoading, error: pageError }] = useLazyGetProductByPageQuery()
    const [getProductByName, { data: nameData, isLoading: nameIsLoading, error: nameError }] = useLazyGetProductByNameQuery()
    const [currentTab, setCurrentTab] = useState('1')
    const [selectedItem, setSelectedItem] = useState("");
    const [filters, setFilters] = useState({
        sort: ''
    });
    const [value, setValue] = useState('');

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    useEffect(() => {
        if (value) {
            return
        } else {
            getProductByPage(pagination.current).unwrap().then((res) => {
                setData(res.data || []);
                setPagination({
                    ...pagination,
                    total: res?.total || 0,
                });
            });
        }
    }, [pagination.current]);

    const handleTableChange = async (pagination) => {
        try {
            if (value) {
                setPagination(pagination);
            } else {
                const res = await getProductByPage(pagination.current).unwrap();
                setData(res.data || []);
                setPagination({
                    ...pagination,
                    total: res?.total || 0,
                });
            }
        } catch (err) {
            console.error(err);
        }
    };
    const columns = [
        { title: "№", render: (text, record, index) => (index + 1) },
        { title: "Mahsulot nomi", dataIndex: "productName" },
        { title: "Jami miqdori", dataIndex: "stock", render: (text) => text.reduce((acc, item) => acc + item.quantity, 0) },
        { title: "Sotib olish narxi", dataIndex: "purchasePrice", render: (text) => text.toLocaleString() },
        { title: "Sotish narxi", dataIndex: "salePrice", render: (text) => text.toLocaleString() },
        { title: "Optom sotish narxi", dataIndex: "salePriceOptom", render: (text) => text.toLocaleString() },
        {
            title: "Barkod",
            dataIndex: "barcode",
            render: (text) => (
                <span
                    onClick={() => {
                        navigator.clipboard.writeText(text);
                        message.success("Barkod nusxalandi!");
                    }}
                    style={{
                        cursor: "pointer",
                        textDecoration: "underline dotted",
                    }}
                    title="Nusxalash uchun bosing"
                >
                    {text}
                </span>
            ),
        },
        { title: "O'lchov birligi", dataIndex: "unitMeasure" },
        {
            title: "Actions", render: (_, record) => (
                <Space size="middle">
                    <Button title="Inventar" onClick={() => {
                        setSelectedProduct(record._id);
                        setIsOpen(true);
                    }}>
                        <LuClipboardList />
                    </Button>
                    <Button title='Tahrirlash' onClick={() => {
                        setSelectedItem(record._id)
                        form.setFieldsValue({
                            productName: record.productName,
                            barcode: record.barcode,
                            purchasePrice: record.purchasePrice,
                            salePrice: record.salePrice,
                            salePriceOptom: record.salePriceOptom,
                            unitMeasure: record.unitMeasure,

                        })
                        setCurrentTab("2")
                    }}>
                        <MdEdit />
                    </Button>
                </Space>
            )
        }
    ]
    useEffect(() => {
        const handleContextMenu = (e) => {
            e.preventDefault();
            setSearchType(prev => !prev);
            inputRef.current.focus();
        };
        window.addEventListener('contextmenu', handleContextMenu);

        return () => {
            window.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    async function handleSearch(value) {
        try {
            if (!value) {
                const res = await getProductByPage(pagination.current).unwrap()
                setData(res)
                setPagination({
                    ...pagination,
                    total: res?.data.length || 0,
                })
                return
            } else {

                if (!searchType) {
                    const res = await getProductByBarcode(value).unwrap()
                    setData(res)
                    setPagination({
                        ...pagination,
                        total: res?.length || 0,
                    })
                } else {
                    const res = await getProductByName(value).unwrap()
                    setData(res)
                    setPagination({
                        ...pagination,
                        total: res?.length || 0,
                    })
                }
            }
        } catch (err) {
            console.log(err)
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

    const onFinish = async (values) => {
        try {
            let data = {
                productName: values.productName,
                barcode: values.barcode,
                unitMeasure: values.unitMeasure,
                purchasePrice: Number(values.purchasePrice),
                salePrice: Number(values.salePrice),
                salePriceOptom: Number(values.salePriceOptom),
            };
            let res;
            if (selectedItem) {
                res = await updateProduct({ id: selectedItem, body: data });
            } else {
                res = await createProduct(data).unwrap();
            }
            if (selectedItem) {
                message.success("Mahsulot muvaffaqiyatli tahrirlandi");
            } else {
                message.success("Mahsulot muvaffaqiyatli qo'shildi");
            }
            setSelectedItem("");
            form.resetFields();
            setCurrentTab("1");
            await refreshTable();
            setValue("")
        } catch (error) {
            message.error("Mahsulotni qo'shishda xatolik: " + error.data.message);
        }
    };

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

    const refreshTable = async () => {
        const res = await getProductByPage(1).unwrap();
        setData(res.data || []);
        setPagination({ ...pagination, total: res.total, current: 1 || 0 });
    };
    useEffect(() => {
        const applySorting = async () => {
            if (!filters?.sort) {
                try {
                    const res = await getProductByPage(pagination.current).unwrap();
                    setData(res.data || []);
                    setPagination(prev => ({
                        ...prev,
                        total: res?.total || 0,
                    }));
                } catch (err) {
                    console.error("Ma'lumotni qayta olishda xatolik:", err);
                }
                return;
            }

            const sortedData = [...data];
            if (filters.sort === "quantity_inc") {
                sortedData.sort((a, b) => {
                    const totalA = a.stock.reduce((acc, item) => acc + item.quantity, 0);
                    const totalB = b.stock.reduce((acc, item) => acc + item.quantity, 0);
                    return totalA - totalB;
                });
            } else if (filters.sort === "quantity_dec") {
                sortedData.sort((a, b) => {
                    const totalA = a.stock.reduce((acc, item) => acc + item.quantity, 0);
                    const totalB = b.stock.reduce((acc, item) => acc + item.quantity, 0);
                    return totalB - totalA;
                });
            }

            setData(sortedData);
        };

        applySorting();
    }, [filters]);



    return (
        <div className='products'>
            <Modal width={600} open={isOpen} onCancel={() => {
                setIsOpen(false)
                setSelectedItem("");
                setSelectedProduct(null)
                setNewQuantities({})
            }}
                title="Tovar miqdori"
                footer={[]}
            >
                <Table rowKey="_id" size='small' dataSource={data?.find(item => item._id === selectedProduct)?.stock} columns={[
                    { title: "Miqdor", dataIndex: "quantity" },
                    { title: "Sotib olish narxi", dataIndex: "purchasePrice", render: (text) => text.toLocaleString() },
                    { title: "Sotish narxi", dataIndex: "salePrice", render: (text) => text.toLocaleString() },
                    { title: "Optom sotish narxi", dataIndex: "salePriceOptom", render: (text) => text.toLocaleString() },
                    {
                        title: "Miqdorni sozlash", render: (_, record) => (
                            <Space size="small">
                                <Input
                                    min={0}
                                    value={newQuantities[record.date] || ""}
                                    onChange={(e) =>
                                        setNewQuantities({
                                            ...newQuantities,
                                            [record.date]: e.target.value,
                                        })
                                    }
                                    width={30}
                                    type="number"
                                    placeholder="Yangi miqdor"
                                />

                                <Button
                                    onClick={async () => {
                                        try {
                                            const res = await updateProductStock({
                                                productId: selectedProduct,
                                                stockDate: record.date,
                                                quantity: newQuantities[record.date],
                                            }).unwrap();
                                            message.success(res.message);
                                            setIsOpen(false);
                                            setSelectedProduct(null);
                                            setNewQuantities({ ...newQuantities, [record.date]: null });
                                        } catch (error) {
                                            console.log(error);
                                            message.error("Miqdorni yangilashda xatolik: " + error.data.message);
                                        }
                                    }}
                                    disabled={!newQuantities[record.date]}
                                    type="primary"
                                >
                                    <FaCheck />
                                </Button>

                            </Space>
                        )
                    }
                ]} />
            </Modal>
            <div className="products-header" style={{ display: "flex", gap: "12px", padding: "12px" }}>
                <Space>
                    <Input value={value} onChange={(e) => setValue(e.target.value)} suffix={
                        (
                            <MdOutlineClear onClick={handleClear} style={{ color: 'rgba(0,0,0,.45)', cursor: 'pointer' }} />
                        )
                    } ref={inputRef} onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch(e.target.value);
                        }
                    }} autoFocus style={{ width: "500px", height: "50px", fontSize: "20px" }} placeholder={!searchType ? "Barkod bilan qidirish" : "Nomi bilan qidirish"} onSubmit={(value) => handleSearch(value)} />
                    <Switch title="Qidiruv turini almashtirish" value={searchType} checkedChildren="Nomi" unCheckedChildren="Barkod" onChange={(value) => setSearchType(value)} />
                    <Select onChange={(value) => setFilters({ ...filters, sort: value })} defaultValue="Saralash" style={{ width: 200 }}>
                        <Select.Option value="">Saralashsiz</Select.Option>
                        <Select.Option value="quantity_inc">Miqdor: birinchi kam</Select.Option>
                        <Select.Option value="quantity_dec">Miqdor: birinchi ko'p</Select.Option>
                    </Select>
                </Space>
            </div>
            <Tabs activeKey={currentTab}
                onChange={(key) => {
                    setCurrentTab(key);
                    form.resetFields();
                }}
            >
                <Tabs.TabPane tab="Mahsulotlar" key="1">
                    <Table pagination={pagination}
                        onChange={handleTableChange} style={{ overflowX: "auto" }} size="small" dataSource={data} loading={barcodeIsLoading || nameIsLoading} columns={columns} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Mahsulot qo'shish" key="2">
                    <Form
                        autoComplete='off'
                        layout="vertical"
                        onFinish={onFinish}
                        form={form}
                    >
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item label="Mahsulot nomi" name="productName" rules={[{ required: true, message: "Mahsulot nomini kiritish shart" }]}>
                                    <Input placeholder="Mahsulot nomi" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="Barkod" name="barcode" rules={[{ required: true, message: "Barkodni kiritish shart" }]}>
                                    <Input placeholder="Barkod" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="O'lchov birlik" name="unitMeasure" rules={[{ required: true, message: "O'lchov birlikni tanlash shart" }]}>
                                    <Select defaultValue="Штука" options={[
                                        { label: "Штука", value: "Штука" },
                                        { label: "Грамм", value: "Грамм" },
                                        { label: "Литр", value: "Литр" },
                                        { label: "Коробка", value: "Коробка" },
                                    ]} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    label="Dona tan narxi"
                                    name="purchasePrice"
                                    rules={
                                        [{ required: true, message: "Dona tan narxini kiritish shart" }]
                                    }
                                >
                                    <Input
                                        placeholder="2000"
                                        type="number"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Dona sotish narxi"
                                    name="salePrice"
                                    rules={
                                        [{ required: true, message: "Dona sotish narxini kiritish shart" }]
                                    }
                                >
                                    <Input
                                        placeholder="3000"
                                        type="number"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Dona optom sotish narxi"
                                    name="salePriceOptom"
                                    rules={
                                        [{ required: true, message: "Dona optom sotish narxini kiritish shart" }]
                                    }
                                >
                                    <Input
                                        placeholder="2200"
                                        type="number"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item>
                                    <Button type='primary' htmlType='submit'>Saqlash</Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Tabs.TabPane>
            </Tabs>
        </div >
    );
};


export default Products;