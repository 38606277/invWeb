/**
 * 订单详情 新增、编辑
 */

import React, { useRef, useState, useEffect } from 'react';
import { message, Form, Button, Row, Col, Select, Input, DatePicker } from 'antd';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProCardCollapse from '@/components/ProCard/ProCardCollapse'
import TableForm_A from '@/components/EditFormA/TableForm_A';
import SelectUserDialog from '@/components/User/SelectUserDialog';
import DictSelect from '@/components/Select/DictSelect';
import HttpService from '@/utils/HttpService.jsx';
import { history } from 'umi';
import moment from 'moment';
import { SaveOutlined, PlusOutlined, MinusOutlined, RightOutlined } from '@ant-design/icons';
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
    const [action, setAction] = useState(props?.match?.params?.action || 'add');
    const [id, setId] = useState(props?.match?.params?.id || -1);
    const [disabled, setDisabled] = useState(false);

    const [selectUserDialogVisible, setSelectUserDialogVisible] = useState(false);
    const [selectUserFiledName, setSelectUserFiledName] = useState('');

    //行数据的列
    const columns = [
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
            title: '物料名称',
            dataIndex: 'item_name',
            renderType: 'InputSearchEF',
            renderParams: {
                formItemParams: {
                    rules: [{ required: true, message: '请选择物料' }]
                },
                widgetParams: {
                    onSearch: (name, record) => {
                        console.log('onSearch')
                        tableRef.current.handleObjChange(
                            {
                                item_id: 5,
                                item_name: '衬衫',
                                category_id: 1,
                                category_name: '服装',
                                unit_price: '19.8',
                                uom: '件',
                                quantity: 10,
                                amount: (19.8 * 10)
                            },
                            record);
                    }
                }
            }
        },
        {
            title: '物料类别id',
            dataIndex: 'category_id',
            hide: true,
            renderParams: {
                formItemParams: {
                    rules: [{ required: false, message: '请选择物料' }]
                }
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
        {
            title: '单价',
            dataIndex: 'unit_price',
            renderParams: {
                formItemParams: {
                    rules: [{ required: true, message: '请输入单价' }]
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
            title: '数量',
            dataIndex: 'quantity',
            renderParams: {
                formItemParams: {
                    rules: [{ required: true, message: '请输入数量' }]
                },
                widgetParams: { disabled: true }
            }
        },
        {
            title: '金额',
            dataIndex: 'amount',
            renderParams: {
                formItemParams: {
                    rules: [{ required: true, message: '请输入金额' }]
                },
                widgetParams: { disabled: true }
            }
        },
        {
            title: '物料描述',
            dataIndex: 'item_description',
            renderParams: {
                formItemParams: {
                    rules: [{ required: true, message: '请输入物料描述' }]
                },
            }
        },
        {
            title: '接收状态',
            dataIndex: 'cancel_flag',
            renderType: 'SelectEF',
            renderParams: {
                formItemParams: {
                    rules: [{ required: true, message: '请选择接收状态' }]
                },
                widgetParams: {
                    dictData: [
                        {
                            keyName: '0',
                            valueName: '接收'
                        },
                        {
                            keyName: 1,
                            valueName: '取消',
                        }
                    ],
                    keyName: 'keyName',
                    valueName: 'valueName'
                }
            }
        },
        {
            title: '接收数量',
            dataIndex: 'rcv_quantity',
            renderParams: {
                formItemParams: {
                    rules: [{ required: true, message: '请输入接收数量' }]
                }
            }
        },
        {
            title: '取消原因',
            dataIndex: 'cancel_reason',
            renderParams: {
                formItemParams: {
                    rules: [{ required: true, message: '请输入取消原因' }]
                }
            }
        }
    ]


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
                        保存采购订单
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

                            values.bill_type = 'store';

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
                <ProCardCollapse
                    title="基础信息"
                >
                    <Form.Item style={{ display: 'none' }} label="采购员Id" name="agent_id" />
                    <Form.Item style={{ display: 'none' }} label="供应商Id" name="vendor_id" />

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
                                        mainForm.setFieldsValue({
                                            vendor_id: 1,
                                            vendor_name: '张三羊毛批发厂'
                                        })
                                    }}
                                    onSearch={() => {
                                        mainForm.setFieldsValue({
                                            vendor_id: 1,
                                            vendor_name: '张三羊毛批发厂'
                                        })
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={24} sm={11}>
                            <Form.Item label="收单地点" name="bill_to_location"
                                rules={[{ required: true, message: '请输入收单地点' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={11}>
                            <Form.Item
                                label="收货地点"
                                name="ship_to_location"
                                rules={[{ required: true, message: '请输入收货地点' }]}
                            >
                                <Input />
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
                                <Input />
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
                                item_name: '',
                                quantity: '',
                                uom: '',
                                amount: '',
                                reamrk: '',
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
                <TableForm_A ref={tableRef} disabled={disabled} columns={columns} primaryKey="line_id" tableForm={tableForm} />
            </ProCardCollapse>
            <SelectUserDialog
                modalVisible={selectUserDialogVisible}
                handleOk={(selectUser) => {
                    console.log('SelectUserDialog', selectUser)
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
        </PageContainer>
    );
};
export default po;