/**
 * 审批规则
 */

import React, { useEffect, useRef, useState } from 'react';
import { message, Form, Button, Row, Col, Select, Input, DatePicker } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProCardCollapse from '@/components/ProCard/ProCardCollapse';
import SelectUserDialog from '@/components/User/SelectUserDialog';
import HttpService from '@/utils/HttpService';
import { history } from 'umi';
const { Search } = Input;


const formItemLayout2 = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};
const formItemLayout1 = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
};

const bankAccount = (props) => {
    const [mainForm] = Form.useForm();

    const [selectUserDialogVisible, setSelectUserDialogVisible] = useState(false);
    const [selectUserFiledName, setSelectUserFiledName] = useState('');

    const action = props?.match?.params?.action || 'add';
    const id = props?.match?.params?.id || -1;

    const save = (params) => {
        HttpService.post('reportServer/approvalRule/saveApprovalRule', JSON.stringify(params)).then(
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

    const update = (params) => {
        HttpService.post('reportServer/approvalRule/updateApprovalRuleById', JSON.stringify(params)).then(
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
            HttpService.post(
                'reportServer/approvalRule/getApprovalRuleListById',
                JSON.stringify({ id: id }),
            ).then((res) => {
                if (res.resultCode == '1000') {
                    mainForm.setFieldsValue({
                        ...res.data
                    });
                } else {
                    message.error(res.message);
                }
            });
        }
    }, []);

    return (
        <PageContainer
            title="审批规则"
            ghost="true"
            header={{
                extra: [
                    <Button
                        key="submit"
                        type="primary"
                        onClick={() => {
                            console.log('mainForm', mainForm);
                            mainForm?.submit();
                        }}
                    >
                        提交
           </Button>,
                    <Button key="back" onClick={() => history.goBack()}>
                        返回
           </Button>,
                ],
            }}
        >
            <Form
                {...formItemLayout2}
                form={mainForm}
                onFinish={async (fieldsValue) => {
                    //mainForm
                    mainForm
                        .validateFields()
                        .then(() => {
                            //验证成功

                            const values = {
                                ...fieldsValue,
                            };

                            if (action === 'edit') {
                                values.id = id;
                                update(values);
                            } else {
                                save(values);
                            }
                        })
                        .catch((errorInfo) => {
                            //验证失败
                            message.error('提交失败');
                        });
                }}
            >
                <ProCardCollapse title="基础信息">

                    <Form.Item style={{ display: 'none' }} label="创建人id" name="create_user" />
                    <Form.Item style={{ display: 'none' }} label="审批人id" name="approval_user" />

                    <Row>
                        <Col xs={24} sm={11}>
                            <Form.Item
                                label="创建人"
                                name="create_user_name"
                                rules={[{ required: true, message: '请选择创建人' }]}
                            >
                                <Search
                                    disabled={action === 'edit'}
                                    placeholder="请选择创建人"
                                    allowClear
                                    readOnly={true}
                                    enterButton
                                    onClick={() => {
                                        setSelectUserFiledName('create_user');
                                        setSelectUserDialogVisible(true);
                                    }}
                                    onSearch={() => {
                                        setSelectUserFiledName('create_user');
                                        setSelectUserDialogVisible(true);
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={11}>
                            <Form.Item
                                label="审批人"
                                name="approval_user_name"
                                rules={[{ required: true, message: '请选择审批人' }]}
                            >
                                <Search
                                    placeholder="请选择审批人"
                                    allowClear
                                    readOnly={true}
                                    enterButton
                                    onClick={() => {
                                        setSelectUserFiledName('approval_user');
                                        setSelectUserDialogVisible(true);
                                    }}
                                    onSearch={() => {
                                        setSelectUserFiledName('approval_user');
                                        setSelectUserDialogVisible(true);
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs={24} sm={11}>
                            <Form.Item label="单据类型" name="type">
                                <Select placeholder="请选择单据类型">
                                    <Option value="po">采购订单</Option>
                                    <Option value="pd">生产订单</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </ProCardCollapse>
            </Form>


            <SelectUserDialog
                modalVisible={selectUserDialogVisible}
                handleOk={(selectUser) => {
                    console.log('SelectUserDialog', selectUser);
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

export default bankAccount;
