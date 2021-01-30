import { Table, Form, message } from 'antd';
import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import styles from './style.less';
import InputEF from '@/components/EditForm/InputEF';
import SelectEF from '@/components/EditForm/SelectEF';
import InputSearchEF from '@/components/EditForm/InputSearchEF';
import styles2 from '@/components/EditForm/index.less';
import SelectDictDailog from '@/components/Dict/SelectDictDialog';

const TableForm2 = forwardRef((props, ref) => {

    const { primaryKey, tableForm2, value, onChange } = props;

    const [data, setData] = useState(value);
    const [selectedRows, setSelectedRows] = useState([]);
    const [deleteRecord, setDeleteRecord] = useState([]);//删除记录
    const [departmentDic, setDepartmentDic] = useState([]);
    const [rowcolumn, setRowcolumn] = useState([]);
    const [selectDictDailogVisible, setSelectDictDailogVisible] = useState(false);
    const [rowId, setRowId] = useState([]);

    useEffect(() => {
       
        setDepartmentDic([
            {
                dict_id: 'attribute1',
                dict_name: "attribute1",
            }, {
                dict_id: 'attribute2',
                dict_name: "attribute2",
            },{
                dict_id: 'attribute3',
                dict_name: "attribute3",
            }, {
                dict_id: 'attribute4',
                dict_name: "attribute4",
            },{
                dict_id: 'attribute5',
                dict_name: "attribute5",
            }, {
                dict_id: 'attribute6',
                dict_name: "attribute6",
            },{
                dict_id: 'attribute7',
                dict_name: "attribute7",
            }, {
                dict_id: 'attribute8',
                dict_name: "attribute8",
            },{
                dict_id: 'attribute9',
                dict_name: "attribute9",
            }, {
                dict_id: 'attribute10',
                dict_name: "attribute10",
            }
        ]);
        setRowcolumn([
            {"rowcolId":"row","rowcolname":"行"},
            {"rowcolId":"column","rowcolname":"列"},
        ]);

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


    const handleFieldChangeSelect = (
        filedValue,
        fieldName,
        filedValue1,
        fieldName1,
        record,
    ) => {
        console.log("List");
        let key = record[primaryKey];
        const newData = [...(data)];
        const target = getRowByKey(key, newData);
        if (target) {
            // target[fieldName] = filedValue;
            // target[fieldName1] = filedValue1;
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
            className:styles.columnshow,
            //  width: '0%',
            render: (text, record, index) => {
                return (
                    <InputEF
                        tableForm={tableForm2}
                        text={text}
                        record={record}
                        index={record.row_number}
                        name="row_number"
                        rules={[{ required: false, message: '请输入行号' }]}
                        handleFieldChange={handleFieldChange}
                        placeholder={"请输入行号"}
                    />
                );
            },

        },
        {
            title: '属性名称',
            dataIndex: 'segment_name',
            key: 'segment_name',
            render: (text, record, index) => {
                return (
                    <InputEF
                        tableForm={tableForm2}
                        text={text}
                        record={record}
                        index={record.row_number}
                        name="segment_name"
                        rules={[{ required: true, message: '请输入属性名称!' }]}
                        handleFieldChange={handleFieldChange}
                        placeholder={"请输入属性名称"}
                    />
                );
            },
        },
        {
            title: 'ATTRIBUTE',
            dataIndex: 'segment',
            key: 'segment',
            render: (text, record, index) => {
                return (
                  <SelectEF
                  tableForm={tableForm2}
                  text={text}
                  record={record}
                  index={record.row_number}
                  name="segment"
                  rules={[{ required: true, message: '请选择数据ATTRIBUTE!' }]}
                  handleFieldChange={handleFieldChange}
                  dictData={departmentDic}
                  keyName={'dict_id'}
                  valueName={'dict_name'}
                  placeholder={"请选择数据SEGMENT"}
                />
              );

            },
        },{
            title: '行列',
            dataIndex: 'row_or_column',
            key: 'row_or_column',
            className:styles.columnshow,
            render: (text, record, index) => {
                return (
                    <SelectEF
                    tableForm={tableForm2}
                    text={text}
                    record={record}
                    index={record.row_number}
                    name="row_or_column"
                    rules={[{ required: true, message: '请选择行或列!' }]}
                    handleFieldChange={handleFieldChange}
                    dictData={rowcolumn}
                    keyName={'rowcolId'}
                    valueName={'rowcolname'}
                    placeholder={"请选择行或列"}
                  />
                );
            },
        },
    ];

 
    return (
        <>
            <Form
                className={styles2.tableForm2}
                key='tableForm2'
                form={tableForm2}>
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
export default TableForm2;
