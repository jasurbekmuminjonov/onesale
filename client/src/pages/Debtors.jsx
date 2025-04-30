import React, { useState } from 'react';
import { Table, Button, Modal } from 'antd';
import { useGetDebtCustomersQuery } from '../context/service/user.service';
import { FaList, FaLink } from 'react-icons/fa6';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const Debtors = () => {
    const { data: debtors = [], isLoading } = useGetDebtCustomersQuery();
    const [selectedSales, setSelectedSales] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const columns = [
        { title: "Mijoz", dataIndex: "customerName" },
        {
            title: "Umumiy qarz",
            dataIndex: "totalDebtAmount",
            render: (amount) => amount.toLocaleString()
        },
        {
            title: "Amal",
            render: (_, record) => (
                <Button
                    icon={<FaList />}
                    onClick={() => {
                        setSelectedSales(record.debtSales);
                        setIsModalOpen(true);
                    }}
                />
            )
        }
    ];

    const modalColumns = [
        {
            title: "Sotuv sanasi",
            dataIndex: "saleDate",
            render: (date) => moment(date).format("DD.MM.YYYY HH:mm")
        },
        { title: "Qarz miqdori", dataIndex: "debtAmount", render: (amount) => amount.toLocaleString() },
        {
            title: "Amal",
            render: (_, record) => (
                <Button
                    icon={<FaLink />}
                    onClick={() => navigate(`/sale-history?saleId=${record.saleId}`)}
                />
            )
        }
    ];

    return (
        <div className="debtors">
            <Table
                dataSource={debtors}
                columns={columns}
                loading={isLoading}
                rowKey="customerId"
                size="small"
                pagination={{ pageSize: 10 }}
            />

            <Modal
                open={isModalOpen}
                title="Qarzdorlik savdolari"
                footer={null}
                onCancel={() => {
                    setIsModalOpen(false);
                    setSelectedSales([]);
                }}
            >
                <Table
                    dataSource={selectedSales}
                    columns={modalColumns}
                    rowKey="saleId"
                    pagination={false}
                    size="small"
                />
            </Modal>
        </div>
    );
};

export default Debtors;
