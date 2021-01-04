import React, { useEffect, useRef, useState } from 'react';
import { Button, Space, Modal, message, Row, TreeSelect, Tree } from 'antd';
import { EllipsisOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { history } from 'umi';


import HttpService from '@/utils/HttpService.jsx';

const { confirm } = Modal;

const { TreeNode } = TreeSelect;

const CompanyStructure = ({ key, form }) => {

    const [treeData, setTreeData] = useState([]);

    useEffect(() => {
        refreshData();
    }, [])


    const refreshData = () => {
        HttpService.post('reportServer/companyStructure/getAllChildrenRecursionByCode', JSON.stringify({ parent_code: 0 }))
            .then(res => {
                if (res.resultCode == "1000") {
                    setTreeData(res.data)
                } else {
                    message.error(res.message);
                }
            });
    }

    const onChange = value => {
        form.setFieldsValue({
            [key]: value,
        });
        console.log('renderFormItem onChange ',);
    };

    return (<TreeSelect
        style={{ width: '100%' }}
        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
        treeData={treeData}
        placeholder="Please select"
        treeDefaultExpandAll
        allowClear
        onChange={onChange}
    />);
}


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
    const result = await HttpService.post('reportServer/storage/listStorageByPage', JSON.stringify(requestParam));
    console.log('result : ', result);
    return Promise.resolve({
        data: result.data.list,
        total: result.data.total,
        success: result.resultCode == "1000"
    });
}

const dictList = () => {

    console.log('绘制布局')
    const ref = useRef();
    const [visible, setVisible] = useState(false);
    const [initData, setInitData] = useState({});


    //定义列
    const columns = [
        {
            title: '编码',
            dataIndex: 'num',
            valueType: 'text',
        },
        {
            title: '名称',
            dataIndex: 'name',
            valueType: 'text',
        },
        {
            title: '状态',
            // hideInSearch: true,
            dataIndex: 'time',
            valueType: 'date',
        },
        {
            title: '数据类型',
            // hideInSearch: true,
            dataIndex: 'name',
            valueType: 'text',
        },
        {
            title: '简码',
            dataIndex: 'type_name',
            valueType: 'select',
            key: 'type',
            request: async () => {
                const result = await HttpService.post('reportServer/baseData/listBaseDataByType', JSON.stringify({
                    type: 'storage_type'
                }));

                if (result.resultCode == '1000') {
                    return Promise.resolve(result.data);
                } else {
                    message.error('数据获取失败')
                    return Promise.resolve([]);
                }
            }
        },
        {
            title: '所属部门',
            dataIndex: 'department',
            key: 'department',
            filters: true,
            renderFormItem: (item, {}, form) => {
          

                return (
                    <CompanyStructure
                        key={item.key}
                        form={form}
                    />

                );
            },
        },

        {
            title: '操作',
            width: 180,
            key: 'option',
            valueType: 'option',
            render: (text, record) => [
                <a key="link3" onClick={() => {
                    setVisible(true);
                    setInitData(record);
                }} >编辑</a>,
                <a key="link4" onClick={() => onDeleteClickListener(ref, [record.id])} >删除</a>,
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
                headerTitle="字典列表"
                 toolBarRender={(action, { selectedRows }) => [
                    <Button type="primary" onClick={() => history.push('/transation/deliver')}>
                      新建
                    </Button>
                  ]}
            />
        </PageContainer>

    );
}

export default dictList;