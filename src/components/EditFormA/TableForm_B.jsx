/** 
 * 
 * 
  列参数：
    [
      { 
        // cloum参数
        mainParams:{
        },
        //render 组件参数
        renderParams:{
            //formItem 参数
            formItemParams:{

            },
            // 具体控件的参数 如：Input Select
            widgetParams:{

            }
        }
      }
    ]
 * 
 */
import { Table, Form, message } from 'antd';
import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import InputEF_A from '@/components/EditFormA/InputEF_A'
import SelectEF_A from '@/components/EditFormA/SelectEF_A'
import InputNumberEF_A from '@/components/EditFormA/InputNumberEF_A'
import InputSearchEF_A from '@/components/EditFormA/InputSearchEF_A'
import styles from './index.less';

const TableForm = forwardRef((props, ref) => {

  const { primaryKey, tableForm, columns } = props;
  const [data, setData] = useState([]); //列表行数据
  const [deleteRecordKeys, setDeleteRecordKeys] = useState([]); //删除记录
  const [deleteRecord, setDeleteRecord] = useState([]); //删除记录
  const [mSelectedRows, setMSelectedRows] = useState([]);
  const [mSelectedRowKeys, setMSelectedRowKeys] = useState([]);
  // 选中回调
  const onTableChange = (selectedRowKeys, selectedRows) => {
    setMSelectedRowKeys(selectedRowKeys);
    setMSelectedRows(selectedRows);
  };

  //通过ref暴露函数
  useImperativeHandle(ref, () => ({
    //手动初始化数据
    initData: (initData) => {
      setData(initData);
    },
    addItem: (item) => {
      //新增一行
      newMember(item);
    },
    //删除选中项
    removeRows: () => {
      removeRows();
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
    //修改值
    handleFieldChange(filedValue, fieldName, record) {
      handleFieldChange(filedValue, fieldName, record);
    },
    //修改对象
    handleObjChange(obj, record) {
      handleObjChange(obj, record)
    }
  }));

  //新增一行
  const newMember = (newItem) => {
    const newData = data?.map((item) => ({ ...item })) || [];
    newData.push(newItem);
    setData(newData);
  };

  //删除选中项目
  const removeRows = () => {
    if (mSelectedRows.length < 1) {
      message.error('请选择删除项');
      return;
    }
    const newData = data.filter((item) => {
      let i;
      for (i = 0; i < mSelectedRows.length; i++) {
        if (mSelectedRows[i][primaryKey] === item[primaryKey]) {
          return false;
        }
      }
      return true;
    });
    setData(newData);

    setDeleteRecord([...deleteRecord, ...mSelectedRows]);
    setDeleteRecordKeys([...deleteRecordKeys, ...mSelectedRowKeys]);

    setMSelectedRows([]);
    setMSelectedRowKeys([]);
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
  };

  /**
   * 修改行数据
   */
  const handleObjChange = (obj, record) => {
    if (!obj) {
      return;
    }
    let key = record[primaryKey];
    const newData = [...data];
    const target = getRowByKey(key, newData);
    if (target) {
      for (let fieldName in obj) {
        target[fieldName] = obj[fieldName];
      }
      setData(newData);
    }
  }

  /**
   * 根据参数构建columns 
   * @param {} columnsParams 
   */
  const buildColumns = (columnParamsList) => {
    let newColmuns = [];
    let index;
    for (index = 0; index < columnParamsList.length; index++) {
      let columnParams = columnParamsList[index];
      newColmuns.push(getColumn(columnParams));
    }
    return newColmuns;
  }

  /**
   * 获取列
   * @param {} columnParams  列参数
   */
  const getColumn = (columnParams) => {
    const { renderParams } = columnParams;

    if (columnParams?.hide) {
      if (!columnParams.className) {
        columnParams.className = styles.columnshow;
      }
    }
    return {
      render: (text, record, index) => {
        renderParams.name = columnParams?.key || columnParams?.dataIndex
        renderParams.prefix = record[primaryKey]
        renderParams.text = text
        renderParams.record = record
        renderParams.tableForm = tableForm
        renderParams.handleFieldChange = handleFieldChange
        return getItemEF(columnParams?.renderType || 'InputEF', renderParams);
      },
      ...columnParams
    }
  }

  /**
   * 获取对应类型的控件
   * @param {}} renderType 
   * @param {*} renderParams 
   */
  const getItemEF = (renderType, renderParams) => {

    if (renderType === 'InputEF') { // 输入框
      return <InputEF_A  {...renderParams} />;
    } else if (renderType === 'InputNumberEF') {//数组输入框
      return <InputNumberEF_A  {...renderParams} />;
    } else if (renderType === 'InputSearchEF') {//搜索框输入
      return <InputSearchEF_A  {...renderParams} />;
    } else if (renderType === 'SelectEF') {//选择框
      return <SelectEF_A  {...renderParams} />;
    } else {// 默认输入框
      return <InputEF_A  {...renderParams} />;
    }
  }

  return (
    <Form className={styles.tableForm} key="tableForm" form={tableForm}>
      <Table
        className="formTable"
        rowKey={primaryKey}
        columns={buildColumns(columns || [])}
        dataSource={data}
        pagination={false}
        rowSelection={{
          selectedRowKeys: mSelectedRowKeys,
          type: 'checkbox',
          onChange: onTableChange,
        }}
      />
    </Form>
  );
});
export default TableForm;
