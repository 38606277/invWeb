import { Table, Form, message } from 'antd';
import React, { useState, useImperativeHandle, forwardRef } from 'react';
import styles from '../style.less';
import InputEF from '@/components/EditForm/InputEF'
import SelectEF from '@/components/EditForm/SelectEF'

const TableForm = forwardRef((props, ref) => {

  const { tableForm, value, onChange } = props;
  const [randomIndex, setRandomIndex] = useState(0);
  const [data, setData] = useState(value);
  const [selectedRows, setSelectedRows] = useState([]);

  const onTableChange = (selectedRowKeys, selectedRows) => {
    setSelectedRows(selectedRows);
  }

  //通过ref暴露函数
  useImperativeHandle(ref, () => ({
    newMember: () => {
      //新增一行
      newMember();
    },
    //删除选中项
    removeRows: () => {
      removeRows();
    }
  }))


  const newMember = () => {
    const newData = data?.map((item) => ({ ...item })) || [];

    newData.push({
      key: `NEW_TEMP_ID_${randomIndex}`,
      workId: '',
      name: '',
      department: '',
      editable: true,
      isNew: true,
    });
    setRandomIndex(randomIndex + 1);
    setData(newData);
  };

  const removeRows = () => {
    if (selectedRows.length < 1) {
      message.error('请选择删除项');
      return;
    }
    const newData = data.filter(item => {
      let i;
      for (i = 0; i < selectedRows.length; i++) {
        if (selectedRows[i].key === item.key) {
          return false;
        }
      }
      return true;
    });
    console.log('newData', newData);
    setData(newData);
    setSelectedRows([])
    if (onChange) {
      onChange(newData);
    }
  }

  const getRowByKey = (key, newData) =>
    (newData || data)?.filter((item) => item.key === key)[0];

  const handleFieldChange = (
    filedValue,
    fieldName,
    key,
  ) => {
    const newData = [...(data)];
    const target = getRowByKey(key, newData);
    if (target) {
      target[fieldName] = filedValue;
      setData(newData);
    }

    onChange(newData);
  };

  const columns = [
    {
      title: '成员姓名',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      render: (text, record, index) => {
        return (
          <InputEF
            tableForm={tableForm}
            text={text}
            record={record}
            index={index}
            name="name"
            rules={[{ required: true, message: 'Please input your name!' }]}
            handleFieldChange={handleFieldChange}
            placeholder={"请输入成员姓名"}
          />
        );
      },

    },
    {
      title: '工号',
      dataIndex: 'workId',
      key: 'workId',
      width: '20%',
      render: (text, record, index) => {

        return (
          <InputEF
            tableForm={tableForm}
            text={text}
            record={record}
            index={index}
            name="workId"
            rules={[{ required: true, message: 'Please input your workId!' }]}
            handleFieldChange={handleFieldChange}
            placeholder={"请输入工号"}
          />
        );
      },
    },
    {
      title: '所属部门',
      dataIndex: 'department',
      key: 'department',
      width: '40%',
      render: (text, record, index) => {

        return (
          <SelectEF
            tableForm={tableForm}
            text={text}
            record={record}
            index={index}
            name="department"
            rules={[{ required: true, message: 'Please select your department!' }]}
            handleFieldChange={handleFieldChange}
            placeholder={"请输选择所属部门"}
            keyName="dict_id"
            valueName="dict_name"
            dictData={
              [
                {
                  dict_id: '1',
                  dict_name: "信息部",
                }, {
                  dict_id: '2',
                  dict_name: "财务部",
                }, {
                  dict_id: '3',
                  dict_name: "行政部",
                }
              ]
            }
          />
        );

      },
    },
  ];

  return (
    <>
      <Form
        key='tableForm'
        form={tableForm}>
        <Table
          key='key'
          columns={columns}
          dataSource={data}
          pagination={false}
          rowSelection={{
            type: 'checkbox',
            onChange: onTableChange,
          }}
        />
      </Form>
    </>
  );
});
export default TableForm;
