/**
 * 产品列表
 */

import React, { useEffect, useRef, useState } from 'react';
import { Button, Space, message, Modal } from 'antd';
import ProTable from '@ant-design/pro-table';
import { history } from 'umi';
import HttpService from '@/utils/HttpService.jsx';
import LocalStorge from '@/utils/LogcalStorge.jsx';

const localStorge = new LocalStorge();

const { confirm } = Modal;

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
        'reportServer/bom/deleteByIds',
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
        bill_type: 'count'
    };

    let userInfo = localStorge.getStorage('userInfo');
    requestParam.operator = userInfo.id;

    const result = await HttpService.post(
        'reportServer/bom/getListByPage',
        JSON.stringify(requestParam),
    );
    console.log('result : ', result);
    return Promise.resolve({
        data: result.data.list,
        total: result.data.total,
        success: result.resultCode == '1000',
    });
};

const countList = () => {
    const ref = useRef();

    //定义列
    const columns = [

        {
            title: '产品名称',
            dataIndex: 'bom_name',
            key: 'inv_org_id',
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
                        history.push(`/mdm/bom/edit/${record.item_id}`);
                    }}
                >
                    编辑
                </a>,
                <a onClick={() => { onDeleteClickListener(ref, [record.item_id]) }}>
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
            rowKey="item_id"
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
                </Space>
            )}
            pagination={{
                showQuickJumper: true,
            }}
            search={{
                defaultCollapsed: true,
            }}
            dateFormatter="string"
            headerTitle="产品管理"
            toolBarRender={(action, { selectedRows }) => [
                <Button type="primary" onClick={() => history.push('/mdm/bom/add/null')}>
                    新建
        </Button>,
            ]}
        />

    );
};
export default countList;


