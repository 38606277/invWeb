//选择仓库的对话框
import React, { useState, useEffect, useRef } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { Button, Space, Modal, message, Row, TreeSelect, Tree, Col,Cascader,Input, Pagination  } from 'antd';
import { EllipsisOutlined, QuestionCircleOutlined, SearchOutlined,PlusCircleOutlined,FormOutlined ,MinusCircleOutlined,CloseCircleOutlined } from '@ant-design/icons';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import HttpService from '@/utils/HttpService.jsx';

const Search = Input.Search;

const SelectItemCategoryDialog = (props) => {

    const { modalVisible, handleOk, handleCancel } = props;
    const [checkKeys, setCheckKeys] = useState([]);
    const [checkRows, setCheckRows] = useState([]);
    const [treeData, setTreeData] = useState([]);
    const [columnData, setColumnData] = useState([]);
    const [catId, setCatId] = useState('-1');// 用于编辑赋初始值
    const [checkVal , setCheckVal] = useState([]);

    const selectType = props?.selectType || 'radio';

    //重置选中状态
    useEffect(() => {
        setCheckKeys([]);
        setCheckRows([]);
        onTreeSelect('-1');
        setCheckVal(['-1']);
        refreshData();
    }, [modalVisible])

 

    const getAllChildrenRecursionById = (catId) => {
        HttpService.post('reportServer/itemCategory/getAllList',JSON.stringify({"category_pid":catId}))
            .then(res => {
                if (res.resultCode === "1000") {
                    if(null!=res.data){
                      if(res.data.length>0){
                        const caiid=res.data[0].category_id;
                        onTreeSelect(caiid);
                        setCheckVal([]);
                        setCheckVal([caiid]);
                        setCatId(caiid)
                        setTreeData(res.data)
                      }
                    }
                    
                } else {
                    message.error(res.message);
                }
            });
    }
    const columns = [
        {
            title: '描述',
            dataIndex: 'item_description',
            valueType: 'text',
            align:"center"
        }
    ];
    const refreshData = () => {
        getAllChildrenRecursionById("-1");
        setColumnData(columns);
    }

    //获取数据
    const fetchData = async (params, sort, filter) => {
        let requestParam = {
            startIndex: params.current,
            perPage: params.pageSize,
            item_description:params.keyword,
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
      const selectOnChange = (selectedKeys, selectedRows) => {
        setCheckKeys(selectedKeys);
        setCheckRows(selectedRows)
        // console.log('selectedKeys', selectedKeys)
        // console.log('selectedRows', selectedRows)
    }
    const exdefault={
        label:"category_name",
        value:"category_id",
        children:"children"
    }
    const isCheck = (userId) => {
        for (let index in checkKeys) {
            if (checkKeys[index] === userId) {
                return true;
            }
        }
        return false;
    }
    return (
        <Modal title="选择类别" visible={modalVisible} onOk={() => {
            if (0 < checkKeys.length) {
                if (selectType === 'radio') {
                    handleOk(checkRows[0], checkKeys[0])
                } else {
                    handleOk(checkRows, checkKeys)
                }
            } else {
                handleCancel();
            }
        }} onCancel={handleCancel}>

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
                                onRow={record => {
                                return {
                                    // 点击行
                                    onClick: event => {
        
                                        if (selectType === 'radio') {
                                            setCheckKeys([record.item_id])
                                            setCheckRows([record])
                                        } else {
                                            //有取消的情况
                                            if (isCheck(record.item_id)) { // 选中则移除
                                                //移除key
                                                const newCheckKeys = checkKeys.filter((item) => {
                                                    return item !== record.item_id;
                                                })
        
                                                //移除record
                                                const newCheckRows = checkRows.filter((item) => {
                                                    return item.item_id !== record.item_id;
                                                })
        
                                                setCheckKeys(newCheckKeys);
                                                setCheckRows(newCheckRows);
                                            } else { // 未选中则添加
                                                setCheckKeys([...checkKeys, record.item_id]);
                                                setCheckRows([...checkRows, record]);
                                            }
                                        }
                                    },
                                };
                            }}
                                columns={columnData}
                                request={fetchData}
                                rowKey="item_id"
                                align="center"
                                params={{ item_category_id: catId }}
                                rowSelection={{
                                    type: selectType,
                                    onChange: selectOnChange,
                                    selectedRowKeys: checkKeys
                                }}
                                tableAlertRender={false}
                                tableAlertOptionRender={false}
            
                                pagination={{
                                    showQuickJumper: true,
                                }}
                                options={{
                                    search: true,
                                }}
                                search={false}
                                dateFormatter="string"
                            />
                        </Col>
                        </Row> 
                    </div>
        </Modal>
    );
}
export default SelectItemCategoryDialog;