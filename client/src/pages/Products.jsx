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
import { useCreateProductMutation, useLazyGetProductByBarcodeQuery, useUpdateProductMutation, useUpdateProductStockMutation, useLazyGetProductByNameQuery } from '../context/service/product.service';
import { LuClipboardList } from "react-icons/lu";
import { FaCheck } from "react-icons/fa";


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
    const [getProductByName, { data: nameData, isLoading: nameIsLoading, error: nameError }] = useLazyGetProductByNameQuery()
    const [currentTab, setCurrentTab] = useState('1')
    const [selectedItem, setSelectedItem] = useState("");
    const columns = [
        { title: "№", render: (text, record, index) => (index + 1) },
        { title: "Mahsulot nomi", dataIndex: "productName" },
        { title: "Jami miqdori", dataIndex: "stock", render: (text) => text.reduce((acc, item) => acc + item.quantity, 0) },
        { title: "Sotib olish narxi", dataIndex: "purchasePrice", render: (text) => text.toLocaleString() },
        { title: "Sotish narxi", dataIndex: "salePrice", render: (text) => text.toLocaleString() },
        { title: "Optom sotish narxi", dataIndex: "salePriceOptom", render: (text) => text.toLocaleString() },
        { title: "Barkod", dataIndex: "barcode" },
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
            if (!searchType) {
                const res = await getProductByBarcode(value).unwrap()
                setData(res)
            } else {
                const res = await getProductByName(value).unwrap()
                setData(res)
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
        } catch (error) {
            message.error("Mahsulotni qo'shishda xatolik: " + error.data.message);
        }
    };

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
                <Table size='small' dataSource={data.find(item => item._id === selectedProduct)?.stock} columns={[
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
                    <Input ref={inputRef} onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch(e.target.value);
                        }
                    }} autoFocus style={{ width: "500px", height: "50px", fontSize: "20px" }} placeholder={!searchType ? "Barkod bilan qidirish" : "Nomi bilan qidirish"} onSubmit={(value) => handleSearch(value)} />
                    <Switch title="Qidiruv turini almashtirish" value={searchType} checkedChildren="Nomi" unCheckedChildren="Barkod" onChange={(value) => setSearchType(value)} />
                </Space>
            </div>
            <Tabs activeKey={currentTab}
                onChange={(key) => {
                    setCurrentTab(key);
                    form.resetFields();
                }}
            >
                <Tabs.TabPane tab="Mahsulotlar" key="1">
                    <Table style={{ overflowX: "auto" }} size="small" dataSource={data} loading={barcodeIsLoading || nameIsLoading} columns={columns} />
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