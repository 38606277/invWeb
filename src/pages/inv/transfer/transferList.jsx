import React, { useEffect, useRef, useState } from 'react';
import { Button, Space, message, Modal } from 'antd';
import { EllipsisOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import { history } from 'umi';
import HttpService from '@/utils/HttpService.jsx';
import LocalStorge from '@/utils/LogcalStorge.jsx';

const localStorge = new LocalStorge();

const { confirm } = Modal;


const getTypeName = (type) => {
    console.log('type:', type)
    if (type === 'out') {
        return '调拨出库';
    } else if (type == 'in') {
        return '调拨入库';
    }
    return '调拨出库';
}

const transferList = (props) => {
    const ref = useRef();

    const type = props?.match?.params?.type || 'out';

    //定义列
    const columns = [
        {
            title: '编号',
            dataIndex: 'bill_code',
            valueType: 'text',
        },
        {
            title: '调出仓库',
            dataIndex: 'inv_org_name',
            key: 'inv_org_id',
            valueType: 'text',
        },
        {
            title: '调出日期',
            dataIndex: 'bill_date',
            key: 'bill_date',
            valueType: 'text',
        },
        {
            title: '调出经办人',
            dataIndex: 'operator_name',
            key: 'operator',
            valueType: 'text',
        },

        {
            title: '调入仓库',
            dataIndex: 'target_inv_org_name',
            key: 'target_inv_org_id',
            valueType: 'text',
        },

        {
            title: '调入经办人',
            dataIndex: 'target_operator_name',
            key: 'target_operator',
            valueType: 'text',
        },
        {
            title: '备注',
            dataIndex: 'remark',
            valueType: 'text',
        },
        {
            title: '状态',
            dataIndex: 'bill_status',
            valueType: 'select',
            valueEnum: {
                0: { text: '新建', status: 'Warning' },
                1: { text: '运输中', status: 'Success' },
                2: { text: '完成', status: 'Success' },
            },
        },
        {
            title: '创建时间',
            dataIndex: 'create_date',
            valueType: 'dateTime',
        },
        {
            title: '操作',
            key: 'option',
            valueType: 'option',
            render: (text, record) => [
                <a
                    onClick={() => {
                        history.push(`/transation/transfer/${type}/edit/${record.bill_id}`);
                    }}
                >
                    查看详情
        </a>,
                <a key="link4" onClick={() => {
                    onDeleteClickListener(ref, [record.bill_id])
                }}>
                    删除
        </a>,
            ],
        },
    ];


    useEffect(() => {
        ref?.current?.clearSelected();
        ref?.current?.reload();

    }, [type])


    //获取数据
    const fetchData = async (params, sort, filter) => {
        console.log('getByKeyword', params, sort, filter);
        // current: 1, pageSize: 20
        let requestParam = {
            pageNum: params.current,
            perPage: params.pageSize,
            ...params,
            bill_type: 'transfer',
            sub_type: type
        };

        let userInfo = localStorge.getStorage('userInfo');
        if (type == 'out') {
            requestParam.operator = userInfo.id;
        } else {
            requestParam.target_operator = userInfo.id;
        }
        requestParam.create_by = userInfo.id;

        const result = await HttpService.post(
            'reportServer/invStore/getStoreListByPage',
            JSON.stringify(requestParam),
        );
        console.log('result : ', result);
        return Promise.resolve({
            data: result.data.list,
            total: result.data.total,
            success: result.resultCode == '1000',
        });
    };

    //更新状态
    const updateStatusByIds = (ref, selectedRowKeys) => {
        if (selectedRowKeys.length < 1) {
            message.error('请选择需要确认的内容');
            return;
        }

        //调出确认为1 调入确认为2
        let status = type == 'out' ? 1 : 2;

        HttpService.post(
            'reportServer/invStore/updateStoreStatusByIds',
            JSON.stringify({ ids: selectedRowKeys.toString(), bill_status: status }),
        ).then((res) => {
            if (res.resultCode == '1000') {
                //刷新
                // 清空选中项
                ref.current.clearSelected();
                ref.current.reload();
            } else {
                message.error(res.message);
            }
        });
    };

    //过账按钮事件
    const onUpdateClickListener = (ref, selectedRowKeys) => {
        if (selectedRowKeys.length < 1) {
            message.error('请选择需要过账的内容');
            return;
        }

        confirm({
            title: '温馨提示',
            content: `您确定要过账吗？`,
            okText: '确定',
            cancelText: '取消',
            okType: 'danger',
            onOk() {
                updateStatusByIds(ref, selectedRowKeys);
            },
            onCancel() { },
        });
    };

    //删除按钮事件
    const onDeleteClickListener = (ref, selectedRowKeys) => {
        if (selectedRowKeys.length < 1) {
            message.error('请选择需要删除的内容');
            return;
        }

        confirm({
            title: '温馨提示',
            content: `您确定要删除吗？`,
            okText: '确定',
            cancelText: '取消',
            okType: 'danger',
            onOk() {
                deleteByIds(ref, selectedRowKeys);
            },
            onCancel() { },
        });
    };
    //删除
    const deleteByIds = (ref, selectedRowKeys) => {
        if (selectedRowKeys.length < 1) {
            message.error('请选择需要删除的内容');
            return;
        }

        HttpService.post(
            'reportServer/invStore/deleteStoreByIds',
            JSON.stringify({ ids: selectedRowKeys.toString() }),
        ).then((res) => {
            if (res.resultCode == '1000') {
                //刷新
                // 清空选中项
                ref.current.clearSelected();
                ref.current.reload();
            } else {
                message.error(res.message);
            }
        });
    };

    return (
        // <PageContainer>
        <ProTable
            actionRef={ref}
            columns={columns}
            request={fetchData}
            rowKey="bill_id"
            rowSelection={
                {
                    // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
                    // 注释该行则默认不显示下拉选项
                    //selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                }
            }
            tableAlertRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => (
                <Space size={24}>
                    <span>
                        已选 {selectedRowKeys.length} 项
            <a
                            style={{
                                marginLeft: 8,
                            }}
                            onClick={onCleanSelected}
                        >
                            取消选择
            </a>
                    </span>
                </Space>
            )}
            tableAlertOptionRender={({ selectedRowKeys }) => {
                return (
                    <Space size={16}>
                        <a onClick={() => onDeleteClickListener(ref, selectedRowKeys)}> 批量删除</a>
                        <a onClick={() => onUpdateClickListener(ref, selectedRowKeys)}> 批量确认</a>
                    </Space>
                )
            }}
            pagination={{
                showQuickJumper: true,
            }}
            search={{
                defaultCollapsed: true,
            }}
            dateFormatter="string"
            headerTitle={getTypeName(type)}
            toolBarRender={(action, { selectedRows }) => [
                <Button type="primary" onClick={() => history.push(`/transation/transfer/${type}/add/null`)}>
                    新建
        </Button>,
            ]}
        />
        // </PageContainer>
    );
};
export default transferList;
