import { Table, Form, message } from 'antd';
import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import styles from './style.less';
import InputEF from '@/components/EditForm/InputEF';
import SelectEF from '@/components/EditForm/SelectEF';
import InputSearchEF from '@/components/EditForm/InputSearchEF';
import styles2 from '@/components/EditForm/index.less';
import SelectDictDailog from '@/components/Dict/SelectDictDialog';

const TableForm = forwardRef((props, ref) => {

    const { primaryKey, tableForm, value, onChange } = props;

    const [data, setData] = useState(value);
    const [selectedRows, setSelectedRows] = useState([]);
    const [deleteRecord, setDeleteRecord] = useState([]);//删除记录
    const [departmentDic, setDepartmentDic] = useState([]);
    const [rowcolumn, setRowcolumn] = useState([]);
    const [mSkey ,setMSkey] = useState([]);
    const [selectDictDailogVisible, setSelectDictDailogVisible] = useState(false);
    const [rowId, setRowId] = useState([]);
    const [isInput, setIsInput] = useState([]);

    useEffect(() => {
       
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
            }
            
        ]);
        setRowcolumn([
            {"rowcolId":"r","rowcolname":"行"},
            {"rowcolId":"c","rowcolname":"列"},
        ]);
        setMSkey([
            {"rowcolId":"mkey","rowcolname":"主键"},
            {"rowcolId":"skey","rowcolname":"从键"},
        ]);
        setIsInput([
            {"rowcolId":"dict","rowcolname":"是"},
            {"rowcolId":"input","rowcolname":"否"},
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

    const handleFieldChangeInput = (
        filedValue,
        fieldName,
        record,
    ) => {
        let key = record[primaryKey];
        const newData = [...(data)];
        const target = getRowByKey(key, newData);
        if (target) {
            target[fieldName] = filedValue;
            target['dict_id'] = "";
            target['dict_name'] = "";
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
                        tableForm={tableForm}
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
                        tableForm={tableForm}
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
                  rules={[{ required: true, message: '请选择数据SEGMENT!' }]}
                  handleFieldChange={handleFieldChange}
                  dictData={departmentDic}
                  keyName={'dict_id'}
                  valueName={'dict_name'}
                  placeholder={"请选择数据SEGMENT"}
                />
              );

            },
        },{
            title: '字典',
            dataIndex: 'dict_id',
            key: 'dict_id',
            className:styles.columnshow,
            render: (text, record, index) => {
                return (
                    <InputSearchEF
                    tableForm={tableForm}
                    text={text}
                    record={record}
                    index={record[primaryKey]}
                    name="dict_id"
                    rules={[{ required: false, message: '请选择数据字典' }]}
                    handleFieldChange={handleFieldChange}
                    onClick={() => {
                        setRowId(record)
                        setSelectDictDailogVisible(true);
                      }}
                      onSearch={() => {
                        setRowId(record)
                        setSelectDictDailogVisible(true);
                      }}
                    />
                );

            },
        },{
            title: '是否字典',
            dataIndex: 'input_mode',
            key: 'input_mode',
            render: (text, record, index) => {
                return (
                    <SelectEF
                    tableForm={tableForm}
                    text={text}
                    record={record}
                    index={record.row_number}
                    name="input_mode"
                    rules={[{ required: true, message: '请选择!' }]}
                    handleFieldChange={handleFieldChangeInput}
                    dictData={isInput}
                    keyName={'rowcolId'}
                    valueName={'rowcolname'}
                    placeholder={"请选择"}
                  />
                );
            },   
        },{
            title: '字典项',
            dataIndex: 'dict_name',
            key: 'dict_name',
            render: (text, record, index) => {
                if(record.input_mode=="dict"){
                    return (
                        <InputSearchEF
                        tableForm={tableForm}
                        text={text}
                        record={record}
                        index={record[primaryKey]}
                        name="dict_name"
                        rules={[{ required: true, message: '请选择字典' }]}
                        handleFieldChange={handleFieldChange}
                        onClick={() => {
                            setRowId(record)
                            setSelectDictDailogVisible(true);
                          }}
                          onSearch={() => {
                            setRowId(record)
                            setSelectDictDailogVisible(true);
                          }}
                        />
                    );
                }else{
                    return "";
                }

            },
        },{
            title: '限定词',
            dataIndex: 'qualifier',
            key: 'qualifier',
            render: (text, record, index) => {
                return (
                    <SelectEF
                    tableForm={tableForm}
                    text={text}
                    record={record}
                    index={record.row_number}
                    name="qualifier"
                    rules={[{ required: true, message: '请选择!' }]}
                    handleFieldChange={handleFieldChange}
                    dictData={mSkey}
                    keyName={'rowcolId'}
                    valueName={'rowcolname'}
                    placeholder={"请选择"}
                  />
                );
            },
        },{
            title: '横排',
            dataIndex: 'spread_mode',
            key: 'spread_mode',
            render: (text, record, index) => {
                return (
                    <SelectEF
                    tableForm={tableForm}
                    text={text}
                    record={record}
                    index={record.row_number}
                    name="spread_mode"
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
                <SelectDictDailog
                    modalVisible={selectDictDailogVisible}
                    handleOk={(selectDict) => {
                        if (selectDict) {
                            console.log(selectDict);
                            rowId.dict_id=selectDict.dict_id;
                            rowId.dict_name=selectDict.dict_name;
                        }
                        setRowId("");
                        setSelectDictDailogVisible(false);
                    }}
                    handleCancel={() => {
                        setRowId("");
                        setSelectDictDailogVisible(false);
                    }}
                />
            </Form>
        </>
    );
});
export default TableForm;
