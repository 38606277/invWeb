import React, { useEffect, useRef, useState } from 'react';
import { Button, Space, Modal, message, Row, TreeSelect, Tree, Col } from 'antd';
import { EllipsisOutlined, QuestionCircleOutlined, SearchOutlined,PlusCircleOutlined,FormOutlined ,MinusCircleOutlined,CloseCircleOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { history } from 'umi';


import HttpService from '@/utils/HttpService.jsx';

const { confirm } = Modal;

const itemList = () => {

    const ref = useRef();
    const [visible, setVisible] = useState(false);
    const [initData, setInitData] = useState({});
    const [treeData, setTreeData] = useState([]);
    const [columnData, setColumnData] = useState([]);
    const [catId, setCatId] = useState('-1');// 用于编辑赋初始值

    const getAllChildrenRecursionById = (catId) => {
        HttpService.post('reportServer/itemCategory/getAllList',JSON.stringify({"category_pid":catId}))
            .then(res => {
                if (res.resultCode === "1000") {
                    if(null!=res.data){
                        onTreeSelect(res.data[0].children[0]);
                    }
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
        HttpService.post('reportServer/item/deleteItemById', JSON.stringify({ item_id: selectedRowKeys.toString() }))
            .then(res => {
                if (res.resultCode == "1000") {
                    //刷新
                    // 清空选中项
                    fetchData({current:0,pageSize:10,"item_category_pid":catId},"","");
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
        const result = await HttpService.post('reportServer/item/getAllPage', JSON.stringify(requestParam));
        return Promise.resolve({
            data: result.data.list,
            total: result.data.total,
            success: result.resultCode == "1000"
        });
    }
    const onTreeSelect = (item) => {
        console.log(item);
        const outlist = [];
        if (catId !== item.item) {
            setCatId(item.category_id);
            let params = {
                "category_id":item.category_id
            }
            HttpService.post('reportServer/itemCategory/getAllPageById', JSON.stringify(params))
            .then(res => {
                if (res.resultCode == "1000") {
                    const resultlist=res.data;
                    resultlist.map((item, index) => {
                        let json = {
                            key: item.segment.toLowerCase(), 
                            title: item.segment_name, 
                            dataIndex: item.segment.toLowerCase(),
                            valueType:'text',
                            align:"center"
                        };
                        outlist.push(json);
                    });
                   let option= {
                        title: '操作',
                        width: 180,
                        key: 'option',
                        align:"center",
                        valueType: 'option',
                        render: (text, record) => [
                            
                            // <Button shape="circle" onClick={() => history.push('/mdm/item/item/'+`${record.category_id}`+'/'+`${record.item_id}`)}
                            // icon={<FormOutlined />}>
                            //     </Button>,
                            <Button shape="circle" danger type="text" onClick={() => onDeleteClickListener([record.item_id])} icon={<CloseCircleOutlined />}></Button>,
                        ]
                    }
                    outlist.push(option);
                    setColumnData(outlist);
                    
                } else {
                    message.error(res.message);
                }
            })
        }
    }

    return (
        <Row style={{ marginTop: '16px' }}>
                <Col xs={24} sm={6}>
                    <Tree
                        defaultExpandAll
                        style={{ width: "100%", minHeight: "450px", padding: "24px" }}
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
                </Col>
                <Col xs={24} sm={1}></Col>
                <Col xs={24} sm={17}>
                    <ProTable
                        actionRef={ref}
                        columns={columnData}
                        request={fetchData}
                        rowKey="id"
                        align="center"
                        params={{ item_category_id: catId }}
                        rowSelection={{
                            // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
                            // 注释该行则默认不显示下拉选项
                            //selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                        }}
                        tableAlertRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => (
                            <Space size={24}>
                                <span>  已选 {selectedRowKeys.length} 项
                                    <a style={{ marginLeft: 8 }} onClick={onCleanSelected}>取消选择</a>
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
                        headerTitle="物料管理列表"
                        toolBarRender={(action, { selectedRows }) => [
                            <Button type="primary" onClick={() => history.push('/mdm/item/item/'+catId+'/null')}>
                            新建
                            </Button>
                        ]}
                    />
                </Col>
            </Row>
    );
}

export default itemList;