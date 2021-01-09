import React, { useRef, useState, useEffect } from 'react';
import { message, Form, Button, Row, Col, Select, Input, DatePicker } from 'antd';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import TableForm from './components/TableForm';
import SelectOrgDailog from '@/components/Org/SelectOrgDialog';
import HttpService from '@/utils/HttpService.jsx';
import { history } from 'umi';

import moment from 'moment';
import 'moment/locale/zh-cn';
import { update } from 'lodash';

const { Search } = Input;

const { RangePicker } = DatePicker;
const { Option } = Select;

export default (props) => {
  const tableRef = useRef();
  const [tableForm] = Form.useForm();
  const [mainForm] = Form.useForm();
  const [selectOrgDailogVisible, setSelectOrgDailogVisible] = useState(false);
  const [action, setAction] = useState(props?.match?.params?.action || add);
  const [id, setId] = useState(props?.match?.params?.id || -1);



  const save = (params) => {
    HttpService.post('reportServer/invStore/createStore', JSON.stringify(params))
      .then(res => {
        if (res.resultCode == "1000") {
          history.push(`/transation/storeList`)
          message.success(res.message);
        } else {
          message.error(res.message);
        }
      });
  }

  const update = (params) => {
    HttpService.post('reportServer/invStore/createStore', JSON.stringify(params))
      .then(res => {
        if (res.resultCode == "1000") {
          history.push(`/transation/storeList`)
          message.success(res.message);
        } else {
          message.error(res.message);
        }
      });
  }



  useEffect(() => {
    if (action === 'edit') {
      //初始化编辑数据
      HttpService.post('reportServer/invStore/getStoreById', JSON.stringify({ bill_id: id }))
        .then(res => {
          if (res.resultCode == "1000") {
            mainForm.setFieldsValue({ ...res.data.mainData, bill_date: moment(res.data.mainData.bill_date) })
            tableRef?.current?.initData(res.data.linesData)
            console.log(res);
          } else {
            message.error(res.message);
          }
        });
    }

  })


  return (
    <PageContainer
      header={
        {
          extra: [
            <Button key="submit" type='primary' onClick={() => {
              mainForm?.submit()
            }}>提交</Button>,
            <Button key="reset">重置</Button>,
          ]
        }
      }
    >
      <Form
        form={mainForm}
        onFinish={async (fieldsValue) => {
          //验证tableForm
          tableForm.validateFields()
            .then(() => {
              //验证成功


              let tableData = tableRef.current.getTableData();
              let deleteRecord = tableRef.current.getDeleteRecord();

              console.log('main数据', values);
              console.log('行数据', tableData);
              console.log('删除记录:', deleteRecord);

              const values = {
                ...fieldsValue,
                'bill_date': fieldsValue['bill_date'].format('YYYY-MM-DD HH:mm:ss')
              };

              values.bill_status = 0;
              values.bill_type = 'store';

              if (action === 'edit') {

                //过滤deleteRecord中的临时数据
                deleteRecord.filter((element) => {
                  return -1 < element.line_id.indexOf('NEW_TEMP_ID_');
                })
                update({
                  mainData: values,
                  linesData: tableData,
                  deleteData: deleteRecord // 删除项
                })
              } else {
                save({
                  mainData: values,
                  linesData: tableData,
                })
              }




            })
            .catch(errorInfo => {
              //验证失败
              message.error('提交失败');
            });
        }} >

        <ProCard title="基础信息" headerBordered
          collapsible
          onCollapse={(collapse) => console.log(collapse)}>
          <Form.Item
            style={{ display: 'none' }}
            label="仓库Id"
            name="inv_org_id"
          />
          <Row gutter={16}>
            <Col xs={24} sm={12}>

              <Form.Item
                label="入库编码"
                name="bill_id"
              >
                <Input placeholde="自动生成" disabled />
              </Form.Item>

            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="仓库名称"
                name="inv_org_name"
                rules={[{ required: true, message: '请输入选择仓库' }]}
              >
                <Search
                  placeholder="请选择仓库"
                  allowClear
                  readOnly={true}
                  enterButton
                  size="large"
                  onClick={() => {
                    setSelectOrgDailogVisible(true)
                  }}
                  onSearch={() => {
                    setSelectOrgDailogVisible(true)
                  }}
                />
              </Form.Item>
            </Col>

          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="bill_date"
                label="入库时间"
                rules={[{ required: true, message: '请选择入库时间' }]}>
                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={24}>
              <Form.Item
                label="备注"
                name="remark"
              >
                <Input.TextArea placeholde="请输入备注" autoSize={{ minRows: 2, maxRows: 6 }} />
              </Form.Item>
            </Col>
          </Row>

        </ProCard>
      </Form>


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
                line_id: `NEW_TEMP_ID_${(Math.random() * 1000000).toFixed(0)}`,
                item_name: '',
                quantity: '',
                uom: '',
                amount: '',
                reamrk: '',
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
        <TableForm ref={tableRef} primaryKey='line_id' tableForm={tableForm} />

      </ProCard>
      <SelectOrgDailog
        modalVisible={selectOrgDailogVisible}
        handleOk={(selectOrg) => {
          if (selectOrg) {
            mainForm.setFieldsValue({
              inv_org_id: selectOrg.org_id,
              inv_org_name: selectOrg.org_name
            })
          }
          setSelectOrgDailogVisible(false);
        }}
        handleCancel={() => {
          setSelectOrgDailogVisible(false);
        }}

      />


    </PageContainer>);
};

