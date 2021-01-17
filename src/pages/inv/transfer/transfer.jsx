import React, { useRef, useState, useEffect } from 'react';
import { message, Form, Button, Row, Col, Select, Input, DatePicker, Steps } from 'antd';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProCardCollapse from '@/components/ProCard/ProCardCollapse'
import TableForm from './components/TableForm';
import SelectOrgDialog from '@/components/Org/SelectOrgDialog';
import SelectUserDialog from '@/components/User/SelectUserDialog';
import HttpService from '@/utils/HttpService.jsx';
import { history } from 'umi';
import moment from 'moment';
import { SaveOutlined, PlusOutlined, MinusOutlined, RightOutlined } from '@ant-design/icons';
import 'moment/locale/zh-cn';

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
    const [action, setAction] = useState(props?.match?.params?.action || add);
    const [id, setId] = useState(props?.match?.params?.id || -1);
    const [disabled, setDisabled] = useState(false);
    const [selectStroeFiledName, setSelectStroeFiledName] = useState('');
    const [selectUserFiledName, setSelectUserFiledName] = useState('');

    const [mainData, setMainData] = useState({});

    const save = (params) => {
        HttpService.post('reportServer/invStore/createStore', JSON.stringify(params)).then((res) => {
            if (res.resultCode == '1000') {
                history.push(`/transation/transferOutList`);
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
                    history.push(`/transation/transferOutList`);
                    message.success(res.message);
                } else {
                    message.error(res.message);
                }
            },
        );
    };

    useEffect(() => {

        if (action === 'edit' || action === 'readOnly') {
            //初始化编辑数据
            HttpService.post('reportServer/invStore/getStoreById', JSON.stringify({ bill_id: id })).then(
                (res) => {
                    if (res.resultCode == '1000') {
                        if (action === 'readOnly') {
                            setDisabled(true);
                        } else {

                            setDisabled(res?.data?.mainData?.bill_status === 1);
                        }
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
                        disabled={disabled}
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
                <ProCardCollapse title="基础信息"
                >
                    <Form.Item style={{ display: 'none' }} label="调出仓库id" name="inv_org_id" />
                    <Form.Item style={{ display: 'none' }} label="调入仓库id" name="target_inv_org_id" />
                    <Form.Item style={{ display: 'none' }} label="调出经办人id" name="operator" />
                    <Form.Item style={{ display: 'none' }} label="调入经办人id" name="target_operator" />
                    <Row>
                        <Col xs={24} sm={10}>
                            <Form.Item label="调拨编码"
                                name="bill_id"
                            >
                                <Input disabled placeholde="自动生成" />
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
                            // rules={[{ required: true, message: '请选择调出经办人' }]}
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
                            //  rules={[{ required: true, message: '请选择调入经办人' }]}
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

                {(mainData?.bill_status || 0) != 0 ? (<ProCardCollapse title="流程进度" >
                    <Steps progressDot current={mainData.bill_status} style={{ padding: "0px 80px" }}>
                        <Step title="调拨出库" description={mainData?.operator_name} />
                        <Step title="运输中" description="顺丰" />
                        <Step title="调拨入库" description={mainData?.target_operator_name} />
                    </Steps>

                </ProCardCollapse>) : <></>}


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
                                <Select disabled={disabled}>
                                    <Option value="1">顺丰物流</Option>
                                    <Option value="2">京东物流</Option>
                                    <Option value="3">中通物流</Option>
                                    <Option value="4">圆通物流</Option>
                                    <Option value="5">申通物流</Option>
                                </Select>
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
                <TableForm ref={tableRef} disabled={disabled} primaryKey="line_id" tableForm={tableForm} />
            </ProCardCollapse>
            <SelectOrgDialog
                modalVisible={selectOrgDialogVisible}
                handleOk={(selectOrg) => {
                    if (selectOrg) {
                        mainForm.setFieldsValue({
                            [`${selectStroeFiledName}_id`]: selectOrg.org_id,
                            [`${selectStroeFiledName}_name`]: selectOrg.org_name,
                        });
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
        </PageContainer>
    );
};
export default transfer;