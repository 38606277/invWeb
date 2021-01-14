import { Table, Form, message } from 'antd';
import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import styles from './style.less';
import InputEF from '@/components/EditForm/InputEF';
import SelectEF from '@/components/EditForm/SelectEF';
import InputSearchEF from '@/components/EditForm/InputSearchEF';
import styles2 from '@/components/EditForm/index.less';

const TableForm = forwardRef((props, ref) => {

    const { primaryKey, tableForm, value, onChange } = props;

    const [data, setData] = useState(value);
    const [selectedRows, setSelectedRows] = useState([]);
    const [deleteRecord, setDeleteRecord] = useState([]);//删除记录
    const [departmentDic, setDepartmentDic] = useState([]);

    useEffect(() => {
        setTimeout(3000);
        setDepartmentDic([
            {
                dict_id: 'segment1',
                dict_name: "segment1",
            }, {
                dict_id: 'segment2',
                dict_name: "segment2",
            }, {
                dict_id: 'segment3',
                dict_name: "segment3",
            },{
                dict_id: 'segment4',
                dict_name: "segment4",
            }, {
                dict_id: 'segment5',
                dict_name: "segment5",
            }, {
                dict_id: 'segment6',
                dict_name: "segment6",
            },{
                dict_id: 'segment7',
                dict_name: "segment7",
            }, {
                dict_id: 'segment8',
                dict_name: "segment8",
            }, {
                dict_id: 'segment9',
                dict_name: "segment9",
            },{
                dict_id: 'segment10',
                dict_name: "segment10",
            }, {
                dict_id: 'attribute1',
                dict_name: "attribute1",
            }, {
                dict_id: 'attribute2',
                dict_name: "attribute2",
            }
            
        ])

    }, []);

    const onTableChange = (selectedRowKeys, selectedRows) => {
        setSelectedRows(selectedRows);
    }

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
        //获取删除行
        getDeleteData() {
            return deleteRecord;
        }
    }))


    const newMember = (newItem) => {
        const newData = data?.map((item) => ({ ...item })) || [];
        newData.push(newItem);
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
                if (selectedRows[i][primaryKey] === item[primaryKey]) {
                    return false;
                }
            }
            return true;
        });
        setData(newData);
        let newDeleteRecord = deleteRecord.concat(selectedRows);
        setDeleteRecord(newDeleteRecord);
        setSelectedRows([]);

        if (onChange) {
            onChange(newData);
        }
    }

    const getRowByKey = (key, newData) =>
        (newData || data)?.filter((item) => item[primaryKey] === key)[0];

    const handleFieldChange = (
        filedValue,
        fieldName,
        record,
    ) => {
        console.log("List");
        let key = record[primaryKey];
        const newData = [...(data)];
        const target = getRowByKey(key, newData);
        if (target) {
            target[fieldName] = filedValue;
            setData(newData);
        }
        if (onChange) {
            onChange(newData);
        }
    };

    const columns = [
        {
            title: '行号',
            dataIndex: 'row_number',
            key: 'row_number',
            width: '20%',
            render: (text, record, index) => {
                return (
                    <InputEF
                        tableForm={tableForm}
                        text={text}
                        record={record}
                        index={record.row_number}
                        name="row_number"
                        rules={[{ required: true, message: 'Please input your name!' }]}
                        handleFieldChange={handleFieldChange}
                        placeholder={"请输入行号"}
                    />
                );
            },

        },
        {
            title: '类别名称',
            dataIndex: 'segment_name',
            key: 'segment_name',
            width: '20%',
            render: (text, record, index) => {
                return (
                    <InputEF
                        tableForm={tableForm}
                        text={text}
                        record={record}
                        index={record.row_number}
                        name="segment_name"
                        rules={[{ required: true, message: 'Please input your workId!' }]}
                        handleFieldChange={handleFieldChange}
                        placeholder={"请输入工号"}
                    />
                );
            },
        },
        {
            title: 'SEGMENT',
            dataIndex: 'segment',
            key: 'segment',
            render: (text, record, index) => {
                return (
                  <SelectEF
                  tableForm={tableForm}
                  text={text}
                  record={record}
                  index={record.row_number}
                  name="segment"
                  rules={[{ required: false, message: 'Please input your workId!' }]}
                  handleFieldChange={handleFieldChange}
                  dictData={departmentDic}
                  keyName={'dict_id'}
                  valueName={'dict_name'}
                  placeholder={"请输入工号"}
                />
              );

            },
        },{
            title: '字典项',
            dataIndex: 'dict_id',
            key: 'dict_id',
            render: (text, record, index) => {
                return (
                    <InputSearchEF
                    tableForm={tableForm}
                    text={text}
                    record={record}
                    index={record[primaryKey]}
                    name="dict_id"
                    rules={[{ required: false, message: '请输入物料名称' }]}
                    handleFieldChange={handleFieldChange}
                    onSearch={() => {
                        handleFieldChange('件', 'uom', record);
                    }}
                    />
                );

            },
        },{
            title: '行列',
            dataIndex: 'row_or_column',
            key: 'row_or_column',
            width: '20%',
            render: (text, record, index) => {
                return (
                    <InputEF
                        tableForm={tableForm}
                        text={text}
                        record={record}
                        index={record.row_number}
                        name="row_or_column"
                        rules={[{ required: true, message: '请输入行或列!' }]}
                        handleFieldChange={handleFieldChange}
                        placeholder={"请输入行或列"}
                    />
                );
            },
        },
    ];

 
    return (
        <>
            <Form
                className={styles2.tableForm}
                key='tableForm'
                form={tableForm}>
                <Table
                    rowKey={primaryKey}
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
