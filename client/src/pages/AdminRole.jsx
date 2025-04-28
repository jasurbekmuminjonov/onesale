import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { DatePicker, Card, Col, Row, Statistic, Space } from 'antd';
import { useGetSalesQuery } from '../context/service/sale.service';
import { useGetProductsQuery } from '../context/service/products.service';
import { FaMoneyBillTransfer, FaMoneyBillTrendUp } from "react-icons/fa6";
import { LineChart, Line, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { MdMoneyOff } from "react-icons/md";
const AdminRole = () => {
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    const { data: sales = [] } = useGetSalesQuery()
    const { data: products = [] } = useGetProductsQuery()
    const [filteredSales, setFilteredSales] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [daysArray, setDaysArray] = useState([])
    const generateDaysArray = () => {
        const start = dayjs(selectedMonth || dayjs()).startOf('month');
        const end = dayjs(selectedMonth || dayjs()).isSame(dayjs(), 'month')
            ? dayjs()
            : dayjs(selectedMonth || dayjs()).endOf('month');

        const days = [];
        let current = start;

        while (current.isSame(end) || current.isBefore(end)) {
            days.push(dayjs(current).format('YYYY-MM-DD'));
            current = current.add(1, 'day');
        }
        return days;
    };
    useEffect(() => {
        const days = generateDaysArray()
        setDaysArray(days)
    }, [selectedMonth])

    const month = {
        "01": "yanvar",
        "02": "fevral",
        "03": "mart",
        "04": "aprel",
        "05": "may",
        "06": "iyun",
        "07": "iyul",
        "08": "avgust",
        "09": "sentabr",
        "10": "oktyabr",
        "11": "noyabr",
        "12": "dekabr"
    }

    const chartData = daysArray.map((date) => {
        const filtered = filteredSales.filter(item =>
            item.createdAt.startsWith(date)
        );

        const totalPaid = filtered.reduce((sum, item) => sum + item.totalAmountToPaid, 0);

        const [year, monthNumber, day] = date.split("-");
        const formattedDate = `${day}-${month[monthNumber]}`;
        return {
            date: formattedDate,
            totalPaid,
        };
    });




    useEffect(() => {
        if (selectedMonth) {
            const month = selectedMonth.month() + 1
            const year = selectedMonth.year()
            const filtered = sales.filter((sale) => {
                const date = new Date(sale.createdAt)
                return date.getMonth() + 1 === month && date.getFullYear() === year
            })
            const filteredProduct = products.filter((product) => {
                const date = new Date(product.createdAt)
                return date.getMonth() + 1 === month && date.getFullYear() === year
            })
            setFilteredSales(filtered)
            setFilteredProducts(filteredProduct)
        } else {
            setFilteredSales(sales)
            setFilteredProducts(products)
        }
    }, [sales, selectedMonth])


    return (
        <div className='admin-role' style={{ padding: "5px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: 'start' }}>
            <Space direction='vertical' style={{ width: "100%" }}>
                <DatePicker placeholder="Oyni tanlang" picker='month' value={selectedMonth} onChange={(date, dateString) => {
                    if (!date) {
                        setSelectedMonth(null)
                    } else {
                        setSelectedMonth(date);
                    }
                }} />
                <p>Sotuvlar</p>
                <Row gutter={16} >
                    <Col span={24}>
                        <Card style={{ background: "#f3bb1b" }}>
                            <Statistic
                                valueStyle={{ color: "#fff" }}
                                title={<p style={{ color: "#fff" }}>Umumiy pul aylanmasi</p>}
                                suffix="UZS"
                                prefix={<FaMoneyBillTransfer />}
                                value={filteredSales.reduce((acc, sale) => acc + sale.totalAmountPaid + sale.products.reduce((acc, pr) => acc + pr.productId.unitPurchasePrice * pr.quantity, 0), 0)}
                            />
                        </Card>
                    </Col>
                </Row>
                <Row gutter={16} >
                    <Col span={24}>
                        <Card style={{ background: "#3f8600" }}>
                            <Statistic
                                valueStyle={{ color: "#fff" }}
                                title={<p style={{ color: "#fff" }}>Olingan sof foyda</p>}
                                suffix="UZS"
                                prefix={<FaMoneyBillTrendUp />}
                                value={filteredSales.reduce((acc, sale) => (
                                    acc + sale.totalAmountPaid - sale.products.reduce((acc, pr) => acc + pr.productId.unitPurchasePrice * pr.quantity, 0)
                                ), 0)}
                            />
                        </Card>
                    </Col>
                </Row>
                <Row gutter={16} >
                    <Col span={24}>
                        <Card style={{ background: "#cf1322" }}>
                            <Statistic
                                valueStyle={{ color: "#fff" }}
                                title={<p style={{ color: "#fff" }}>Umumiy qarz</p>}
                                suffix="UZS"
                                prefix={<MdMoneyOff />}
                                value={filteredSales.filter(s => s.isDebt)?.reduce((acc, sale) => (
                                    acc + (sale.totalAmountToPaid - sale.totalAmountPaid)
                                ), 0)}
                            />
                        </Card>
                    </Col>
                </Row>
                <p>Ombor</p>
                <Row gutter={16} >
                    <Col span={24}>
                        <Card style={{ background: "#f3bb1b" }}>
                            <Statistic
                                valueStyle={{ color: "#fff" }}
                                title={<p style={{ color: "#fff" }}>Umumiy mahsulotlar tan narxi</p>}
                                suffix="UZS"
                                prefix={<MdMoneyOff />}
                                value={products.reduce((acc, sale) => (
                                    acc + (sale.totalPieceQuantity * sale.unitPurchasePrice)
                                ), 0)}
                            />
                        </Card>
                    </Col>
                </Row>
                <Row gutter={16} >
                    <Col span={24}>
                        <Card style={{ background: "#3f8600" }}>
                            <Statistic
                                valueStyle={{ color: "#fff" }}
                                title={<p style={{ color: "#fff" }}>Ombordagi umumiy sof foyda</p>}
                                suffix="UZS"
                                prefix={<FaMoneyBillTrendUp />}
                                value={products.reduce((acc, sale) => (
                                    acc + (sale.unitSellingPrice - sale.unitPurchasePrice) * sale.totalPieceQuantity
                                ), 0)}
                            />
                        </Card>
                    </Col>
                </Row>
            </Space>
            <p>Sotuvlar summasi sanalar bo'yicha</p>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <Tooltip
                        formatter={(value) => [`${value?.toLocaleString()} so'm`, 'Sotuv summasi']}
                        labelFormatter={(label) => `Sana: ${label}`}
                    />
                    <Line type="monotone" dataKey="totalPaid" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};


export default AdminRole;