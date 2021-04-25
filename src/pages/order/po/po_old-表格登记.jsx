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
import DictSelect from '@/components/Select/DictSelect';
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

const po = (props) => {
    const tableRef = useRef();
    const [tableForm] = Form.useForm();
    const [mainForm] = Form.useForm();
    const [disabled, setDisabled] = useState(false);

    const [selectUserDialogVisible, setSelectUserDialogVisible] = useState(false);
    const [selectUserFiledName, setSelectUserFiledName] = useState('');
    const [selectCustomersDialogVisible, setSelectCustomersDialogVisible] = useState(false);
    const [selectCustomersFiledName, setSelectCustomersFiledName] = useState('');

    const [columnList, setColumnList] = useState([]);
    const [typeList, setTypeList] = useState([]);

    const [itemCategoryId, setItemCategoryId] = useState('');

    const [skuList, setSkuList] = useState([]);

    const action = props?.match?.params?.action || 'add';
    const id = props?.match?.params?.id || -1;

    /**
     *   //构建列 
     * @param {*} dynamicList 动态列表
     */
    const buildColumns = (dynamicList) => {

        return [
            {
                title: '货号',
                dataIndex: 'sku',
                renderType: 'SearchSelectEF',
                fixed: 'left',
                width: '160px',
                renderParams: {
                    formItemParams: {
                        rules: [{ required: true }]
                    },
                    widgetParams: {
                        keyName: 'sku',
                        valueName: 'sku',
                        disabled: disabled,
                        onHandleSearch: (searchValue, callBack) => {
                            HttpService.post('reportServer/item/getColumnListBySKU',
                                JSON.stringify({
                                    segment: 'segment5',
                                    item_category_id: itemCategoryId,
                                    sku: searchValue
                                }))
                                .then(res => {
                                    if (res.resultCode == "1000") {
                                        setSkuList(res.data)
                                        callBack(res.data)
                                    } else {
                                        callBack([])
                                    }
                                })
                        },
                        onChange: (value, name, record) => {
                            const findResult = skuList.find((item) => {
                                return item.sku == value;
                            })

                            tableRef.current?.handleObjChange(
                                findResult,
                                record);
                        }
                    }
                }
            },
            ...dynamicList, // 动态展示列
            // {
            //     title: '单位',
            //     dataIndex: 'uom',
            //     width: '100px',
            //     fixed: 'right',
            //     renderParams: {
            //         formItemParams: {
            //             rules: [{ required: true, message: '请输入单位' }]
            //         },
            //         widgetParams: { disabled: true }
            //     }
            // },
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
        HttpService.post('reportServer/po/createPoNew', JSON.stringify(params)).then((res) => {
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

    const handleChange = (value) => {
        //setItemCategoryUnit();
        setItemCategoryId(value);
        getItemCategoryById(value, 'segment5')
    }


    const getItemCategoryById = (category_id, segment) => {
        //获取合并列
        let params = {
            "category_id": category_id,
            "segment": segment
        }

        HttpService.post('reportServer/itemCategory/getItemCategoryById2', JSON.stringify(params))
            .then(res => {
                if (res.resultCode == "1000") {
                    const resultlist = res.data;
                    console.log('resultlist', resultlist)

                    const newColumnList = [];
                    resultlist.forEach((item) => {
                        if (item?.children) {
                            item?.children.forEach((childrenItem) => {
                                newColumnList.push({ ...childrenItem, renderType: 'InputNumberEF' });
                            })
                        } else {
                            newColumnList.push({
                                ...item,
                                renderParams: {
                                    widgetParams: {
                                        disabled: true
                                    }
                                }
                            })
                        }
                    })
                    setColumnList(newColumnList);
                } else {
                    message.error(res.message);
                }
            })
    }



    useEffect(() => {
        HttpService.post('/reportServer/itemCategory/getItemCategoryByPid', JSON.stringify({ category_pid: '-1' })).then(
            (res) => {
                if (res.resultCode == '1000') {
                    setTypeList(res.data)
                } else {
                    message.error(res.message);
                }
            },
        );

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

                        const newColumnList = [];
                        //构建列
                        for (let index in res.data.linesData[0].columnList) {
                            let column = res.data.linesData[0].columnList[index];
                            newColumnList.push({
                                title: column.segment_name,
                                dataIndex: column.segment,
                                renderParams: {
                                    widgetParams: { disabled: true }
                                }
                            });
                        }

                        setColumnList(newColumnList);

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
                                <Select onChange={handleChange}>
                                    {typeList.map((item) => {
                                        return <Option value={item.category_id}>{item.category_name}</Option>
                                    })}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs={24} sm={22}>
                            <Form.Item {...formItemLayout1} label="业务描述" name="comments">
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
                        disabled={disabled || itemCategoryId == ''}
                        icon={<PlusOutlined />}
                        size="small"
                        onClick={() => {
                            //新增一行
                            tableRef.current.addItem({
                                line_id: `NEW_TEMP_ID_${(Math.random() * 1000000).toFixed(0)}`,
                                line_type_id: '0'
                            });
                        }}
                    ></Button>,
                    <Button
                        disabled={disabled || itemCategoryId == ''}
                        size="small"
                        style={{ marginLeft: '6px' }}
                        icon={<MinusOutlined />}
                        onClick={() => {
                            //删除选中项
                            tableRef?.current?.removeRows();
                        }}
                    ></Button>
                ]}
            >
                <TableForm_A
                    tableParams={
                        { scroll: { x: 1700 } }
                    }
                    ref={tableRef}
                    disabled={disabled}
                    columns={buildColumns(columnList)}
                    primaryKey="line_id"
                    tableForm={tableForm} />

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

        </PageContainer>
    );
};
export default po;