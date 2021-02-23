import React, { useEffect, useRef, useState } from 'react';
import {
  Menu,
  Button,
  Space,
  Modal,
  message,
  Row,
  Dropdown,
  Select,
  TreeSelect,
  Tree,
  Col,
  Cascader,
  Tooltip,
} from 'antd';
import {
  EllipsisOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  PlusCircleOutlined,
  FormOutlined,
  MinusCircleOutlined,
  CloseCircleOutlined,
  DownOutlined,
  UserOutlined,
} from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import ProCard from '@ant-design/pro-card';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { history } from 'umi';
import SplitPane from 'react-split-pane';

const { Option } = Select;
// import '../itemCategory/index.less';

import HttpService from '@/utils/HttpService.jsx';

const { confirm } = Modal;

function handleButtonClick(e) {
  message.info('Click on left button.');
  console.log('click left button', e);
}

function handleMenuClick(e) {
  message.info('Click on menu item.');
  console.log('click', e);
}
function handleChange(value) {
  console.log(`selected ${value}`);
}

const inventoryQuery = (props) => {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  const [initColData, setInitColData] = useState({});
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
          console.log(res.data);
          if (res.data.length > 0) {
            // const caiid=res.data[0].category_id;
            // onTreeSelect(caiid);
            setCheckVal([]);
            // setCheckVal([caiid]);
            // setCatId(caiid)
            setTreeData(res.data);
          }
        }
      } else {
        message.error(res.message);
      }
    });
  };
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
      align: 'center',
    },
    {
      title: '操作',
      width: 180,
      key: 'option',
      valueType: 'option',
      align: 'center',
      render: (text, record) => [
        <Button
          type="text"
          onClick={() =>
            history.push(
              '/mdm/item/item/' + `${record.item_category_id}` + '/' + `${record.item_id}`,
            )
          }
        >
          编辑
        </Button>,
        <Button type="text" danger onClick={() => onDeleteClickListener(ref, [record.dict_id])}>
          删除
        </Button>,
      ],
    },
  ];

  const refreshData = () => {
    getAllChildrenRecursionById('-1');
    setColumnData(columns);
  };
  useEffect(() => {
    if (
      'null' != props.match.params.category_id &&
      '-1' != props.match.params.category_id &&
      '' != props.match.params.category_id
    ) {
      setCatId(props.match.params.category_id);
      onTreeSelect(props.match.params.category_id);
      setCheckVal([]);
      setCheckVal([props.match.params.category_id]);
    } else {
      setColumnData(columns);
    }
    refreshData();
  }, []);

  //获取数据
  const fetchData = async (params, sort, filter) => {
    let requestParam = {
      startIndex: params.current,
      perPage: params.pageSize,
      ...params,
    };
    const result = await HttpService.post(
      'reportServer/item/getAllPage',
      JSON.stringify(requestParam),
    );
    return Promise.resolve({
      data: result.data.list,
      total: result.data.total,
      success: result.resultCode == '1000',
    });
  };
  const onTreeSelect = (category_id) => {
    setCheckVal();
    setCheckVal(category_id);
    const outlist = [
      {
        title: '描述',
        dataIndex: 'item_description',
        valueType: 'text',
        align: 'center',
      },
    ];
    if (catId !== category_id && '-1' != category_id) {
      setColumnData([]);
      setCatId(category_id);
      let params = {
        category_id: category_id,
      };
      HttpService.post(
        'reportServer/itemCategory/getItemCategoryByID',
        JSON.stringify(params),
      ).then((res) => {
        if (res.resultCode == '1000') {
          const resultlist = res.data.lineForm;
          resultlist.map((item, index) => {
            if (item.segment_name == '尺码') {
            } else {
            }
            let json = {
              key: item.segment.toLowerCase(),
              title: item.segment_name,
              dataIndex: item.segment.toLowerCase(),
              valueType: 'text',
              align: 'center',
              children: [
                {
                  title: 'XL',
                  dataIndex: 'companyAddress',
                  key: 'companyAddress',
                  width: 200,
                },
                {
                  title: 'XXL',
                  dataIndex: 'companyName',
                  key: 'companyName',
                },
              ],
            };
            outlist.push(json);
          });
          // const resultlist2 = res.data.list2;
          // resultlist2.map((item, index) => {
          //   let json = {
          //     key: item.segment.toLowerCase(),
          //     title: item.segment_name,
          //     dataIndex: item.segment.toLowerCase(),
          //     valueType: 'text',
          //     align: 'center',
          //   };
          //   outlist.push(json);
          // });
          let option = {
            title: '操作',
            width: 180,
            key: 'option',
            align: 'center',
            valueType: 'option',
            render: (text, record) => [
              <Button
                shape="circle"
                onClick={() =>
                  history.push(
                    '/mdm/item/item/' + `${record.item_category_id}` + '/' + `${record.item_id}`,
                  )
                }
                icon={<FormOutlined />}
              ></Button>,
              <Button
                shape="circle"
                danger
                type="text"
                onClick={() => onDeleteClickListener(ref, [record.item_id])}
                icon={<CloseCircleOutlined />}
              ></Button>,
            ],
          };
          outlist.push(option);
          setColumnData(outlist);
        } else {
          message.error(res.message);
        }
      });
    } else if ('-1' == category_id) {
      setColumnData(outlist);
    }
  };

  return (
    <PageContainer ghost="true" title="商品列表">
      {/* <ProCard> */}
      <div style={{ backgroundColor: 'white' }}>
        <SplitPane
          split="vertical"
          minSize={0}
          defaultSize={180}
          style={{ minHeight: minHeight, overflow: 'auto' }}
        >
          <Tree
            defaultExpandAll="true"
            style={{
              width: '100%',
              minHeight: '450px',
              padding: '10px',
              minHeight: minHeight,
              overflow: 'auto',
            }}
            showLine
            treeData={treeData}
            titleRender={(item) => {
              return (
                <div style={{ width: '100%' }} key={item.category_id}>
                  <span
                    onClick={() => {
                      onTreeSelect(item.category_id);
                    }}
                  >
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
            rowKey="item_id"
            align="center"
            tooltip={{ setting: false }}
            params={{ item_category_id: catId }}
            rowSelection={
              {
                // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
                // 注释该行则默认不显示下拉选项
                //selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
              }
            }
            tableAlertRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => (
              <Space size={24}>
                <span>
                  {' '}
                  已选 {selectedRowKeys.length} 项
                  <a style={{ marginLeft: 8 }} onClick={onCleanSelected}>
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
              defaultCollapsed: true,
            }}
            options={{ fullScreen: false, setting: false, reload: false, density: false }}
            dateFormatter="string"
            headerTitle="物料管理列表"
            toolBarRender={(action, { selectedRows }) => [
              <Select defaultValue="0" style={{ width: 120 }} onChange={handleChange}>
                <Option value="0">正常模式</Option>
                <Option value="1">尺码模排</Option>
                <Option value="2">颜色横排</Option>
              </Select>,
            ]}
          />
        </SplitPane>
      </div>
      {/* </ProCard> */}
    </PageContainer>
  );
};

export default inventoryQuery;
