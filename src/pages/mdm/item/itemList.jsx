import React, { useEffect, useRef, useState } from 'react';
import { Button, Space, Modal, message, Row, TreeSelect, Tree, Col,Cascader  } from 'antd';
import { EllipsisOutlined, QuestionCircleOutlined, SearchOutlined,PlusCircleOutlined,FormOutlined ,MinusCircleOutlined,CloseCircleOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { history } from 'umi';


import HttpService from '@/utils/HttpService.jsx';

const { confirm } = Modal;

const itemList = (props) => {

    const ref = useRef();
    const [visible, setVisible] = useState(false);
    const [initColData, setInitColData] = useState({});
    const [treeData, setTreeData] = useState([]);
    const [columnData, setColumnData] = useState([]);
    const [catId, setCatId] = useState('-1');// 用于编辑赋初始值
    const [checkVal , setCheckVal] = useState([]);

    const getAllChildrenRecursionById = (catId) => {
        HttpService.post('reportServer/itemCategory/getAllList',JSON.stringify({"category_pid":catId}))
            .then(res => {
                if (res.resultCode === "1000") {
                    if(null!=res.data){

                       // onTreeSelect(res.data[0]);
                    }
                    setTreeData(res.data)
                } else {
                    message.error(res.message);
                }
            });
    }
    const columns = [
        // {
        //     title: '类别名称',
        //     dataIndex: 'dict_code',
        //     valueType: 'text',
        //     align:"center"
        // },
        {
            title: '描述',
            dataIndex: 'item_description',
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
                <Button type="text" onClick={() => history.push('/mdm/item/item/'+`${record.item_category_id}`+'/'+`${record.item_id}`)}>
                      编辑
                    </Button>,
                <Button type="text" danger onClick={() => onDeleteClickListener([record.dict_id])} >删除</Button>,
            ]
        },
    ];
    const refreshData = () => {
        getAllChildrenRecursionById("-1");
        setColumnData(columns);
    }
    useEffect(() => {
        if ("null" != props.match.params.category_id && "" != props.match.params.category_id) {
            setCatId(props.match.params.category_id);
            onTreeSelect(props.match.params.category_id);
            setCheckVal([]);
            setCheckVal([props.match.params.category_id]);
        }
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
    const onTreeSelect = (category_id) => {
        const outlist = [{
            title: '描述',
            dataIndex: 'item_description',
            valueType: 'text',
            align:"center"
        }];
        setColumnData([]);
        if (catId !== category_id) {
            let params = {
                "category_id":category_id
            }
            HttpService.post('reportServer/itemCategory/getAllPageById', JSON.stringify(params))
            .then(res => {
                if (res.resultCode == "1000") {
                    const resultlist=res.data.list;
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
                            
                            <Button shape="circle" onClick={() => history.push('/mdm/item/item/'+`${record.item_category_id}`+'/'+`${record.item_id}`)}
                            icon={<FormOutlined />}>
                                </Button>,
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
    const onChangeOption = (value, selectedOptions) => {
        setCheckVal();
        setCheckVal(value);
        const catidd=selectedOptions[selectedOptions.length-1]["category_id"];
        setCatId(catidd)
        onTreeSelect(catidd);
      }
    
      const exdefault={
        label:"category_name",
        value:"category_id",
        children:"children"
      }
    return (
        <div style={{ marginTop: '16px' }}>
            <Row>
                <Col xs={24} sm={24}>
                    物料类别： <Cascader 
                    options={treeData} 
                    placeholder="请选择类别" 
                    onChange={onChangeOption} 
                    value={checkVal}
                    changeOnSelect
                    allowClear={false} 
                    fieldNames={exdefault}/>
               </Col>
               </Row>
               <Row>
                   <Col xs={24} sm={24}>
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
        </div>
    );
}

export default itemList;