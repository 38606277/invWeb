import React, { useEffect, useRef, useState } from 'react';
import { Button, Space, Modal, message, Row, TreeSelect, Tree, Col, Cascader } from 'antd';
import { EllipsisOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { history } from 'umi';
import SplitPane from 'react-split-pane';
import './style.less';
import HttpService from '@/utils/HttpService.jsx';

//获取数据
const fetchData = async (params, sort, filter) => {
    let requestParam = {
        startIndex: params.current,
        perPage: params.pageSize,
        ...params
    }
    const result = await HttpService.post('reportServer/inventory/getAllPage', JSON.stringify(requestParam));
    return Promise.resolve({
        data: result.data.list,
        total: result.data.total,
        success: result.resultCode == "1000"
    });
}

const inventoryList = () => {

    const ref = useRef();
    const [treeData, setTreeData] = useState([]);
    const [columnData, setColumnData] = useState([]);
    const [catId, setCatId] = useState('-1'); // 用于编辑赋初始值
    const [checkVal, setCheckVal] = useState([]);
    const [minHeight, setMinHeight] = useState(window.innerHeight - 92 + 'px'); // 用于编辑赋初始值

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
      const onSelectTree = (selectedKeys,e) => {
        if(selectedKeys.length>0){
            onTreeSelect(selectedKeys[0])
        }
        
    }
    const onTreeSelect = (category_id) => {
        const outlist = [{
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
            title: '总金额',
            dataIndex: 'amount',
            valueType: 'text',
            align:"center"
        },
        {
            title: '预警最大值',
            dataIndex: 'max',
            valueType: 'text',
            align:"center"
        },
        {
            title: '预警最小值',
            dataIndex: 'min',
            valueType: 'text',
            align:"center"
        },
        {
            title: '仓库',
            dataIndex: 'org_name',
            valueType: 'text',
            align:"center"
        }];
       
        if (catId !== category_id && '-1' != category_id) {
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
            setCheckVal([category_id]);
            setColumnData(outlist);
            setCatId(category_id);
        }
    }
    //定义列
    const columns = [
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
            title: '总金额',
            dataIndex: 'amount',
            valueType: 'text',
            align:"center"
        },
        {
            title: '预警最大值',
            dataIndex: 'max',
            valueType: 'text',
            align:"center"
        },
        {
            title: '预警最小值',
            dataIndex: 'min',
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
        <PageContainer ghost="true" title="分类列表">
      <div style={{ backgroundColor: 'white' }}>
        <SplitPane split="vertical" minSize={0} defaultSize={180}  style={{minHeight:minHeight,overflow:'auto'}}>
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
            style={{ height: '100%' }}
            actionRef={ref}
            columns={columnData}
            request={fetchData}
            rowKey="id"
            align="center"
            params={{ item_id: catId }}
            pagination={{
              showQuickJumper: true,
            }}
            search={{
              defaultCollapsed: true,
            }}
            dateFormatter="string"
            headerTitle="库存列表"
          />
        </SplitPane>
      </div>
    </PageContainer>
            // <ProTable
            //     actionRef={ref}
            //     columns={columns}
            //     request={fetchData}
            //     rowKey="id"
            //     pagination={{
            //         showQuickJumper: true,
            //     }}
            //     search={{
            //         defaultCollapsed: true
            //     }}
            //     dateFormatter="string"
            //     headerTitle="库存列表"
            // />

    );
}

export default inventoryList;