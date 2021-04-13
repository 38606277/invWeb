/**
 * 订单详情 新增、编辑
 */
import React, { useRef, useState, useEffect } from 'react';
import { message, Form, Button, Row, Col, Select, Input, DatePicker } from 'antd';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProCardCollapse from '@/components/ProCard/ProCardCollapse'
import TableForm_A from '@/components/EditFormA/TableForm_A';
import SelectUserDialog from '@/components/User/SelectUserDialog';
import SelectCustomersDialog from '@/components/Customers/SelectCustomersDialog';
import SelectItemDialog from '@/components/itemCategory/SelectItemDialog';
import DictSelect from '@/components/Select/DictSelect';
import HttpService from '@/utils/HttpService.jsx';
import { history } from 'umi';
import moment from 'moment';
import { SaveOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import 'moment/locale/zh-cn';

import SelectItemCategoryDialog from '@/components/itemCategory/SelectItemCategoryDialog';

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
    const tableRef = useRef();
    const [tableForm] = Form.useForm();
    const [mainForm] = Form.useForm();
    const [disabled, setDisabled] = useState(false);

    const [selectUserDialogVisible, setSelectUserDialogVisible] = useState(false);
    const [selectUserFiledName, setSelectUserFiledName] = useState('');
    const [selectCustomersDialogVisible, setSelectCustomersDialogVisible] = useState(false);
    const [selectCustomersFiledName, setSelectCustomersFiledName] = useState('');

    const [categoryId, setCategoryId] = useState('-1')
    const [selectItemCategoryDialogVisible, setSelectItemCategoryDialogVisible] = useState(false);
    const [selectItemDialogVisible, setSelectItemDialogVisible] = useState(false);

    const [columnList, setColumnList] = useState([]);

    const action = props?.match?.params?.action || 'add';
    const id = props?.match?.params?.id || -1;


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
    }

    const calculateAmount = (value, name, record) => {
        const amount = record['quantity'] * record['price'];
        tableRef.current?.handleObjChange(
            {
                amount: amount
            },
            record);
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
                        setDisabled(res?.data?.mainData?.status != 0);
                        mainForm.setFieldsValue({
                            ...res.data.mainData,
                            po_date: moment(res.data.mainData.po_date),
                            po_date_end: moment(res.data.mainData.po_date_end),
                        });

                        const columnList = [];
                        //构建列
                        for (let index in res.data.linesData[0].columnList) {
                            let column = res.data.linesData[0].columnList[index];
                            columnList.push({
                                title: column.segment_name,
                                dataIndex: column.segment,
                                renderParams: {
                                    widgetParams: { disabled: true }
                                }
                            });
                        }

                        setColumnList(columnList);

                        tableRef?.current?.initData(res.data.linesData[0].dataList);

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
                        保存
                 </Button>,
                    //     <Button
                    //         disabled={disabled}
                    //         key="submit"
                    //         type="danger"
                    //         icon={<SaveOutlined />}
                    //         onClick={() => {
                    //             mainForm?.submit();
                    //         }}
                    //     >
                    //         提交
                    // </Button>,
                    <Button
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
                                po_date: fieldsValue['po_date'].format('YYYY-MM-DD HH:mm:ss'),
                                po_date_end: fieldsValue['po_date_end'].format('YYYY-MM-DD HH:mm:ss')
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
                                values.status = 0;
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
                    <Form.Item hidden label="订单Id" name="po_header_id" />
                    <Form.Item hidden label="采购员Id" name="agent_id" />
                    <Form.Item hidden label="供应商Id" name="vendor_id" />
                    <Form.Item hidden label="类别Id" name="category_id" />

                    <Row>
                        <Col xs={24} sm={11}>
                            <Form.Item label="订单编号" name="header_code">
                                <Input disabled placeholder="自动生成" />
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
                            <Form.Item
                                name="po_date"
                                label="开始日期"
                                rules={[{ required: true, message: '请选择开始日期' }]}
                            >
                                <DatePicker style={{ width: "100%" }} disabled={disabled} showTime format="YYYY-MM-DD HH:mm:ss" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={11}>
                            <Form.Item
                                name="po_date_end"
                                label="结束日期"
                                rules={[{ required: true, message: '请选择结束日期' }]}
                            >
                                <DatePicker style={{ width: "100%" }} disabled={disabled} showTime format="YYYY-MM-DD HH:mm:ss" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row>

                        <Col xs={24} sm={11}>
                            <Form.Item label="类别" name="category_name"
                                rules={[{ required: true, message: '请选择类别' }]}>
                                <Search
                                    disabled={disabled}
                                    allowClear
                                    readOnly={true}
                                    enterButton
                                    onClick={() => {
                                        setSelectItemCategoryDialogVisible(true);
                                    }}
                                    onSearch={() => {
                                        setSelectItemCategoryDialogVisible(true);
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs={24} sm={22}>
                            <Form.Item {...formItemLayout1} label="业务描述" name="comments">
                                {/* <Input disabled={disabled} placeholder="自动生成" /> */}
                                <Input.TextArea
                                    disabled={disabled}
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
                            // tableRef.current.addItem({
                            //     line_id: `NEW_TEMP_ID_${(Math.random() * 1000000).toFixed(0)}`,
                            //     cancel_flag: 0
                            // });

                            setSelectItemDialogVisible(true)


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
                <TableForm_A ref={tableRef} disabled={disabled} columns={buildColumns(columnList)} primaryKey="line_id" tableForm={tableForm} />
            </ProCardCollapse>
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

            <SelectItemCategoryDialog
                modalVisible={selectItemCategoryDialogVisible}
                handleOk={(checkRows, checkKeys) => {
                    console.log('SelectItemCategoryDialog', checkRows, checkKeys)
                    if (checkRows.category_id == -1) {
                        message.warning('根节点无法作为类别')
                        return;
                    }

                    mainForm.setFieldsValue({
                        'category_id': checkRows.category_id,
                        'category_name': checkRows.category_name,
                    });

                    setCategoryId(checkRows.category_id);
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

                    setColumnList(columnList);

                    setSelectItemCategoryDialogVisible(false);
                }}
                handleCancel={() => {
                    setSelectItemCategoryDialogVisible(false);
                }}
            />



            <       SelectItemDialog
                categoryId={categoryId}
                modalVisible={selectItemDialogVisible}
                selectType='checkbox'
                handleOk={(checkRows, checkKeys, columnData, catId, catname) => {

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
                    tableRef.current.addItemList(addItemList)


                    setSelectItemDialogVisible(false);
                }}
                handleCancel={() => {
                    setSelectItemDialogVisible(false);
                }}
            />

        </PageContainer>
    );
};
export default po;