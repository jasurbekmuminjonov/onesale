import React, { useEffect, useState } from 'react';
import { DatePicker, Spin } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLazyGetSalesByDateQuery } from '../context/service/sale.service';
import dayjs from 'dayjs';
import 'dayjs/locale/uz';
dayjs.locale('uz');

const { RangePicker } = DatePicker;

const Statistics = () => {
    const [getSalesByDate, { data: sales = [], isLoading }] = useLazyGetSalesByDateQuery();
    const [dateRange, setDateRange] = useState([
        dayjs().subtract(6, 'day'),
        dayjs()
    ]);

    const fetchSales = (range) => {
        const [start, end] = range;
        getSalesByDate({
            start: start.format("DD.MM.YYYY"),
            end: end.format("DD.MM.YYYY")
        });
    };

    useEffect(() => {
        fetchSales(dateRange);
    }, []);

    const groupedData = {};
    sales.forEach(sale => {
        const date = dayjs(sale.date).format("DD.MM.YYYY");
        if (!groupedData[date]) groupedData[date] = 0;
        groupedData[date] += sale.totalAmount || 0;
    });

    const chartData = Object.entries(groupedData).map(([date, total]) => ({
        date,
        total
    }));

    return (
        <div className='statistics' style={{ padding: 24 }}>
            <div className="statistics-header" style={{ marginBottom: 24 }}>
                <RangePicker
                    value={dateRange}
                    onChange={(dates) => {
                        if (!dates || dates.length === 0) {
                            const defaultRange = [dayjs().subtract(6, 'day'), dayjs()];
                            setDateRange(defaultRange);
                            fetchSales(defaultRange);
                        } else {
                            setDateRange(dates);
                            fetchSales(dates);
                        }
                    }}
                    allowClear
                    format="DD.MM.YYYY"
                />
            </div>

            <div className="statistics-chart" style={{ height: 350 }}>
                <h2>Sotuvlar</h2>
                {isLoading ? (
                    <Spin />
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip
                                formatter={(value) => [`${value.toLocaleString()} so'm`, 'Umumiy sotuv']}
                            />
                            <Line
                                type="monotone"
                                dataKey="total"
                                stroke="#1890ff"
                                strokeWidth={3}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default Statistics;
