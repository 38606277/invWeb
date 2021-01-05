import { PlusOutlined } from '@ant-design/icons';
import { Button, Input, Table, Form } from 'antd';
import React, { useState } from 'react';
import styles from '../style.less';

const TableForm = ({ value, onChange }) => {

  const [index, setIndex] = useState(0);
  const [data, setData] = useState(value);
  const [mForm] = Form.useForm();
  const getRowByKey = (key, newData) =>
    (newData || data)?.filter((item) => item.key === key)[0];

  const newMember = () => {
    const newData = data?.map((item) => ({ ...item })) || [];

    newData.push({
      key: `NEW_TEMP_ID_${index}`,
      workId: '',
      name: '',
      department: '',
      editable: true,
      isNew: true,
    });

    setIndex(index + 1);
    setData(newData);
  };

  const handleFieldChange = (
    e,
    fieldName,
    key,
  ) => {
    const newData = [...(data)];
    const target = getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target.value;
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
        if (record.editable) {
          return (
            <Form.Item
              name={`${index}_id`}
              rules={[{ required: true, message: 'Please input your username!' }]}>
              <Input
                value={text}
                autoFocus
                onChange={(e) => handleFieldChange(e, 'name', record.key)}
                placeholder="成员姓名"
              />
            </Form.Item>
          );
        }
        return text;
      },
    },
    {
      title: '工号',
      dataIndex: 'workId',
      key: 'workId',
      width: '20%',
      render: (text, record) => {
        if (record.editable) {
          return (
            <Input
              value={text}
              onChange={(e) => handleFieldChange(e, 'workId', record.key)}
              placeholder="工号"
            />
          );
        }
        return text;
      },
    },
    {
      title: '所属部门',
      dataIndex: 'department',
      key: 'department',
      width: '40%',
      render: (text, record) => {
        if (record.editable) {
          return (
            <Input
              value={text}
              onChange={(e) => handleFieldChange(e, 'department', record.key)}

              placeholder="所属部门"
            />
          );
        }
        return text;
      },
    },
  ];

  return (
    <>
      <Form
        form={mForm}>
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          rowClassName={(record) => (record.editable ? styles.editable : '')}
        />
        <Button
          style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
          type="dashed"
          onClick={newMember}
        >
          <PlusOutlined />
        新增成员
      </Button>
      </Form>
    </>
  );
};

export default TableForm;
