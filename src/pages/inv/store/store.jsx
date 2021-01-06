import React, { useState } from 'react';
import { message, Form } from 'antd';
import ProForm, { ProFormText, ProFormDateRangePicker, ProFormSelect } from '@ant-design/pro-form';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import TableForm from './components/TableForm';


export default () => {

  return (
    <PageContainer>

      <ProForm onFinish={async (values) => {
        console.log(values);
        message.success('提交成功');
      }} >
        <ProCard
          title="基础信息"
          headerBordered
          collapsible
          onCollapse={(collapse) => console.log(collapse)}
        >
          <ProForm.Group>
            <ProFormText width="md" name="name" label="签约客户名称" tooltip="最长为 24 位" placeholder="请输入名称" />
            <ProFormText width="md" name="company" label="我方公司名称" placeholder="请输入名称" />
          </ProForm.Group>
        </ProCard>


        <ProCard
          style={{ marginTop: '30px' }}
          title="行信息"
          headerBordered
          collapsible
          onCollapse={(collapse) => console.log(collapse)}
        >
          <Form.Item name="members">
            <TableForm />
          </Form.Item>

        </ProCard>
      </ProForm>

    </PageContainer>);
};

