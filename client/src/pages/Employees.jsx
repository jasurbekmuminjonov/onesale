import React, { useState } from 'react';
import { useCreateEmployeeMutation, useGetEmployeesQuery } from '../context/service/user.service';
import { Table, Tabs, Form, Input, Select, Button, message, Spin } from 'antd';

const { TabPane } = Tabs;
const { Option } = Select;

const Employees = () => {
    const { data = [], isLoading, refetch } = useGetEmployeesQuery();
    const [createEmployee, { isLoading: creating }] = useCreateEmployeeMutation();
    const [form] = Form.useForm();
    const [currentTab, setCurrentTab] = useState("1");

    const handleAddEmployee = async (values) => {
        try {
            await createEmployee(values).unwrap();
            message.success("Xodim muvaffaqiyatli qo'shildi!");
            form.resetFields();
            setCurrentTab("1");
            refetch();
        } catch (err) {
            message.error("Xatolik: " + (err?.data?.message || "Server xatosi"));
        }
    };

    const columns = [
        { title: "Ismi", dataIndex: "name", key: "name" },
        { title: "Telefon", dataIndex: "phone", key: "phone" },
        { title: "Roli", dataIndex: "role", key: "role", render: (text) => text === "cashier" ? "Kassir" : "Menejer" },
    ];

    return (
        <div className="employees">
            <Tabs activeKey={currentTab} onChange={(value) => setCurrentTab(value)}>
                <TabPane tab="Xodimlar ro'yxati" key="1">
                    {isLoading ? (
                        <Spin />
                    ) : (
                        <Table
                            dataSource={data || []}
                            columns={columns}
                            rowKey="_id"
                            pagination={{ pageSize: 10 }}
                        />
                    )}
                </TabPane>

                <TabPane tab="Yangi xodim qo‘shish" key="2">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleAddEmployee}
                        style={{ maxWidth: "400px", marginTop: "16px" }}
                    >
                        <Form.Item
                            label="Ismi"
                            name="name"
                            rules={[{ required: true, message: "Iltimos, ismni kiriting!" }]}
                        >
                            <Input placeholder="Ism" />
                        </Form.Item>

                        <Form.Item
                            label="Telefon"
                            name="phone"
                            rules={[
                                { required: true, message: "Telefon raqam majburiy" },
                                { pattern: /^\d{9}$/, message: "Kerakli format: 901234567" }
                            ]}
                        >
                            <Input type='number' />
                        </Form.Item>

                        <Form.Item
                            label="Parol"
                            name="password"
                            rules={[{ required: true, message: "Parol majburiy" }]}
                        >
                            <Input.Password placeholder="Parol" />
                        </Form.Item>

                        <Form.Item
                            label="Roli"
                            name="role"
                            rules={[{ required: true, message: "Rol tanlang" }]}
                        >
                            <Select placeholder="Rolni tanlang">
                                <Option value="cashier">Kassir</Option>
                                <Option value="manager">Menejer</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={creating}>
                                Qo‘shish
                            </Button>
                        </Form.Item>
                    </Form>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default Employees;
