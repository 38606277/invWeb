/**
 * 生产订单
 */
import React, { useRef, useState, useEffect } from 'react';
import { message, Form, Button, Row, Col, Select, Input, DatePicker, Tabs } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import TableForm_A from '@/components/EditFormA/TableForm_A';
import SelectItemDialog from '@/components/itemCategory/SelectItemDialog';
import SelectCustomersDialog from '@/components/Customers/SelectCustomersDialog';
import SelectBomDialog from '@/components/Bom/SelectBomDialog';
import ProCardCollapse from '@/components/ProCard/ProCardCollapse'
import HttpService from '@/utils/HttpService.jsx';
import { history } from 'umi';
import { SaveOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
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


const count = (props) => {
    const tableRef = useRef();
    const [tableForm] = Form.useForm();

    const materialTableRef = useRef();
    const [materialTableForm] = Form.useForm();

    const [mainForm] = Form.useForm();


    const [selectItemDialogVisible, setSelectItemDialogVisible] = useState(false);
    const [selectItemRecord, setSelectItemRecord] = useState({});

    const [selectCustomersDialogVisible, setSelectCustomersDialogVisible] = useState(false);
    const [selectCustomersFiledName, setSelectCustomersFiledName] = useState('');

    const [selectBomDialogVisible, setSelectBomDialogVisible] = useState(false);

    const [disabled, setDisabled] = useState(false);

    const action = props?.match?.params?.action || 'add';
    const id = props?.match?.params?.id || -1;

    const calculateAmount = (value, name, record) => {
        const amount = record['price'] * record['quantity'];
        tableRef.current.handleObjChange(
            {
                amount: amount
            },
            record);
    }

    const buildColumns = () => {
        return [
            {
                title: '产品名称',
                dataIndex: 'item_description',
                renderType: 'InputSearchEF',
                width: '20%',
                renderParams: {
                    formItemParams: {
                        rules: [{ required: true, message: '请选择产品' }]
                    },
                    widgetParams: {
                        onSearch: (name, record) => {
                            setSelectItemRecord(record)
                            setSelectBomDialogVisible(true)
                        }
                    }
                }
            },
            {
                title: '产品id',
                dataIndex: 'item_id',
                hide: true,
                renderParams: {
                    formItemParams: {
                        rules: [{ required: false, message: '请选择产品' }]
                    },
                    widgetParams: { disabled: true }
                }
            },
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
                        rules: [{ required: true, message: '请输入合计成本' }]
                    },
                    widgetParams: { disabled: true, }
                }
            }
        ]

    }


    const materialBuildColumns = () => {
        return [
            {
                title: '原料名称',
                dataIndex: 'material_description',
                renderType: 'InputSearchEF',
                width: '20%',
                renderParams: {
                    formItemParams: {
                        rules: [{ required: true, message: '请选择产品' }]
                    },
                    widgetParams: {
                        onSearch: (name, record) => {
                            setSelectItemRecord(record)
                            setSelectBomDialogVisible(true)
                        }
                    }
                }
            },
            {
                title: '原料id',
                dataIndex: 'material_id',
                hide: true,
                renderParams: {
                    formItemParams: {
                        rules: [{ required: false, message: '请选择产品' }]
                    },
                    widgetParams: { disabled: true }
                }
            },
            {
                title: '单位',
                dataIndex: 'unit_cost',
                renderParams: {
                    formItemParams: {
                        rules: [{ required: true, message: '请输入单位' }]
                    },
                    widgetParams: { disabled: true }
                }
            },
            {
                title: '单位成本',
                dataIndex: 'unit_cost',
                renderParams: {
                    formItemParams: {
                        rules: [{ required: true, message: '请输入单位' }]
                    },
                    widgetParams: { disabled: true }
                }
            },

            {
                title: '损耗率',
                dataIndex: 'lose_rate',
                renderType: 'InputNumberEF',
                renderParams: {
                    formItemParams: {
                        rules: [{ required: true, message: '请输入损耗率' }]
                    },
                    widgetParams: {
                        disabled: disabled
                    },
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
                        rules: [{ required: true, message: '请输入合计成本' }]
                    },
                    widgetParams: { disabled: true, }
                }
            }
        ]

    }


    const save = (params) => {
        HttpService.post('reportServer/pd/createPd', JSON.stringify(params)).then((res) => {
            if (res.resultCode == '1000') {
                history.push(`/order/pdList`);
                message.success(res.message);
            } else {
                message.error(res.message);
            }
        });
    };

    const update = (params) => {
        HttpService.post('reportServer/pd/updatePdById', JSON.stringify(params)).then(
            (res) => {
                if (res.resultCode == '1000') {
                    history.push(`/order/pdList`);
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
            HttpService.post('reportServer/pd/getPdById', JSON.stringify({ pd_header_id: id })).then(
                (res) => {
                    if (res.resultCode == '1000') {
                        setDisabled(true);
                        mainForm.setFieldsValue({
                            ...res.data.mainData,
                        });
                        tableRef?.current?.initData(res.data.linesData);
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
            title="生产订单"
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
                        保存生产订单
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
                <ProCardCollapse title="基础信息"
                >
                    <Form.Item style={{ display: 'none' }} label="产品id" name="item_id" />
                    <Form.Item hidden label="制作商Id" name="manufactory_id" />
                    <Row>
                        <Col xs={24} sm={10}>
                            <Form.Item
                                name="pd_header_name"
                                label="订单名称"
                                rules={[{ required: true, message: '请输入产品名称' }]}
                            >
                                <Input disabled={disabled} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={11}>
                            <Form.Item
                                label="制作商"
                                name="manufactory_name"
                                rules={[{ required: true, message: '请选择供应商' }]}
                            >
                                <Search
                                    disabled={disabled}
                                    allowClear
                                    readOnly={true}
                                    enterButton
                                    onClick={() => {
                                        setSelectCustomersFiledName('manufactory')
                                        setSelectCustomersDialogVisible(true);
                                    }}
                                    onSearch={() => {
                                        setSelectCustomersFiledName('manufactory')
                                        setSelectCustomersDialogVisible(true);
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={24} sm={20}>
                            <Form.Item {...formItemLayout1} label="备注" name="remark">
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
                                line_id: `NEW_TEMP_ID_${(Math.random() * 1000000).toFixed(0)}`,
                                material_pid: -1
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
                    ></Button>,
                ]}
            >

                <Tabs defaultActiveKey="1" onChange={(key) => {
                    console.log(key);
                }}>
                    <TabPane tab="产品" key="product">
                        <TableForm_A ref={tableRef} columns={buildColumns()} primaryKey="line_id" tableForm={tableForm} />
                    </TabPane>
                    <TabPane tab="原料" key="material">
                        <TableForm_A ref={materialTableRef} columns={materialBuildColumns()} primaryKey="line_id" tableForm={materialTableForm} />
                    </TabPane>

                </Tabs>


            </ProCardCollapse>
            <SelectItemDialog
                modalVisible={selectItemDialogVisible}
                handleOk={(result) => {
                    console.log('SelectItemDialog : ', result)
                    tableRef.current.handleObjChange(
                        {
                            item_id: result.item_id,
                            item_description: result.item_description,
                            uom: result.uom
                        },
                        selectItemRecord);
                    setSelectItemDialogVisible(false);
                }}
                handleCancel={() => {
                    setSelectItemDialogVisible(false);
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
            <SelectBomDialog
                modalVisible={selectBomDialogVisible}
                handleOk={(selectBom) => {
                    console.log('SelectBomDialog', selectBom)

                    HttpService.post('reportServer/bomLines/getBomLinesLeafByItemId', JSON.stringify({
                        item_id: selectBom.item_id
                    }))
                        .then((res) => {
                            if (res.resultCode == '1000') {

                                tableRef?.current?.handleObjChange(
                                    {
                                        item_id: selectBom.item_id,
                                        item_description: selectBom.bom_name,
                                        uom: selectBom.uom,
                                        materialList: res.data
                                    },
                                    selectItemRecord);

                                materialTableRef?.current?.addItemList(res.data)
                                console.log('SelectBomDialog materialTableRef', materialTableRef)
                                setSelectBomDialogVisible(false);
                            } else {
                                message.error(res.message);
                                setSelectBomDialogVisible(false);
                            }
                        });
                }}
                handleCancel={() => {
                    setSelectBomDialogVisible(false);
                }}
            />



        </PageContainer>
    );
};
export default count;