import React, { useState, useEffect, useRef } from 'react';
import { Button, Space, message, Tree, Row, Col, Modal } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import HttpService from '@/utils/HttpService.jsx';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import SplitPane from 'react-split-pane';
import SelectUserDialog from '@/components/User/SelectUserDialog';



const { confirm } = Modal;

// 获取数据
const fetchData = async (params, sort, filter) => {
    console.log('getByKeyword', params, sort, filter);
    const requestParam = {
        pageNum: params.current,
        perPage: params.pageSize,
        ...params
    }

    const result = await HttpService.post('reportServer/invOrgUser/getListByPage', JSON.stringify(requestParam));
    console.log('result : ', result);
    return Promise.resolve({
        data: result.data.list,
        total: result.data.total,
        success: result.resultCode === "1000"
    });

}

const InvOrgUser = () => {
    const ref = useRef();
    const [treeData, setTreeData] = useState([]);
    const [orgId, setOrgId] = useState(null);// 用于编辑赋初始值
    const [minHeight] = useState(window.innerHeight - 92 + 'px'); // 用于编辑赋初始值

    const [selectUserDialogVisible, setSelectUserDialogVisible] = useState(false);


    const getAllChildrenRecursionById = (mOrgPid) => {
        HttpService.post('reportServer/invOrg/getAllChildrenRecursionById', JSON.stringify({ org_pid: mOrgPid }))
            .then(res => {
                if (res.resultCode === "1000") {
                    setTreeData(res.data)
                } else {
                    message.error(res.message);
                }
            });
    }

    const refreshData = () => {
        getAllChildrenRecursionById("0");
    }

    const onTreeSelect = (item) => {
        if (orgId !== item.org_id) {
            setOrgId(item.org_id)
        }
    }


    // 删除
    const deleteByIds = (deleteRowKeys) => {
        if (deleteRowKeys.length < 1) {
            message.error('请选择需要删除的内容');
            return;
        }
        HttpService.post('reportServer/invOrgUser/deleteByIds', JSON.stringify({ ids: deleteRowKeys.toString() }))
            .then(res => {
                if (res.resultCode === "1000") {
                    // 刷新
                    //  清空选中项
                    if (ref.current) {
                        ref.current.clearSelected();
                        ref.current.reload();
                    }
                    refreshData();
                } else {
                    message.error(res.message);
                }
            });
    }


    // 删除按钮事件
    const onDeleteClickListener = (selectedRowKeys) => {
        console.log('selectedRowKeys', selectedRowKeys)
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


    useEffect(() => {
        refreshData();
    }, [])

    const columns = [
        {
            title: '姓名',
            dataIndex: "USER_NAME",
            key: 'USER_NAME',
            valueType: 'text',
        },
        {
            title: '仓库',
            dataIndex: 'org_name',
            key: 'org_name',
            valueType: 'text'
        },
        {
            title: '更新时间',
            dataIndex: 'update_date',
            key: 'update_date',
            valueType: 'text'
        },
        {
            title: '操作',
            width: 180,
            valueType: 'option',
            render: (text, record) => [
                // <a onClick={() => {

                // }}>新增</a>,
                // <a onClick={() => {

                // }}>编辑</a>,
                <a onClick={() => {
                    onDeleteClickListener([record.id]);
                }}>删除</a>,
            ]
        },
    ];


    return (
        <PageContainer ghost="true" title="仓库员工管理">
            <div>
                <SplitPane split="vertical" minSize={10} defaultSize={200}>
                    <Tree
                        defaultExpandAll={true}
                        style={{
                            width: '100%',
                            padding: '10px',
                            overflow: 'auto',
                            minHeight: minHeight,
                        }}
                        showLine
                        treeData={treeData}
                        titleRender={(item) => {
                            return (<div style={{ width: "100%" }} key={item.org_id} onClick={() => {
                                onTreeSelect(item);
                            }}>
                                <span >{item.org_name}</span>
                            </div>)
                        }}
                    >
                    </Tree>


                    <ProTable
                        headerTitle="员工列表"
                        actionRef={ref}
                        columns={columns}
                        request={fetchData}
                        rowKey="id"
                        params={{ org_id: orgId }}
                        rowSelection={{
                            //  自定义选择项参考: https:// ant.design/components/table-cn/#components-table-demo-row-selection-custom
                            //  注释该行则默认不显示下拉选项
                            // selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                        }}
                        tableAlertRender={({ selectedRowKeys, onCleanSelected }) => (
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
                                <a onClick={() => onDeleteClickListener(selectedRowKeys)}> 批量删除</a>
                            </Space>
                        )}
                        pagination={{
                            showQuickJumper: true,
                        }}
                        // search={{
                        //     defaultCollapsed: true
                        // }}
                        search={false}
                        dateFormatter="string"
                        toolBarRender={() => [
                            <Button key='create' type="primary" onClick={() => {
                                if (orgId != null) {
                                    setSelectUserDialogVisible(true);
                                } else {
                                    message.info('请先选择仓库');
                                }

                            }}>
                                <PlusOutlined />
                                    新增
                          </Button>
                        ]}
                    />

                </SplitPane>

                <SelectUserDialog
                    modalVisible={selectUserDialogVisible}
                    selectType="checkbox"
                    handleOk={(checkRows, checkKeys) => {
                        let params = { org_id: orgId, userIds: checkKeys.toString() };
                        HttpService.post('reportServer/invOrgUser/add', JSON.stringify(params))
                            .then(res => {
                                if (res.resultCode === "1000") {
                                    // 刷新
                                    //  清空选中项
                                    if (ref.current) {
                                        ref.current.clearSelected();
                                        ref.current.reload();
                                    }
                                } else {
                                    message.error(res.message);
                                }
                            });


                        setSelectUserDialogVisible(false);
                    }}
                    handleCancel={() => {
                        setSelectUserDialogVisible(false);
                    }}
                />
            </div>

        </PageContainer >
    )

}
export default InvOrgUser;




