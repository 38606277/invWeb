import React, { useEffect, useRef, useState } from 'react';
import { Button, Space, Modal, message, Row, TreeSelect, Tree, Col, Cascader, Switch, Select } from 'antd';
import { EllipsisOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { history } from 'umi';
import SplitPane from 'react-split-pane';
import './style.less';
import HttpService from '@/utils/HttpService.jsx';
import InventoryRulesDialog from '@/components/Inventory/InventoryRulesDialog'




const inventoryList = () => {

    const ref = useRef();
    const [treeData, setTreeData] = useState([]);
    const [columnData, setColumnData] = useState([]);
    const [catId, setCatId] = useState('-1'); // 用于编辑赋初始值
    const [checkVal, setCheckVal] = useState([]);

    const [inventoryRulesDialogVisible, setInventoryRulesDialogVisible] = useState(false);


    const [minHeight, setMinHeight] = useState(window.innerHeight - 92 + 'px'); // 用于编辑赋初始值

    const [orientation, setOrientation] = useState(false);

    const [mergeColumn, setMergeColumn] = useState('segment1');

    const [segmentOption, setSegmentOption] = useState([]);


    const getAllChildrenRecursionById = (catId) => {
        HttpService.post(
            'reportServer/itemCategory/getAllList',
            JSON.stringify({ category_pid: catId }),
        ).then((res) => {
            if (res.resultCode === '1000') {
                if (null != res.data) {
                    if (res.data.length > 0) {
                        const caiid = res.data[0].children[0].category_id;
                        onTreeSelect(caiid);
                        setCheckVal([caiid]);
                        setCatId(caiid)
                        setTreeData(res.data)
                    }
                }
            } else {
                message.error(res.message);
            }
        });
    };

    const refreshData = () => {
        getAllChildrenRecursionById('-1');
    };
    useEffect(() => {
        refreshData();
    }, []);
    const onSelectTree = (selectedKeys, e) => {
        if (selectedKeys.length > 0) {
            if (catId !== selectedKeys[0]) {
                onTreeSelect(selectedKeys[0])
            }

        }

    }

    const getItemCategoryById2 = (category_id, segment) => {
        //获取合并列
        let params = {
            "category_id": category_id,
            "segment": segment
        }

        HttpService.post('reportServer/itemCategory/getItemCategoryById2', JSON.stringify(params))
            .then(res => {
                if (res.resultCode == "1000") {
                    const resultlist = res.data;
                    let segmentOptionList = [];
                    resultlist.map((item, index) => {
                        segmentOptionList.push({ label: item.title, value: item.dataIndex });
                    });
                    setColumnData(resultlist);
                    setSegmentOption(segmentOptionList);
                    ref.current.reload()
                } else {
                    message.error(res.message);
                }
            })
    }


    const onTreeSelect = (category_id) => {
        const outlist = [{
            title: '商品描述',
            dataIndex: 'item_description',
            valueType: 'text',
            align: "center"
        },
        {
            title: '物料名称',
            dataIndex: 'category_name',
            valueType: 'text',
            align: "center"
        },
        {
            title: '数量',
            dataIndex: 'on_hand_quantity',
            valueType: 'text',
            align: "center"
        },
        {
            title: '单价',
            dataIndex: 'price',
            valueType: 'text',
            align: "center"
        },
        {
            title: '总金额',
            dataIndex: 'amount',
            valueType: 'text',
            align: "center"
        },
        {
            title: '预警最大值',
            dataIndex: 'max',
            valueType: 'text',
            align: "center"
        },
        {
            title: '预警最小值',
            dataIndex: 'min',
            valueType: 'text',
            align: "center"
        },
        {
            title: '仓库',
            dataIndex: 'org_name',
            valueType: 'text',
            align: "center"
        }];

        setCheckVal([category_id]);
        setColumnData([]);
        setCatId(category_id);

        if (catId !== category_id && '-1' != category_id && orientation) {//合并列
            setMergeColumn('segment1')
            getItemCategoryById2(category_id, mergeColumn);

        } else {
            if ('-1' != category_id) {
                if (catId !== category_id) {
                    setMergeColumn('segment1')
                }
                let params = {
                    "category_id": category_id
                }
                HttpService.post('reportServer/itemCategory/getItemCategoryByID', JSON.stringify(params))
                    .then(res => {
                        if (res.resultCode == "1000") {
                            const resultlist = res.data.lineForm;
                            let segmentOptionList = [];
                            resultlist.map((item, index) => {
                                let json = {
                                    key: item.segment.toLowerCase(),
                                    title: item.segment_name,
                                    dataIndex: item.segment.toLowerCase(),
                                    valueType: 'text',
                                    align: "center",
                                };

                                segmentOptionList.push({ label: item.segment_name, value: item.segment });
                                outlist.push(json);
                            });


                            outlist.push({
                                title: '操作',
                                key: 'option',
                                valueType: 'option',
                                render: (text, record) => [
                                    <a onClick={() => {
                                        setInventoryRulesDialogVisible(true)
                                    }}
                                    >
                                        设置
                            </a>
                                ],
                            })

                            setColumnData(outlist);
                            setSegmentOption(segmentOptionList);

                            ref.current.reload()
                        } else {
                            message.error(res.message);
                        }
                    })
            } else if ('-1' == category_id) {
                setCheckVal([category_id]);

                outlist.push({
                    title: '操作',
                    key: 'option',
                    valueType: 'option',
                    render: (text, record) => [
                        <a onClick={() => {
                            setInventoryRulesDialogVisible(true)
                        }}
                        >
                            设置
                </a>
                    ],
                })
                setColumnData(outlist);
                setCatId(category_id);
            }
        }
    }

    //获取数据
    const fetchData = async (params, sort, filter) => {
        let requestParam = {
            startIndex: params.current,
            perPage: params.pageSize,
            ...params
        }
        let url = 'reportServer/inventory/getAllPage';
        if ('-1' != catId && orientation && mergeColumn != null) {
            requestParam.item_category_id = catId;
            requestParam.segment = mergeColumn;
            url = 'reportServer/inventory/getAllPage2';
        } else {
            if ('-1' != catId) {
                requestParam.item_category_id = catId;
            }

        }
        const result = await HttpService.post(url, JSON.stringify(requestParam));
        return Promise.resolve({
            data: result.data.list,
            total: result.data.total,
            success: result.resultCode == "1000"
        });
    }
    return (
        <PageContainer ghost="true" title="分类列表">
            <div style={{ backgroundColor: 'white' }}>
                <SplitPane split="vertical" minSize={0} defaultSize={180} style={{ minHeight: minHeight, overflow: 'auto' }}>
                    <Tree
                        defaultExpandAll="true"
                        style={{
                            width: '100%',
                            minHeight: '450px',
                            padding: '10px',
                            overflow: 'auto',
                            maxHeight: minHeight,
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
                    <ProTable
                        bordered
                        style={{ height: '100%' }}
                        actionRef={ref}
                        columns={columnData}
                        request={fetchData}
                        rowKey="id"
                        align="center"
                        pagination={{
                            showQuickJumper: true,
                        }}
                        search={{
                            defaultCollapsed: true,
                        }}
                        dateFormatter="string"
                        headerTitle="库存列表"

                        toolbar={{
                            search: {
                                onSearch: (value) => {
                                    alert(value);
                                },
                            },
                            actions: [
                                <Switch
                                    disabled={'-1' == catId}
                                    checkedChildren="合并"
                                    unCheckedChildren="默认"
                                    checked={orientation}
                                    onChange={(checked) => {
                                        setOrientation(checked)

                                        if (checked) {
                                            getItemCategoryById2(catId, mergeColumn)
                                        } else {
                                            onTreeSelect(catId)
                                        }

                                    }} />,
                                <Select
                                    value={mergeColumn}
                                    disabled={!orientation || '-1' == catId}
                                    style={{ width: 120 }}
                                    onChange={(value) => {
                                        setMergeColumn(value);
                                        getItemCategoryById2(catId, value)
                                    }}
                                    options={segmentOption}
                                />
                            ]
                        }}


                    />
                </SplitPane>
            </div>

            <InventoryRulesDialog
                //categoryId={categoryId}
                modalVisible={inventoryRulesDialogVisible}
                handleOk={(resultList) => {

                    setInventoryRulesDialogVisible(false);
                }}
                handleCancel={() => {
                    setInventoryRulesDialogVisible(false);
                }}
            />

        </PageContainer>


    );
}

export default inventoryList;