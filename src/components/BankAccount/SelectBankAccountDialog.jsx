//选择库存中的物料
import React, { useState, useEffect } from 'react';
import { Input, Drawer, Button } from 'antd';

import ProTable from '@ant-design/pro-table';
import HttpService from '@/utils/HttpService.jsx';

const Search = Input.Search;
//定义列
const columns = [
  {
    title: '账户名称',
    dataIndex: 'bank_account_name',
    valueType: 'text',
    align: "center"
  },
  {
    title: '账户编号',
    dataIndex: 'bank_account_number',
    valueType: 'text',
    align: "center"
  },
  {
    title: '货币',
    dataIndex: 'currency_code',
    valueType: 'text',
    align: "center"
  },
  {
    title: '联系人',
    dataIndex: 'contact_name',
    valueType: 'text',
    align: "center"
  },
  {
    title: '联系号码',
    dataIndex: 'contact_phone',
    valueType: 'text',
    align: "center"
  },

  {
    title: '银行名称',
    dataIndex: 'bank_name',
    valueType: 'text',
    align: "center"
  },
  {
    title: '支行名称',
    dataIndex: 'bank_branch',
    valueType: 'text',
    align: "center"
  },
  {
    title: '最小付款额',
    dataIndex: 'min_check_amount',
    valueType: 'text',
    align: "center"
  },
  {
    title: '最大付款额',
    dataIndex: 'max_check_amount',
    valueType: 'text',
    align: "center"
  },
  {
    title: '描述',
    dataIndex: 'description',
    valueType: 'text',
    align: "center"
  },

  {
    title: '失效日期',
    dataIndex: 'inactive_date',
    valueType: 'date',
    align: "center"
  },
];

const linesKey = 'bank_account_id';

const SelectBankAccountDialog = (props) => {
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
                  setCheckKeys([record[linesKey]])
                  setCheckRows([record])
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
              }
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

export default SelectBankAccountDialog;
