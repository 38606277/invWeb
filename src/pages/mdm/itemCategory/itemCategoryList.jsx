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
            // deleteByIds(selectedRowKeys);
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
    HttpService.post('reportServer/mdmItemgory/deleteItemgoryById', JSON.stringify({ category_id: selectedRowKeys.toString() }))
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
    const result = await HttpService.post('reportServer/mdmDict/getAllPage', JSON.stringify(requestParam));
    return Promise.resolve({
        data: result.data.list,
        total: result.data.total,
        success: result.resultCode == "1000"
    });
}

const itemCategoryList = () => {

    const ref = useRef();
    const [visible, setVisible] = useState(false);
    const [initData, setInitData] = useState({});

    //定义列
    const columns = [
        {
            title: '编码',
            dataIndex: 'category_code',
            valueType: 'text',
        },
        {
            title: '名称',
            dataIndex: 'category_name',
            valueType: 'text',
        },
        {
            title: '操作',
            width: 180,
            key: 'option',
            valueType: 'option',
            render: (text, record) => [
                <Button type="primary" onClick={() => history.push('/mdm/itemCategory/itemCategory/'+`${record.category_id}`)}>
                      编辑
                    </Button>,
                <Button onClick={() => onDeleteClickListener([record.category_id])} >删除</Button>,
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
                headerTitle="物料类别列表"
                 toolBarRender={(action, { selectedRows }) => [
                    <Button type="primary" onClick={() => history.push('/mdm/itemCategory/itemCategory/null')}>
                      新建
                    </Button>
                  ]}
            />
        </PageContainer>

    );
}

export default itemCategoryList;