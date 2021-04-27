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

            },
            //添加widgetParamsBuild 实现函数可以覆盖widgetParams 可以通过record的值来控制组件
            widgetParamsBuild:(text, record, index)=>{
              return widgetParams;
            }

        }
      }
    ]
 * 
 */
import { Table, Form, message } from 'antd';
import React, { useState, useImperativeHandle, forwardRef } from 'react';
import InputEF_A from '@/components/EditFormA/InputEF_A'
import SelectEF_A from '@/components/EditFormA/SelectEF_A'
import InputNumberEF_A from '@/components/EditFormA/InputNumberEF_A'
import InputSearchEF_A from '@/components/EditFormA/InputSearchEF_A'
import DebounceSelectEF_A from '@/components/EditFormA/DebounceSelectEF_A'
import SearchSelectEF_A from '@/components/EditFormA/SearchSelectEF_A'
import styles from './index.less';

const TableForm = forwardRef((props, ref) => {

  const { primaryKey, columns, value } = props;

  const tableParams = props.tableParams || {};

  const [tableForm] = Form.useForm();


  const [data, setData] = useState(value || []); //列表行数据

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
    //新增一行
    addItem: (item) => {
      newMember(item);
    },
    //新增多行
    addItemList: (itemList) => {
      newMemberList(itemList);
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
    },
    //验证表单数据
    validateFields() {
      return new Promise((resolve, reject) => {
        tableForm.validateFields().then(() => {
          resolve(true);
        }).catch(() => {
          reject(false);
        });
      });
    },
    clear() {
      setData([]);
      setDeleteRecord([]);
      setDeleteRecordKeys([]);
      setMSelectedRows([]);
      setMSelectedRowKeys([]);
    }
  }));

  //新增一行
  const newMember = (newItem) => {
    const newData = data?.map((item) => ({ ...item })) || [];
    newData.push(newItem);
    setData(newData);
  };

  //新增多行
  const newMemberList = (newItemList) => {
    const newData = data?.map((item) => ({ ...item })) || [];
    newData.push(...newItemList);
    setData(newData);
    console.log('newMemberList newData', newData)
    console.log('newMemberList data', data)
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
    //console.log('newData', newData);
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
    const renderParams = columnParams?.renderParams || {};

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

        //添加widgetParamsBuild 实现函数可以覆盖widgetParams 可以通过record的值来控制组件
        if (renderParams?.widgetParamsBuild) {
          renderParams.widgetParams = renderParams?.widgetParamsBuild(text, record, index) || (renderParams?.widgetParams || {});
        }

        return getItemEF(columnParams?.renderType || 'InputEF', renderParams);
      },
      align: 'center',
      ...columnParams

    }
  }

  /**
   * 获取对应类型的控件
   * @param {*}} renderType 
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
    } else if (renderType === 'DebounceSelectEF') {
      return <DebounceSelectEF_A  {...renderParams} />;
    } else if (renderType === 'SearchSelectEF') {
      return <SearchSelectEF_A  {...renderParams} />;
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
        {...tableParams}
      />
    </Form>
  );
});
export default TableForm;
