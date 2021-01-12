import { Table, Form, message } from 'antd';
import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import InputEF from '@/components/EditForm/InputEF';
import InputNumberEF from '@/components/EditForm/InputNumberEF';
import InputSearchEF from '@/components/EditForm/InputSearchEF';
import styles from '@/components/EditForm/index.less';
const TableForm = forwardRef((props, ref) => {
  const { disabled, primaryKey, tableForm, value, onChange } = props;

  const [data, setData] = useState(value || []); //列表行数据
  const [deleteRecordKeys, setDeleteRecordKeys] = useState([]); //删除记录
  const [deleteRecord, setDeleteRecord] = useState([]); //删除记录
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // 选中回调
  const onTableChange = (selectedRowKeys, selectedRows) => {
    setSelectedRowKeys(selectedRowKeys);
    setSelectedRows(selectedRows);
  };

  //通过ref暴露函数
  useImperativeHandle(ref, () => ({
    addItem: (item) => {
      //新增一行
      newMember(item);
    },
    //删除选中项
    removeRows: () => {
      removeRows();
    },
    //手动初始化数据
    initData: (initData) => {
      setData(initData);
      if (onChange) {
        onChange(initData);
      }
    },
    //获取表格数据
    getTableData() {
      return data;
    },

    //获取删除记录
    getDeleteRecord() {
      return deleteRecord;
    },
    //获取删除记录Id
    getDeleteRecordKeys() {
      return deleteRecordKeys;
    },
  }));

  //新增一行
  const newMember = (newItem) => {
    const newData = data?.map((item) => ({ ...item })) || [];
    newData.push(newItem);
    setData(newData);
  };

  //删除选中项目
  const removeRows = () => {
    if (selectedRows.length < 1) {
      message.error('请选择删除项');
      return;
    }
    const newData = data.filter((item) => {
      let i;
      for (i = 0; i < selectedRows.length; i++) {
        if (selectedRows[i][primaryKey] === item[primaryKey]) {
          return false;
        }
      }
      return true;
    });
    //console.log('newData', newData);
    setData(newData);

    setDeleteRecord([...deleteRecord, ...selectedRows]);
    setDeleteRecordKeys([...deleteRecordKeys, ...selectedRowKeys]);

    setSelectedRows([]);
    setSelectedRowKeys([]);

    if (onChange) {
      onChange(newData);
    }
  };

  //根据key获取行数据
  const getRowByKey = (key, newData) =>
    (newData || data)?.filter((item) => item[primaryKey] === key)[0];

  //修改行数据属性值
  const handleFieldChange = (filedValue, fieldName, record) => {
    let key = record[primaryKey];
    const newData = [...data];
    const target = getRowByKey(key, newData);
    if (target) {
      target[fieldName] = filedValue;
      setData(newData);
    }
    if (onChange) {
      onChange(newData);
    }
  };

  const calculationMoney = (filedValue, fieldName, record) => {
    let key = record[primaryKey];
    const newData = [...data];
    const target = getRowByKey(key, newData);


    //数量不能大于结存数量
    if (target['balance'] < target['quantity']) {
      message.error('输入数量不能大于结存剩余数量，请检查');

      target['quantity'] = target['balance'];
    }

    if (target) {
      target['amount'] = target['price'] * target['quantity'];
      setData(newData);
    }
    if (onChange) {
      onChange(newData);
    }
  };

  const columns = [
    {
      title: '物料id',
      dataIndex: 'item_id',
      key: 'item_id',
      className: styles.columnshow,
      render: (text, record, index) => {
        return (
          <InputEF
            disabled={disabled}
            tableForm={tableForm}
            text={text}
            record={record}
            index={record[primaryKey]}
            name="item_id"
            disabled
            handleFieldChange={handleFieldChange}
          />
        );
      },
    },
    {
      title: '物料名称',
      dataIndex: 'item_name',
      key: 'item_name',
      render: (text, record, index) => {
        return (
          <InputSearchEF
            disabled={disabled}
            tableForm={tableForm}
            text={text}
            record={record}
            index={record[primaryKey]}
            name="item_name"
            rules={[{ required: true, message: '请输入物料名称' }]}
            handleFieldChange={handleFieldChange}
            onSearch={() => {
              handleFieldChange(1, 'item_id', record);
              handleFieldChange('件', 'uom', record);
              handleFieldChange(5, 'balance', record);
              handleFieldChange(29.8, 'price', record);
              handleFieldChange('衬衫', 'item_name', record);
            }}
          />
        );
      },
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      render: (text, record, index) => {
        return (
          <InputNumberEF
            tableForm={tableForm}
            text={text}
            record={record}
            index={record[primaryKey]}
            name="price"
            precision={2}
            disabled
            handleFieldChange={handleFieldChange}
            onChange={calculationMoney}
          />
        );
      },
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      render: (text, record, index) => {
        return (
          <InputNumberEF
            tableForm={tableForm}
            text={text}
            record={record}
            index={record[primaryKey]}
            name="price"
            precision={2}
            disabled
            handleFieldChange={handleFieldChange}
            onChange={calculationMoney}
          />
        );
      },
    },
    {
      title: '结存数量',
      dataIndex: 'balance',
      key: 'balance',
      render: (text, record, index) => {
        return (
          <InputEF
            tableForm={tableForm}
            text={text}
            record={record}
            index={record[primaryKey]}
            name="balance"
            disabled
            handleFieldChange={handleFieldChange}
          />
        );
      },
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, record, index) => {
        return (
          <InputNumberEF
            disabled={disabled}
            tableForm={tableForm}
            text={text}
            record={record}
            index={record[primaryKey]}
            name="quantity"
            onChange={calculationMoney}
            rules={[{ required: true, message: '请输入数量' }]}
            precision={0}
            handleFieldChange={handleFieldChange}
          />
        );
      },
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (text, record, index) => {
        return (
          <InputNumberEF
            tableForm={tableForm}
            text={text}
            record={record}
            index={record[primaryKey]}
            name="amount"
            precision={2}
            disabled
            handleFieldChange={handleFieldChange}
          />
        );
      },
    },
    {
      title: '备注',
      dataIndex: 'reamrk',
      key: 'reamrk',
      render: (text, record, index) => {
        return (
          <InputEF
            disabled={disabled}
            tableForm={tableForm}
            text={text}
            record={record}
            index={record[primaryKey]}
            name="reamrk"
            handleFieldChange={handleFieldChange}
          />
        );
      },
    },
  ];

  return (
    <>
      <Form className={styles.tableForm} key="tableForm" form={tableForm}>
        <Table
          className="formTable"
          rowKey={primaryKey}
          columns={columns}
          dataSource={data}
          pagination={false}
          rowSelection={{
            selectedRowKeys: selectedRowKeys,
            type: 'checkbox',
            onChange: onTableChange,
          }}
        />
      </Form>
    </>
  );
});
export default TableForm;