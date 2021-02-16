import React, { useState, useEffect, useRef } from 'react';
import { message, Form, Button, Row, Col, Select, Input, DatePicker } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProCardCollapse from '@/components/ProCard/ProCardCollapse'
import TableFormList_A from '@/components/EditFormA/TableFormList_A';
import SelectItemDialog from '@/components/itemCategory/SelectItemDialog';
import SelectItemCategoryDialog from '@/components/itemCategory/SelectItemCategoryDialog';
import SelectUserDialog from '@/components/User/SelectUserDialog';
import SelectCustomersDialog from '@/components/Customers/SelectCustomersDialog';
import DictSelect from '@/components/Select/DictSelect';

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




const po = (props) => {
    const tableFormListRef = useRef();
    const [mainForm] = Form.useForm();

    const [selectItemDialogVisible, setSelectItemDialogVisible] = useState(false);
    const [categoryId, setCategoryId] = useState('-1')
    const [selectItemCategoryDialogVisible, setSelectItemCategoryDialogVisible] = useState(false);
    const [disabled, setDisabled] = useState(false);

    const [selectUserDialogVisible, setSelectUserDialogVisible] = useState(false);
    const [selectUserFiledName, setSelectUserFiledName] = useState('');
    const [selectCustomersDialogVisible, setSelectCustomersDialogVisible] = useState(false);
    const [selectCustomersFiledName, setSelectCustomersFiledName] = useState('');

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
            {
                title: '物料类别',
                dataIndex: 'category_name',
                renderParams: {
                    formItemParams: {
                        rules: [{ required: true, message: '请选择物料' }]
                    },
                    widgetParams: { disabled: disabled }
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
    }

    const buildActionButtonList = () => {

        const btnList = [
            <Button
                disabled={disabled}
                key="submit"
                type="danger"
                icon={<SaveOutlined />}
                onClick={() => {
                    setSelectItemCategoryDialogVisible(true);
                }}
            >
                添加类别
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
                保存采购订单
            </Button>,
            <Button
                key="reset"
                onClick={() => {
                    history.goBack();
                }}
            >
                返回
  </Button>];

        return btnList;
    }

    const save = (params) => {
        HttpService.post('reportServer/po/createPo', JSON.stringify(params)).then((res) => {
            if (res.resultCode == '1000') {
                history.goBack();
                message.success(res.message);
            } else {
                message.error(res.message);
            }
        });
    };

    const update = (params) => {
        HttpService.post('reportServer/po/updatePoById', JSON.stringify(params)).then(
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
            HttpService.post('reportServer/po/getPoById', JSON.stringify({ po_header_id: id })).then(
                (res) => {
                    if (res.resultCode == '1000') {
                        setDisabled(res?.data?.mainData?.status == '1');
                        mainForm.setFieldsValue({
                            ...res.data.mainData,
                            po_date: moment(res.data.mainData.po_date),
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
            title="采购订单"
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
                            po_date: fieldsValue['po_date'].format('YYYY-MM-DD HH:mm:ss'),
                        };

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


                            update({
                                mainData: values,
                                linesData: tableData,
                                deleteData: deleteIds.toString(), // 删除项
                            });
                        } else {

                            values.status = 1;

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
                    <Form.Item hidden label="采购员Id" name="agent_id" />
                    <Form.Item hidden label="供应商Id" name="vendor_id" />

                    <Row>
                        <Col xs={24} sm={11}>
                            <Form.Item label="订单编号" name="header_code">
                                <Input disabled placeholde="自动生成" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={11}>
                            <Form.Item
                                label="订单类型"
                                name="po_type"
                                rules={[{ required: true, message: '请选择订单类型' }]}
                            >
                                <DictSelect disabled={disabled} dictCode="order_po" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs={24} sm={11}>
                            <Form.Item label="采购员" name="agent_name"
                                rules={[{ required: true, message: '请选择采购员' }]}>
                                <Search
                                    disabled={disabled}
                                    allowClear
                                    readOnly={true}
                                    enterButton
                                    onClick={() => {
                                        setSelectUserFiledName('agent')
                                        setSelectUserDialogVisible(true);
                                    }}
                                    onSearch={() => {
                                        setSelectUserFiledName('agent')
                                        setSelectUserDialogVisible(true);
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={11}>
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
                                        setSelectCustomersFiledName('vendor')
                                        setSelectCustomersDialogVisible(true);
                                    }}
                                    onSearch={() => {
                                        setSelectCustomersFiledName('vendor')
                                        setSelectCustomersDialogVisible(true);
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={24} sm={11}>
                            <Form.Item label="收单地点"
                                name="bill_to_location"
                                rules={[{ required: true, message: '请输入收单地点' }]}>
                                <Input disabled={disabled} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={11}>
                            <Form.Item
                                label="收货地点"
                                name="ship_to_location"

                                rules={[{ required: true, message: '请输入收货地点' }]}
                            >
                                <Input disabled={disabled} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={24} sm={11}>
                            <Form.Item label="合同编号" name="contract_code"
                                rules={[{ required: true, message: '请选择合同编号' }]}>
                                <Search
                                    disabled={disabled}
                                    allowClear
                                    readOnly={true}
                                    enterButton
                                    onClick={() => {
                                        mainForm.setFieldsValue({
                                            contract_code: 'HT_0000001',
                                            contract_name: '羊毛采购合同'
                                        })
                                    }}
                                    onSearch={() => {
                                        mainForm.setFieldsValue({
                                            contract_code: 'HT_0000001',
                                            contract_name: '羊毛采购合同'
                                        })
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={11}>
                            <Form.Item
                                label="合同名称"
                                name="contract_name"
                                rules={[{ required: true, message: '请选择输入合同名称' }]}
                            >
                                <Input disabled={true} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs={24} sm={11}>
                            <Form.Item label="合同文件" name="contract_file">
                                <Input disabled={disabled} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs={24} sm={11}>
                            <Form.Item
                                name="po_date"
                                label="生效日期"
                                rules={[{ required: true, message: '请选择生效日期' }]}
                            >
                                <DatePicker style={{ width: "100%" }} disabled={disabled} showTime format="YYYY-MM-DD HH:mm:ss" />
                            </Form.Item>
                        </Col>

                    </Row>

                    <Row>
                        <Col xs={24} sm={22}>
                            <Form.Item {...formItemLayout1} label="业务描述" name="comments">
                                {/* <Input disabled={disabled} placeholde="自动生成" /> */}
                                <Input.TextArea
                                    disabled={disabled}
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
                                line_type_id: 0,
                                category_id: catId,
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


            <SelectUserDialog
                modalVisible={selectUserDialogVisible}
                handleOk={(selectUser) => {
                    if (selectUser) {
                        mainForm.setFieldsValue({
                            [`${selectUserFiledName}_id`]: selectUser.id,
                            [`${selectUserFiledName}_name`]: selectUser.userName,
                        });
                    }
                    setSelectUserDialogVisible(false);
                }}
                handleCancel={() => {
                    setSelectUserDialogVisible(false);
                }}
            />
            <SelectCustomersDialog
                modalVisible={selectCustomersDialogVisible}
                handleOk={(selectCustomers) => {
                    console.log('selectCustomers', selectCustomers)
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

        </PageContainer>
    );
};
export default po;
