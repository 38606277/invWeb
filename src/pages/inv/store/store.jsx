import React, { useState, useEffect, useRef } from 'react';
import { message, Form, Button, Row, Col, Select, Input, DatePicker } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProCardCollapse from '@/components/ProCard/ProCardCollapse'
import TableFormList_A from '@/components/EditFormA/TableFormList_A';
import SelectOrgDialog from '@/components/Org/SelectOrgDialog';
import SelectPoDialog from '@/components/Po/SelectPoDialog';
import SelectPdDialog from '@/components/Pd/SelectPdDialog';
import SelectItemDialog from '@/components/itemCategory/SelectItemDialog';
import SelectItemCategoryDialog from '@/components/itemCategory/SelectItemCategoryDialog';

import HttpService from '@/utils/HttpService.jsx';
import { history } from 'umi';
import moment from 'moment';
import { SaveOutlined } from '@ant-design/icons';
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
  } else if (type == 'pd') {
    return '生产入库';
  }
  return '其他入库';
}



const store = (props) => {
  const tableFormListRef = useRef();
  const [mainForm] = Form.useForm();
  const [selectOrgDialogVisible, setSelectOrgDialogVisible] = useState(false);
  const [selectPoDialogVisible, setSelectPoDialogVisible] = useState(false);

  const [selectPdDialogVisible, setSelectPdDialogVisible] = useState(false);

  const [selectItemDialogVisible, setSelectItemDialogVisible] = useState(false);
  const [categoryId, setCategoryId] = useState('-1')
  const [selectItemCategoryDialogVisible, setSelectItemCategoryDialogVisible] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const type = props?.match?.params?.type || 'other';
  const action = props?.match?.params?.action || 'add';
  const id = props?.match?.params?.id || -1;


  const calculateAmount = (value, name, record) => {
    const amount = record['quantity'] * record['price'];
    let tableFormData = tableFormListRef?.current?.getTableFormDataList()?.find((item) => {
      return item.parimaryId == record.item_category_id;
    })

    tableFormData?.tableRef?.current?.handleObjChange(
      {
        amount: amount
      },
      record);
  }





  /**
   *   //构建列 
   * @param {*} dynamicList 动态列表
   */
  const buildColumns = (dynamicList) => {


    if (type == 'other') {//其他入库
      return [
        {
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
        },
        ...dynamicList, // 动态展示列
        {
          title: '单位',
          dataIndex: 'uom',
          width: '100px',
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
        }
      ]

    } else if (type == 'po') {//采购订单入库
      return [
        {
          title: '物料描述',
          dataIndex: 'item_description',
          renderType: 'InputSearchEF',
          fixed: 'left',
          width: '200px',
          renderParams: {
            formItemParams: {
              rules: [{ required: true, message: '请选择物料' }]
            },
            widgetParams: {
              disabled: disabled,
              onSearch: (name, record) => {
                // setSelectItemRecord(record)
                // setSelectItemDialogVisible(true)
              }
            }
          }
        },
        ...dynamicList, // 动态展示列
        {
          title: '单位',
          dataIndex: 'uom',
          width: '100px',
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
            widgetParams: {
              disabled: disabled,
              onChange: (value, name, record) => {
                let tableFormData = tableFormListRef?.current?.getTableFormDataList()?.find((item) => {
                  return item.parimaryId == record.item_category_id;
                })
                const tableRef = tableFormData?.tableRef;
                const amount = record['quantity'] * record['price'];
                tableRef?.current?.handleObjChange(
                  {
                    amount: amount
                  },
                  record);
              }
            }
          }
        },
        {
          title: '未接收数量',
          dataIndex: 'not_rcv_quantity',
          renderType: 'InputNumberEF',
          width: '100px',
          fixed: 'right',
          renderParams: {
            formItemParams: {
              rules: [{ required: true, message: '请输入数量' }]
            },
            widgetParams: { disabled: true, precision: 0, }
          }
        },
        {
          title: '接收数量',
          dataIndex: 'quantity',
          renderType: 'InputNumberEF',
          width: '100px',
          fixed: 'right',
          renderParams: {
            formItemParams: {
              rules: [{ required: true, message: '请输入接收数量' }]
            },
            widgetParams: {
              disabled: disabled,
              precision: 0,
              onChange: (value, name, record) => {
                let tableFormData = tableFormListRef?.current?.getTableFormDataList()?.find((item) => {
                  return item.parimaryId == record.item_category_id;
                })
                const tableRef = tableFormData?.tableRef;
                //数量不能大于结存数量
                if (record['not_rcv_quantity'] < record['quantity']) {
                  message.error('接收数量不能大于未接收数量，请检查');
                  const quantity = record['not_rcv_quantity'];
                  const amount = quantity * record['price'];

                  tableRef?.current?.handleObjChange(
                    {
                      quantity: quantity,
                      amount: amount
                    },
                    record);
                } else {
                  const amount = record['quantity'] * record['price'];
                  tableRef?.current?.handleObjChange(
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
          width: '100px',
          fixed: 'right',
          renderParams: {
            formItemParams: {
              rules: [{ required: true, message: '请输入金额' }]
            },
            widgetParams: { disabled: true }
          }
        }, {
          title: '备注',
          dataIndex: 'remark',
          width: '100px',
          fixed: 'right',
          renderParams: {
            formItemParams: {
              rules: [{ required: false, message: '请输入备注' }]
            },
            widgetParams: { disabled: disabled }
          }
        }
      ]
    } else if (type == 'pd') {//生产订单入库

      return [
        {
          title: '物料描述',
          dataIndex: 'item_description',
          renderType: 'InputSearchEF',
          fixed: 'left',
          width: '200px',
          renderParams: {
            formItemParams: {
              rules: [{ required: true, message: '请选择物料' }]
            },
            widgetParams: {
              disabled: disabled,
              onSearch: (name, record) => {
              }
            }
          }
        },
        ...dynamicList, // 动态展示列
        {
          title: '单位',
          dataIndex: 'uom',
          width: '100px',
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
          width: '100px',
          fixed: 'right',
          renderParams: {
            formItemParams: {
              rules: [{ required: true, message: '请输入单价' }]
            },
            widgetParams: {
              disabled: disabled,
              onChange: (value, name, record) => {
                let tableFormData = tableFormListRef?.current?.getTableFormDataList()?.find((item) => {
                  return item.parimaryId == record.item_category_id;
                })
                const tableRef = tableFormData?.tableRef;
                const amount = record['quantity'] * record['price'];
                tableRef?.current?.handleObjChange(
                  {
                    amount: amount
                  },
                  record);
              }
            }
          }
        },

        {
          title: '未接收数量',
          dataIndex: 'not_rcv_quantity',
          renderType: 'InputNumberEF',
          width: '100px',
          fixed: 'right',
          renderParams: {
            formItemParams: {
              rules: [{ required: true, message: '请输入数量' }]
            },
            widgetParams: { disabled: true, precision: 0, }
          }
        },
        {
          title: '接收数量',
          dataIndex: 'quantity',
          renderType: 'InputNumberEF',
          width: '100px',
          fixed: 'right',
          renderParams: {
            formItemParams: {
              rules: [{ required: true, message: '请输入接收数量' }]
            },
            widgetParams: {
              disabled: disabled,
              precision: 0,
              onChange: (value, name, record) => {
                const tableFormData = tableFormListRef?.current?.getTableFormDataList()?.find((item) => {
                  return item.parimaryId == record.item_category_id;
                })

                const tableRef = tableFormData?.tableRef;

                console.log('接收数量', value, name, record)

                //数量不能大于结存数量
                if (record['not_rcv_quantity'] < record['quantity']) {
                  message.error('接收数量不能大于未接收数量，请检查');
                  const quantity = record['not_rcv_quantity'];
                  const amount = quantity * record['price'];

                  tableRef?.current?.handleObjChange(
                    {
                      quantity: quantity,
                      amount: amount
                    },
                    record);
                } else {
                  const amount = record['quantity'] * record['price'];
                  tableRef?.current?.handleObjChange(
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
          width: '100px',
          fixed: 'right',
          renderParams: {
            formItemParams: {
              rules: [{ required: true, message: '请输入金额' }]
            },
            widgetParams: { disabled: true }
          }
        }
      ]
    }
    return [];
  }

  const buildActionButtonList = () => {

    const btnList = [
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
        key="reset"
        onClick={() => {
          history.goBack();
        }}
      >
        返回
  </Button>];

    if (type == 'other') {
      btnList.splice(0, 0, <Button
        disabled={disabled}
        key="submit"
        type="danger"
        icon={<SaveOutlined />}
        onClick={() => {
          setSelectItemCategoryDialogVisible(true);
        }}
      >
        添加类别
        </Button>)
    }
    return btnList;
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


            //回填行信息
            let linesData = res.data.linesData;
            let newLinesData = [];
            for (let index in linesData) {
              let lines = linesData[index];

              let columnList = [];
              for (let columnIndex in lines.columnList) {
                let column = lines.columnList[columnIndex];

                columnList.push({
                  ...column,
                  renderParams: {
                    widgetParams: { disabled: true }
                  }
                });
              }
              newLinesData.push({
                ...lines,
                title: lines.categoryName,
                parimaryId: lines.categoryId,
                columnList: buildColumns(columnList),
                tableRef: React.createRef()
              })
            }
            tableFormListRef?.current?.setTableFormDataList(newLinesData);
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
        extra: buildActionButtonList()
      }}
    >
      <Form
        {...formItemLayout2}
        form={mainForm}
        onFinish={async (fieldsValue) => {
          const tableFormDataList = tableFormListRef?.current?.getTableFormDataList();
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
                deleteRecordKeys.push(...tableFormDataList[deleteIndex].tableRef.current.getDeleteRecordKeys());
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

              if (type == 'po' || type == 'pd') {
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


            {type == 'po' || type == 'pd' ? <Col xs={24} sm={11}>

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
                    if (type == 'po') {
                      setSelectPoDialogVisible(true);
                    } else {
                      setSelectPdDialogVisible(true);
                    }

                  }}
                  onSearch={() => {
                    if (type == 'po') {
                      setSelectPoDialogVisible(true);
                    } else {
                      setSelectPdDialogVisible(true);
                    }
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
      <TableFormList_A
        ref={tableFormListRef}
        //tableFormDataList={tableFormDataList}
        disabled={disabled}
        primaryKey="line_id"
        onAddClick={(tableFormData) => {

          if (type == 'other') {
            setCategoryId(tableFormData.parimaryId);
            setSelectItemDialogVisible(true)
          } else {
            setSelectPoDialogVisible(true);
          }
        }}
      />
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


          HttpService.post('reportServer/po/getPoLinesColumnById', JSON.stringify({
            po_header_id: mainData.po_header_id
          }))
            .then((res) => {
              //获取这个订单的所有动态列

              //构建数据
              //按照 item_category_id 数据分类
              console.log('getPoLinesColumnById ', res)

              const dataListObj = linesData.reduce(function (acc, obj) {
                console.log('acc start ', obj);
                const key = obj['category_id'];
                if (!acc[key]) {
                  acc[key] = [];
                }

                const newObj = {
                  ...obj,
                  quantity: null,
                  amount: null,
                  line_id: `NEW_TEMP_ID_${(Math.random() * 1000000).toFixed(0)}`
                };

                acc[key].push(newObj);
                console.log('acc[key] ', acc[key]);
                return acc;
              }, {});

              console.log('dataListObj', dataListObj)

              const newLinesData = [];
              Object.keys(dataListObj).forEach((item) => {
                const dataList = dataListObj[item]; //数据

                const columnOjb = res.data.find((columnItem) => {
                  return columnItem.categoryId == item;
                })


                let columnList = [];
                for (let columnIndex in columnOjb.columnList) {
                  let column = columnOjb.columnList[columnIndex];

                  columnList.push({
                    ...column,
                    renderParams: {
                      widgetParams: { disabled: true }
                    }
                  });
                }
                console.log('columnList', columnList)

                newLinesData.push({
                  dataList,
                  title: columnOjb.categoryName,
                  parimaryId: item,
                  columnList: buildColumns(columnList),
                  tableRef: React.createRef()
                })

              })


              tableFormListRef?.current?.setTableFormDataList(newLinesData);

              console.log('newLinesData', newLinesData);

              setSelectPoDialogVisible(false);
            }).catch(() => {
              setSelectPoDialogVisible(false);
            });



        }}
        handleCancel={() => {
          setSelectPoDialogVisible(false);
        }}
      />


      <SelectPdDialog
        modalVisible={selectPdDialogVisible}
        item_type='0'
        handleOk={(mainData, linesData) => {
          console.log('SelectPdDialog', mainData, linesData)
          mainForm.setFieldsValue({
            source_id: mainData.pd_header_id,
            source_bill: 'pd',
            source_system: '0',
            op_code: mainData.pd_header_code
          });


          HttpService.post('reportServer/pd/getPdLinesColumnById', JSON.stringify({
            pd_header_id: mainData.pd_header_id
          }))
            .then((res) => {
              //获取这个订单的所有动态列

              //构建数据
              //按照 item_category_id 数据分类

              const dataListObj = linesData.reduce(function (acc, obj) {
                console.log('acc start ', obj);
                const key = obj['item_category_id'];
                if (!acc[key]) {
                  acc[key] = [];
                }

                const newObj = {
                  ...obj,
                  quantity: null,
                  amount: null,
                  line_id: `NEW_TEMP_ID_${(Math.random() * 1000000).toFixed(0)}`
                };

                acc[key].push(newObj);
                console.log('acc[key] ', acc[key]);
                return acc;
              }, {});

              console.log('dataListObj', dataListObj)

              const newLinesData = [];
              Object.keys(dataListObj).forEach((item) => {
                const dataList = dataListObj[item]; //数据

                const columnOjb = res.data.find((columnItem) => {
                  return columnItem.categoryId == item;
                })


                console.log('columnOjb', columnOjb)

                let columnList = [];
                for (let columnIndex in columnOjb.columnList) {
                  let column = columnOjb.columnList[columnIndex];

                  columnList.push({
                    ...column,
                    renderParams: {
                      widgetParams: { disabled: true }
                    }
                  });
                }
                console.log('columnList', columnList)

                newLinesData.push({
                  dataList,
                  title: columnOjb.categoryName,
                  parimaryId: item,
                  columnList: buildColumns(columnList),
                  tableRef: React.createRef()
                })

              })


              tableFormListRef?.current?.setTableFormDataList(newLinesData);

              console.log('newLinesData', newLinesData);

              setSelectPdDialogVisible(false);
            }).catch(() => {
              setSelectPdDialogVisible(false);
            });



        }}
        handleCancel={() => {
          setSelectPdDialogVisible(false);
        }}
      />



      <SelectItemDialog
        categoryId={categoryId}
        modalVisible={selectItemDialogVisible}
        selectType='checkbox'
        handleOk={(checkRows, checkKeys, columnData, catId, catname) => {
          const tableFormDataList = tableFormListRef?.current?.getTableFormDataList();
          let tableFormDate = tableFormDataList.find((element) => {
            return element.parimaryId == catId;
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
            tableFormDate?.tableRef?.current?.addItemList(addItemList)
          }
          tableFormListRef?.current?.setTableFormDataList(tableFormDataList);

          setSelectItemDialogVisible(false);
        }}
        handleCancel={() => {
          setSelectItemDialogVisible(false);
        }}
      />

      <SelectItemCategoryDialog
        modalVisible={selectItemCategoryDialogVisible}
        handleOk={(checkRows, checkKeys) => {
          console.log('SelectItemCategoryDialog', checkRows, checkKeys)
          if (checkRows.category_id == -1) {
            message.warning('根节点无法作为类别')
            return;
          }

          const tableFormDataList = tableFormListRef?.current?.getTableFormDataList();
          //添加类别
          let tableFormDate = tableFormDataList.find((element) => {
            return element.parimaryId == checkRows.category_id;
          })

          if (tableFormDate) {
            message.warning('类别已存在，请勿重复添加')
          } else {
            const columnList = [];
            //构建列
            for (let index in checkRows.segmentlist) {
              let column = checkRows.segmentlist[index];
              columnList.push({
                title: column.segment_name,
                dataIndex: column.segment,
                renderParams: {
                  widgetParams: { disabled: true }
                }
              });
            }

            let tableFormData = {
              dataList: [],
              title: checkRows.category_name,
              parimaryId: checkRows.category_id,
              columnList: buildColumns(columnList),
              tableRef: React.createRef()
            }
            tableFormDataList.push(tableFormData);
          }
          tableFormListRef?.current?.setTableFormDataList(tableFormDataList);
          setSelectItemCategoryDialogVisible(false);
        }}
        handleCancel={() => {
          setSelectItemCategoryDialogVisible(false);
        }}
      />



    </PageContainer>
  );
};
export default store;
