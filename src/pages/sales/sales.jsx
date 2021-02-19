import React, { useRef, useState, useEffect } from 'react';
import { message, Form, Button, Row, Col, Select, Input, DatePicker } from 'antd';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProCardCollapse from '@/components/ProCard/ProCardCollapse'
import TableForm_B from '@/components/EditFormA/TableForm_B';
import SelectItemOrgDialog from '@/components/itemCategory/SelectItemOrgDialog';
import HttpService from '@/utils/HttpService.jsx';
import { history } from 'umi';
import moment from 'moment';
import { SaveOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import 'moment/locale/zh-cn';
import LocalStorge from '@/utils/LogcalStorge';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;
const localStorge = new LocalStorge();

const formItemLayout2 = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const formItemLayout1 = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

const getTypeName = (type) => {
  if (type === 'other') {
    return 'POS销售';
  } else if (type == 'po') {
    return '采购入库';
  }
  return '销售单';
}


export default (props) => {
  const tableRef = useRef();
  const [tableForm] = Form.useForm();
  const [mainForm] = Form.useForm();
  const [selectOrgDialogVisible, setSelectOrgDialogVisible] = useState(false);
  const [selectPoDialogVisible, setSelectPoDialogVisible] = useState(false);
  const [selectItemDialogVisible, setSelectItemDialogVisible] = useState(false);
  const [selectItemRecord, setSelectItemRecord] = useState({});
  const [orgid, setOrgid] = useState();

  const [disabled, setDisabled] = useState(false);

  const type = props?.match?.params?.type || 'other';
  const action = props?.match?.params?.action || 'add';
  const id = props?.match?.params?.id || -1;

  const calculateAmount = (value, name, record) => {
    const amount = record['quantity'] * record['price'];
    tableRef.current.handleObjChange(
      {
        amount: amount
      },
      record);
  }

  const buildColumns = () => {
    if (type == 'other') {//其他入库
      return [
        {
          title: '物料id',
          dataIndex: 'item_id',
          hide: true,
          renderParams: {
            formItemParams: {
              rules: [{ required: false, message: '请选择物料' }]
            },
            widgetParams: { disabled: true }
          }
        },
        {
          title: '物料描述',
          dataIndex: 'item_description',
          renderType: 'InputSearchEF',
          renderParams: {
            formItemParams: {
              rules: [{ required: true, message: '请选择物料' }]
            },
            widgetParams: {
              disabled: disabled,
              onSearch: (name, record) => {
                setSelectItemRecord(record)
                setSelectItemDialogVisible(true)
              }
            }
          }
        },
        {
          title: '单价',
          dataIndex: 'price',
          renderType: 'InputNumberEF',
          renderParams: {
            formItemParams: {
              rules: [{ required: true, message: '请输入单价' }]
            },
            widgetParams: { disabled: disabled, onChange: calculateAmount }
          }
        },
        {
          title: '单位',
          dataIndex: 'uom',
          renderParams: {
            formItemParams: {
              rules: [{ required: true, message: '请输入单位' }]
            },
            widgetParams: { disabled: disabled }
          }
        },
        {
          title: '数量',
          dataIndex: 'quantity',
          renderType: 'InputNumberEF',
          renderParams: {
            formItemParams: {
              rules: [{ required: true, message: '请输入数量' }]

            },
            widgetParams: { disabled: disabled, precision: 0, onChange: calculateAmount }
          }
        },
        {
          title: '金额',
          dataIndex: 'amount',
          renderType: 'InputNumberEF',
          renderParams: {
            formItemParams: {
              rules: [{ required: true, message: '请输入金额' }]
            },
            widgetParams: {
              disabled: true
            }
          }
        },
        {
          title: '备注',
          dataIndex: 'remark',
          renderParams: {
            formItemParams: {
              rules: [{ required: false, message: '请输入备注' }]
            },
            widgetParams: { disabled: disabled }
          }
        }
      ]

    } else if (type == 'po') {//订单入库

      return [
        {
          title: '物料id',
          dataIndex: 'item_id',
          hide: true,
          renderParams: {
            formItemParams: {
              rules: [{ required: false, message: '请选择物料' }]
            },
            widgetParams: { disabled: true }
          }
        },
        {
          title: '物料描述',
          dataIndex: 'item_description',
          renderType: 'InputSearchEF',
          renderParams: {
            formItemParams: {
              rules: [{ required: true, message: '请选择物料' }]
            },
            widgetParams: {
              disabled: disabled,
              onSearch: (name, record) => {
                setSelectItemRecord(record)
                setSelectItemDialogVisible(true)
              }
            }
          }
        },
        {
          title: '单价',
          dataIndex: 'price',
          renderType: 'InputNumberEF',
          renderParams: {
            formItemParams: {
              rules: [{ required: true, message: '请输入单价' }]
            },
            widgetParams: {
              disabled: disabled,
              onChange: (value, name, record, tableRef) => {
                const amount = record['quantity'] * record['price'];
                tableRef.current.handleObjChange(
                  {
                    amount: amount
                  },
                  record);
              }
            }
          }
        },
        {
          title: '单位',
          dataIndex: 'uom',
          renderParams: {
            formItemParams: {
              rules: [{ required: true, message: '请输入单位' }]
            },
            widgetParams: { disabled: disabled }
          }
        },
        {
          title: '未接收数量',
          dataIndex: 'not_rcv_quantity',
          renderType: 'InputNumberEF',
          renderParams: {
            formItemParams: {
              rules: [{ required: true, message: '请输入数量' }]
            },
            widgetParams: { disabled: disabled, precision: 0, }
          }
        },
        {
          title: '接收数量',
          dataIndex: 'quantity',
          renderType: 'InputNumberEF',
          renderParams: {
            formItemParams: {
              rules: [{ required: true, message: '请输入接收数量' }]
            },
            widgetParams: {
              disabled: disabled,
              precision: 0,
              onChange: (value, name, record, tableRef) => {
                //数量不能大于结存数量
                if (record['not_rcv_quantity'] < record['quantity']) {
                  message.error('接收数量不能大于未接收数量，请检查');
                  const quantity = record['not_rcv_quantity'];
                  const amount = quantity * record['price'];
                  tableRef.current.handleObjChange(
                    {
                      quantity: quantity,
                      amount: amount
                    },
                    record);
                } else {
                  const amount = record['quantity'] * record['price'];
                  tableRef.current.handleObjChange(
                    {
                      amount: amount
                    },
                    record);
                }
              }
            }

          }
        }, {
          title: '金额',
          dataIndex: 'amount',
          renderType: 'InputNumberEF',
          renderParams: {
            formItemParams: {
              rules: [{ required: true, message: '请输入金额' }]
            },
            widgetParams: { disabled: true }
          }
        }, {
          title: '备注',
          dataIndex: 'remark',
          renderParams: {
            formItemParams: {
              rules: [{ required: false, message: '请输入备注' }]
            },
            widgetParams: { disabled: disabled }
          }
        }
      ]

    }

    return [];
  }



  const save = (params) => {
    HttpService.post('reportServer/wholeSale/createStore', JSON.stringify(params)).then((res) => {
      if (res.resultCode == '1000') {
        history.goBack();
        message.success(res.message);
      } else {
        message.error(res.message);
      }
    });
  };

  const update = (params) => {
    HttpService.post('reportServer/wholeSale/updateStoreById', JSON.stringify(params)).then(
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
    let userInfo = localStorge.getStorage('userInfo');
    if (action === 'edit') {
      //初始化编辑数据
      HttpService.post('reportServer/wholeSale/getStoreById', JSON.stringify({ bill_id: id })).then(
        (res) => {
          if (res.resultCode == '1000') {
            setDisabled(res?.data?.mainData?.bill_status === 1);
            setOrgid(res.data.mainData.inv_org_id)
            mainForm.setFieldsValue({
              ...res.data.mainData,
              bill_date: moment(res.data.mainData.bill_date),
            });
            if(res.data.linesData.length>0){
              tableRef?.current?.initData(res.data.linesData[0].dataList);
            }
            
          } else {
            message.error(res.message);
          }
        },
      );
    } else {
      //初始化编辑数据
      HttpService.post('reportServer/invOrgUser/getOrgListByUserId', JSON.stringify({ user_id: userInfo.id })).then(
        (res) => {
          if (res.resultCode == '1000') {
            setOrgid(res.data[0].org_id)
            mainForm.setFieldsValue({
              inv_org_name: res.data[0].org_name,
              inv_org_id: res.data[0].org_id,
            });

          } else {
            message.error(res.message);
          }
        },
      );
      mainForm.setFieldsValue({
        bill_date: moment(new Date()),
      });
    }
  }, []);


  return (
    <PageContainer
      ghost="true"
      title={'批发销售'}
      header={{
        extra: [
          <Button
            disabled={disabled}
            key="submit"
            type="danger"
            icon={<SaveOutlined />}
            onClick={() => {
              mainForm?.submit();
            }}
          >
            {` 保存批发销售单`}
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
                bill_date: fieldsValue['bill_date'].format('YYYY-MM-DD HH:mm:ss'),
              };

              values.bill_type = `deliver_wholesales`;

              if (action === 'edit') {
                let deleteRecordKeys = tableRef.current.getDeleteRecordKeys();
                console.log('deleteRecordKeys', deleteRecordKeys);
                //过滤deleteRecord中的临时数据
                let deleteIds = deleteRecordKeys.filter((element) => {
                  return element.toString().indexOf('NEW_TEMP_ID_') < 0;
                });
                values.bill_status = 1;
                update({
                  mainData: values,
                  linesData: tableData,
                  deleteData: deleteIds.toString(), // 删除项
                });
              } else {
                values.bill_status = 0;
               
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
        <ProCardCollapse
          title="基础信息"
        >
          <Form.Item style={{ display: 'none' }} name="inv_org_id" />
          <Form.Item style={{ display: 'none' }} name="bill_id" />
          <Row>
            <Col xs={24} sm={11}>
              <Form.Item label="销售编码" name="bill_code">
                <Input disabled placeholder="自动生成" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={11}>
              <Form.Item
                label="仓库名称"
                name="inv_org_name"
                rules={[{ required: true, message: '请输入选择仓库' }]}
              >
                <Input id="inv_org_name" disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col xs={24} sm={11}>
              <Form.Item
                name="bill_date"
                label="销售时间"
                rules={[{ required: true, message: '请选择销售时间' }]}
              >
                <DatePicker style={{ width: "100%" }} showTime format="YYYY-MM-DD HH:mm:ss" disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col xs={24} sm={22}>
              <Form.Item {...formItemLayout1} label="备注" name="remark">
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
              //新增一行
              tableRef.current.addItem({
                line_id: `NEW_TEMP_ID_${(Math.random() * 1000000).toFixed(0)}`
              });
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
          ></Button>
        ]}
      >
        <TableForm_B ref={tableRef} columns={buildColumns()} primaryKey="line_id" tableForm={tableForm} />
      </ProCardCollapse>

      <SelectItemOrgDialog
        modalVisible={selectItemDialogVisible}
        //selectType="checkbox"
        orgid={orgid}
        handleOk={(result) => {
          console.log('SelectItemDialog', result)
          tableRef.current.handleObjChange(
            result,
            selectItemRecord);
          setSelectItemDialogVisible(false);
        }}
        handleCancel={() => {
          setSelectItemDialogVisible(false);
        }}
      />


    </PageContainer>
  );
};
