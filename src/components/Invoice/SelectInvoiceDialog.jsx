//选择发票
import React, { useState, useEffect } from 'react';
import { Input, Drawer, Button } from 'antd';

import ProTable from '@ant-design/pro-table';
import HttpService from '@/utils/HttpService.jsx';

const Search = Input.Search;
//定义列
const columns = [
  {
    title: '编号',
    dataIndex: 'invoice_num',
    valueType: 'text',
  },
  {
    title: '已付金额',
    dataIndex: 'invoice_type',
    key: 'invoice_type',
    valueType: 'text',
  },
  {
    title: '供应商',
    dataIndex: 'vendor_name',
    key: 'inv_org_id',
    valueType: 'text',
  },
  {
    title: '金额',
    dataIndex: 'invoice_amount',
    key: 'inv_org_id',
    valueType: 'text',
  },
  {
    title: '已付金额',
    dataIndex: 'amount_paid',
    key: 'amount_paid',
    valueType: 'text',
  },
  {
    title: '状态',
    dataIndex: 'payment_status',
    valueType: 'select',
    valueEnum: {
      0: { text: '未付款', status: 'Error' },
      1: { text: '付款中', status: 'Warning' },
      2: { text: '已完成', status: 'Success' },
    },
  },
  {
    title: '描述',
    dataIndex: 'description',
    valueType: 'text',
  },
  {
    title: '创建时间',
    dataIndex: 'create_date',
    valueType: 'dateTime',
  },
];

const linesKey = 'invoice_id';

const SelectInvoiceDialog = (props) => {
  const { modalVisible, handleOk, handleCancel } = props;
  const [checkKeys, setCheckKeys] = useState([]);
  const [checkRows, setCheckRows] = useState([]);

  const selectType = props?.selectType || 'radio';

  //重置选中状态
  useEffect(() => {
    setCheckKeys([]);
    setCheckRows([]);
  }, [modalVisible]);

  // 获取数据
  const fetchData = async (params, sort, filter) => {
    const requestParam = {
      pageNum: params.current,
      perPage: params.pageSize,
      searchKeyword: params.keyword,
      ...params,
    };

    const result = await HttpService.post(
      'reportServer/ap/invoice/getInvoiceListByPage',
      JSON.stringify(requestParam),
    );
    console.log('result : ', result);
    return Promise.resolve({
      data: result.data.list,
      total: result.data.total,
      success: result.resultCode == '1000',
    });
  };

  const selectOnChange = (selectedKeys, selectedRows) => {
    setCheckKeys(selectedKeys);
    setCheckRows(selectedRows);
  };

  const isCheck = (id) => {
    for (let index in checkKeys) {
      if (checkKeys[index] === id) {
        return true;
      }
    }
    return false;
  };

  return (
    <Drawer
      title="选择银行账户"
      visible={modalVisible}
      onClose={handleCancel}
      bodyStyle={{ paddingBottom: 80 }}
      width={720}
      footer={
        <div
          style={{
            textAlign: 'right',
          }}
        >
          <Button onClick={handleCancel} style={{ marginRight: 8 }}>
            取消
          </Button>
          <Button
            onClick={() => {
              if (0 < checkKeys.length) {
                if (selectType === 'radio') {
                  handleOk(checkRows[0], checkKeys[0]);
                } else {
                  handleOk(checkRows, checkKeys);
                }
              } else {
                handleCancel();
              }
            }}
            type="primary"
          >
            确定
          </Button>
        </div>
      }
    >
      <div>
        <ProTable
          onRow={(record) => {
            return {
              // 点击行
              onClick: (event) => {
                //有取消的情况
                if (selectType === 'radio') {
                  setCheckKeys([record[linesKey]]);
                  setCheckRows([record]);
                } else if (isCheck(record[linesKey])) {
                  // 选中则移除
                  //移除key
                  const newCheckKeys = checkKeys.filter((item) => {
                    return item !== record[linesKey];
                  });

                  //移除record
                  const newCheckRows = checkRows.filter((item) => {
                    return item[linesKey] !== record[linesKey];
                  });

                  setCheckKeys(newCheckKeys);
                  setCheckRows(newCheckRows);
                } else {
                  // 未选中则添加
                  setCheckKeys([...checkKeys, record[linesKey]]);
                  setCheckRows([...checkRows, record]);
                }
              },
            };
          }}
          columns={columns}
          request={fetchData}
          rowKey={linesKey}
          rowSelection={{
            type: selectType,
            onChange: selectOnChange,
            selectedRowKeys: checkKeys,
            // getCheckboxProps: (record) => {
            //   console.log('0 < (record.on_hand_quantity || 0)', 0 < (record.on_hand_quantity || 0));
            //   return {
            //     disabled: (record.on_hand_quantity || 0) == '0', // Column configuration not to be checked
            //   };
            // },
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
      </div>
    </Drawer>
  );
};

export default SelectInvoiceDialog;
