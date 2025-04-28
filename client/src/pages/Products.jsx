import React, { useState } from 'react';
import {
    Tabs,
    Table,
    Form,
    Input,
    Button,
    message,
    Row,
    Col,
    Select,
    Space,
    Popconfirm,
} from "antd";
import { useGetProductTypesQuery } from '../context/service/productType.service';
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { useCreateProductMutation, useDeleteProductMutation, useGetProductsQuery, useUpdateProductMutation } from '../context/service/products.service';
import moment from 'moment';
const Products = () => {
    const [form] = Form.useForm();
    const [createProduct] = useCreateProductMutation()
    const [updateProduct] = useUpdateProductMutation()
    const [deleteProduct] = useDeleteProductMutation()
    const { data: productType = [] } = useGetProductTypesQuery()
    const { data: product = [], isLoading } = useGetProductsQuery()
    const [currentTab, setCurrentTab] = useState('1')
    const [selectedItem, setSelectedItem] = useState("");
    const packageTypes = {
        piece: "Dona",
        box: "Quti"
    }
    const columns = [
        { title: "Mahsulot nomi", dataIndex: "productTypeId", render: (text) => text.name },
        { title: "Qadoq turi", dataIndex: "productTypeId", render: (text) => packageTypes[text.packageType] },
        { title: "Jami dona soni", dataIndex: "totalPieceQuantity" },
        { title: "Qutidagi dona soni", dataIndex: "productTypeId", render: (text) => text.packageType === "piece" ? "-" : text.pieceQuantityPerBox },
        { title: "Jami quti soni", dataIndex: "productTypeId", render: (text, record) => text.packageType === "piece" ? "-" : (record.totalPieceQuantity / text.pieceQuantityPerBox).toFixed() },
        { title: "Sotib olish narxi", dataIndex: "unitPurchasePrice" },
        { title: "Sotish narxi", dataIndex: "unitSellingPrice" },
        { title: "Kiritilgan sana", dataIndex: "createdAt", render: (text) => moment(text).format("DD.MM.YYYY") },
        {
            title: "Amallar", render: (_, record) => (
                <Space>
                    <Button
                        onClick={() => {
                            setSelectedItem(record._id);
                            form.setFieldsValue({
                                productTypeId: record.productTypeId._id,
                                totalPieceQuantity: record.productTypeId.packageType === "box" ? (record.totalPieceQuantity / record.productTypeId.pieceQuantityPerBox).toFixed() : record.totalPieceQuantity,
                                unitPurchasePrice: record.unitPurchasePrice,
                                unitSellingPrice: record.unitSellingPrice,
                            });
                            setCurrentTab("2");
                        }}
                        type="primary"
                        style={{ background: "#f4a62a" }}
                        icon={<MdEdit />}
                    ></Button>
                    <Popconfirm
                        onConfirm={() => handleDelete(record._id)}
                        title="Chindan ham mahsulotni butunlay o'chirmoqchimisiz?"
                        onCancel={() => { }}
                    >
                        <Button type="primary" danger icon={<MdDeleteForever />}></Button>
                    </Popconfirm>
                </Space >
            )
        }
    ]
    const handleDelete = async (id) => {
        try {
            await deleteProduct(id).unwrap();
            message.success("Mahsulot muvaffaqiyatli o'chirildi");
        } catch (error) {
            message.error("Mahsulotni o'chirishda xatolik: " + error.data.message);
        }
    }
    const onFinish = async (values) => {
        try {
            let data = {
                productTypeId: values.productTypeId,
                totalPieceQuantity: Number(values.totalPieceQuantity),
                unitPurchasePrice: Number(values.unitPurchasePrice),
                unitSellingPrice: Number(values.unitSellingPrice),
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
            <Tabs activeKey={currentTab}
                onChange={(key) => {
                    setCurrentTab(key);
                    form.resetFields();
                }}
            >
                <Tabs.TabPane tab="Mahsulotlar" key="1">
                    <Table style={{ overflowX: "auto" }} size="small" dataSource={product} loading={isLoading} columns={columns} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Mahsulot qo'shish" key="2">
                    <Form
                        autoComplete='off'
                        layout="vertical"
                        onFinish={onFinish}
                        form={form}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Mahsulot turi"
                                    name={"productTypeId"}
                                    rules={[
                                        { required: true, message: "Mahsulot turini tanlash shart" }
                                    ]}
                                >
                                    <Select
                                        showSearch
                                        placeholder="Mahsulot turini tanlang"
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            option.children.toLowerCase().includes(input.toLowerCase())
                                        }>
                                        {productType.map((item) => (
                                            <Select.Option key={item._id} value={item._id}>
                                                {item.name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    shouldUpdate={(prev, next) => prev.productTypeId !== next.productTypeId}
                                >
                                    {({ getFieldValue }) => {
                                        const isBox = productType.find(pr => pr._id === getFieldValue("productTypeId"))?.packageType === "box";
                                        return (
                                            <Form.Item
                                                label={isBox ? "Quti soni" : "Jami dona soni"}
                                                name="totalPieceQuantity"
                                                rules={
                                                    isBox
                                                        ? [{ required: true, message: "Quti sonini kiritish shart" }]
                                                        : [{ required: true, message: "Jami dona sonini kiritish shart" }]
                                                }
                                            >
                                                <Input
                                                    placeholder="25"
                                                    type="number"
                                                />
                                            </Form.Item>
                                        );
                                    }}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Dona tan narxi"
                                    name="unitPurchasePrice"
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
                            <Col span={12}>
                                <Form.Item
                                    label="Dona sotish narxi"
                                    name="unitSellingPrice"
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
        </div>
    );
};


export default Products;