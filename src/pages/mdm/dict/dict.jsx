import React, { useEffect, useRef, useState } from 'react';
import { message, Form, Button, Row, Col, Select, Input, DatePicker } from 'antd';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import TableForm from './TableForm';
import FormItem from 'antd/lib/form/FormItem';

const { RangePicker } = DatePicker;
const { Option } = Select;

export default () => {

  const [tableForm] = Form.useForm();
  const [mainForm] = Form.useForm();
  const tableRef = useRef();
  const [tableData, setTableData] = useState([]);
  
  useEffect(() => {
    mainForm.setFieldsValue({
      dict_id:"",
      dict_code:"",
      dict_name:"",
      dict_type:""
    });
    //初始化数据
    tableRef?.current?.initData([
      {
        value_id: '1',
        value_code: '00001',
        value_name: 'John Brown',
        value_pid: 'New York No. 1 Lake Park',
        dict_id: '2',
      },
      {
        value_id: '2',
        value_code: '00002',
        value_name: 'Jim Green',
        value_pid: 'London No. 1 Lake Park',
        dict_id: '2',
      },
      {
        value_id: '3',
        value_code: '00003',
        value_name: 'Joe Black',
        value_pid: 'Sidney No. 1 Lake Park',
        dict_id: '2',
      },
    ]);
    
  },[]);
  console.log(tableData);
  return (
    <PageContainer
      header={
        {
          extra: [
            <Button key="submit" type='primary' onClick={() => {
              console.log('mainForm', mainForm)
              mainForm?.submit()
            }}>提交</Button>,
            <Button key="reset">重置</Button>,
          ]
        }
      }
    >
      <Form
        form={mainForm}
        onFinish={async (values) => {
          //验证tableForm
          tableForm.validateFields()
            .then(() => {
              //验证成功
              console.log('main数据', values);
              console.log('行数据', tableData);
              message.success('提交成功');
            })
            .catch(errorInfo => {
              //验证失败
              message.error('提交失败');
            });
        }} >

        <ProCard title="基础信息" headerBordered
          collapsible
          onCollapse={(collapse) => console.log(collapse)}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <Form.Item name="dict_id" style={{display:'none'}}>
                <Input id='dict_id' name='dict_id' value={mainForm.dict_id} />
                </Form.Item>
              <Form.Item
                label="字典编码"
                name="name"
                rules={[{ required: true, message: '请输入字典编码' }]}
              >
                <Input placeholder="请输入字典编码" />
              </Form.Item>
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <Form.Item
                label="字典名称"
                name="url"
                rules={[{ required: true, message: '请选择字典名称' }]}
              >
                <Input
                  style={{ width: '100%' }}
                  placeholder="请输入字典名称"
                />
              </Form.Item>
            </Col>
            <Col xl={{ span: 8, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
              <Form.Item
                label="字典类型"
                name="owner"
                rules={[{ required: true, message: '请选择字典类型' }]}
              >
                <Select placeholder="请选择字典类型">
                  <Option value="list">列表</Option>
                  <Option value="tree">树</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </ProCard>

        <ProCard
          title="行信息"
          style={{ marginTop: '30px' }}

          headerBordered
          collapsible
          onCollapse={(collapse) => console.log(collapse)}
          extra={
            [

              <Button type='primary' onClick={() => {
                //新增一行
                tableRef.current.addItem({
                  value_id: `NEW_${(Math.random() * 1000000).toFixed(0)}`,
                  value_code: '',
                  value_name: '',
                  value_pid: '',
                  dict_id:mainForm.getFieldValue('dict_id'),
                  editable: true,
                  isNew: true,
                });
              }}> 新建
              </Button>,
              <Button type='danger' style={{ margin: '12px' }} onClick={() => {
                //删除选中项
                tableRef.current.removeRows();
              }}> 删除</Button>

            ]
          }
        >
         <TableForm ref={tableRef} primaryKey='value_id' value={tableData} onChange={(newTableData) => {
          //onChange实时回调最新的TableData 
          //手动获取方式 tableRef?.current?.getTableData()，可以节省onChange方法
          setTableData(newTableData);
        }} tableForm={tableForm} />

        </ProCard>
      </Form>

    </PageContainer>);
};

