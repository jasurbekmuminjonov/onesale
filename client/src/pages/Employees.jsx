import React, { useState } from 'react';
import { useCreateUserMutation, useGetUsersQuery } from '../context/service/user.service';
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
const Distributors = () => {
    const { data: users, isLoading } = useGetUsersQuery()
    const [createUser] = useCreateUserMutation()
    const [form] = Form.useForm();
    const [currentTab, setCurrentTab] = useState('1')
    const [selectedItem, setSelectedItem] = useState("");

    const distributors = users?.filter(user => user.role === 'distributor') || [];
    const columns = [
        { title: "To'liq ismi", dataIndex: "fullname" },
        { title: "Telefon raqami", dataIndex: "phone" }
    ]
    const onFinish = async (values) => {
        try {
            let data = {
                fullname: values.fullname,
                phone: values.phone,
                password: values.password,
                role: "distributor"
            };
            let res;
            // if (selectedItem) {
            //     res = await updatePiece({ id: selectedItem, updatedData: data });
            // } else {
            // }
            res = await createUser(data).unwrap();

            message.success("Agent muvaffaqiyatli qo'shildi");
            // setSelectedItem("");
            form.resetFields();
            setCurrentTab("1");
        } catch (error) {
            message.error("Agent qo'shishda xatolik: " + error.data.message);
        }
    };
    return (
        <div className='distributors'>
            <Tabs activeKey={currentTab}
                onChange={(key) => {
                    setCurrentTab(key);
                    form.resetFields();
                }}
            >
                <Tabs.TabPane tab="Agentlar" key="1">
                    <Table style={{ overflowX: "auto" }} size="small" dataSource={distributors} loading={isLoading} columns={columns} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Agent qo'shish" key="2">
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
                                    name={"fullname"}
                                    rules={[
                                        { required: true, message: "To'liq ismni kiritish shart" }
                                    ]}
                                >
                                    <Input placeholder='Ali Valiyev' />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
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
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={24}>
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


export default Distributors;