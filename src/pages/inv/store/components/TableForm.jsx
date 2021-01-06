import { PlusOutlined } from '@ant-design/icons';
import { Button, Input, Table, Form } from 'antd';
import React, { useState, useImperativeHandle, forwardRef } from 'react';
import styles from '../style.less';
import InputEF from '@/components/EditForm/InputEF'
import SelectEF from '@/components/EditForm/SelectEF'


const TableForm = ({ tableRef, tableForm, value, onChange }) => {
  const [randomIndex, setRandomIndex] = useState(0);
  const [data, setData] = useState(value);

  //通过ref暴露函数
  useImperativeHandle(tableRef, () => ({
    newMember: () => {
      //新增一行
      newMember();
    }
  }))
  const getRowByKey = (key, newData) =>
    (newData || data)?.filter((item) => item.key === key)[0];

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
        form={tableForm}>
        <Table
          key='key'
          columns={columns}
          dataSource={data}
          pagination={false}
          rowClassName={(record) => (record.editable ? styles.editable : '')}
        />
      </Form>
    </>
  );
};

export default forwardRef(TableForm);
