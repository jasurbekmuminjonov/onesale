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
} from "antd";
import { useCreateReturnMutation, useGetReturnsQuery } from "../context/service/return.service";
import { useGetSalesQuery } from "../context/service/sale.service";
import moment from "moment";

const { TabPane } = Tabs;

const ReturnProduct = () => {
  const [saleIdInput, setSaleIdInput] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
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

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  };

  const handleReturn = async () => {
    try {
      const values = await form.validateFields();
      const body = {
        productId: selectedProduct?.productId?._id || selectedProduct?.productId,
        stockDate: selectedProduct.stockDate,
        saleId: selectedSale?._id,
        quantity: values.quantity,
        reason: values.reason,
        storeId: selectedSale.storeId,
      };

      await createReturn(body).unwrap();
      message.success("Tovar muvaffaqiyatli qaytarildi");
      setIsModalVisible(false);
      setSelectedProduct(null);
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
      title: "Omborga qo‘shilgan sana",
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
    },
    {
      title: "Amal",
      key: "action",
      render: (_, record) => (
        <Button type="primary" onClick={() => handleOpenModal(record)}>
          Qaytarish
        </Button>
      ),
    },
  ];

  const returnColumns = [
    {
      title: "Mahsulot",
      dataIndex: ["productId", "productName"],
      key: "productName",
    },
    {
      title: "Qaytarilgan sana",
      dataIndex: "date",
      key: "date",
      render: (text) => moment(text).format("DD.MM.YYYY HH:mm"),
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
            <Table
              columns={saleColumns}
              dataSource={selectedSale.products}
              rowKey={(record) => record.productId?._id || record.productId}
              pagination={false}
            />
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
        title="Tovarni qaytarish"
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
          <Form.Item
            label="Qaytarilayotgan miqdor"
            name="quantity"
            rules={[{ required: true, message: "Iltimos, miqdorni kiriting" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Sabab" name="reason">
            <Input placeholder="Sabab (ixtiyoriy)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReturnProduct;
