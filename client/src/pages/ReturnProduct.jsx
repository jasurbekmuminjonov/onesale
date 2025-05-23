import React, { useState } from "react";
import {
  Tabs,
  Input,
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  message,
  Spin,
  Space,
  Popover,
} from "antd";
import { useCreateReturnMutation, useGetReturnsQuery } from "../context/service/return.service";
import { useGetSalesQuery } from "../context/service/sale.service";
import moment from "moment";

const { TabPane } = Tabs;

const ReturnProduct = () => {
  const [saleIdInput, setSaleIdInput] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const { data: salesData = [], isLoading: isSalesLoading } = useGetSalesQuery();
  const { data: returnData = [], isLoading: isReturnsLoading } = useGetReturnsQuery();
  const [createReturn, { isLoading: isCreating }] = useCreateReturnMutation();

  const handleFindSale = () => {
    const found = salesData?.find(sale => sale?._id === saleIdInput);
    if (!found) return message.warning("Sotuv topilmadi");
    setSelectedSale(found);
  };

  const handleReturn = async () => {
    try {
      const values = await form.validateFields();
      const products = selectedProducts.map((product, index) => ({
        productId: product?.productId?._id || product?.productId,
        stockDate: product.stockDate,
        quantity: values[`quantity_${index}`],
        reason: values[`reason_${index}`] || '-',
      }));

      const body = {
        saleId: selectedSale._id,
        products,
      };

      await createReturn(body).unwrap();
      message.success("Tanlangan mahsulotlar muvaffaqiyatli qaytarildi");
      setIsModalVisible(false);
      setSelectedProducts([]);
      setSelectedSale(null);
      setSaleIdInput("");
      form.resetFields();
    } catch (err) {
      message.error("Xatolik yuz berdi");
    }
  };

  const saleColumns = [
    {
      title: "Mahsulot",
      dataIndex: ["productId", "productName"],
      key: "productName",
    },
    {
      title: "Sana",
      dataIndex: "stockDate",
      key: "stockDate",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Miqdori",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Narxi",
      dataIndex: "price",
      key: "price",
    }
  ];

  const rowSelection = {
    selectedRowKeys: selectedProducts.map(
      (p) => `${p.productId?._id || p.productId}-${p.stockDate}`
    ),
    onChange: (_, selectedRows) => {
      setSelectedProducts(selectedRows);
    },
    getCheckboxProps: (record) => ({
      disabled: record.quantity <= 0,
    }),
  };

  const renderProductsPopover = (products) => {
    const columns = [
      {
        title: "Mahsulot",
        dataIndex: ["productId", "productName"],
        key: "productName",
      },
      {
        title: "Sana",
        dataIndex: "stockDate",
        key: "stockDate",
        render: (text) => moment(text).format("DD.MM.YYYY"),
      },
      {
        title: "Miqdori",
        dataIndex: "quantity",
        key: "quantity",
      },
      {
        title: "Sabab",
        dataIndex: "reason",
        key: "reason",
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={products}
        rowKey={(record, index) => `${record.productId?._id || "prod"}-${index}`}
        size="small"
        pagination={false}
      />
    );
  };
  const returnColumns = [
    {
      title: "Mahsulotlar",
      key: "products",
      render: (_, record) => (
        <Popover
          title="Qaytarilgan mahsulotlar"
          content={renderProductsPopover(record.products)}
          trigger="click"
          placement="rightTop"
        >
          <Button type="link">Mahsulotlarni ko‘rish</Button>
        </Popover>
      ),
    },
    {
      title: "Qaytarilgan sana",
      dataIndex: "date",
      key: "date",
      render: (text) => moment(text).format("DD.MM.YYYY HH:mm"),
    },
  ];

  return (
    <div className="return-product">
      <Tabs defaultActiveKey="1">
        <TabPane tab="Tovarni qaytarib olish" key="1">
          <Input.Search
            autoFocus
            placeholder="Sotuv ID ni kiriting"
            enterButton="Qidirish"
            value={saleIdInput}
            onChange={(e) => setSaleIdInput(e.target.value)}
            onSearch={handleFindSale}
            style={{ maxWidth: 400, marginBottom: 16 }}
          />

          {isSalesLoading ? (
            <Spin />
          ) : selectedSale ? (
            <>
              <Table
                columns={saleColumns}
                dataSource={selectedSale.products}
                rowSelection={{
                  type: "checkbox",
                  ...rowSelection,
                  getCheckboxProps: (record) => ({
                    disabled: record.quantity <= 0,
                  }),
                }}
                rowKey={(record) =>
                  `${record.productId?._id || record.productId}-${record.stockDate}`
                }
                pagination={false}
              />
              <Button
                type="primary"
                style={{ marginTop: 16 }}
                disabled={selectedProducts.length === 0}
                onClick={() => setIsModalVisible(true)}
              >
                Tanlangan mahsulotlarni qaytarish
              </Button>
            </>
          ) : null}
        </TabPane>

        <TabPane tab="Qaytarilgan tovarlar" key="2">
          <Table
            columns={returnColumns}
            dataSource={returnData || []}
            loading={isReturnsLoading}
            rowKey="_id"
          />
        </TabPane>
      </Tabs>

      <Modal
        title="Qaytarish ma'lumotlarini kiriting"
        open={isModalVisible}
        onOk={handleReturn}
        confirmLoading={isCreating}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        <Form form={form} layout="vertical">
          {selectedProducts.map((product, index) => (
            <div key={index} style={{ borderBottom: "1px solid #ddd", marginBottom: 12 }}>
              <b>{product?.productId?.productName || "Nomaʼlum mahsulot"}</b>
              <Form.Item
                name={`quantity_${index}`}
                label="Miqdori"
                rules={[{ required: true, message: "Miqdor kiritish shart" }]}
              >
                <InputNumber min={1} max={product.quantity} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item name={`reason_${index}`} label="Sabab">
                <Input placeholder="Qaytarish sababi (ixtiyoriy)" />
              </Form.Item>
            </div>
          ))}
        </Form>
      </Modal>
    </div>
  );
};

export default ReturnProduct;
