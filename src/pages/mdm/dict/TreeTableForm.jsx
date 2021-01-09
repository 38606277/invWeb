import { Table, Form, message, Input, Button } from 'antd';
import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import styles from './style.less';
import InputEF from '@/components/EditForm/InputEF';
import { PlusOutlined } from '@ant-design/icons';

const TreeTableForm = forwardRef((props, ref) => {

    const { primaryKey, tableForm, value, onChange } = props;

    const [data, setData] = useState(value);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedRowKeys,setSelectedRowKeys] =useState([]);
    const [deleteRecord, setDeleteRecord] = useState([]);//删除记录
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

    const onTableChange = (selectedRowKeys, selectedRows) => {
        setSelectedRows(selectedRows);
        setSelectedRowKeys(selectedRowKeys);
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
            console.log('delete='+JSON.stringify(deleteRecord));
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
        const newSlectRow=[];
        const newData =[];
        for (let i = 0; i < selectedRows.length; i++) {
            removeTreeListItem(data,selectedRows[i][primaryKey]);
            // newSlectRow.push(selectedRows[i])
            // if(undefined!=selectedRows[i].children){
            //     getChildrenRowKey(selectedRows[i].children,newSlectRow);
            // }
        }
       
        const newdd=[...newData,...data];
        setData(newdd);
        //赋值失败
        const newDelte= [...deleteRecord,...selectedRowKeys];
        setDeleteRecord(newDelte);
        setSelectedRows([]);
        setSelectedRowKeys([]);
        if (onChange) {
            onChange(newData);
        }
    }
    const removeTreeListItem = (treeList, id) => { // 根据id属性从数组（树结构）中移除元素
        if (!treeList || !treeList.length) {
            return
        }
        for (let i = 0; i < treeList.length; i++) {
            if (treeList[i][primaryKey] == id) {
                treeList.splice(i, 1);
                break;
            }
            if(undefined!=treeList[i].children){
                removeTreeListItem(treeList[i].children, id);
            }
        }
    }
    const getChildrenRowKey = (valueChild,childrenRowkey) => {
        for(let i=0;i<valueChild.length;i++){
                childrenRowkey.push(valueChild[i])
                if(undefined!=valueChild[i].children){
                    getChildrenRowKey(valueChild[i].children,childrenRowkey);
                }
        }
        return childrenRowkey;
    }

    const getChildrenRowKeyForRemove = (valueChild) => {
        valueChild.filter(item => {
            for (let i = 0; i < valueChild.length; i++) {
                if (valueChild[i][primaryKey] === item[primaryKey]) {
                    return false
                }
                if(undefined!=item.children){
                   getChildrenRowKeyForRemove(item.children);
                }
            }
            return true;
        });
    }

    const getChildrenDataByRowKey = (key , valueChild, childrenRowkey,tempData) => {
        for(let i=0;i<valueChild.length;i++){
            if(valueChild[i][primaryKey]===key){
                return valueChild[i];
            }
            if(undefined!=valueChild[i].children){
                tempData = getChildrenDataByRowKey(key,valueChild[i].children, childrenRowkey,tempData);
            }
        }
        return tempData;
    }

    const getRowByKey = (key, valueChild) =>{
        let childrenRowkey =[];
        let tempData=null;
        for(let i=0;i<valueChild.length;i++){
            if(valueChild[i][primaryKey]===key){
                return valueChild[i];
            }
            if(undefined!=valueChild[i].children){
                tempData=getChildrenDataByRowKey(key,valueChild[i].children, childrenRowkey,tempData);
            }
        }
        if(null!=tempData){
            console.log("ssss=="+JSON.stringify(tempData));
        }
       
        return tempData;
    }

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

    const addChilren = (record) =>{
        if(undefined==record.children){
            record["children"]=[];
            record.children.push({
                value_id: `NEW_${(Math.random() * 1000000).toFixed(0)}`,
                value_code: '',
                value_name: '',
                value_pid:record.value_id,
                dict_id:record.dict_id,
                editable: true,
                isNew: true,
            })
        }else{
            record.children.push({
                value_id: `NEW_${(Math.random() * 1000000).toFixed(0)}`,
                value_code: '',
                value_name: '',
                value_pid:record.value_id,
                dict_id:record.dict_id,
                editable: true,
                isNew: true,
            })
        }
        addTreeListItem(data,record);
        const newData=[];
        const newdd=[...newData,...data];
        setData(newdd);
        setSelectedRows([]);
        setSelectedRowKeys([]);
        if (onChange) {
            onChange(newdd);
        }
    }
    const addTreeListItem = (treeList,Obj) => { // 根据id属性从数组（树结构）中添加元素
        if (!treeList || !treeList.length) {
            return
        }
        for (let i = 0; i < treeList.length; i++) {
            if (treeList[i][primaryKey] == Obj[primaryKey]) {
                treeList[i]=Obj;
                return;
            }
            if(undefined!=treeList[i].children){
                addTreeListItem(treeList[i].children,Obj);
            }
        }
    }

    const columns = [
        {
            title: '字典编码',
            dataIndex: 'value_code',
            key: 'value_code',
            width: '40%',
            render: (text, record, index) => {
                return (
                    <InputEF
                        tableForm={tableForm}
                        text={text}
                        record={record}
                        index={record.value_id}
                        name="value_code"
                        rules={[{ required: true, message: 'Please input your name!' }]}
                        handleFieldChange={handleFieldChange}
                        placeholder={"请输入成员姓名"}
                    />
                );
            },

        },
        {
            title: '字典名称',
            dataIndex: 'value_name',
            key: 'value_name',
            width: '40%',
            render: (text, record, index) => {
                return (
                    <InputEF
                        tableForm={tableForm}
                        text={text}
                        record={record}
                        index={record.value_id}
                        name="value_name"
                        rules={[{ required: true, message: 'Please input your workId!' }]}
                        handleFieldChange={handleFieldChange}
                        placeholder={"请输入工号"}
                    />
                );
            },
        },
        {
            title: '操作',
            key: 'option',
            width: '10%',
            render: (text, record, index) => {
                return (
                    <Button icon={<PlusOutlined />} onClick={()=>addChilren(record)}></Button>
              );

            },
        },
        {
            title: '父ID',
            dataIndex: 'value_pid',
            key: 'value_pid',
            className:styles.columnshow,
            render: (text, record, index) => {
                return (
                  <InputEF
                  tableForm={tableForm}
                  text={text}
                  record={record}
                  index={record.value_id}
                  name="value_pid"
                  rules={[{ required: false, message: 'Please input your workId!' }]}
                  handleFieldChange={handleFieldChange}
                  placeholder={"请输入工号"}
                />
              );

            },
        },
    ];

    const [checkStrictly, setCheckStrictly] = React.useState(false);
    return (
        <>
            <Form
                key='tableForm'
                form={tableForm}>
                <Table
                    expandable={{defaultExpandAllRows:true}}
                    rowKey={primaryKey}
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                    rowSelection={{
                        ...selectedRowKeys,
                        checkStrictly,
                        type: 'checkbox',
                        onChange: onTableChange,
                    }}
                />
            </Form>
        </>
    );
});
export default TreeTableForm;
