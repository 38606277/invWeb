import React, { useRef, useState, useEffect } from 'react';
import { message, Form, Button, Row, Col, Select, Input, DatePicker } from 'antd';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import TableForm from './components/TableForm';
import FormItem from 'antd/lib/form/FormItem';

const { RangePicker } = DatePicker;
const { Option } = Select;

export default () => {
  const tableRef = useRef();
  const [tableForm] = Form.useForm();
  const [mainForm] = Form.useForm();



  useEffect(() => {
    mainForm.setFieldsValue({
      members: [
        {
          id: '1',
          workId: '00001',
          name: 'John Brown',
          department: '2',
        },
        {
          id: '2',
          workId: '00002',
          name: 'Jim Green',
          department: 'London No. 1 Lake Park',
        },
        {
          id: '3',
          workId: '00003',
          name: 'Joe Black',
          department: 'Sidney No. 1 Lake Park',
        },
      ]
    });
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
                  id: `NEW_TEMP_ID_${(Math.random() * 1000000).toFixed(0)}`,
                  workId: '这是默认值',
                  name: '这是默认值',
                  department: '',
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
          <Form.Item name='members'>
            <TableForm ref={tableRef} primaryKey='id' tableForm={tableForm} />
          </Form.Item>

        </ProCard>
      </Form>

    </PageContainer>);
};

