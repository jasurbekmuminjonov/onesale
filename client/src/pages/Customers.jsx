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
} from "antd";
const Customers = () => {
    const { data: customers, isLoading } = useGetCustomersQuery()
    const [createCustomer] = useCreateCustomerMutation()
    const [form] = Form.useForm();
    const [currentTab, setCurrentTab] = useState('1')

    const columns = [
        { title: "To'liq ismi", dataIndex: "customerName" },
        { title: "Telefon raqami", dataIndex: "customerPhone" },
        { title: "Umumiy importlar", dataIndex: "totalPurchaseAmount", render: (text) => text?.toLocaleString() },
        { title: "Umumiy qarzlar", dataIndex: "totalDebtAmount", render: (text) => text?.toLocaleString() },
        // {
        //     title: "Amallar",
        //     render: (text, record) => (
        //         <Button type='primary' onClick={() => {
        //             setCurrentTab("1")
        //             form.resetFields()
        //         }}>Ko'rish</Button>
        //     )
        // }
    ]
    const onFinish = async (values) => {
        try {
            let data = {
                customerName: values.customerName,
                customerPhone: values.customerPhone
            };
            let res;
            res = await createCustomer(data).unwrap();

            message.success(res.message);
            form.resetFields();
            setCurrentTab("1");
        } catch (error) {
            message.error(error.data.message);
        }
    };
    return (
        <div className='customers'>
            <Tabs activeKey={currentTab}
                onChange={(key) => {
                    setCurrentTab(key);
                    form.resetFields();
                }}
            >
                <Tabs.TabPane tab="Xaridorlar" key="1">
                    <Table style={{ overflowX: "auto" }} size="small" dataSource={customers} loading={isLoading} columns={columns} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Xaridor qo'shish" key="2">
                    <Form
                        autoComplete='off'
                        layout="vertical"
                        onFinish={onFinish}
                        form={form}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="To'liq ism"
                                    name={"customerName"}
                                    rules={[
                                        { required: true, message: "To'liq ismni kiritish shart" }
                                    ]}
                                >
                                    <Input placeholder='Ali Valiyev' />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
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
                                    <Input placeholder="901234567" type="number" />
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


export default Customers;