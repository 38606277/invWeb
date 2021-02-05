import React, { useState, useEffect } from 'react';
import { message, Form, Button, Row, Col, Select, Input, DatePicker } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProCardCollapse from '@/components/ProCard/ProCardCollapse'
import TableForm_A from '@/components/EditFormA/TableForm_A';
import SelectOrgDialog from '@/components/Org/SelectOrgDialog';
import SelectPoDialog from '@/components/Po/SelectPoDialog';
import SelectItemDialog from '@/components/itemCategory/SelectItemDialog';
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

const getTypeName = (type) => {
  if (type == 'other') {
    return '其他入库';
  } else if (type == 'po') {
    return '采购入库';
  }
  return '其他入库';
}

const TableFormList = ({ tableFormDataList, disabled }) => {
  let tableFormList = [];
  for (let index in tableFormDataList) {
    let tableFormData = tableFormDataList[index];

    console.log('TableFormList tableFormData :  ', tableFormData)

    tableFormList.push(<ProCardCollapse
      title={tableFormData.categoryName}
      extra={[
        <Button
          disabled={disabled}
          icon={<PlusOutlined />}
          size="small"
          onClick={() => {
            //新增一行
            tableFormData?.tableRef?.current?.addItem({
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
            tableFormData?.tableRef?.current?.removeRows();
          }}
        ></Button>,
      ]}
    >
      <TableForm_A
        tableParams={
          { scroll: { x: 1300 } }
        }
        ref={tableFormData.tableRef}
        columns={tableFormData.columnList}
        primaryKey="line_id"
        value={tableFormData.dataList}
      />
    </ProCardCollapse>
    );
  }
  return tableFormList;
}


const store = (props) => {
  const [mainForm] = Form.useForm();
  const [selectOrgDialogVisible, setSelectOrgDialogVisible] = useState(false);
  const [selectPoDialogVisible, setSelectPoDialogVisible] = useState(false);
  const [selectItemDialogVisible, setSelectItemDialogVisible] = useState(false);
  const [selectItemRecord, setSelectItemRecord] = useState({});

  const [tableFormDataList, setTableFormDataList] = useState([]);

  const [disabled, setDisabled] = useState(false);

  const type = props?.match?.params?.type || 'other';
  const action = props?.match?.params?.action || 'add';
  const id = props?.match?.params?.id || -1;

  const calculateAmount = (value, name, record) => {
    console.log('calculateAmount', record);
    const amount = record['quantity'] * record['price'];
    let tableFormData = tableFormDataList?.find((item) => {
      console.log('calculateAmount item', item);
      return item.categoryId == record.item_category_id;
    })
    tableFormData?.tableRef?.current?.handleObjChange(
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
    HttpService.post('reportServer/invStore/createStore', JSON.stringify(params)).then((res) => {
      if (res.resultCode == '1000') {
        history.goBack();
        message.success(res.message);
      } else {
        message.error(res.message);
      }
    });
  };

  const update = (params) => {
    HttpService.post('reportServer/invStore/updateStoreById', JSON.stringify(params)).then(
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
      HttpService.post('reportServer/invStore/getStoreById', JSON.stringify({ bill_id: id })).then(
        (res) => {
          if (res.resultCode == '1000') {
            setDisabled(res?.data?.mainData?.bill_status === 1);
            mainForm.setFieldsValue({
              ...res.data.mainData,
              bill_date: moment(res.data.mainData.bill_date),
            });

            //  tableRef?.current?.initData(res.data.linesData);

            //回填行信息
            let linesData = res.data.linesData;
            let newLinesData = [];
            for (let index in linesData) {
              let lines = linesData[index];

              let columnList = [{
                title: '描述',
                dataIndex: 'item_description',
                fixed: 'left',
                width: '200px',
                renderParams: {
                  formItemParams: {
                    rules: [{ required: true, message: '请输入描述' }]
                  },
                  widgetParams: { disabled: true }
                }
              }];
              for (let columnIndex in lines.columnList) {
                let column = lines.columnList[columnIndex];



                columnList.push({
                  ...column,
                  renderParams: {
                    formItemParams: {
                      rules: [{ required: true, message: `请输入${column.title}` }]
                    },
                    widgetParams: { disabled: true }
                  }
                });
              }
              columnList.push(...[
                {
                  title: '单位',
                  dataIndex: 'uom',
                  renderParams: {
                    formItemParams: {
                      rules: [{ required: true, message: '请输入单位' }]
                    },
                    widgetParams: { disabled: true }
                  }
                },
                {
                  title: '单价',
                  dataIndex: 'price',
                  renderType: 'InputNumberEF',
                  fixed: 'right',
                  width: '100px',
                  renderParams: {
                    formItemParams: {
                      rules: [{ required: true, message: '请输入单价' }]
                    },
                    widgetParams: { disabled: disabled, onChange: calculateAmount }
                  }
                },
                {
                  title: '数量',
                  dataIndex: 'quantity',
                  renderType: 'InputNumberEF',
                  fixed: 'right',
                  width: '100px',
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
                  fixed: 'right',
                  width: '100px',
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
                  fixed: 'right',
                  width: '100px',
                  renderParams: {
                    formItemParams: {
                      rules: [{ required: false, message: '请输入备注' }]
                    },
                    widgetParams: { disabled: disabled }
                  }
                }])

              newLinesData.push({
                ...lines,
                columnList,
                tableRef: React.createRef()
              })
            }

            setTableFormDataList(newLinesData)

          } else {
            message.error(res.message);
          }
        },
      );
    }
  }, []);


  return (
    <PageContainer

      ghost="true"
      title={getTypeName(type)}
      header={{
        extra: [
          <Button
            key="submit"
            type="danger"
            icon={<SaveOutlined />}
            onClick={() => {
              setSelectItemDialogVisible(true);
            }}
          >
            添加物料
        </Button>,
          <Button
            disabled={disabled}
            key="submit"
            type="danger"
            icon={<SaveOutlined />}
            onClick={() => {
              mainForm?.submit();
            }}
          >
            {` 保存${getTypeName(type)}单`}
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

          let tableFormPromiseList = [];
          for (let index in tableFormDataList) {
            tableFormPromiseList.push(tableFormDataList[index].tableRef.current.validateFields());
          }
          let promiseAll = Promise.all(tableFormPromiseList);
          promiseAll.then((res) => {
            console.log('promiseAll then', res);

            let tableData = [];
            for (let index in tableFormDataList) {
              tableData.push(...tableFormDataList[index].tableRef.current.getTableData());
            }
            const values = {
              ...fieldsValue,
              bill_date: fieldsValue['bill_date'].format('YYYY-MM-DD HH:mm:ss'),
            };

            values.bill_type = `store_${type}`;

            if (action === 'edit') {
              let deleteRecordKeys = [];
              for (let deleteIndex in tableFormDataList) {
                deleteRecordKeys.push(tableFormDataList[deleteIndex].tableRef.current.getDeleteRecordKeys());
              }
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

              if (type == 'po') {
                values.bill_status = 1;
              } else {
                values.bill_status = 0;
              }

              save({
                mainData: values,
                linesData: tableData,
              });
            }


          }).catch((error) => {
            console.log('promiseAll catch', error)
            message.error('提交失败');
          });

        }}
      >
        <ProCardCollapse
          title="基础信息"
        >
          <Form.Item style={{ display: 'none' }} label="仓库Id" name="inv_org_id" />
          <Row>
            <Col xs={24} sm={11}>
              <Form.Item label="入库编码" name="bill_id">
                <Input disabled placeholde="自动生成" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={11}>
              <Form.Item
                label="仓库名称"
                name="inv_org_name"
                rules={[{ required: true, message: '请输入选择仓库' }]}
              >
                <Search
                  disabled={disabled}
                  placeholder="请选择仓库"
                  allowClear
                  readOnly={true}
                  enterButton
                  onClick={() => {
                    setSelectOrgDialogVisible(true);
                  }}
                  onSearch={() => {
                    setSelectOrgDialogVisible(true);
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col xs={24} sm={11}>
              <Form.Item
                name="bill_date"
                label="入库时间"
                rules={[{ required: true, message: '请选择入库时间' }]}
              >
                <DatePicker style={{ width: "100%" }} disabled={disabled} showTime format="YYYY-MM-DD HH:mm:ss" />
              </Form.Item>
            </Col>



            {type == 'po' ? <Col xs={24} sm={11}>

              <Form.Item hidden label="来源id" name="source_id" />
              <Form.Item hidden label="来源单据" name="source_bill" />
              <Form.Item hidden label="来源系统" name="source_system" />

              <Form.Item
                label="订单编号"
                name="op_code"
                rules={[{ required: true, message: '请选择订单编号' }]}
              >
                <Search
                  disabled={disabled}
                  allowClear
                  readOnly={true}
                  enterButton
                  onClick={() => {
                    setSelectPoDialogVisible(true);
                  }}
                  onSearch={() => {
                    setSelectPoDialogVisible(true);
                  }}
                />
              </Form.Item>
            </Col> : <></>}
          </Row>

          <Row>
            <Col xs={24} sm={22}>
              <Form.Item {...formItemLayout1} label="备注" name="remark">
                {/* <Input disabled={disabled} placeholde="自动生成" /> */}
                <Input.TextArea
                  disabled={disabled}
                  placeholde="请输入备注"
                  autoSize={{ minRows: 2, maxRows: 3 }}
                />
              </Form.Item>
            </Col>
          </Row>
        </ProCardCollapse>
      </Form>
      {tableFormDataList.length < 1 ? "" : <TableFormList tableFormDataList={tableFormDataList} disable={disabled} />}
      <SelectOrgDialog
        modalVisible={selectOrgDialogVisible}
        handleOk={(selectOrg) => {
          if (selectOrg) {
            mainForm.setFieldsValue({
              inv_org_id: selectOrg.org_id,
              inv_org_name: selectOrg.org_name,
            });
          }
          setSelectOrgDialogVisible(false);
        }}
        handleCancel={() => {
          setSelectOrgDialogVisible(false);
        }}
      />



      <SelectPoDialog
        modalVisible={selectPoDialogVisible}
        handleOk={(mainData, linesData) => {
          console.log('SelectPoDialog', mainData, linesData)
          mainForm.setFieldsValue({
            source_id: mainData.po_header_id,
            source_bill: 'po',
            source_system: '0',
            op_code: mainData.header_code
          });

          const initData = [];
          for (let i in linesData) {
            const line = linesData[i];
            initData.push({
              line_id: `NEW_TEMP_ID_${(Math.random() * 1000000).toFixed(0)}`,
              item_id: line.item_id,
              item_description: line.item_description,
              price: line.price,
              not_rcv_quantity: line.not_rcv_quantity
            })
          }
          tableRef?.current?.initData(initData);
          setSelectPoDialogVisible(false);
        }}
        handleCancel={() => {
          setSelectPoDialogVisible(false);
        }}
      />

      {/* <SelectItemDialog
        modalVisible={selectItemDialogVisible}
        //selectType="checkbox"
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
      /> */}

      <SelectItemDialog
        modalVisible={selectItemDialogVisible}
        selectType='checkbox'
        handleOk={(checkRows, checkKeys, columnData, catId, catname) => {

          let tableFormDate = tableFormDataList.find((element) => {
            return element.categoryId == catId;
          })

          if (tableFormDate) {
            let addItemList = [];
            for (let index in checkRows) {
              let row = checkRows[index];
              addItemList.push({
                ...row,
                line_id: `NEW_TEMP_ID_${(Math.random() * 1000000).toFixed(0)}`,
                material_id: row.item_id,
                material_description: row.item_description,
                uom: row.uom
              })
            }


            tableFormDate.tableRef.current.addItemList(addItemList)

          } else {
            let dataList = [];
            for (let index in checkRows) {
              let row = checkRows[index];
              dataList.push({
                ...row,
                line_id: `NEW_TEMP_ID_${(Math.random() * 1000000).toFixed(0)}`,
                material_id: row.item_id,
                material_description: row.item_description,
                uom: row.uom,
              })
            }

            let columnList = [];
            //构建列
            for (let index in columnData) {
              let column = columnData[index];

              columnList.push({
                ...column,
                renderParams: {
                  formItemParams: {
                    rules: [{ required: true, message: `请输入${column.title}` }]
                  },
                  widgetParams: { disabled: true }
                }
              });
            }

            columnList.push(...[
              {
                title: '单位',
                dataIndex: 'uom',
                renderParams: {
                  formItemParams: {
                    rules: [{ required: true, message: '请输入单位' }]
                  },
                  widgetParams: { disabled: true }
                }
              },
              {
                title: '单价',
                dataIndex: 'price',
                renderType: 'InputNumberEF',
                fixed: 'right',
                renderParams: {
                  formItemParams: {
                    rules: [{ required: true, message: '请输入单价' }]
                  },
                  widgetParams: { disabled: disabled, onChange: calculateAmount }
                }
              },
              {
                title: '数量',
                dataIndex: 'quantity',
                renderType: 'InputNumberEF',
                fixed: 'right',
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
                fixed: 'right',
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
                fixed: 'right',
                renderParams: {
                  formItemParams: {
                    rules: [{ required: false, message: '请输入备注' }]
                  },
                  widgetParams: { disabled: disabled }
                }
              }])


            let tableFormData = {
              dataList,
              categoryName: catname,
              categoryId: catId,
              columnList,
              tableRef: React.createRef()
            }
            tableFormDataList.push(tableFormData);
          }
          console.log('tableFormDataList', tableFormDataList)

          setTableFormDataList(tableFormDataList)

          setSelectItemDialogVisible(false);
        }}
        handleCancel={() => {
          setSelectItemDialogVisible(false);
        }}
      />


    </PageContainer>
  );
};
export default store;
