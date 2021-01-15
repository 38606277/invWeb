import React, { useEffect, useRef, useState } from 'react';
import { Button, Space, message, Modal } from 'antd';
import { EllipsisOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
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
        'reportServer/invOnHand/getItemOnHandByPage',
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

//获取数据
const fetchData = async (params, sort, filter) => {
    console.log('getByKeyword', params, sort, filter);
    // current: 1, pageSize: 20
    let requestParam = {
        pageNum: params.current,
        perPage: params.pageSize,
        ...params,
    };
    const result = await HttpService.post(
        'reportServer/invOnHand/getItemOnHandOrgByPage',
        JSON.stringify(requestParam),
    );
    console.log('result : ', result);
    return Promise.resolve({
        data: result.data.list,
        total: result.data.total,
        success: result.resultCode == '1000',
    });
};

const onHandList = () => {
    const ref = useRef();

    //定义列
    const columns = [
        {
            title: '仓库名称',
            dataIndex: 'org_name',
        },
        {
            title: '物料数量',
            dataIndex: 'item_count',
            key: 'item_count',
        },
        {
            title: '物料价值',
            dataIndex: 'item_price',
            key: 'item_price',
        },
        {
            title: '操作',
            key: 'option',
            valueType: 'option',
            render: (text, record) => [
                <a
                    onClick={() => {
                        history.push(`/transation/onHand/edit/${record.org_id}`);
                    }}
                >
                    编辑
                </a>
            ],
        },
    ];

    return (
        // <PageContainer>
        <ProTable
            actionRef={ref}
            columns={columns}
            request={fetchData}
            rowKey="org_id"
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
            headerTitle="仓库存量"
            toolBarRender={(action, { selectedRows }) => [
                //         <Button type="primary" onClick={() => history.push('/transation/deliver/add/null')}>
                //             新建
                // </Button>,
            ]}
        />
        // </PageContainer>
    );
};
export default onHandList;
