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
  Tabs,
  Divider ,
  message,
  InputNumber    
} from 'antd';
import { findDOMNode } from 'react-dom';
import { PageContainer } from '@ant-design/pro-layout';
import { connect } from 'umi';
import { history } from 'umi';
import moment from 'moment';
import OperationModal from './components/OperationModal';
import styles from './style.less';
import HttpService from '../../../utils/HttpService';
import ProTable from '@ant-design/pro-table';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Search } = Input;
const { TabPane } = Tabs;

const formItemLayout2 = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const formItemLayout1 = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};
const url = window.getServerUrl();

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
  const [amountToatl,setamountToatl] = useState();
  const [countTotal,setcountTotal] = useState();
  const [headerId,setHeaderId] = useState();

  useEffect(() => {
    loadCarSales();
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
  const loadCarSales = () => {
    HttpService.post('reportServer/sales/getCarSales', null).then((res) => {
      if (res.resultCode == '1000') {
        // setList(res.data);
        if (null != res.data.maindata) {
          mainForm.setFieldsValue({
            ...res.data.maindata,
            so_date: moment(res.data.maindata.so_date),
          });
          setList(res.data.lines);
          setamountToatl(res.data.amountAll);
          setcountTotal(res.data.countnum);
          setHeaderId(res.data.maindata.so_header_id)
        }else{
          setamountToatl("0");
          setcountTotal("0");
        }
      }
    });
  }
  const deleteItem = (id) => {
    HttpService.post('reportServer/sales/deleteLineById', JSON.stringify({"lineId":id})).then((res) => {
      loadCarSales();
    });
  };

  const editAndDelete = (key, currentItem) => {
    if (key === 'edit') showEditModal(currentItem);
    else if (key === 'delete') {
      Modal.confirm({
        title: '删除商品',
        content: '确定删除该商品吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => deleteItem(currentItem.so_line_id),
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
/****列表 开始 */

  const ref = useRef();
  const type = 'wholesales';

  //获取数据
  const fetchData = async (params, sort, filter) => {
    console.log('getByKeyword', params, sort, filter);
    // current: 1, pageSize: 20
    let requestParam = {
      pageNum: params.current,
      perPage: params.pageSize,
      ...params,
    };
    const result = await HttpService.post(
      'reportServer/sales/getListPage',
      JSON.stringify(requestParam),
    );
    console.log('result : ', result);
    return Promise.resolve({
      data: result.data.list,
      total: result.data.total,
      success: result.resultCode == '1000',
    });
  };

  //定义列
  const columns = [
    {
      title: '编号',
      dataIndex: 'header_code',
      valueType: 'text',
      align: 'center',
    },
    {
      title: '仓库',
      dataIndex: 'inv_org_name',
      key: 'inv_org_id',
      valueType: 'text',
      align: 'center',
    },
    {
      title: '销售时间',
      dataIndex: 'so_date',
      valueType: 'dateTime',
      align: 'center',
    },
    {
      title: '备注',
      dataIndex: 'comments',
      valueType: 'text',
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      align: 'center',
      valueEnum: {
        0: { text: '新建', status: 'Warning' },
        1: { text: '已过账', status: 'Success' },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'create_date',
      valueType: 'dateTime',
      align: 'center',
    },
    {
      title: '操作',
      key: 'option',
      valueType: 'option',
      align: 'center',
      render: (text, record) => [
        <a
          onClick={() => {
            
          }}
        >
          查看
        </a>,
        <a
          onClick={() => {
            onDeleteClickListener(ref, [record.so_header_id]);
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  const updateQuantity = (item,v) => {
   
    HttpService.post('reportServer/sales/updateQuantity', JSON.stringify({"lineId":item.so_line_id,"quantity":v})).then((res) => {
      loadCarSales();
    });
  }

//结算
const updateStatusByIds = () => {
  console.log(headerId);
  HttpService.post(
    'reportServer/wholeSale/updateWholeSaleStatusByIds',
    JSON.stringify({ ids:headerId , status: 1 }),
  ).then((res) => {
    if (res.resultCode == '1000') {
      //刷新
      history.push(`/retail/itemselect`);
    } else {
      message.error(res.message);
    }
  });
};
  return (
    <div>
     
      <Tabs  type="card" defaultActiveKey="1" size='small' style={{ marginBottom: 32 }}>
        <TabPane tab="我的订单" key="1">
          <ProTable
            actionRef={ref}
            columns={columns}
            request={fetchData}
            rowKey="so_header_id"
            params={{
              so_type: `deliver_wholesales`,
            }}
            rowSelection={
              {
                // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
                // 注释该行则默认不显示下拉选项
                //selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
              }
            }
            tableAlertRender={false}
            tableAlertOptionRender={false}
            pagination={{
              showQuickJumper: true,
            }}
            search={{
              defaultCollapsed: true,
            }}
            dateFormatter="string"
            headerTitle={'零售'}
            toolBarRender={false}
          />
        </TabPane>
      <TabPane tab="进行中" key="2">
      <div className={styles.standardList}>
        <Form
          {...formItemLayout2}
          form={mainForm}
          onFinish={async (fieldsValue) => {
            //验证tableForm
            console.log(fieldsValue);
          }}
        >
          <Card bordered={false}>
            <Row>
              <Col xs={24} sm={8}>
                <Form.Item label="销售编码" name="header_code">
                  <Input placeholder="自动生成" readOnly bordered={0} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  label="仓库名称"
                  name="inv_org_name"
                >
                  <Input id="inv_org_name" readOnly bordered={0} />
                </Form.Item>
              </Col>
            {/* </Row>

            <Row>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="so_date"
                  label="销售时间"
                  rules={[{ required: true, message: '请选择销售时间' }]}
                >
                  {mainForm.so_date}
                  <DatePicker style={{ width: '100%' }} disabled  bordered={0} format="YYYY-MM-DD HH:mm:ss" />
                </Form.Item>
              </Col> */}
              <Col xs={24} sm={8}>
                <Form.Item
                  name="USER_NAME"
                  label="销售员"
                >
                  <Input id="USER_NAME" readOnly bordered={0} />
                </Form.Item>
              </Col>
            </Row>
          <Divider ></Divider>
          
            <List
              size="large"
              rowKey="id"
              header={
                <div>
                  <span>
                    <Checkbox style={{ marginLeft:'24px',marginRight: '50px' }} />
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
                      // onClick={(e) => {
                      //   e.preventDefault();
                      //   showEditModal(item);
                      // }}
                      onClick={() => editAndDelete('delete', item)}>
                    
                      删除
                    </a>,
                    // <MoreBtn key="more" item={item} />,
                  ]}
                >
                  <Checkbox style={{ marginRight: '60px' }} />
                  <List.Item.Meta
                    avatar={
                      item.image_url == null ?
                        <Avatar src='https://img11.360buyimg.com/n7/jfs/t22633/109/2567375342/123812/faf849d3/5b862eb9N70c434d2.jpg' shape="square" size="large" />
                        : <Avatar src={url + "/report/" + item.image_url} shape="square" size="large" />
                        }
                    title={item.mkeyRes}
                    description={item.skeyRes}
                  />
                  <div className={styles.listContent}>
                    <div className={styles.listContentItem}>
                      <span>￥{item.retail_price}</span>
                      {/* <p>{owner}</p> */}
                    </div>
                    <div className={styles.listContentItem}>
                      <span><InputNumber min={1} max={1000} defaultValue={item.quantity} bordered={false}  onChange={(val)=>{updateQuantity(item,val)}} /></span>
                      {/* <p>{moment(createdAt).format('YYYY-MM-DD HH:mm')}</p> */}
                    </div>
                    <div className={styles.listContentItem}>
                      <span>￥{item.amount}</span>
                    </div>
                  </div>
                </List.Item>
              )}
            />
            <div style={{float: 'right',    fontSize: 'large'}}>
            已选商品&nbsp;<span style={{color:'red'}}>{ countTotal }</span>&nbsp;件&nbsp;&nbsp;&nbsp;&nbsp;
            合计：<span style={{color:'red'}}>￥{ amountToatl }</span> &nbsp;&nbsp;&nbsp;&nbsp;
            <Button type="primary" disabled={countTotal=='0'?true:false} onClick={updateStatusByIds}>结算</Button>
              </div>

            </Card>
        </Form>
        </div>
      </TabPane>
    </Tabs>
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
