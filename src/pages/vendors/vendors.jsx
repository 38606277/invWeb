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
        HttpService.post('reportServer/vendors/getCustomersByID', JSON.stringify(params))
        .then(res => {
            if (res.resultCode == "1000") {
                const datainfo = res.data;
                mainForm.setFieldsValue({
                  vendor_id: datainfo.vendor_id,
                  vendor_name: datainfo.vendor_name,
                  vendor_address: datainfo.vendor_address,
                  vendor_link: datainfo.vendor_link,
                  vendor_type: datainfo.vendor_type,
                  area_id: datainfo.area_id,
                  bank_name: datainfo.bank_name,
                  bank_account_num: datainfo.bank_account_num,
                  area_name:datainfo.area_name==null?"":datainfo.area_name.split(",")
                });
                 
            } else {
                message.error(res.message);
            }
        })
    }else{
      mainForm.setFieldsValue({
        vendor_id: "",
        vendor_name: "",
        vendor_address: "",
        vendor_link: "",
        vendor_type: "",
        area_id: "",
        bank_name: "",
        bank_account_num: "",
        area_name:""
      });
    }
    loadAreaData('CHN');
  }, []);

  
  const loadAreaData = (code) => {
      let param = {
          parentCode: code,
          maxLevel: 3
      }
      HttpService.post('/reportServer/vendors/getArea',param).then(response => {
          if (response.resultCode == "1000") {
              setOptions(response.data)
              console.log(response)
          }
          else {
              message.error(response.message);
          }
      }, errMsg => {
        message.error(errMsg);
      });
  }


  const handleFieldChange = ( value, selectedOptions) => {
    console.log(selectedOptions);
    const valuess=value==undefined?"":value[value.length-1];
    console.log(valuess);
      // const valName='area_id';
      // const val=value.join(",");
     mainForm.setFieldsValue({'area_id':valuess});
     //loadData(selectedOptions);
  }
  const  loadData = selectedOptions => {
      const targetOption = selectedOptions[selectedOptions.length - 1];
      let param = {
          parentCode: targetOption.value,
          maxLevel: 3
      }
      targetOption.loading = true;
      HttpService.post('/reportServer/vendors/getArea',param).then(response => {
          if (response.resultCode == "1000") {
              targetOption.children = response.data;
              targetOption.loading = false;
              setOptions([...options]);
          }
          else {
              message.error(response.message);
          }
      }, errMsg => {
        message.error(errMsg);
      });
  };

  return (
    <PageContainer
      header={
        {
          extra: [
            <Button key="submit" type='primary' onClick={() => {
              console.log('mainForm', mainForm)
              mainForm?.submit()
            }}>提交</Button>,
            <Button key="back" onClick={() => history.push('/vendors/vendorsList')}>返回</Button>,
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
              HttpService.post('reportServer/vendors/saveVendors', JSON.stringify(postData))
                .then(res => {
                  if (res.resultCode == "1000") {
                    //刷新
                    message.success('提交成功');
                    history.push("/vendors/vendorsList");
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
                rules={[{ required: true, message: '请输入供应商名称' }]}
              >
                  <Input id='vendor_name' name='vendor_name' />
              </Form.Item>
              
            </Col>
            <Col xl={{ span: 8, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <Form.Item
                label="地址"
                name="vendor_address"
                rules={[{ required: true, message: '请输入地址' }]}
              >
                <Input id='vendor_address' name='vendor_address' />
              </Form.Item>
            </Col>

          </Row>
          <Row gutter={24}>
             
            <Col xl={{ span: 8, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <Form.Item
                label="联系人"
                name="vendor_link"
                rules={[{ required: true, message: '请联系人' }]}
              >
                <Input id='vendor_link' name='vendor_link' />
              </Form.Item>
            </Col>
          <Col xl={{ span: 8, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <Form.Item
                label="类型"
                name="vendor_type"
                rules={[{ required: true, message: '请类型' }]}
              >
                  <Input id='vendor_type' name='vendor_type' />
              </Form.Item>
            </Col>
            </Row>
          <Row gutter={24}>
            <Col xl={{ span: 8, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
            <Form.Item name="area_id" style={{display:'none'}}>
                <Input id='area_id' name='area_id' value={mainForm.area_id} />
              </Form.Item>
              <Form.Item
                label="区域"
                name="area_name"
                rules={[{ required: true, message: '请选择区域' }]}
              >
                <Cascader
                    options={options}
                    loadData={loadData}
                    onChange={handleFieldChange}
                    changeOnSelect
                />
              </Form.Item>
            </Col>

         
          <Col xl={{ span: 8, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <Form.Item
                label="银行名称"
                name="bank_name"
                rules={[{ required: true, message: '请输入银行名称' }]}
              >
                  <Input id='bank_name' name='bank_name' />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xl={{ span: 8, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <Form.Item
                label="银行账号"
                name="bank_account_num"
                rules={[{ required: true, message: '请输入银行账号' }]}
              >
                <Input id='bank_account_num' name='bank_account_num' />
              </Form.Item>
            </Col>
          </Row>
      </Form >
    </PageContainer >);
};
