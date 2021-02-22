import React, { useRef, useState, useEffect } from 'react';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Dropdown,
  Input,
  List,
  Menu,
  Modal,
  Progress,
  Radio,
  DatePicker,
  Row,
  Form,
  Checkbox,
} from 'antd';
import { findDOMNode } from 'react-dom';
import { PageContainer } from '@ant-design/pro-layout';
import { connect } from 'umi';
import moment from 'moment';
import OperationModal from './components/OperationModal';
import styles from './style.less';
import HttpService from '../../../utils/HttpService';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Search } = Input;

const formItemLayout2 = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const formItemLayout1 = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

const Info = ({ title, value, bordered }) => (
  <div className={styles.headerInfo}>
    <span>{title}</span>
    <p>{value}</p>
    {bordered && <em />}
  </div>
);

const ListContent = (item) => (
  <div className={styles.listContent}>
    <div className={styles.listContentItem}>
      <span>￥{item.cost_price}</span>
      {/* <p>{owner}</p> */}
    </div>
    <div className={styles.listContentItem}>
      <span>{item.quantity}</span>
      {/* <p>{moment(createdAt).format('YYYY-MM-DD HH:mm')}</p> */}
    </div>
    <div className={styles.listContentItem}>
      <span>￥{item.retail_price}</span>
    </div>
  </div>
);

export default () => {
  const addBtn = useRef(null);
  const [done, setDone] = useState(false);
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(undefined);
  const [list, setList] = useState([]);
  const [tableForm] = Form.useForm();
  const [mainForm] = Form.useForm();

  useEffect(() => {
    HttpService.post('reportServer/sales/getCarSales', null).then(
      (res) => {
        if (res.resultCode == '1000') {
         // setList(res.data);
         if(null!=res.data.maindata){
            mainForm.setFieldsValue({
              ...res.data.maindata,
              so_date: moment(res.data.maindata.so_date),
            });
            setList(res.data.lines);
          }
        }
      },
    );
  }, []);
  const paginationProps = {
    showSizeChanger: true,
    showQuickJumper: true,
    pageSize: 5,
    total: 50,
  };

  const showModal = () => {
    setVisible(true);
    setCurrent(undefined);
  };

  const showEditModal = (item) => {
    setVisible(true);
    setCurrent(item);
  };

  const deleteItem = (id) => {
    
  };

  const editAndDelete = (key, currentItem) => {
    if (key === 'edit') showEditModal(currentItem);
    else if (key === 'delete') {
      Modal.confirm({
        title: '删除任务',
        content: '确定删除该任务吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => deleteItem(currentItem.id),
      });
    }
  };

  const extraContent = (
    <div className={styles.extraContent}>
      <RadioGroup defaultValue="all">
        <RadioButton value="all">全部</RadioButton>
        <RadioButton value="progress">进行中</RadioButton>
        <RadioButton value="waiting">等待中</RadioButton>
      </RadioGroup>
      <Search className={styles.extraContentSearch} placeholder="请输入" onSearch={() => ({})} />
    </div>
  );

  const MoreBtn = ({ item }) => (
    <Dropdown
      overlay={
        <Menu onClick={({ key }) => editAndDelete(key, item)}>
          <Menu.Item key="edit">编辑</Menu.Item>
          <Menu.Item key="delete">删除</Menu.Item>
        </Menu>
      }
    >
      <a>
        更多 <DownOutlined />
      </a>
    </Dropdown>
  );

  const setAddBtnblur = () => {
    if (addBtn.current) {
      // eslint-disable-next-line react/no-find-dom-node
      const addBtnDom = findDOMNode(addBtn.current);
      setTimeout(() => addBtnDom.blur(), 0);
    }
  };

  const handleDone = () => {
    setAddBtnblur();
    setDone(false);
    setVisible(false);
  };

  const handleCancel = () => {
    setAddBtnblur();
    setVisible(false);
  };

  const handleSubmit = (values) => {
    const id = current ? current.id : '';
    setAddBtnblur();
    setDone(true);
    
  };

  return (
    <div>
      <div className={styles.standardList}>
      <Form
        {...formItemLayout2}
        form={mainForm}
        onFinish={async (fieldsValue) => {
          //验证tableForm
          console.log(fieldsValue)
        }}
      >
        <Card bordered={false}>
          <Row>
            <Col xs={24} sm={8}>
              <Form.Item label="* 销售编码" name="header_code">
                <Input placeholder="自动生成" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="仓库名称"
                name="inv_org_name"
                rules={[{ required: true, message: '请输入选择仓库' }]}
              >
                <Input id="inv_org_name" />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col xs={24} sm={8}>
              <Form.Item
                name="so_date"
                label="销售时间"
                rules={[{ required: true, message: '请选择销售时间' }]}
              >
                <DatePicker style={{ width: '100%' }} showTime format="YYYY-MM-DD HH:mm:ss" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="sales_id"
                label="销售员"
                rules={[{ required: true, message: '请选择销售时间' }]}
              >
                <Input id="sales_id" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card
          className={styles.listCard}
          bordered={false}
          title="订单列表"
          style={{
            marginTop: 24,
          }}
          bodyStyle={{
            padding: '0 32px 40px 32px',
          }}
          extra={extraContent}
        >
          {/* <Button
              type="dashed"
              style={{
                width: '100%',
                marginBottom: 8,
              }}
              onClick={showModal}
              ref={addBtn}
            >
              <PlusOutlined />
              添加
            </Button> */}

          <List
            size="large"
            rowKey="id"
            header={
              <div>
                <span>
                  {' '}
                  <Checkbox style={{ marginRight: '60px' }} />
                </span>
                <span style={{ marginRight: '360px' }}>商品名称</span>
                <span style={{ marginRight: '160px' }}>单价</span>
                <span style={{ marginRight: '160px' }}>数量</span>
                <span style={{ marginRight: '160px' }}>小计</span>
              </div>
            }
            dataSource={list}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <a
                    key="edit"
                    onClick={(e) => {
                      e.preventDefault();
                      showEditModal(item);
                    }}
                  >
                    编辑
                  </a>,
                  <MoreBtn key="more" item={item} />,
                ]}
              >
                <Checkbox style={{ marginRight: '60px' }} />
                <List.Item.Meta
                  avatar={<Avatar src={item.image_url} shape="square" size="large" />}
                  title={item.item_description}
                  description={'红色 XXL'}
                />
                <div className={styles.listContent}>
                  <div className={styles.listContentItem}>
                    <span>￥{item.cost_price}</span>
                    {/* <p>{owner}</p> */}
                  </div>
                  <div className={styles.listContentItem}>
                    <span>{item.quantity}</span>
                    {/* <p>{moment(createdAt).format('YYYY-MM-DD HH:mm')}</p> */}
                  </div>
                  <div className={styles.listContentItem}>
                    <span>￥{item.retail_price}</span>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </Card>
      </Form>
      </div>

      <OperationModal
        done={done}
        current={current}
        visible={visible}
        onDone={handleDone}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

