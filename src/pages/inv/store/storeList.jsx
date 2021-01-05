import React, { useEffect, useRef, useState } from 'react';
import { Button, Space, message } from 'antd';
import { EllipsisOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import { history } from 'umi';
import HttpService from '@/utils/HttpService.jsx';


//删除按钮事件
const onDeleteClickListener = (ref, selectedRowKeys) => {

    if (selectedRowKeys.length < 1) {
        message.error('请选择需要删除的内容');
        return;
    }
    console.log('onDeleteClickListener', selectedRowKeys);

    confirm({
        title: '温馨提示',
        content: `您确定要删除吗？`,
        okText: '确定',
        cancelText: '取消',
        okType: 'danger',
        onOk() {
            deleteByIds(ref, selectedRowKeys);
        },
        onCancel() {

        },
    });

}
//删除
const deleteByIds = (ref, selectedRowKeys) => {
    if (selectedRowKeys.length < 1) {
        message.error('请选择需要删除的内容');
        return;
    }

    HttpService.post('reportServer/storage/deleteStorage', JSON.stringify({ ids: selectedRowKeys.toString() }))
        .then(res => {
            if (res.resultCode == "1000") {
                //刷新
                // 清空选中项
                ref.current.clearSelected();
                ref.current.reload();

            } else {
                message.error(res.message);
            }
        });
}

//获取数据
const fetchData = async (params, sort, filter) => {
    console.log('getByKeyword', params, sort, filter);
    // current: 1, pageSize: 20
    let requestParam = {
        pageNum: params.current,
        perPage: params.pageSize,
        ...params
    }
    const result = await HttpService.post('reportServer/invStore/getStoreListByPage', JSON.stringify(requestParam));
    console.log('result : ', result);
    return Promise.resolve({
        data: result.data.list,
        total: result.data.total,
        success: result.resultCode == "1000"
    });
}

const storeList = () => {

    console.log('绘制布局')
    const ref = useRef();

    //定义列
    const columns = [
        {
            title: '编号',
            dataIndex: 'transaction_id',
            valueType: 'text',
        },
        {
            title: '类型',
            dataIndex: 'store',
            valueType: 'text',
        },
        {
            title: '创建人',
            dataIndex: 'create_by',
            valueType: 'text',
        },
        {
            title: '创建时间',
            dataIndex: 'create_date',
            valueType: 'date',
        },
        {
            title: '操作',
            width: 180,
            key: 'option',
            valueType: 'option',
            render: (text, record) => [
                <a key="link3" onClick={() => {

                }} >编辑</a>,
                <a key="link4" onClick={() => { }} >删除</a>,
            ]
        },
    ];

    return (
        <PageContainer>
            <ProTable
                actionRef={ref}
                columns={columns}
                request={fetchData}
                rowKey="id"
                rowSelection={{
                    // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
                    // 注释该行则默认不显示下拉选项
                    //selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                }}
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
                    defaultCollapsed: true
                }}
                dateFormatter="string"
                headerTitle="入库管理"
                toolBarRender={(action, { selectedRows }) => [
                    <Button type="primary" onClick={() => history.push('/transation/store')}>
                        新建
                      </Button>
                ]}
            />
        </PageContainer>

    );
}

export default storeList;