import React, { useEffect, useRef, useState } from 'react';
import { Button, Space, Modal, message, Row, TreeSelect, Tree } from 'antd';
import { EllipsisOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { history } from 'umi';
import HttpService from '@/utils/HttpService.jsx';

const { confirm } = Modal;


//删除按钮事件
const onDeleteClickListener = (selectedRowKeys) => {
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
            deleteByIds(selectedRowKeys);
        },
        onCancel() {

        },
    });

}
//删除
const deleteByIds = ( selectedRowKeys) => {
    if (selectedRowKeys.length < 1) {
        message.error('请选择需要删除的内容');
        return;
    }
    HttpService.post('reportServer/customers/deleteCustomersById', JSON.stringify({ customer_id: selectedRowKeys.toString() }))
        .then(res => {
            if (res.resultCode == "1000") {
                //刷新
                // 清空选中项
                fetchData({current:0,pageSize:10},"","");
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
        startIndex: params.current,
        perPage: params.pageSize,
        ...params
    }
    const result = await HttpService.post('reportServer/customers/getAllPage', JSON.stringify(requestParam));
    return Promise.resolve({
        data: result.data.list,
        total: result.data.total,
        success: result.resultCode == "1000"
    });
}

const customersList = () => {

    const ref = useRef();
    const [visible, setVisible] = useState(false);
    const [initData, setInitData] = useState({});

    //定义列
    const columns = [
        {
            title: '名称',
            dataIndex: 'customer_name',
            valueType: 'text',
            align:"center"
        },
        {
            title: '地址',
            dataIndex: 'customer_address',
            valueType: 'text',
            align:"center"
        },
        {
            title: '联系人',
            dataIndex: 'customer_link',
            valueType: 'text',
            align:"center"
        },
        {
            title: '类型',
            dataIndex: 'customer_type',
            valueType: 'text',
            align:"center"
        },
        {
            title: '区域',
            dataIndex: 'area_id',
            valueType: 'text',
            align:"center"
        },
        {
            title: '操作',
            width: 180,
            key: 'option',
            valueType: 'option',
            align:"center",
            render: (text, record) => [
                <Button type="text" onClick={() => history.push('/customers/customers/'+`${record.customer_id}`)}>
                      编辑
                    </Button>,
                <Button type="text" danger onClick={() => onDeleteClickListener([record.customer_id])} >删除</Button>,
            ]
        },
    ];

    return (
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
                tableAlertOptionRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => (
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
                headerTitle="供应商列表"
                 toolBarRender={(action, { selectedRows }) => [
                    <Button type="primary" onClick={() => history.push('/customers/customers/null')}>
                      新建
                    </Button>
                  ]}
            />

    );
}

export default customersList;