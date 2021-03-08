import React, { useEffect, useRef, useState } from 'react';
import { message, Form, Button, Row, Col, Select, Input, DatePicker } from 'antd';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import ProCardCollapse from '@/components/ProCard/ProCardCollapse';
import TableForm from './TableForm';
import TableForm2 from './TableForm2';
import FormItem from 'antd/lib/form/FormItem';
import HttpService from '../../../utils/HttpService';
import { history } from 'umi';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

export default (props) => {
  const [tableForm] = Form.useForm();
  const [tableForm2] = Form.useForm();
  const [mainForm] = Form.useForm();
  const tableRef = useRef();
  const tableRef2 = useRef();
  const [tableData, setTableData] = useState([]);
  const [tableData2, setTableData2] = useState([]);
  const [query, setQuery] = useState('redux');
  const [displayType, setDisplayType] = useState('list');

  const [isSelect, setIsSelect] = useState(false);
  const [selectOrgDialogVisible, setSelectOrgDialogVisible] = useState(false);

  useEffect(() => {
    console.log(props.match.params);
    if ('null' != props.match.params.category_id && '' != props.match.params.category_id) {
      HttpService.post(
        'reportServer/itemCategory/getItemCategoryByID',
        JSON.stringify({ category_id: props.match.params.category_id }),
      ).then((res) => {
        if (res.resultCode == '1000') {
          setIsSelect(true);
          let mainFormV = res.data.mainForm;
          let lineFormV = res.data.lineForm;
          let lineFormV2 = res.data.lineForm2;
          mainForm.setFieldsValue({
            category_id: mainFormV.category_id,
            category_code: mainFormV.category_code,
            category_name: mainFormV.category_name,
            category_pid: mainFormV.category_pid,
            cost_method:mainFormV.cost_method+"",
          });

          //初始化数据
          tableRef?.current?.initData(lineFormV);
          tableRef2?.current?.initData(lineFormV2);
        } else {
          message.error(res.message);
        }
      });
    } else {
      mainForm.setFieldsValue({
        category_id: '',
        category_code: '',
        category_name: '',
        cost_method: '1',
        category_pid:
          props.match.params.category_pid == 'null' ? '-1' : props.match.params.category_pid,
      });
      console.log(mainForm);
    }
  }, []);


  return (
    <PageContainer
      title="类别设置"
      ghost="true"
      header={{
        extra: [
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              mainForm?.submit();
            }}
          >
            提交
          </Button>,
          <Button key="back" onClick={() => history.push('/mdm/itemCategory/itemCategoryList')}>
            返回
          </Button>,
        ],
      }}
    >
      <Form
        form={mainForm}
        onFinish={async (values) => {
          let boolean1=true;
          let boolean2=true;
          //验证tableForm
          await tableForm
            .validateFields()
            .then(() => {
              //验证成功
              console.log("boolean1=true")
            })
            .catch((errorInfo) => {
              //验证失败
              boolean1=false;
              console.log("boolean1=false")
              message.error('提交失败');
            });
          //表单2验证
          await  tableForm2.validateFields().then(() => {
            //验证成功
            console.log("boolean2=true")
          }).catch(errorInfo => {
            //验证失败
            boolean2=false;
            console.log("boolean2=false")
            message.error('提交失败');
          });
   
          if(boolean1 && boolean2){
            let postData = {
              ...values,
              lineForm: tableData,
              lineForm2: tableData2,
              lineDelete: tableRef?.current?.getDeleteData(),
              lineDelete2: tableRef2?.current?.getDeleteData()
            }
            HttpService.post('reportServer/itemCategory/saveItemCategory', JSON.stringify(postData))
              .then(res => {
                if (res.resultCode == "1000") {
                  //刷新
                  message.success('提交成功');
                  history.push("/mdm/itemCategory/itemCategoryList");
                } else {
                  message.error(res.message);
                }
              });
            }
          }}
        >
        <ProCardCollapse
          title="基础信息"
          headerBordered
          onCollapse={(collapse) => console.log(collapse)}
        >
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <Form.Item name="category_id" style={{ display: 'none' }}>
                <Input id="category_id" name="category_id" value={mainForm.category_id} />
              </Form.Item>
              <Form.Item name="category_pid" style={{ display: 'none' }}>
                <Input id="category_pid" name="category_pid" value={mainForm.category_pid} />
              </Form.Item>

              <Form.Item
                label="类别编码"
                name="category_code"
                rules={[{ required: true, message: '请输入字典编码' }]}
              >
                <Input placeholder="请输入字典编码" />
              </Form.Item>
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <Form.Item
                label="类别名称"
                name="category_name"
                rules={[{ required: true, message: '请选择字典名称' }]}
              >
                <Input style={{ width: '100%' }} placeholder="请输入字典名称" />
              </Form.Item>
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <Form.Item
                label="计价方式"
                name="cost_method"
                rules={[{ required: true, message: '请选择计价方式' }]}
              >
                <Select
                  placeholder="请选择计价方式"
                  defaultValue={mainForm.cost_method}
                >
                  <Option value="1">移动加平均</Option>
                  <Option value="2">单独记价</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </ProCardCollapse>

        <ProCardCollapse
          title="关键信息"
          onCollapse={(collapse) => console.log(collapse)}
          extra={[
            <Button
              size="small"
              onClick={() => {
                //新增一行
                tableRef.current.addItem({
                  category_id: mainForm.category_id,
                  row_number: `NEW_${(Math.random() * 1000000).toFixed(0)}`,
                  segment: '',
                  segment_name: '',
                  dict_id: '',
                  dict_name: '',
                  input_mode:"dict",
                  spread_mode: 'r',
                  qualifier:'mkey',
                  editable: true,
                  isNew: true,
                });
              }}
              icon={<PlusOutlined />}
            ></Button>,
            <Button
              size="small"
              style={{ margin: '12px' }}
              onClick={() => {
                //删除选中项
                tableRef.current.removeRows();
              }}
              icon={<MinusOutlined />}
            ></Button>,
          ]}
        >
          <TableForm
            ref={tableRef}
            primaryKey="row_number"
            value={tableData}
            onChange={(newTableData) => {
              //onChange实时回调最新的TableData
              //手动获取方式 tableRef?.current?.getTableData()，可以节省onChange方法
              setTableData(newTableData);
            }}
            tableForm={tableForm}
          />
        </ProCardCollapse>
        <ProCardCollapse
          title="属性信息"
          style={{ marginTop: '30px' }}
          headerBordered
          collapsible
          extra={
            [
              <Button onClick={() => {
                //新增一行
                tableRef2.current.addItem({
                  category_id: mainForm.category_id,
                  row_number: `NEW_${(Math.random() * 1000000).toFixed(0)}`,
                  attribute: '',
                  attribute_name: '',
                  dict_id: '',
                  dict_name: '',
                  input_mode:"dict",
                  spread_mode: 'r',
                  qualifier:'mkey',
                  required:'0',
                  editable: true,
                  isNew: true,
                });
              }} icon={<PlusOutlined />}>
              </Button>,
              <Button style={{ margin: '12px' }} onClick={() => {
                //删除选中项
                tableRef2.current.removeRows();
              }} icon={<MinusOutlined />}></Button>
            ]
          }
        >
          <TableForm2
            ref={tableRef2}
            primaryKey='row_number'
            value={tableData2}
            onChange={(newTableData) => {
              //onChange实时回调最新的TableData 
              //手动获取方式 tableRef2?.current?.getTableData()，可以节省onChange方法
              setTableData2(newTableData);
            }}
            tableForm2={tableForm2} />
        </ProCardCollapse>
      </Form>
    </PageContainer>
  );
};
