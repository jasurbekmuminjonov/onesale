import React from 'react';
import { useGetUsersQuery } from '../context/service/user.service';
import { useGetSalesQuery } from '../context/service/sale.service';
import { Button, Popover, Table } from 'antd';

import moment from 'moment';
import { FaLink, FaList } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
const Debtors = () => {
    const { data: users = [], isLoading: userLoading } = useGetUsersQuery();
    const { data: sales = [], isLoading: salesLoading } = useGetSalesQuery();
    const navigate = useNavigate();
    const clients = users.filter(user => user.role === 'client');
    const debts = sales.filter(sale => sale.isDebt === true);
    const debtors = clients.filter(client => debts.some(debt => debt.clientId._id === client._id));
    const columns = [
        { title: "Qarzdor", dataIndex: "fullname" },
        { title: "Telefon", dataIndex: "phone" },
        { title: "Umumiy qarz", render: (_, record) => debts.filter(debt => debt.clientId._id === record._id).reduce((acc, curr) => acc + curr.totalAmountToPaid - curr.totalAmountPaid, 0).toLocaleString() },
        {
            title: "Qarz sotuvlar", render: (_, record) => (
                <Popover title="Sotuvlar" trigger='click' placement='bottom' content={
                    <Table dataSource={debts.filter(debt => debt.clientId._id === record._id)} columns={[
                        { title: "Sana", dataIndex: "createdAt", render: (text) => moment(text).format('DD.MM.YYYY') },
                        { title: "Umumiy to'lov", dataIndex: "totalAmountToPaid", render: (text) => text.toLocaleString() },
                        { title: "To'langan", dataIndex: "totalAmountPaid", render: (text) => text.toLocaleString() },
                        { title: "Qarz", render: (_, record) => (record.totalAmountToPaid - record.totalAmountPaid).toLocaleString() },
                        {
                            title: "Amallar", dataIndex: "_id", render: (text) => (
                                <Button type='primary' onClick={() => navigate(`/sale-history?saleId=${text}`)}><FaLink /></Button>
                            )
                        }
                    ]} />
                }>
                    <Button><FaList /></Button>
                </Popover>
            )
        }
    ]
    return (
        <div className='debtors'>
            <Table columns={columns} dataSource={debtors} loading={userLoading || salesLoading} />
        </div>
    );
};

export default Debtors;