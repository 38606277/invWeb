import React, { useRef, useState } from 'react';
import { message, Form, Button, Row, Col, Select, Input, DatePicker } from 'antd';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import TableForm from '@/components/TableForm';
import InputEF from '@/components/EditForm/InputEF'
import SelectEF from '@/components/EditForm/SelectEF'

const { RangePicker } = DatePicker;
const { Option } = Select;



const tableData = [
  {
    value_id: '1',
    key: '1',
    workId: '00001',
    name: 'John Brown',
    department: 'New York No. 1 Lake Park',
  },
  {
    value_id: '2',
    key: '2',
    workId: '00002',
    name: 'Jim Green',
    department: 'London No. 1 Lake Park',
  },
  {
    value_id: '3',
    key: '3',
    workId: '00003',
    name: 'Joe Black',
    department: 'Sidney No. 1 Lake Park',
  },
];

export default () => {
  const tableRef = useRef();
  const [tableForm] = Form.useForm();
  const [mainForm] = Form.useForm();

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
        initialValues={{ members: tableData }}
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
                  value_id: `NEW_TEMP_ID_${(Math.random() * 1000000).toFixed(0)}`,
                  key: `NEW_TEMP_ID_${(Math.random() * 1000000).toFixed(0)}`,
                  workId: '这是默认值',
                  name: '这是默认值',
                  department: 'Sidney No. 1 Lake Park',
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
            <TableForm
              ref={tableRef}
              primaryKey='value_id'
              tableForm={tableForm}
              columns={(handleFieldChange, tableForm) => {
                return [
                  {
                    title: '成员姓名',
                    dataIndex: 'name',
                    key: 'name',
                    width: '20%',
                    render: (text, record, index) => {
                      return (
                        <InputEF
                          tableForm={tableForm}
                          text={text}
                          record={record}
                          index={index}
                          name="name"
                          rules={[{ required: true, message: 'Please input your name!' }]}
                          handleFieldChange={handleFieldChange}
                          placeholder={"请输入成员姓名"}
                        />
                      );
                    },

                  },
                  {
                    title: '工号',
                    dataIndex: 'workId',
                    key: 'workId',
                    width: '20%',
                    render: (text, record, index) => {
                      return (
                        <InputEF
                          tableForm={tableForm}
                          text={text}
                          record={record}
                          index={index}
                          name="workId"
                          rules={[{ required: true, message: 'Please input your workId!' }]}
                          handleFieldChange={handleFieldChange}
                          placeholder={"请输入工号"}
                        />
                      );
                    },
                  },
                  {
                    title: '所属部门',
                    dataIndex: 'department',
                    key: 'department',
                    width: '40%',
                    render: (text, record, index) => {
                      return (
                        <SelectEF
                          tableForm={tableForm}
                          text={text}
                          record={record}
                          index={index}
                          name="department"
                          rules={[{ required: true, message: 'Please select your department!' }]}
                          handleFieldChange={handleFieldChange}
                          placeholder={"请输选择所属部门"}
                          keyName="dict_id"
                          valueName="dict_name"
                          dictData={
                            [
                              {
                                dict_id: '1',
                                dict_name: "信息部",
                              }, {
                                dict_id: '2',
                                dict_name: "财务部",
                              }, {
                                dict_id: '3',
                                dict_name: "行政部",
                              }
                            ]
                          }
                        />
                      );

                    },
                  },
                ];
              }}
            />
          </Form.Item>

        </ProCard>
      </Form>

    </PageContainer>);
};

