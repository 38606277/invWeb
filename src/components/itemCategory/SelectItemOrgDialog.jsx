//选择仓库的对话框
import React, { useState, useEffect, useRef } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { Button, Space, Modal, message, Row, TreeSelect, Tree, Col, Cascader, Input, Pagination } from 'antd';
import { EllipsisOutlined, QuestionCircleOutlined, SearchOutlined, PlusCircleOutlined, FormOutlined, MinusCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import HttpService from '@/utils/HttpService.jsx';
import 'antd/dist/antd.css';

const Search = Input.Search;

const SelectItemCategoryDialog = (props) => {

    const { modalVisible, handleOk, handleCancel ,orgid} = props;
    const [checkKeys, setCheckKeys] = useState([]);
    const [checkRows, setCheckRows] = useState([]);
    const [treeData, setTreeData] = useState([]);
    const [columnData, setColumnData] = useState([]);
    const [catId, setCatId] = useState('-1');// 用于编辑赋初始值
    const [catname, setCatname] = useState('');// 用于编辑赋初始值
    const [checkVal, setCheckVal] = useState([]);

    const selectType = props?.selectType || 'radio';
    const categoryId = props?.categoryId || '-1';

    //重置选中状态
    useEffect(() => {
        setCheckKeys([]);
        setCheckRows([]);
        onTreeSelect('-1');
         setCheckVal(['-1']);
        if (categoryId == '-1') {
            refreshData();
        }
        setCatId(categoryId)
    }, [modalVisible])

    const getAllChildrenRecursionById = (catId) => {
        HttpService.post('reportServer/itemCategory/getAllList', JSON.stringify({ "category_pid": catId }))
            .then(res => {
                if (res.resultCode === "1000") {
                    if (null != res.data) {
                        if (res.data.length > 0) {
                            const caiid = res.data[0].children[0].category_id;
                            const catname = res.data[0].children[0].category_name;
                            onTreeSelect(caiid);
                             setCheckVal([]);
                             setCheckVal([caiid]);
                            setCatId(caiid)
                            setCatname(catname)
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
            align: "center"
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
            item_description: params.keyword,
            org_id:orgid,
            ...params
        }
        const result = await HttpService.post('reportServer/inventory/getAllPage', JSON.stringify(requestParam));
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
            align: "center"
        }];
       
        if (catId !== category_id && '-1' != category_id) {
            setCheckVal([]);
            setCheckVal([category_id]);
            setColumnData([]);
            setCatId(category_id);
            let params = {
                "category_id": category_id
            }
            HttpService.post('reportServer/itemCategory/getItemCategoryByID', JSON.stringify(params))
                .then(res => {
                    if (res.resultCode == "1000") {
                        const resultlist = res.data.lineForm;
                        resultlist.map((item, index) => {
                            let json = {
                                key: item.segment.toLowerCase(),
                                title: item.segment_name,
                                dataIndex: item.segment.toLowerCase(),
                                valueType: 'text',
                                align: "center"
                            };
                            outlist.push(json);
                        });
                        setColumnData(outlist);

                    } else {
                        message.error(res.message);
                    }
                })
        }else if('-1' == category_id){
            setCheckVal([]);
            setCheckVal([category_id]);
            setColumnData(outlist);
            setCatId(category_id);
        }
    }

    const selectOnChange = (selectedKeys, selectedRows) => {
        setCheckKeys(selectedKeys);
        setCheckRows(selectedRows)
    }
    const exdefault = {
        label: "category_name",
        value: "category_id",
        children: "children"
    }
    const isCheck = (userId) => {
        for (let index in checkKeys) {
            if (checkKeys[index] === userId) {
                return true;
            }
        }
        return false;
    }
    const onSelectTree = (selectedKeys,e) => {
        if(selectedKeys.length>0){
            onTreeSelect(selectedKeys[0])
        }
        
    }
    const columnslist = [
        {
            title: '商品描述',
            dataIndex: 'item_description',
            valueType: 'text',
            align:"center"
        },
        {
            title: '物料名称',
            dataIndex: 'category_name',
            valueType: 'text',
            align:"center"
        },
        {
            title: '数量',
            dataIndex: 'on_hand_quantity',
            valueType: 'text',
            align:"center"
        },
        {
            title: '单价',
            dataIndex: 'price',
            valueType: 'text',
            align:"center"
        },
        {
            title: '仓库',
            dataIndex: 'org_name',
            valueType: 'text',
            align:"center"
        }
    ];
    return (
        <Modal title="选择类别"
        width={1000}
         visible={modalVisible} onOk={() => {
            if (0 < checkKeys.length) {
                if (selectType === 'radio') {
                    handleOk(checkRows[0], checkKeys[0], columnData, catId, catname)
                } else {
                    handleOk(checkRows, checkKeys, columnData, catId, catname)
                }
            } else {
                handleCancel();
            }
        }} onCancel={handleCancel}>

            <div style={{ marginTop: '6px' }}>
                <Row>
                    <Col  span={4}>
                        <Tree
                            defaultExpandAll="true"
                            style={{
                                width: '100%',
                                minHeight: '450px',
                                padding: '10px',
                                overflow: 'auto',
                                maxHeight: '900px',
                            }}
                            selectedKeys={checkVal}
                            showLine
                            treeData={treeData}
                            onSelect={onSelectTree}
                            titleRender={(item) => {
                            return (
                                <div style={{ width: '100%' }} key={item.category_id}>
                                <span>
                                    {item.category_name}
                                </span>
                                </div>
                            );
                            }}
                        ></Tree>
                    </Col>
                    <Col span={20}>
                        <ProTable
                            onRow={record => {
                                return record.on_hand_quantity >0?{
                                    // 点击行
                                    onClick: event => {

                                        if (selectType === 'radio') {
                                            setCheckKeys([record.tempid])
                                            setCheckRows([record])
                                        } else {
                                            //有取消的情况
                                            if (isCheck(record.tempid)) { // 选中则移除
                                                //移除key
                                                const newCheckKeys = checkKeys.filter((item) => {
                                                    return item !== record.tempid;
                                                })

                                                //移除record
                                                const newCheckRows = checkRows.filter((item) => {
                                                    return item.tempid !== record.tempid;
                                                })

                                                setCheckKeys(newCheckKeys);
                                                setCheckRows(newCheckRows);
                                            } else { // 未选中则添加
                                                setCheckKeys([...checkKeys, record.tempid]);
                                                setCheckRows([...checkRows, record]);
                                            }
                                        }
                                    },
                                }:"";
                            }}
                            columns={columnslist}
                            request={fetchData}
                            rowKey="tempid"
                            align="center"
                            params={{ item_category_id: catId }}
                            rowSelection={{
                                type: selectType,
                                onChange: selectOnChange,
                                selectedRowKeys: checkKeys,
                                getCheckboxProps: (record) => (
                                    {
                                        disabled: record.on_hand_quantity >0?false:true, // Column configuration not to be checked
                                }),
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