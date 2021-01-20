/**
 * 采购订单列表
 */
import React, { useEffect, useRef, useState } from 'react';
import { Button, Space, message, Modal } from 'antd';
import { EllipsisOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { history } from 'umi';
import HttpService from '@/utils/HttpService.jsx';

const { confirm } = Modal;

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

//删除
const updateStatusByIds = (ref, selectedRowKeys) => {
    if (selectedRowKeys.length < 1) {
        message.error('请选择需要过账的内容');
        return;
    }

    HttpService.post(
        'reportServer/po/updatePoStatusByIds',
        JSON.stringify({ ids: selectedRowKeys.toString(), bill_status: 1 }),
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
        'reportServer/po/deletePoByIds',
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

//获取数据
const fetchData = async (params, sort, filter) => {
    console.log('getByKeyword', params, sort, filter);
    // current: 1, pageSize: 20
    let requestParam = {
        pageNum: params.current,
        perPage: params.pageSize,
        ...params,
        bill_type: 'store'
    };
    const result = await HttpService.post(
        'reportServer/po/getPoListByPage',
        JSON.stringify(requestParam),
    );
    console.log('result : ', result);
    return Promise.resolve({
        data: result.data.list,
        total: result.data.total,
        success: result.resultCode == '1000',
    });
};


const poList = (props) => {
    const ref = useRef();
    const type = props?.match?.params?.type || 'other';

    //定义列
    const columns = [
        {
            title: '订单编号',
            dataIndex: 'hand_code',
            valueType: 'text',
            render: (_) => <a>{_}</a>,
        },
        {
            title: '订单类型',
            dataIndex: 'po_type_name',
            key: 'po_type',
            valueType: 'text',
        },
        {
            title: '采购员',
            dataIndex: 'agent_name',
            key: 'agent_id',
        },
        {
            title: '供应商',
            dataIndex: 'vendor_name',
            key: 'vendor_id',
        },
        {
            title: '生效日期',
            dataIndex: 'po_date',
            valueType: 'dateTimeRange'

        },
        {
            title: '收单地点',
            dataIndex: 'bill_to_location',

        },
        {
            title: '收货地点',
            dataIndex: 'ship_to_location',

        },
        {
            title: '订单状态',
            dataIndex: 'status',
        },
        {
            title: '合同编号',
            dataIndex: 'contract_code',
            render: (_) => <a>{_}</a>,
        },
        {
            title: '合同名称',
            dataIndex: 'contract_name',

        },
        {
            title: '合同文件',
            dataIndex: 'contract_file',

        },
        {
            title: '业务描述',
            dataIndex: 'comments',

        },
        {
            title: '创建时间',
            dataIndex: 'create_date',
            valueType: 'dateTimeRange'
        },
        {
            title: '操作',
            key: 'option',
            valueType: 'option',
            render: (text, record) => [
                <a onClick={() => {
                    history.push(`/order/po/edit/${record.po_header_id}`);
                }}
                >
                    编辑
        </a>,
                <a onClick={() => {
                    onDeleteClickListener(ref, [record.po_header_id])
                }}>
                    删除
        </a>,
            ],
        },
    ];

    return (
        <ProTable
            actionRef={ref}
            columns={columns}
            request={fetchData}
            rowKey="po_header_id"
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
            tableAlertOptionRender={({ selectedRowKeys }) => (
                <Space size={16}>
                    <a onClick={() => onDeleteClickListener(ref, selectedRowKeys)}> 批量删除</a>

                    <a onClick={() => onUpdateClickListener(ref, selectedRowKeys)}> 批量过账</a>
                </Space>
            )}
            pagination={{
                showQuickJumper: true,
            }}
            search={{
                defaultCollapsed: true,
            }}
            dateFormatter="string"
            headerTitle="采购订单"
            toolBarRender={(action, { selectedRows }) => [
                <Button type="primary" onClick={() => history.push('/order/po/add/null')}>
                    新建
        </Button>,
            ]}
        />

    );
};
export default poList;
