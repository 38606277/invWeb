import React, { useRef, useState, useEffect } from 'react';
import { message, Form, Button, Row, Col, Select, Input, DatePicker } from 'antd';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import TableForm from './components/TableForm';
import SelectOrgDialog from '@/components/Org/SelectOrgDialog';
import SelectUserDialog from '@/components/User/SelectUserDialog';

import ProCardCollapse from '@/components/ProCard/ProCardCollapse'

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

const count = (props) => {
    const tableRef = useRef();
    const [tableForm] = Form.useForm();
    const [mainForm] = Form.useForm();
    const [selectOrgDialogVisible, setSelectOrgDialogVisible] = useState(false);
    const [selectUserDialogVisible, setSelectUserDialogVisible] = useState(false);
    const [action, setAction] = useState(props?.match?.params?.action || add);
    const [id, setId] = useState(props?.match?.params?.id || -1);
    const [disabled, setDisabled] = useState(false);

    const save = (params) => {
        HttpService.post('reportServer/invStore/createStore', JSON.stringify(params)).then((res) => {
            if (res.resultCode == '1000') {
                history.push(`/transation/countList`);
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
                    history.push(`/transation/countList`);
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
                        setDisabled(true);
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
            title="盘点单"
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
                        保存盘点单
          </Button>,
                    <Button
                        disabled={disabled}
                        key="reset"
                        onClick={() => {
                            mainForm?.resetFields();
                            tableForm?.resetFields();
                        }}
                    >
                        重置
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

                            values.bill_type = 'count';

                            if (action === 'edit') {
                                let deleteRecordKeys = tableRef.current.getDeleteRecordKeys();
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
                    <Form.Item style={{ display: 'none' }} label="盘查仓库Id" name="inv_org_id" />
                    <Form.Item style={{ display: 'none' }} label="盘查人id" name="operator" />
                    <Row>
                        <Col xs={24} sm={10}>
                            <Form.Item label="盘点编码" name="bill_id">
                                <Input disabled placeholde="自动生成" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={10}>
                            <Form.Item
                                name="bill_date"
                                label="盘点时间"
                                rules={[{ required: true, message: '请选择出库时间' }]}
                            >
                                <DatePicker style={{ width: "100%" }} disabled={disabled} showTime format="YYYY-MM-DD HH:mm:ss" />
                            </Form.Item>
                        </Col>

                    </Row>

                    <Row>
                        <Col xs={24} sm={10}>
                            <Form.Item
                                label="盘查仓库"
                                name="inv_org_name"
                                rules={[{ required: true, message: '请选择盘查仓库' }]}
                            >
                                <Search
                                    disabled={disabled}
                                    placeholder="请选择盘查仓库"
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

                        <Col xs={24} sm={10}>
                            <Form.Item
                                label="盘点人"
                                name="operator_name"
                            // rules={[{ required: true, message: '请选择调出经办人' }]}
                            >
                                <Search
                                    disabled={disabled}
                                    placeholder="请选择盘点人"
                                    allowClear
                                    readOnly={true}
                                    enterButton
                                    onClick={() => {

                                        setSelectUserDialogVisible(true);
                                    }}
                                    onSearch={() => {

                                        setSelectUserDialogVisible(true);
                                    }}
                                />
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
                                status: 1
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
                <TableForm ref={tableRef} disabled={disabled} primaryKey="line_id" tableForm={tableForm} />
            </ProCardCollapse>
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
            <SelectUserDialog
                modalVisible={selectUserDialogVisible}
                handleOk={(selectUser) => {
                    console.log('SelectUserDialog', selectUser)
                    if (selectUser) {
                        mainForm.setFieldsValue({
                            operator: selectUser.id,
                            operator_name: selectUser.userName,
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
export default count;