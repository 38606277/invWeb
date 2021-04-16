import React, { useRef, useState } from 'react';
import { Button, Space, message, Modal } from 'antd';
import ProTable from '@ant-design/pro-table';
import { history } from 'umi';
import HttpService from '@/utils/HttpService.jsx';
import LocalStorge from '@/utils/LogcalStorge.jsx';


const localStorge = new LocalStorge();

const { confirm } = Modal;

//删除按钮事件
const onDeleteClickListener = (ref, selectedRowKeys) => {
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
      deleteByIds(ref, selectedRowKeys);
    },
    onCancel() { },
  });
};
//删除
const deleteByIds = (ref, selectedRowKeys) => {
  if (selectedRowKeys.length < 1) {
    message.error('请选择需要删除的内容');
    return;
  }

  HttpService.post(
    'reportServer/approvalRule/deleteApprovalRuleByIds',
    JSON.stringify({ ids: selectedRowKeys.toString() }),
  ).then((res) => {
    if (res.resultCode == '1000') {
      //刷新
      // 清空选中项
      ref.current.clearSelected();
      ref.current.reload();
    } else {
      message.error(res.message);
    }
  });
};

//获取数据
const fetchData = async (params, sort, filter) => {
  console.log('getByKeyword', params, sort, filter);
  // current: 1, pageSize: 20
  let requestParam = {
    pageNum: params.current,
    perPage: params.pageSize,
    ...params,

  };

  const result = await HttpService.post(
    'reportServer/approvalRule/getApprovalRuleListByPage',
    JSON.stringify(requestParam),
  );
  console.log('result : ', result);
  return Promise.resolve({
    data: result.data.list,
    total: result.data.total,
    success: result.resultCode == '1000',
  });
};

const approvalRuleList = () => {
  const ref = useRef();

  //定义列
  const columns = [
    {
      title: '创建人',
      dataIndex: 'create_user_name',
      valueType: 'text',
      render: (text, record) => {
        if (record.create_user == 'default') {
          return '默认';
        }
        return record.create_user_name;
      }
    },
    {
      title: '审批人',
      dataIndex: 'approval_user_name',
      valueType: 'text'
    },
    {
      title: '类型',
      dataIndex: 'type',
      valueType: 'select',
      valueEnum: {
        'po': { text: '采购订单' },
        'pd': { text: '生产订单' }
      },
    },
    {
      title: '操作',
      key: 'option',
      valueType: 'option',
      render: (text, record) => [
        <a
          onClick={() => {
            history.push(`/transation/approvalRule/edit/${record.id}`);
          }}
        >
          编辑
        </a>,
        <a
          onClick={() => {
            onDeleteClickListener(ref, [record.id]);
          }}
        >
          删除
        </a>
      ],
    },
  ];

  return (
    // <PageContainer>

    <div>


      <ProTable
        actionRef={ref}
        columns={columns}
        request={fetchData}
        rowKey="id"
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
        headerTitle="审批管理"
        toolBarRender={(action, { selectedRows }) => [
          <Button type="primary" onClick={() => history.push('/transation/approvalRule/add/null')}>
            新建
        </Button>,
        ]}
      />
    </div>
    // </PageContainer>
  );
};
export default approvalRuleList;
