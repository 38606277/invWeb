import React, { useEffect, useRef, useState } from 'react';
import { message, Form, Button, Row, Col, Select, Input, DatePicker,Cascader  } from 'antd';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import FormItem from 'antd/lib/form/FormItem';
import HttpService from '../../utils/HttpService';
import { history } from 'umi';
import { PlusOutlined, MinusOutlined, ConsoleSqlOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

const formItemLayout2 = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export default (props) => {

  const [mainForm] = Form.useForm();
  const [options, setOptions] = useState([]);

  const [names, setName] = useState();

  useEffect(() => {
    const outlist = [];
    if ("null" != props.match.params.vendor_id && "" != props.match.params.vendor_id && "null" != props.match.params.vendor_id) {
        let params = {
            "vendor_id":props.match.params.vendor_id
        }
        HttpService.post('reportServer/shipment/getShipmentByID', JSON.stringify(params))
        .then(res => {
            if (res.resultCode == "1000") {
                const datainfo = res.data;
                mainForm.setFieldsValue({
                  vendor_id: datainfo.vendor_id,
                  vendor_name: datainfo.vendor_name,
                  vendor_code: datainfo.vendor_code,
                  address: datainfo.address
                });
                 
            } else {
                message.error(res.message);
            }
        })
    }else{
      mainForm.setFieldsValue({
        vendor_id: "",
        vendor_name: "",
        vendor_code: "",
        address: ""
      });
    }
  }, []);

 
  return (
    <PageContainer
      header={
        {
          extra: [
            <Button key="submit" type='primary' onClick={() => {
              console.log('mainForm', mainForm)
              mainForm?.submit()
            }}>提交</Button>,
            <Button key="back" onClick={() => history.push('/shipment/shipmentList')}>返回</Button>,
          ]
        }
      }
    >
      <Form
      { ...formItemLayout2}
        form={mainForm}
        onFinish={async (values) => {
          //mainForm
          mainForm.validateFields()
            .then(() => {
              //验证成功
              let postData={
                ...values
              }
              console.log(postData)
              HttpService.post('reportServer/shipment/saveShipment', JSON.stringify(postData))
                .then(res => {
                  if (res.resultCode == "1000") {
                    //刷新
                    message.success('提交成功');
                    history.push("/shipment/shipmentList");
                  } else {
                    message.error(res.message);
                  }
                });
            }).catch(errorInfo => {
              //验证失败
              message.error('提交失败');
            });
        }} >
          <Row gutter={24}>
          <Col xl={{ span: 8, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <Form.Item name="vendor_id" style={{display:'none'}}>
                <Input id='vendor_id' name='vendor_id' value={mainForm.vendor_id} />
              </Form.Item>
              <Form.Item
                label="名称"
                name="vendor_name"
                rules={[{ required: true, message: '请输入客户名称' }]}
              >
                  <Input id='vendor_name' name='vendor_name' />
              </Form.Item>
              
            </Col>
            <Col xl={{ span: 8, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <Form.Item
                label="编码"
                name="vendor_code"
                rules={[{ required: true, message: '请输入编码' }]}
              >
                <Input id='vendor_code' name='vendor_code' />
              </Form.Item>
            </Col>

          </Row>
          <Row gutter={24}>
             
            <Col xl={{ span: 8, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <Form.Item
                label="地址"
                name="address"
                rules={[{ required: true, message: '请输入地址' }]}
              >
                <Input id='address' name='address' />
              </Form.Item>
            </Col>
          
            </Row>
      </Form >
    </PageContainer >);
};
