/**
 * 采购订单列表
 */
import React, { useEffect, useRef, useState } from 'react';
import { Button, Space, message, Modal } from 'antd';
import ProTable from '@ant-design/pro-table';
import { history } from 'umi';
import HttpService from '@/utils/HttpService.jsx';
import LocalStorge from '@/utils/LogcalStorge.jsx';

const localStorge = new LocalStorge();

const { confirm } = Modal;

/**
 * 审批
 */
const onApprovalClickListener = (ref, recordId) => {
    confirm({
        title: '温馨提示',
        content: `您确定要审批吗？`,
        okText: '确定',
        cancelText: '取消',
        okType: 'danger',
        onOk() {
            updateStatusById(ref, recordId, '2');
        },
        onCancel() { },
    });
}

/**
 * 提交
 */
const onSubmitClickListener = (ref, recordId) => {
    confirm({
        title: '温馨提示',
        content: `您确定要提交吗？`,
        okText: '确定',
        cancelText: '取消',
        okType: 'danger',
        onOk() {
            updateStatusById(ref, recordId, '1');
        },
        onCancel() { },
    });
}


//修改状态
const updateStatusById = (ref, billId, billStatus) => {
    HttpService.post(
        'reportServer/pd/updatePdStatusById',
        JSON.stringify({ bill_id: billId, bill_status: billStatus }),
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
        'reportServer/pd/deleteByIds',
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
        status: '0,1,2',
        pageNum: params.current,
        perPage: params.pageSize,
        ...params,
    };
    const result = await HttpService.post(
        'reportServer/pd/getListByPage',
        JSON.stringify(requestParam),
    );
    console.log('result : ', result);
    return Promise.resolve({
        data: result.data.list,
        total: result.data.total,
        success: result.resultCode == '1000',
    });
};




const pdList = (props) => {
    const ref = useRef();

    const getTableAction = (record) => {

        const actionList = [];

        if (record.status == 0) {
            actionList.push(<a onClick={() => {
                history.push(`/order/pd/edit/${record.pd_header_id}`);
            }}
            >
                编辑
             </a>);
            actionList.push(<a onClick={() => {
                // onSubmitClickListener(ref, record.pd_header_id);
                history.push(`/order/pd/edit/${record.pd_header_id}`);
            }}
            >
                提交
             </a>);
        } else {
            actionList.push(<a onClick={() => {
                history.push(`/order/pd/edit/${record.pd_header_id}`);
            }}
            >
                查看详情
             </a>);

            let userInfo = localStorge.getStorage('userInfo');
            if (record.status == 1 && record.approval_id == userInfo.id) {
                actionList.push(<a onClick={() => {
                    //onApprovalClickListener(ref, record.pd_header_id);
                    history.push(`/order/pd/edit/${record.pd_header_id}`);
                }}
                >
                    审批
                 </a>);
            }
        }
        actionList.push(<a onClick={() => {
            onDeleteClickListener(ref, [record.pd_header_id])

        }}
        >
            删除
         </a>);

        return actionList;
    }

    //定义列
    const columns = [
        {
            title: '订单编号',
            dataIndex: 'pd_header_code',
            valueType: 'text',
            render: (text, record) => <a onClick={() => {
                history.push(`/order/pd/edit/${record.pd_header_id}`);
            }}>{text}</a>,
        },
        {
            title: '订单名称',
            dataIndex: 'pd_header_name',
            key: 'pd_header_id',
            valueType: 'text',
        },
        {
            title: '制造商',
            dataIndex: 'manufactory_name',
            key: 'manufactory_id',
            valueType: 'text',
        },
        {
            title: '订单状态',
            dataIndex: 'status',
            valueType: 'select',
            valueEnum: {
                0: { text: '草稿' },
                1: { text: '待审批' },
                2: { text: '待入库' },
                3: { text: '已完成' },
            },
        },
        {
            title: '更新时间',
            dataIndex: 'update_date',
            valueType: 'dateTime',
        },
        {
            title: '操作',
            key: 'option',
            valueType: 'option',
            render: (text, record) => getTableAction(record),
        },
    ];

    return (
        <ProTable
            actionRef={ref}
            columns={columns}
            request={fetchData}
            rowKey="pd_header_id"
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
                    {/* <a onClick={() => onUpdateClickListener(ref, selectedRowKeys)}> 批量审批</a> */}
                </Space>
            )}
            pagination={{
                showQuickJumper: true,
            }}
            search={{
                defaultCollapsed: true,
            }}
            dateFormatter="string"
            headerTitle="生产订单"
            toolBarRender={(action, { selectedRows }) => [
                <Button type="primary" onClick={() => history.push('/order/pd/add/null')}>
                    新建
         </Button>,
            ]}
        />

    );
};
export default pdList;
