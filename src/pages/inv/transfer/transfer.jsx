import React, { useRef, useState, useEffect } from 'react';
import { message, Form, Button, Row, Col, Select, Input, DatePicker, Steps } from 'antd';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProCardCollapse from '@/components/ProCard/ProCardCollapse'
import TableForm_A from '@/components/EditFormA/TableForm_A';
import SelectOrgDialog from '@/components/Org/SelectOrgDialog';
import SelectUserDialog from '@/components/User/SelectUserDialog';
import SelectOnHandDialog from '@/components/OnHand/SelectOnHandDialog';
import DictSelect from '@/components/Select/DictSelect';
import HttpService from '@/utils/HttpService.jsx';
import { history } from 'umi';
import moment from 'moment';
import { SaveOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import 'moment/locale/zh-cn';

import LocalStorge from '@/utils/LogcalStorge.jsx';
const localStorge = new LocalStorge();

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Step } = Steps;

const formItemLayout2 = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};
const formItemLayout1 = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
};

const transfer = (props) => {
    const tableRef = useRef();
    const [tableForm] = Form.useForm();
    const [mainForm] = Form.useForm();
    const [selectOrgDialogVisible, setSelectOrgDialogVisible] = useState(false);
    const [selectUserDialogVisible, setSelectUserDialogVisible] = useState(false);

    const [selectOnHandDialogVisible, setSelectOnHandDialogVisible] = useState(false);
    const [selectOrgId, setSelectOrgId] = useState(null);

    const [disabled, setDisabled] = useState(false);

    const [selectStroeFiledName, setSelectStroeFiledName] = useState('');
    const [selectUserFiledName, setSelectUserFiledName] = useState('');

    const [mainData, setMainData] = useState({});

    const type = props?.match?.params?.type || 'out';
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
                        disabled: true
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
                    widgetParams: { onChange: calculateAmount }
                }
            },

            {
                title: '结存数量',
                dataIndex: 'on_hand_quantity',
                renderType: 'InputNumberEF',
                renderParams: {
                    formItemParams: {
                        rules: [{ required: true, message: '请输入结存数量' }]

                    },
                    widgetParams: { disabled: true, precision: 0 }
                }
            },
            {
                title: '调拨数量',
                dataIndex: 'quantity',
                renderType: 'InputNumberEF',
                renderParams: {
                    formItemParams: {
                        rules: [{ required: true, message: '请输入调拨数量' }]
                    },
                    widgetParams: {
                        disabled: disabled,
                        precision: 0,
                        onChange: (value, name, record) => {
                            //数量不能大于结存数量
                            if (record['on_hand_quantity'] < record['quantity']) {
                                message.error('接收数量不能大于结存数量，请检查');
                                const quantity = record['on_hand_quantity'];
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
            setDisabled(true)
            //初始化编辑数据
            HttpService.post('reportServer/invStore/getStoreByIdOld', JSON.stringify({ bill_id: id })).then(
                (res) => {
                    if (res.resultCode == '1000') {
                        let mainD = {
                            ...res.data.mainData,
                            bill_date: moment(res.data.mainData.bill_date)
                        }
                        mainForm.setFieldsValue(mainD);
                        tableRef?.current?.initData(res.data.linesData);
                        setMainData(mainD);
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
            title="调拨单"
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
                        保存调拨单
                </Button>,
                    <Button

                        key="reset"
                        onClick={() => {
                            history.goBack();
                        }}
                    >
                        返回
          </Button>
                ],
            }}
        >

            <Form
                {...formItemLayout2}
                form={mainForm}
                initialValues={{ ship_method: "1" }}
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

                            values.bill_type = 'transfer';

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

                {(mainData?.bill_status || 0) != 0 ? (<ProCardCollapse title="流程进度" >
                    <Steps progressDot current={mainData.bill_status} style={{ padding: "0px 80px" }}>
                        <Step title="调拨出库" description={mainData?.operator_name} />
                        <Step title="运输中" description="顺丰" />
                        <Step title="调拨入库" description={mainData?.target_operator_name} />
                    </Steps>

                </ProCardCollapse>) : <></>}

                <ProCardCollapse title="基础信息"
                >
                    <Form.Item style={{ display: 'none' }} label="调出仓库id" name="inv_org_id" />
                    <Form.Item style={{ display: 'none' }} label="调入仓库id" name="target_inv_org_id" />
                    <Form.Item style={{ display: 'none' }} label="调出经办人id" name="operator" />
                    <Form.Item style={{ display: 'none' }} label="调入经办人id" name="target_operator" />
                    <Row>
                        <Col xs={24} sm={10}>
                            <Form.Item label="调拨编码"
                                name="bill_code"
                            >
                                <Input disabled placeholder="自动生成" />
                            </Form.Item>
                        </Col>

                    </Row>

                    <Row>

                        <Col xs={24} sm={10}>
                            <Form.Item
                                label="调出仓库"
                                name="inv_org_name"
                                rules={[{ required: true, message: '请选择调出仓库' }]}
                            >
                                <Search
                                    disabled={disabled}
                                    placeholder="请选择调出仓库"
                                    allowClear
                                    readOnly={true}
                                    enterButton
                                    onClick={() => {
                                        setSelectStroeFiledName('inv_org')
                                        setSelectOrgDialogVisible(true);
                                    }}
                                    onSearch={() => {
                                        setSelectStroeFiledName('inv_org')
                                        setSelectOrgDialogVisible(true);
                                    }}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={10}>
                            <Form.Item
                                label="调入仓库"
                                name="target_inv_org_name"
                                rules={[{ required: true, message: '请选择调入仓库' }]}
                            >
                                <Search
                                    disabled={disabled}
                                    placeholder="请选择调入仓库"
                                    allowClear
                                    readOnly={true}
                                    enterButton
                                    onClick={() => {
                                        setSelectStroeFiledName('target_inv_org')
                                        setSelectOrgDialogVisible(true);
                                    }}
                                    onSearch={() => {
                                        setSelectStroeFiledName('target_inv_org')
                                        setSelectOrgDialogVisible(true);
                                    }}
                                />
                            </Form.Item>
                        </Col>

                    </Row>



                    <Row>

                        <Col xs={24} sm={10}>
                            <Form.Item
                                label="调出经办人"
                                name="operator_name"
                                rules={[{ required: true, message: '请选择调出经办人' }]}
                            >
                                <Search
                                    disabled={disabled}
                                    placeholder="请选择调出经办人"
                                    allowClear
                                    readOnly={true}
                                    enterButton
                                    onClick={() => {
                                        setSelectUserFiledName('operator')
                                        setSelectUserDialogVisible(true);
                                    }}
                                    onSearch={() => {
                                        setSelectUserFiledName('operator')
                                        setSelectUserDialogVisible(true);
                                    }}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={10}>
                            <Form.Item
                                label="调入经办人"
                                name="target_operator_name"
                                rules={[{ required: true, message: '请选择调入经办人' }]}
                            >
                                <Search
                                    disabled={disabled}
                                    placeholder="请选择调入经办人"
                                    allowClear
                                    readOnly={true}
                                    enterButton
                                    onClick={() => {
                                        setSelectUserFiledName('target_operator')
                                        setSelectUserDialogVisible(true);
                                    }}
                                    onSearch={() => {
                                        setSelectUserFiledName('target_operator')
                                        setSelectUserDialogVisible(true);
                                    }}
                                />
                            </Form.Item>
                        </Col>

                    </Row>

                    <Row>

                        <Col xs={24} sm={10}>
                            <Form.Item

                                label="调出日期"
                                name="bill_date"
                                rules={[{ required: true, message: '请选择调出日期' }]}
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

                <ProCardCollapse title="物流信息" >

                    <Row>
                        <Col xs={24} sm={10}>
                            <Form.Item label="运输方式"
                                name="ship_method"

                            >
                                <Select disabled={disabled} onChange={(value) => {
                                }}>
                                    <Option value="1">自主运输</Option>
                                    <Option value="2">第三方运输</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row >
                        <Col xs={24} sm={10}>
                            <Form.Item
                                label="物流厂商"
                                name="ship_corp"
                            >

                                <DictSelect disabled={disabled} dictCode="ship_corp" />

                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={10} >
                            <Form.Item label="物流单号"
                                name="ship_number"
                            >
                                <Input disabled={disabled} />
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
                            [`${selectStroeFiledName}_id`]: selectOrg.org_id,
                            [`${selectStroeFiledName}_name`]: selectOrg.org_name,
                        });

                        if (selectStroeFiledName == 'inv_org') {
                            setSelectOrgId(selectOrg.org_id);
                        }
                    }
                    setSelectOrgDialogVisible(false);
                }}
                handleCancel={() => {
                    setSelectOrgDialogVisible(false);
                }}
            />

            <SelectUserDialog
                modalVisible={selectUserDialogVisible}
                handleOk={(selectUser) => {
                    console.log('SelectUserDialog', selectUser)
                    if (selectUser) {
                        mainForm.setFieldsValue({
                            [`${selectUserFiledName}`]: selectUser.id,
                            [`${selectUserFiledName}_name`]: selectUser.userName,
                        });
                    }
                    setSelectUserDialogVisible(false);
                }}
                handleCancel={() => {
                    setSelectUserDialogVisible(false);
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
                            on_hand_quantity: line.on_hand_quantity,
                            uom: line.uom
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
export default transfer;