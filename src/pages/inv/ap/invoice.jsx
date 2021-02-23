import React, { useRef, useState, useEffect } from 'react';
import { message, Form, Button, Row, Col, Select, Input, DatePicker } from 'antd';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import TableForm_A from '@/components/EditFormA/TableForm_A';

import DictSelect from '@/components/Select/DictSelect';
import SelectCustomersDialog from '@/components/Customers/SelectCustomersDialog';
import SelectPoDialog from '@/components/Po/SelectPoDialog';

import ProCardCollapse from '@/components/ProCard/ProCardCollapse';
import HttpService from '@/utils/HttpService.jsx';
import { history } from 'umi';
import moment from 'moment';
import { SaveOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import 'moment/locale/zh-cn';

const { Search } = Input;
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

const invoice = (props) => {
  const tableRef = useRef();
  const [tableForm] = Form.useForm();
  const [mainForm] = Form.useForm();

  const [selectPoDialogVisible, setSelectPoDialogVisible] = useState(false);
  const [selectCustomersDialogVisible, setSelectCustomersDialogVisible] = useState(false);
  const [selectCustomersFiledName, setSelectCustomersFiledName] = useState('');
  const [disabled, setDisabled] = useState(false);

  const action = props?.match?.params?.action || 'add';
  const id = props?.match?.params?.id || -1;

  const buildColumns = () => {
    return [
      {
        title: '订单编号',
        dataIndex: 'po_code',
        renderParams: {
          formItemParams: {
            rules: [{ required: false, message: '请选择物料' }],
          },
          widgetParams: { disabled: true },
        },
      },
      {
        title: '物料',
        dataIndex: 'item_description',
        renderParams: {
          formItemParams: {
            rules: [{ required: true, message: '请选择物料' }],
          },
          widgetParams: {
            disabled: true,
          },
        },
      },
      {
        title: '金额',
        dataIndex: 'invoiced_amount',
        renderType: 'InputNumberEF',
        renderParams: {
          formItemParams: {
            rules: [{ required: true, message: '请输入金额' }],
          },
          widgetParams: { disabled: disabled },
        },
      },
    ];
  };

  const save = (params) => {
    HttpService.post('reportServer/ap/invoice/createInvoice', JSON.stringify(params)).then(
      (res) => {
        if (res.resultCode == '1000') {
          history.push(`/ap/invoiceList`);
          message.success(res.message);
        } else {
          message.error(res.message);
        }
      },
    );
  };

  const update = (params) => {
    HttpService.post('reportServer/ap/invoice/updateInvoiceById', JSON.stringify(params)).then(
      (res) => {
        if (res.resultCode == '1000') {
          history.push(`/ap/invoiceList`);
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
        'reportServer/ap/invoice/getInvoiceById',
        JSON.stringify({ invoice_id: id }),
      ).then((res) => {
        if (res.resultCode == '1000') {
          setDisabled(true);
          mainForm.setFieldsValue({
            ...res.data.mainData,
            invoice_date: moment(res.data.mainData.invoice_date),
          });
          tableRef?.current?.initData(res.data.linesData);
        } else {
          message.error(res.message);
        }
      });
    }
  }, []);

  return (
    <PageContainer
      ghost="true"
      title="发票"
      header={{
        extra: [
          <Button
            key="submit"
            type="danger"
            icon={<SaveOutlined />}
            onClick={() => {
              mainForm?.submit();
            }}
          >
            保存发票
          </Button>,
          <Button
            disabled={disabled}
            key="reset"
            onClick={() => {
              history.goBack();
            }}
          >
            返回
          </Button>,
        ],
      }}
    >
      <Form
        {...formItemLayout2}
        form={mainForm}
        onFinish={async (fieldsValue) => {
          //验证tableForm
          tableForm
            .validateFields()
            .then(() => {
              //验证成功

              let tableData = tableRef.current.getTableData();

              const values = {
                ...fieldsValue,
                invoice_date: fieldsValue['invoice_date'].format('YYYY-MM-DD HH:mm:ss'),
              };

              if (action === 'edit') {
                let deleteRecordKeys = tableRef.current.getDeleteRecordKeys();
                console.log('deleteRecordKeys', deleteRecordKeys);
                //过滤deleteRecord中的临时数据
                let deleteIds = deleteRecordKeys.filter((element) => {
                  return element.toString().indexOf('NEW_TEMP_ID_') < 0;
                });
                update({
                  mainData: values,
                  linesData: tableData,
                  deleteData: deleteIds.toString(), // 删除项
                });
              } else {
                values.payment_status = 0;
                values.amount_paid = 0;
                save({
                  mainData: values,
                  linesData: tableData,
                });
              }
            })
            .catch((errorInfo) => {
              console.log(errorInfo);
              //验证失败
              message.error('提交失败');
            });
        }}
      >
        <ProCardCollapse title="基础信息">
          <Form.Item hidden label="供应商Id" name="vendor_id" />
          <Row>
            <Col xs={24} sm={10}>
              <Form.Item label="发票编码" name="invoice_num">
                <Input placeholder="请输入发票编码" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={10}>
              <Form.Item
                label="发票类型"
                name="invoice_type"
                rules={[{ required: true, message: '请选择订单类型' }]}
              >
                <DictSelect disabled={disabled} dictCode="po_invoice" />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col xs={24} sm={10}>
              <Form.Item
                name="invoice_date"
                label="发票时间"
                rules={[{ required: true, message: '请选择发票时间' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  disabled={disabled}
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={10}>
              <Form.Item
                label="供应商"
                name="vendor_name"
                rules={[{ required: true, message: '请选择供应商' }]}
              >
                <Search
                  disabled={disabled}
                  allowClear
                  readOnly={true}
                  enterButton
                  onClick={() => {
                    setSelectCustomersFiledName('vendor');
                    setSelectCustomersDialogVisible(true);
                  }}
                  onSearch={() => {
                    setSelectCustomersFiledName('vendor');
                    setSelectCustomersDialogVisible(true);
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col xs={24} sm={10}>
              <Form.Item
                label="发票金额"
                name="invoice_amount"
                rules={[{ required: true, message: '请输入发票金额' }]}
              >
                <Input disabled={disabled} placeholder="请输入发票金额" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={10}>
              <Form.Item
                name="amount_paid"
                label="已付金额"
                rules={[{ required: false, message: '付款后自动计算' }]}
              >
                <Input disabled placeholder="付款后自动计算" />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col xs={24} sm={20}>
              <Form.Item {...formItemLayout1} label="备注" name="description">
                {/* <Input disabled={disabled} placeholder="自动生成" /> */}
                <Input.TextArea
                  disabled={disabled}
                  placeholder="请输入备注"
                  autoSize={{ minRows: 2, maxRows: 3 }}
                />
              </Form.Item>
            </Col>
          </Row>
        </ProCardCollapse>
      </Form>

      <ProCardCollapse
        title="行信息"
        extra={[
          <Button
            disabled={disabled}
            icon={<PlusOutlined />}
            size="small"
            onClick={() => {
              setSelectPoDialogVisible(true);
            }}
          ></Button>,
          <Button
            disabled={disabled}
            size="small"
            style={{ marginLeft: '6px' }}
            icon={<MinusOutlined />}
            onClick={() => {
              //删除选中项
              tableRef.current.removeRows();
            }}
          ></Button>,
        ]}
      >
        <TableForm_A ref={tableRef} columns={buildColumns()} primaryKey="line_id" />
      </ProCardCollapse>

      <SelectCustomersDialog
        modalVisible={selectCustomersDialogVisible}
        handleOk={(selectCustomers) => {
          console.log('selectCustomers', selectCustomers);
          if (selectCustomers) {
            mainForm.setFieldsValue({
              [`${selectCustomersFiledName}_id`]: selectCustomers.customer_id,
              [`${selectCustomersFiledName}_name`]: selectCustomers.customer_name,
            });
          }
          setSelectCustomersDialogVisible(false);
        }}
        handleCancel={() => {
          setSelectCustomersDialogVisible(false);
        }}
      />

      <SelectPoDialog
        modalVisible={selectPoDialogVisible}
        handleOk={(mainData, linesData) => {
          console.log('SelectPoDialog', mainData, linesData);
          let tableData = tableRef.current.getTableData();
          let newLinesData = [];

          for (let i = 0; i < linesData.length; i++) {
            const item = linesData[i];

            //检查改行是否存在
            let isAdd = true;

            for (let j = 0; j < tableData.length; j++) {
              const isHeader = mainData.po_header_id == tableData[j]['po_id'];
              const isLine = item['line_id'] == tableData[j]['line_id'];

              console.log(
                ` mainData.po_header_id == tableData[j]['po_id']; ${mainData.po_header_id} == ${tableData[j]['po_id']}`,
              );
              console.log(
                ` linesData[i]['line_id'] == tableData[j]['line_id']; ${linesData[i]['line_id']} == ${tableData[j]['line_id']}`,
              );

              if (isHeader && isLine) {
                isAdd = false;
                break;
              }
            }

            if (isAdd) {
              newLinesData.push({
                line_id: `NEW_TEMP_ID_${(Math.random() * 1000000).toFixed(0)}`,
                po_id: mainData.po_header_id,
                po_code: mainData.header_code,
                po_line_id: item.line_id,
                item_description: item.item_description,
                type: 'item',
              });
            }
          }

          tableRef.current.addItemList(newLinesData);

          setSelectPoDialogVisible(false);
        }}
        handleCancel={() => {
          setSelectPoDialogVisible(false);
        }}
      />
    </PageContainer>
  );
};
export default invoice;
