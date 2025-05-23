import React, { useState } from 'react';
import { useCreateCustomerMutation, useGetCustomersQuery } from '../context/service/user.service';
import {
    Tabs,
    Table,
    Form,
    Input,
    Button,
    message,
    Row,
    Col,
    Modal,
    Statistic
} from "antd";
import { useGetSalesQuery } from '../context/service/sale.service';
import moment from 'moment';

const Customers = () => {
    const { data: customers = [], isLoading } = useGetCustomersQuery();
    const [createCustomer] = useCreateCustomerMutation();
    const [form] = Form.useForm();
    const [currentTab, setCurrentTab] = useState('1');
    const { data: sales = [] } = useGetSalesQuery();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [modalType, setModalType] = useState("sales"); // 'sales' or 'debts'

    const onFinish = async (values) => {
        try {
            let res = await createCustomer(values).unwrap();
            message.success(res.message);
            form.resetFields();
            setCurrentTab("1");
        } catch (error) {
            message.error(error.data.message);
        }
    };

    const showModal = (customer, type) => {
        setSelectedCustomer(customer);
        setModalType(type);
        setModalVisible(true);
    };

    const filteredSales = sales.filter(
        (sale) =>
            sale.customerId?._id === selectedCustomer?._id &&
            (modalType === "sales" ? (sale.totalAmount - sale.paidAmount) < 1 : (sale.totalAmount - sale.paidAmount) > 0)
    );

    const totalAmount = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);

    const saleColumns = [
        { title: "Sana", dataIndex: "date", render: (text) => moment(text).format("DD.MM.YYYY HH:mm") },
        { title: "Umumiy summa", dataIndex: "totalAmount" },
        { title: "To'langan summa", dataIndex: "paidAmount" },
        { title: "Qolgan summa", render: (_, record) => record.totalAmount - record.paidAmount }
    ];

    const columns = [
        { title: "To'liq ismi", dataIndex: "customerName" },
        { title: "Telefon raqami", dataIndex: "customerPhone" },
        {
            title: "Amallar",
            render: (_, record) => (
                <>
                    <Button size="small" onClick={() => showModal(record, "sales")} style={{ marginRight: 8 }}>
                        Sotuvlar
                    </Button>
                    <Button size="small" onClick={() => showModal(record, "debts")} danger>
                        Qarzlar
                    </Button>
                </>
            )
        }
    ];

    return (
        <div className='customers'>
            <Tabs activeKey={currentTab} onChange={(key) => {
                setCurrentTab(key);
                form.resetFields();
            }}>
                <Tabs.TabPane tab="Xaridorlar" key="1">
                    <Table size="small" dataSource={customers} loading={isLoading} columns={columns} rowKey="_id" />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Xaridor qo'shish" key="2">
                    <Form autoComplete='off' layout="vertical" onFinish={onFinish} form={form}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="To'liq ism"
                                    name="customerName"
                                    rules={[{ required: true, message: "To'liq ismni kiritish shart" }]}
                                >
                                    <Input placeholder='Ali Valiyev' />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Telefon"
                                    name="customerPhone"
                                    rules={[
                                        { required: true, message: "Telefon kiritish shart" },
                                        {
                                            pattern: /^[0-9]{9}$/,
                                            message: "Kerakli format: 901234567",
                                        },
                                    ]}
                                >
                                    <Input placeholder="901234567" type="number" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item>
                                    <Button type='primary' htmlType='submit'>Saqlash</Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Tabs.TabPane>
            </Tabs>

            <Modal
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={false}
                width={700}
                title={modalType === "sales" ? "Sotuvlar tarixi" : "Qarzlar tarixi"}
            >
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Statistic title="Umumiy summa" value={totalAmount} suffix="so'm" />
                    </Col>
                </Row>
                <Table
                    columns={saleColumns}
                    dataSource={filteredSales}
                    rowKey="_id"
                    size="small"
                    style={{ marginTop: 20 }}
                />
            </Modal>
        </div>
    );
};

export default Customers;
