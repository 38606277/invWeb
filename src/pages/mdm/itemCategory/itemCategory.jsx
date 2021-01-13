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
  const [displayType, setDisplayType] = useState('list');
  const [isSelect,setIsSelect] = useState(false);
  const [selectOrgDailogVisible, setSelectOrgDailogVisible] = useState(false);

  useEffect(() => {
    if("null"!=props.match.params.category_id && ""!=props.match.params.category_id){
      HttpService.post('reportServer/mdmDict/getDictByID', JSON.stringify({ category_id: props.match.params.category_id }))
      .then(res => {
          if (res.resultCode == "1000") {
            setIsSelect(true);
            let mainFormV=res.data.mainForm;
            let lineFormV=res.data.lineForm;
            mainForm.setFieldsValue({
              category_id:mainFormV.category_id,
              dict_code:mainFormV.dict_code,
              dict_name:mainFormV.dict_name,
              dict_type:mainFormV.dict_type
            });
            setDisplayType(mainFormV.dict_type);
            //初始化数据
            tableRef?.current?.initData(lineFormV);
          } else {
              message.error(res.message);
          }
      });
    }else{
      mainForm.setFieldsValue({
        category_id:"",
        dict_code:"",
        dict_name:"",
        dict_type:"list"
      });
    }
  },[]);

  const selectChage = (e) =>{
    setDisplayType(e);
    if(mainForm.getFieldValue('category_id')=="" || mainForm.getFieldValue('category_id')=="null"){
      tableRef?.current?.initData([]);
    }
  }
  return (
    <PageContainer
      header={
        {
          extra: [
            <Button key="submit" type='primary' onClick={() => {
              console.log('mainForm', mainForm)
              mainForm?.submit()
            }}>提交</Button>,
            <Button key="back" onClick={()=>history.push('/mdm/itemCategory/itemCategoryList')}>返回</Button>,
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
                      history.push("/mdm/itemCategory/itemCategoryList");
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
              <Form.Item name="category_id" style={{display:'none'}}>
                <Input id='category_id' name='category_id' value={mainForm.category_id} />
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
                <Input
                  style={{ width: '100%' }}
                  placeholder="请输入字典名称"
                />
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
                  category_id: `NEW_${(Math.random() * 1000000).toFixed(0)}`,
                  row_number: '',
                  segment: '',
                  segment_name: '',
                  dict_id: '',
                  row_or_column: '',
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
        <TableForm
            ref={tableRef}
            primaryKey='category_id' 
            value={tableData}
            onChange={(newTableData) => {
            //onChange实时回调最新的TableData 
            //手动获取方式 tableRef?.current?.getTableData()，可以节省onChange方法
            setTableData(newTableData);
            }} 
            tableForm={tableForm} />

        </ProCard>
      </Form>
      {/* <SelectOrgDailog
        modalVisible={selectOrgDailogVisible}
        handleOk={(selectOrg) => {
          if (selectOrg) {
            mainForm.setFieldsValue({
              inv_org_id: selectOrg.org_id,
              inv_org_name: selectOrg.org_name,
            });
          }
          setSelectOrgDailogVisible(false);
        }}
        handleCancel={() => {
          setSelectOrgDailogVisible(false);
        }}
      /> */}
    </PageContainer>);
};
