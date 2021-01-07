import { Table, Form, message } from 'antd';
import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import styles from '../style.less';
import InputEF from '@/components/EditForm/InputEF'
import SelectEF from '@/components/EditForm/SelectEF'

const TableForm = forwardRef((props, ref) => {

    const { primaryKey, tableForm, value, onChange } = props;

    const [data, setData] = useState(value);
    const [selectedRows, setSelectedRows] = useState([]);
    const [departmentDic, setDepartmentDic] = useState([]);

    useEffect(() => {
        setTimeout(3000);
        setDepartmentDic([
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
        ])

    }, []);

    //监听value值 ，长度改变更新布局
    // useEffect(() => {
    //     setData(value);
    // }, [value.length]);



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
                onChange(data);
            }
        },
        //获取表格数据
        getTableData() {
            return data;
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
        console.log('newData', newData);
        setData(newData);
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
                            departmentDic
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
