import React, { useEffect, useRef, useState } from 'react';
import { Button, Space, Modal, message, Row, TreeSelect, Tree, Col } from 'antd';
import { EllipsisOutlined, QuestionCircleOutlined, SearchOutlined,PlusCircleOutlined,FormOutlined ,MinusCircleOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { history } from 'umi';
import SplitPane from 'react-split-pane';
import './index.less';
import HttpService from '@/utils/HttpService.jsx';

const { confirm } = Modal;




const itemCategoryList = () => {

    const ref = useRef();
    const [visible, setVisible] = useState(false);
    const [initData, setInitData] = useState({});
    const [treeData, setTreeData] = useState([]);
    const [catId, setCatId] = useState('-1');// 用于编辑赋初始值
    const [minHeight, setMinHeight] = useState( window.innerHeight-92+'px');// 用于编辑赋初始值

    const getAllChildrenRecursionById = (catId) => {
        HttpService.post('reportServer/itemCategory/getAllList',JSON.stringify({"category_pid":catId}))
            .then(res => {
                if (res.resultCode === "1000") {
                    setTreeData(res.data)
                } else {
                    message.error(res.message);
                }
            });
    }
    
    const refreshData = () => {
        getAllChildrenRecursionById("-1");
    }
    useEffect(() => {
        refreshData();
    }, [])

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
        HttpService.post('reportServer/itemCategory/deleteItemCategoryById', JSON.stringify({ category_id: selectedRowKeys.toString() }))
            .then(res => {
                if (res.resultCode == "1000") {
                    //刷新
                    // 清空选中项
                    fetchData({current:0,pageSize:10,"category_pid":catId},"","");
                } else {
                    message.error(res.message);
                }
            });
    }

    //获取数据
    const fetchData = async (params, sort, filter) => {
        let requestParam = {
            startIndex: params.current,
            perPage: params.pageSize,
            ...params
        }
        const result = await HttpService.post('reportServer/itemCategory/getAllPage', JSON.stringify(requestParam));
        return Promise.resolve({
            data: result.data.list,
            total: result.data.total,
            success: result.resultCode == "1000"
        });
        // 刷新
        ref.current.reload();
    }
    const onTreeSelect = (item) => {
        if (catId !== item.item) {
            setCatId(item.category_id);
        }
    }
    //定义列
    const columns = [
        {
            title: '编码',
            dataIndex: 'category_code',
            valueType: 'text',
            align:"center"
        },
        {
            title: '名称',
            dataIndex: 'category_name',
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
                <Button shape="circle" type="text" onClick={() => history.push('/mdm/itemCategory/itemCategory/'+`${record.category_id}`+'/null')}
                 icon={<PlusCircleOutlined />}>
                </Button>,
                <Button shape="circle" type="text" onClick={() => history.push('/mdm/itemCategory/itemCategory/'+`${record.category_id}`+'/'+`${record.category_id}`)}
                 icon={<FormOutlined />}>
                    </Button>,
                <Button shape="circle" danger type="text" onClick={() => onDeleteClickListener([record.category_id])} icon={<MinusCircleOutlined />}></Button>,
            ]
        },
    ];

    return (
        <SplitPane split="vertical"  minSize={10} defaultSize={200} style={{minHeight:minHeight,overflow:'auto',margin:'-15px'}}>
            <Tree
                defaultExpandAll
                style={{ width: "100%", minHeight: "450px", padding: "10px" ,minHeight:minHeight,overflow:'auto' }}
                showLine
                treeData={treeData}
                titleRender={(item) => {
                    return (<div style={{ width: "100%" }} key={item.category_id}>
                        <span onClick={() => {
                            onTreeSelect(item);
                        }}>{item.category_name}</span>
                    </div>)
                }}
            >
            </Tree>
        
            <ProTable
                actionRef={ref}
                columns={columns}
                request={fetchData}
                rowKey="category_id"
                params={{ category_pid: catId }}
                rowSelection={{
                    // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
                    // 注释该行则默认不显示下拉选项
                    //selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                }}
                tableAlertRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => (
                    <Space size={24}>
                        <span>
                            已选 {selectedRowKeys.length} 项
                            <a style={{ marginLeft: 8, }} onClick={onCleanSelected} > 取消选择 </a>
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
                    <Button type="primary" onClick={() => history.push('/mdm/itemCategory/itemCategory/null/null')}>
                    新建
                    </Button>
                ]}
            />
        </SplitPane>
    );
}

export default itemCategoryList;