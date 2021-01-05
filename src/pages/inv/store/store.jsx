import React, { useState } from 'react';
import { message } from 'antd';
import ProForm, { ProFormText, ProFormDateRangePicker, ProFormSelect } from '@ant-design/pro-form';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { EditableProTable } from '@ant-design/pro-table';
import ProCard from '@ant-design/pro-card';

const waitTime = (time = 100) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, time);
    });
};

const defaultData = [
    {
        id: 624748504,
        title: '活动名称一',
        decs: '这个活动真好玩',
        state: 'open',
        created_at: '2020-05-26T09:42:56Z',
    },
    {
        id: 624691229,
        title: '活动名称二',
        decs: '这个活动真好玩',
        state: 'closed',
        created_at: '2020-05-26T08:19:22Z',
    },
];



// 行信息布局
const columns = [
    {
        title: '活动名称',
        dataIndex: 'title',
        formItemProps: {
            rules: [
                {
                    required: true,
                    message: '此项为必填项',
                },
            ],
        },
        // 第二行不允许编辑
        editable: (text, record, index) => {
            return index !== 0;
        },
        width: '30%',
    },
    {
        title: '状态',
        key: 'state',
        dataIndex: 'state',
        valueType: 'select',
        valueEnum: {
            all: { text: '全部', status: 'Default' },
            open: {
                text: '未解决',
                status: 'Error',
            },
            closed: {
                text: '已解决',
                status: 'Success',
            },
        },
    },
    {
        title: '描述',
        dataIndex: 'decs',
        fieldProps: (from, { rowKey }) => {
            if (from.getFieldValue([rowKey || '', 'title']) === '不好玩') {
                return {
                    disabled: true,
                };
            }
            return {};
        },
    },
    {
        title: '操作',
        valueType: 'option',
        width: 200,
        render: (text, record, _, action) => [
            <a
                key="editable"
                onClick={() => {
                    action.startEditable?.(record.id);
                }}
            >
                编辑
        </a>,
            <a
                key="delete"
                onClick={() => {
                    setDataSource(dataSource.filter((item) => item.id !== record.id));
                }}
            >
                删除
        </a>,
        ],
    },
];



export default () => {
    const [editableKeys, setEditableRowKeys] = useState([]);
    const [dataSource, setDataSource] = useState([]);
    const [newRecord, setNewRecord] = useState({
        id: (Math.random() * 1000000).toFixed(0),
    });

    return (
        <PageContainer>

            <ProForm onFinish={async (values) => {
                console.log(values);
                message.success('提交成功');
            }} >
                <ProCard
                    title="基础信息"
                    headerBordered
                    collapsible
                    onCollapse={(collapse) => console.log(collapse)}
                >
                    <ProForm.Group>
                        <ProFormText width="md" name="name" label="签约客户名称" tooltip="最长为 24 位" placeholder="请输入名称" />
                        <ProFormText width="md" name="company" label="我方公司名称" placeholder="请输入名称" />
                    </ProForm.Group>
                </ProCard>


                <ProCard
                    style={{ marginTop: '30px' }}
                    title="行信息"
                    headerBordered
                    collapsible
                    onCollapse={(collapse) => console.log(collapse)}
                >
                    <EditableProTable

                        rowKey="id"
                        headerTitle="可编辑表格"
                        maxLength={100}
                        recordCreatorProps={
                            {
                                position: 'bottom',
                                record: newRecord,
                            }
                        }
                        columns={columns}
                        request={async () => ({
                            data: defaultData,
                            total: 3,
                            success: true,
                        })}
                        value={dataSource}
                        onChange={setDataSource}
                        editable={{
                            type: "multiple",
                            editableKeys,
                            onSave: async () => {
                                setNewRecord({
                                    id: (Math.random() * 1000000).toFixed(0),
                                });
                            },
                            onChange: setEditableRowKeys,
                        }}
                    />


                </ProCard>
            </ProForm>

        </PageContainer>);
};