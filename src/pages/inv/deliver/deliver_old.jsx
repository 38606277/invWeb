import React, { useRef, useState, useEffect } from 'react';
import { message, Form, Button, Row, Col, Select, Input, DatePicker } from 'antd';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProCardCollapse from '@/components/ProCard/ProCardCollapse'
import TableForm_A from '@/components/EditFormA/TableForm_A';
import SelectOrgDialog from '@/components/Org/SelectOrgDialog';
import SelectItemDialog from '@/components/itemCategory/SelectItemDialog';
import SelectOnHandDialog from '@/components/OnHand/SelectOnHandDialog';
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


const deliver = (props) => {
    const tableRef = useRef();
    const [tableForm] = Form.useForm();
    const [mainForm] = Form.useForm();
    const [selectOrgDialogVisible, setSelectOrgDialogVisible] = useState(false);
    const [selectItemDialogVisible, setSelectItemDialogVisible] = useState(false);
    const [selectItemRecord, setSelectItemRecord] = useState({});
    const [disabled, setDisabled] = useState(false);

    const [selectOnHandDialogVisible, setSelectOnHandDialogVisible] = useState(false);
    const [selectOrgId, setSelectOrgId] = useState(null);

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
                        disabled: true,
                        onSearch: (name, record) => {
                            // setSelectItemRecord(record)
                            // setSelectItemDialogVisible(true)
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
                    widgetParams: { disabled: true, onChange: calculateAmount }
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
                title: '结存数量',
                dataIndex: 'balance',
                renderType: 'InputNumberEF',
                renderParams: {
                    formItemParams: {
                        rules: [{ required: true, message: '请输入结存数量' }]

                    },
                    widgetParams: { disabled: true, precision: 0 }
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
                    widgetParams: {
                        disabled: disabled,
                        precision: 0,
                        onChange: (value, name, record) => {
                            //数量不能大于结存数量
                            if (record['balance'] < record['quantity']) {
                                message.error('接收数量不能大于结存数量，请检查');
                                const quantity = record['balance'];
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

    }

    const save = (params) => {
        HttpService.post('reportServer/invStore/createStore', JSON.stringify(params)).then((res) => {
            if (res.resultCode == '1000') {
                history.push(`/transation/deliverList`);
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
                    history.push(`/transation/deliverList`);
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
            title="出库单"
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
                        保存出库单
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

                            values.bill_type = 'deliver';

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
                <ProCardCollapse title="基础信息"
                >
                    <Form.Item style={{ display: 'none' }} label="仓库Id" name="inv_org_id" />
                    <Row>
                        <Col xs={24} sm={10}>
                            <Form.Item label="出库编码" name="bill_id">
                                <Input disabled placeholder="自动生成" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={10}>
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
                        <Col xs={24} sm={10}>
                            <Form.Item
                                name="bill_date"
                                label="出库时间"
                                rules={[{ required: true, message: '请选择出库时间' }]}
                            >
                                <DatePicker style={{ width: "100%" }} disabled={disabled} showTime format="YYYY-MM-DD HH:mm:ss" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs={24} sm={20}>
                            <Form.Item {...formItemLayout1} label="备注" name="remark">
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
                            //新增一行
                            // tableRef.current.addItem({
                            //     line_id: `NEW_TEMP_ID_${(Math.random() * 1000000).toFixed(0)}`,
                            //     item_name: '',
                            //     quantity: '',
                            //     uom: '',
                            //     amount: '',
                            //     reamrk: '',
                            // });

                            if (selectOrgId == null) {
                                message.error("请先选择调出仓库")
                            } else {
                                setSelectOnHandDialogVisible(true);
                            }
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
                <TableForm_A ref={tableRef} columns={buildColumns()} primaryKey="line_id" tableForm={tableForm} />
            </ProCardCollapse>
            <SelectOrgDialog
                modalVisible={selectOrgDialogVisible}
                handleOk={(selectOrg) => {
                    if (selectOrg) {
                        mainForm.setFieldsValue({
                            inv_org_id: selectOrg.org_id,
                            inv_org_name: selectOrg.org_name,
                        });
                        setSelectOrgId(selectOrg.org_id);
                    }
                    setSelectOrgDialogVisible(false);
                }}
                handleCancel={() => {
                    setSelectOrgDialogVisible(false);
                }}
            />
            <SelectItemDialog
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
            />
            <SelectOnHandDialog
                orgId={selectOrgId}
                modalVisible={selectOnHandDialogVisible}
                selectType="checkbox"
                handleOk={(result) => {
                    console.log('SelectOnHandDialog', result)

                    const initData = [];
                    for (let i in result) {
                        const line = result[i];
                        initData.push({
                            line_id: `NEW_TEMP_ID_${(Math.random() * 1000000).toFixed(0)}`,
                            item_id: line.item_id,
                            item_description: line.item_description,
                            price: line.price,
                            balance: line.on_hand_quantity,
                            //amount: line.amount
                        })
                    }
                    tableRef?.current?.initData(initData);
                    setSelectOnHandDialogVisible(false);
                }}
                handleCancel={() => {
                    setSelectOnHandDialogVisible(false);
                }}
            />
        </PageContainer>
    );
};
export default deliver;