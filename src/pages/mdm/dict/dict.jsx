import React, { useEffect, useRef, useState } from 'react';
import { message, Form, Button, Row, Col, Select, Input, DatePicker } from 'antd';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import TableForm from './TableForm';
import FormItem from 'antd/lib/form/FormItem';
import HttpService from '../../../utils/HttpService';
import { history } from 'umi';

const { RangePicker } = DatePicker;
const { Option } = Select;

export default (props) => {

  const [tableForm] = Form.useForm();
  const [mainForm] = Form.useForm();
  const tableRef = useRef();
  const [tableData, setTableData] = useState([]);
  const [query, setQuery] = useState('redux');

  useEffect(() => {
    if("null"!=props.match.params.dict_id && ""!=props.match.params.dict_id){
      HttpService.post('reportServer/mdmDict/getDictByID', JSON.stringify({ dict_id: props.match.params.dict_id }))
      .then(res => {
          if (res.resultCode == "1000") {
            let mainFormV=res.data.mainForm;
            let lineFormV=res.data.lineForm;
            mainForm.setFieldsValue({
              dict_id:mainFormV.dict_id,
              dict_code:mainFormV.dict_code,
              dict_name:mainFormV.dict_name,
              dict_type:mainFormV.dict_type
            });
            //初始化数据
            tableRef?.current?.initData(lineFormV);
          } else {
              message.error(res.message);
          }
      });
    }else{
      mainForm.setFieldsValue({
        dict_id:"",
        dict_code:"",
        dict_name:"",
        dict_type:"list"
      });
    }
  },[]);

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
            <Button key="back" onClick={()=>history.push('/mdm/dict/dictList')}>返回</Button>,
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
              let postData={
                ...values,
                lineForm:tableData,
                lineDelete:tableRef?.current?.getDeleteData()
              }
              HttpService.post('reportServer/mdmDict/saveDict', JSON.stringify(postData))
              .then(res => {
                  if (res.resultCode == "1000") {
                      //刷新
                      message.success('提交成功');
                      history.push("/mdm/dict/dictList");
                  } else {
                      message.error(res.message);
                  }
              });
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
                name="dict_code"
                rules={[{ required: true, message: '请输入字典编码' }]}
              >
                <Input placeholder="请输入字典编码" />
              </Form.Item>
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <Form.Item
                label="字典名称"
                name="dict_name"
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
                name="dict_type"
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
