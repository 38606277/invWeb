import React, { useEffect, useRef, useState } from 'react';
import { Button, Space, message, Modal } from 'antd';
import { EllipsisOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import { history } from 'umi';
import HttpService from '@/utils/HttpService.jsx';

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
    onCancel() {},
  });
};
//删除
const deleteByIds = (ref, selectedRowKeys) => {
  if (selectedRowKeys.length < 1) {
    message.error('请选择需要删除的内容');
    return;
  }

  HttpService.post(
    '/reportServer/bankAccount/deleteBankAccountByIds',
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
    '/reportServer/bankAccount/getBankAccountListByPage',
    JSON.stringify(requestParam),
  );
  console.log('result : ', result);
  return Promise.resolve({
    data: result.data.list,
    total: result.data.total,
    success: result.resultCode == '1000',
  });
};

const transferList = (props) => {
  const ref = useRef();

  //定义列
  const columns = [
    {
      title: '账户名称',
      dataIndex: 'bank_account_name',
      valueType: 'text',
      align: 'center',
    },
    {
      title: '账户编号',
      dataIndex: 'bank_account_number',
      valueType: 'text',
      align: 'center',
    },
    {
      title: '货币',
      dataIndex: 'currency_code',
      valueType: 'text',
      align: 'center',
    },
    {
      title: '联系人',
      dataIndex: 'contact_name',
      valueType: 'text',
      align: 'center',
    },
    {
      title: '联系号码',
      dataIndex: 'contact_phone',
      valueType: 'text',
      align: 'center',
    },

    {
      title: '银行名称',
      dataIndex: 'bank_name',
      valueType: 'text',
      align: 'center',
    },
    {
      title: '支行名称',
      dataIndex: 'bank_branch',
      valueType: 'text',
      align: 'center',
    },
    {
      title: '最小付款额',
      dataIndex: 'min_check_amount',
      valueType: 'text',
      align: 'center',
    },
    {
      title: '最大付款额',
      dataIndex: 'max_check_amount',
      valueType: 'text',
      align: 'center',
    },
    {
      title: '描述',
      dataIndex: 'description',
      valueType: 'text',
      align: 'center',
    },

    {
      title: '失效日期',
      dataIndex: 'inactive_date',
      valueType: 'date',
      align: 'center',
    },
    {
      title: '操作',
      key: 'option',
      valueType: 'option',
      render: (text, record) => [
        <a
          onClick={() => {
            history.push(`/mdm/bankAccount/edit/${record.bank_account_id}`);
          }}
        >
          编辑
        </a>,
        <a
          onClick={() => {
            onDeleteClickListener(ref, [record.bank_account_id]);
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  return (
    // <PageContainer>
    <ProTable
      actionRef={ref}
      columns={columns}
      request={fetchData}
      rowKey="bank_account_id"
      // rowSelection={
      //   {
      //     // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
      //     // 注释该行则默认不显示下拉选项
      //     //selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
      //   }
      // }

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
      headerTitle="银行账户管理"
      toolBarRender={(action, { selectedRows }) => [
        <Button type="primary" onClick={() => history.push(`/mdm/bankAccount/add/null`)}>
          新建
        </Button>,
      ]}
    />
    // </PageContainer>
  );
};
export default transferList;
