import React, { useRef, useState } from 'react';
import { message, Form, Button, Row, Col, Select, Input, DatePicker } from 'antd';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import TableForm from './components/TableForm';
import FormItem from 'antd/lib/form/FormItem';

const { RangePicker } = DatePicker;
const { Option } = Select;

export default () => {

  const [tableForm] = Form.useForm();
  const [mainForm] = Form.useForm();


  const tableRef = useRef();


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
              console.log(values);
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
              <Form.Item
                label="仓库名"
                name="name"
                rules={[{ required: true, message: '请输入仓库名称' }]}
              >
                <Input placeholder="请输入仓库名称" />
              </Form.Item>
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <Form.Item
                label="url地址"
                name="url"
                rules={[{ required: true, message: '请选择' }]}
              >
                <Input
                  style={{ width: '100%' }}
                  addonBefore="http://"
                  addonAfter=".com"
                  placeholder="请输入"
                />
              </Form.Item>
            </Col>
            <Col xl={{ span: 8, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
              <Form.Item
                label="管理员"
                name="owner"
                rules={[{ required: true, message: '请选择管理员' }]}
              >
                <Select placeholder="请选择管理员">
                  <Option value="xiao">付晓晓</Option>
                  <Option value="mao">周毛毛</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <Form.Item
                label="审批员"
                name="approver"
                rules={[{ required: true, message: '请选择审批员' }]}
              >
                <Select placeholder="请选择审批员">
                  <Option value="xiao">付晓晓</Option>
                  <Option value="mao">周毛毛</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <Form.Item
                label="生效日期"
                name="dateRange"
                rules={[{ required: true, message: '请选择生效日期' }]}
              >
                <RangePicker placeholder={['开始日期', '结束日期']} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xl={{ span: 8, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
              <Form.Item
                label="仓库类型"
                name="type"
                rules={[{ required: true, message: '请选择仓库类型' }]}
              >
                <Select placeholder="请选择仓库类型">
                  <Option value="private">私密</Option>
                  <Option value="public">公开</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </ProCard>

        <ProCard
          style={{ marginTop: '30px' }}
          title="行信息"
          headerBordered
          collapsible
          onCollapse={(collapse) => console.log(collapse)}
          extra={
            <Button onClick={() => {
              //新增一行
              tableRef.current.newMember();
            }}> 新建</Button>
          }
        >
          <Form.Item name='members'>
            <TableForm tableRef={tableRef} tableForm={tableForm} />
          </Form.Item>

        </ProCard>
      </Form>

    </PageContainer>);
};

