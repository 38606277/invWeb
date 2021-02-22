import React, { useEffect, useRef, useState } from 'react';
import { Button, Space, message, Modal } from 'antd';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import { history } from 'umi';
import HttpService from '@/utils/HttpService.jsx';
import LocalStorge from '@/utils/LogcalStorge.jsx';

const localStorge = new LocalStorge();

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
        'reportServer/ap/invoice/deleteInvoiceByIds',
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
        ...params
    };

    let userInfo = localStorge.getStorage('userInfo');
    requestParam.operator = userInfo.id;

    const result = await HttpService.post(
        'reportServer/ap/invoice/getInvoiceListByPage',
        JSON.stringify(requestParam),
    );
    console.log('result : ', result);
    return Promise.resolve({
        data: result.data.list,
        total: result.data.total,
        success: result.resultCode == '1000',
    });
};

const invoiceList = () => {
    const ref = useRef();

    //定义列
    const columns = [
        {
            title: '编号',
            dataIndex: 'invoice_num',
            valueType: 'text',
        },
        {
            title: '已付金额',
            dataIndex: 'invoice_type',
            key: 'invoice_type',
            valueType: 'text',
        },
        {
            title: '供应商',
            dataIndex: 'vendor_name',
            key: 'inv_org_id',
            valueType: 'text',
        },
        {
            title: '金额',
            dataIndex: 'invoice_amount',
            key: 'inv_org_id',
            valueType: 'text',
        },
        {
            title: '已付金额',
            dataIndex: 'amount_paid',
            key: 'amount_paid',
            valueType: 'text',
        },
        {
            title: '状态',
            dataIndex: 'payment_status',
            valueType: 'select',
            valueEnum: {
                0: { text: '未付款', status: 'Error' },
                1: { text: '付款中', status: 'Warning' },
                2: { text: '已完成', status: 'Success' },
            },
        },
        {
            title: '描述',
            dataIndex: 'description',
            valueType: 'text',

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
                        history.push(`/ap/invoice/edit/${record.invoice_id}`);
                    }}
                >
                    编辑
                </a>,
                <a onClick={() => { onDeleteClickListener(ref, [record.invoice_id]) }}>
                    删除
                </a>,
            ],
        },
    ];

    return (
        // <PageContainer>
        <ProTable
            actionRef={ref}
            columns={columns}
            request={fetchData}
            rowKey="invoice_id"
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
                    {/* <a onClick={() => onUpdateClickListener(ref, selectedRowKeys)}> 批量过账</a> */}
                </Space>
            )}
            pagination={{
                showQuickJumper: true,
            }}
            search={{
                defaultCollapsed: true,
            }}
            dateFormatter="string"
            headerTitle="发票管理"
            toolBarRender={(action, { selectedRows }) => [
                <Button type="primary" onClick={() => history.push('/ap/invoice/add/null')}>
                    新建
        </Button>,
            ]}
        />
        // </PageContainer>
    );
};
export default invoiceList;
