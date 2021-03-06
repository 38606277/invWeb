//选择库存中的物料
import React, { useState, useEffect, useRef } from 'react';
import { Modal, Input, Drawer, Button } from 'antd';

import ProTable from '@ant-design/pro-table';
import HttpService from '@/utils/HttpService.jsx';

const Search = Input.Search;
const columns = [
  {
    title: '类别名称',
    dataIndex: 'category_name',
    key: 'category_name',
    valueType: 'text',
  }
];

const primaryKey = 'category_id';

const SelectOnHandCategoryDialog = (props) => {
  const { modalVisible, handleOk, handleCancel } = props;
  const [checkKeys, setCheckKeys] = useState([]);
  const [checkRows, setCheckRows] = useState([]);

  const onHandTableRef = useRef();

  const selectType = props?.selectType || 'radio';
  const orgId = props?.orgId;

  //重置选中状态
  useEffect(() => {
    setCheckKeys([]);
    setCheckRows([]);
    if (modalVisible) {
      onHandTableRef?.current?.reload();
    }
  }, [modalVisible]);

  // 获取数据
  const fetchData = async (params, sort, filter) => {
    if (orgId == null) {
      console.log('SelectOnHandDialog orgId 不能为null');
      return Promise.resolve({
        data: [],
        total: 0,
        success: true,
      });
    }

    const requestParam = {
      pageNum: params.current,
      perPage: params.pageSize,
      searchKeyword: params.keyword,
      org_id: orgId,
      ...params,
    };

    const result = await HttpService.post(
      '/reportServer/invOnHand/getItemOnHandCategoryByPage',
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
    // console.log('selectedKeys', selectedKeys)
    // console.log('selectedRows', selectedRows)
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
      title="选择类别"
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
          actionRef={onHandTableRef}
          onRow={(record) => {
            return {
              // 点击行
              onClick: (event) => {
                if ((record.on_hand_quantity || 0) == '0') {
                  return;
                }

                if (selectType === 'radio') {
                  setCheckKeys([record[primaryKey]]);
                  setCheckRows([record]);
                } else {
                  //有取消的情况
                  if (isCheck(record[primaryKey])) {
                    // 选中则移除
                    //移除key
                    const newCheckKeys = checkKeys.filter((item) => {
                      return item !== record[primaryKey];
                    });

                    //移除record
                    const newCheckRows = checkRows.filter((item) => {
                      return item[primaryKey] !== record[primaryKey];
                    });

                    setCheckKeys(newCheckKeys);
                    setCheckRows(newCheckRows);
                  } else {
                    // 未选中则添加
                    setCheckKeys([...checkKeys, record[primaryKey]]);
                    setCheckRows([...checkRows, record]);
                  }
                }
              },
            };
          }}
          columns={columns}
          request={fetchData}
          rowKey={primaryKey}
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

export default SelectOnHandCategoryDialog;
