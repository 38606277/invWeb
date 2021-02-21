import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, Space, Modal, message, Row, TreeSelect, Tree, Col, Input, Cascader   } from 'antd';
import {
  EllipsisOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  PlusCircleOutlined,
  FormOutlined,
  MinusCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import ProCard from '@ant-design/pro-card';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { history } from 'umi';
import SplitPane from 'react-split-pane';
import '../itemCategory/index.less';

import HttpService from '@/utils/HttpService.jsx';

const { confirm } = Modal;

const itemList = (props) => {
  const ref = useRef();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [treeData, setTreeData] = useState([]);
  const [treeSelectData, setTreeSelectData] = useState([]);
  const [columnData, setColumnData] = useState([]);
  const [catId, setCatId] = useState('-1'); // 用于编辑赋初始值
  const [checkVal, setCheckVal] = useState([]);
  const [checkItemcategoryVal ,setCheckItemcategoryVal]=useState();
  const [minHeight, setMinHeight] = useState(window.innerHeight - 92 + 'px'); // 用于编辑赋初始值
  const [mainForm] = Form.useForm();
  const [selectRows, setSelectRows] = useState([]);

  const getAllChildrenRecursionById = (catId) => {
    HttpService.post(
      'reportServer/itemCategory/getAllList',
      JSON.stringify({ category_pid: catId }),
    ).then((res) => {
      if (res.resultCode === '1000') {
        if (null != res.data) {
          if (res.data.length > 0) {
            setCheckVal([]);
            setTreeData(res.data);
            setTreeSelectData(res.data[0].children)
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
        <Button type="text" danger onClick={() => onDeleteClickListener(ref,[record.dict_id])}>
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

  //删除按钮事件
  const onDeleteClickListener = (ref,selectedRowKeys) => {
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
        deleteByIds(ref,selectedRowKeys);
      },
      onCancel() {},
    });
  };
  //删除
  const deleteByIds = (ref,selectedRowKeys) => {
    if (selectedRowKeys.length < 1) {
      message.error('请选择需要删除的内容');
      return;
    }
    HttpService.post(
      'reportServer/item/deleteItemById',
      JSON.stringify({ item_id: selectedRowKeys.toString() }),
    ).then((res) => {
      if (res.resultCode == '1000') {
        //刷新
        // 清空选中项
        ref.current.clearSelected();
        ref.current.reload();
        //fetchData({ current: 0, pageSize: 10, item_category_pid: catId }, '', '');
      } else {
        message.error(res.message);
      }
    });
  };

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
      HttpService.post('reportServer/itemCategory/getItemCategoryByID', JSON.stringify(params)).then(
        (res) => {
          if (res.resultCode == '1000') {
            const resultlist = res.data.lineForm;
            resultlist.map((item, index) => {
              let json = {
                key: item.segment.toLowerCase(),
                title: item.segment_name,
                dataIndex: item.segment.toLowerCase(),
                valueType: 'text',
                align: 'center',
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
                  onClick={() => onDeleteClickListener(ref,[record.item_id])}
                  icon={<CloseCircleOutlined />}
                ></Button>,
              ],
            };
            outlist.push(option);
            setColumnData(outlist);
          } else {
            message.error(res.message);
          }
        },
      );
    } else if ('-1' == category_id) {
      setColumnData(outlist);
    }
  };
  const batchUpdateClickListener = (ref,selectedRowKeys,selectedRows) => {
    console.log(selectedRows);
    setSelectRows(selectedRowKeys);
    setDialogVisible(true);
  }
  const onOk = () => {
    mainForm?.submit();
  }
  const onChangeOption = (value) => {
    setCheckItemcategoryVal(value);
 }

  const exdefault = {
    title: "category_name",
    value: "category_id",
    children: "children"
  }
  return (
    <PageContainer ghost="true" title="商品列表">
      <div style={{ backgroundColor: 'white' }}>
        <SplitPane split="vertical" minSize={0} defaultSize={180}  style={{minHeight:minHeight,overflow:'auto'}}>
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
                <a onClick={() => batchUpdateClickListener(ref, selectedRowKeys,selectedRows)}> 批量修改</a>|
                <a onClick={() => onDeleteClickListener(ref, selectedRowKeys)}> 批量删除</a>
              </Space>
            )}
            pagination={{
              showQuickJumper: true,
            }}
            search={{
              defaultCollapsed: true,
            }}
            dateFormatter="string"
            headerTitle="物料管理列表"
            toolBarRender={(action, { selectedRows }) => [
              <Button
                type="primary"
                onClick={() => history.push('/mdm/item/item/' + catId + '/null')}
              >
                新建
              </Button>,
              <Button
              type="primary"
              onClick={() => history.push('/mdm/item/itembatch/' + catId + '/null')}
            >
              批量新建
            </Button>,
            ]}
          />
        </SplitPane>
      </div>
      <Modal
        width={1000}
        visible={dialogVisible}
        title="批量修改"
        onOk={onOk}
        onCancel={() => {
          setDialogVisible(false);
        }}
      >
        <Form
        form={mainForm}
        onFinish={async (values) => {
          //验证tableForm
          console.log(values)
          console.log(selectRows)
          setDialogVisible(false);
          if(undefined== values.cost_price && 
            undefined== values.factory_price &&
            undefined== values.promotion_price &&
            undefined== values.retail_price &&
            undefined== values.item_category_id &&
            undefined== values.vendor_id            
            ){
              setDialogVisible(false);
            }else {
              let postData = {
                ...values,
                arrid:selectRows.join(",")
              };
              console.log(postData);
              HttpService.post('reportServer/item/batchUpdateItem', JSON.stringify(postData)).then(
                (res) => {
                  if (res.resultCode == '1000') {
                    //刷新
                    message.success('提交成功');
                    history.push('/mdm/item/itemList/' + catId);
                  } else {
                    message.error(res.message);
                  }
                },
              );
            }
        }}
        >
          <ProCard collapsible title="类别信息">
            <Row gutter={24}>
              <Col xl={{ span: 12, offset: 2 }} lg={{ span: 12 }} md={{ span: 12 }} sm={24}>
              <Form.Item
                label="类别"
                name="item_category_id"
                rules={[{ required: false, message: '请选择类别' }]}
              >
                <TreeSelect
                treeData={treeSelectData}
                placeholder="请选择类别"
                treeDefaultExpandAll
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                fieldNames={exdefault} />
              </Form.Item>
             </Col>
            </Row>
          </ProCard>
          <ProCard collapsible title="价格信息">
            <Row gutter={24}>
              <Col xl={{ span: 6, offset: 2 }} lg={{ span: 6 }} md={{ span: 12 }} sm={24}>
                <Form.Item
                  label="零售价格"
                  name="retail_price"
                  rules={[{ required: false, message: '请输入零售价格' }]}
                >
                  <Input id="retail_price" name="retail_price" />
                </Form.Item>
              </Col>
              <Col xl={{ span: 6, offset: 2 }} lg={{ span: 6 }} md={{ span: 12 }} sm={24}>
                <Form.Item label="出厂价格" name="factory_price" 
                rules={[{ required: false, message: '请输入出厂价格' }]} >
                  <Input id="factory_price" name="factory_price" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col xl={{ span: 6, offset: 2 }} lg={{ span: 6 }} md={{ span: 12 }} sm={24}>
              <Form.Item
                  label="促销价格"
                  name="promotion_price"
                  rules={[{ required: false, message: '请输入促销价格' }]}
                >
                  <Input id="promotion_price" name="promotion_price" />
                </Form.Item>
              </Col>
              <Col xl={{ span: 6, offset: 2 }} lg={{ span: 6 }} md={{ span: 12 }} sm={24}>
                <Form.Item
                  label="成本价格"
                  name="cost_price"
                  rules={[{ required: false, message: '请输入成本价格' }]}
                >
                  <Input id="cost_price" name="cost_price" />
                </Form.Item>
              </Col>
            </Row>
          </ProCard>
          <ProCard collapsible title="供应商信息">
            <Row gutter={24}>
              <Col xl={{ span: 12, offset: 2 }} lg={{ span: 12 }} md={{ span: 12 }} sm={24}>
              <Form.Item
                label="供应商信息"
                name="vendor_id"
                rules={[{ required: false, message: '请输入供应商信息' }]}
              >
                <Input id="vendor_id" name="vendor_id" />
              </Form.Item>
              </Col>
            </Row>
          </ProCard>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default itemList;
