import React, { useEffect, useRef, useState } from 'react';
import { message, Form, Button, Row, Col, Select, Input, DatePicker } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProCardCollapse from '@/components/ProCard/ProCardCollapse';

import HttpService from '@/utils/HttpService';
import { history } from 'umi';
import { PlusOutlined, MinusOutlined, ConsoleSqlOutlined } from '@ant-design/icons';

import moment from 'moment';
import 'moment/locale/zh-cn';

const { RangePicker } = DatePicker;
const { Option } = Select;

const formItemLayout2 = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const formItemLayout1 = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

const bankAccount = (props) => {
  const [mainForm] = Form.useForm();

  const action = props?.match?.params?.action || 'add';
  const id = props?.match?.params?.id || -1;

  const save = (params) => {
    HttpService.post('reportServer/bankAccount/createBankAccount', JSON.stringify(params)).then(
      (res) => {
        if (res.resultCode == '1000') {
          history.goBack();
          message.success(res.message);
        } else {
          message.error(res.message);
        }
      },
    );
  };

  const update = (params) => {
    HttpService.post('reportServer/bankAccount/updateBankAccountById', JSON.stringify(params)).then(
      (res) => {
        if (res.resultCode == '1000') {
          history.goBack();
          message.success(res.message);
        } else {
          message.error(res.message);
        }
      },
    );
  };

  useEffect(() => {
    if (action === 'edit') {
      //初始化编辑数据
      HttpService.post(
        'reportServer/bankAccount/getBankAccountById',
        JSON.stringify({ bank_account_id: id }),
      ).then((res) => {
        if (res.resultCode == '1000') {
          mainForm.setFieldsValue({
            ...res.data,
            inactive_date: moment(res.data.inactive_date),
          });
        } else {
          message.error(res.message);
        }
      });
    }
  }, []);

  return (
    <PageContainer
      header={{
        extra: [
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              console.log('mainForm', mainForm);
              mainForm?.submit();
            }}
          >
            提交
          </Button>,
          <Button key="back" onClick={() => history.goBack()}>
            返回
          </Button>,
        ],
      }}
    >
      <Form
        {...formItemLayout2}
        form={mainForm}
        onFinish={async (fieldsValue) => {
          //mainForm
          mainForm
            .validateFields()
            .then(() => {
              //验证成功

              const values = {
                ...fieldsValue,
                inactive_date: fieldsValue['inactive_date'].format('YYYY-MM-DD'),
              };

              if (action === 'edit') {
                values.bank_account_id = id;
                update(values);
              } else {
                save(values);
              }
            })
            .catch((errorInfo) => {
              //验证失败
              message.error('提交失败');
            });
        }}
      >
        <ProCardCollapse title="基础信息">
          <Row>
            <Col xs={24} sm={11}>
              <Form.Item
                label="账户名称"
                name="bank_account_name"
                rules={[{ required: true, message: '请输入账户名称' }]}
              >
                <Input placeholder="请输入账户名称" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={11}>
              <Form.Item
                label="账户编号"
                name="bank_account_number"
                rules={[{ required: true, message: '请输入账户编号' }]}
              >
                <Input placeholder="请输入账户编号" />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col xs={24} sm={11}>
              <Form.Item
                label="联系人"
                name="contact_name"
                rules={[{ required: true, message: '请输入联系人' }]}
              >
                <Input placeholder="请输入联系人" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={11}>
              <Form.Item
                label="联系电话"
                name="contact_phone"
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col xs={24} sm={11}>
              <Form.Item
                label="最小付款额"
                name="min_check_amount"
                rules={[{ required: true, message: '请输入最小付款额' }]}
              >
                <Input placeholder="请输入最小付款额" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={11}>
              <Form.Item
                label="最大付款额"
                name="max_check_amount"
                rules={[{ required: true, message: '请输入最大付款额' }]}
              >
                <Input placeholder="请输入最大付款额" />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col xs={24} sm={11}>
              <Form.Item
                label="银行名称"
                name="bank_name"
                rules={[{ required: true, message: '请输入银行名称' }]}
              >
                <Input placeholder="请输入银行名称" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={11}>
              <Form.Item
                label="支行名称"
                name="bank_branch"
                rules={[{ required: true, message: '请输入支行名称' }]}
              >
                <Input placeholder="请输入支行名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col xs={24} sm={11}>
              <Form.Item
                label="货币类型"
                name="currency_code"
                rules={[{ required: true, message: '请输入货币类型' }]}
              >
                <Input placeholder="请输入货币类型" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={11}>
              <Form.Item
                label="失效时间"
                name="inactive_date"
                rules={[{ required: true, message: '请选择失效时间' }]}
              >
                <DatePicker style={{ width: '100%' }} showTime format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={22}>
              <Form.Item {...formItemLayout1} label="描述" name="description">
                <Input.TextArea placeholder="请输入描述" autoSize={{ minRows: 2, maxRows: 3 }} />
              </Form.Item>
            </Col>
          </Row>
        </ProCardCollapse>
      </Form>
    </PageContainer>
  );
};

export default bankAccount;
