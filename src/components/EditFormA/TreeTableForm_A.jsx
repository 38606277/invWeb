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
import { Table, Form, message, Input, Button } from 'antd';
import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import styles from './index.less';
import InputEF_A from '@/components/EditFormA/InputEF_A'
import SelectEF_A from '@/components/EditFormA/SelectEF_A'
import InputNumberEF_A from '@/components/EditFormA/InputNumberEF_A'
import InputSearchEF_A from '@/components/EditFormA/InputSearchEF_A'
import styles2 from '@/components/EditForm/index.less';

const TreeTableForm = forwardRef((props, ref) => {
    const { primaryKey, tableForm, columns, onDeleteListener } = props;
    const [data, setData] = useState([]);//数据
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);//选中的key
    const [deleteRecord, setDeleteRecord] = useState([]);//删除记录
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);//展开的key


    //table全选
    const onTableSelectAll = (selected, selectedRows, changeRows) => {
        const temp = [];
        if (selected) {
            for (let i = 0; i < selectedRows.length; i++) {
                temp.push(selectedRows[i][primaryKey]);
            }
        }
        setSelectedRowKeys(temp);
    }

    //选择
    const onTableSelect = (record, selected, selectedRows, nativeEvent) => {
        const newdata = [];
        newdata.push(record[primaryKey]);
        if (selected) {
            if (undefined != record.children) {
                findTreeListItemRowKey(record.children, newdata);
            }
            const newd = [...selectedRowKeys, ...newdata];
            const lastData = [...new Set(newd)];
            setSelectedRowKeys(lastData);

        } else {
            if (undefined != record.children) {
                findTreeListItemRowKey(record.children, newdata);
            }
            const tempOld = [...selectedRowKeys];
            for (let i = 0; i < tempOld.length; i++) {
                for (let ii = 0; ii < newdata.length; ii++) {
                    if (tempOld[i] == newdata[ii]) {
                        selectedRowKeys.splice(selectedRowKeys.findIndex(item => item === newdata[ii]), 1);
                        break;
                    }
                }
            }
            const temp = [];
            const tempId = [...selectedRowKeys, ...temp];
            setSelectedRowKeys(tempId);
        }
    }

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
        //新增一行
        addChilrenItem: (record, item) => {
            addChilrenItem(record, item);
        },
        //删除选中项
        removeRows: () => {
            removeRows();
        },
        //获取表格数据
        getTableData() {
            return data;
        },
        //获取删除行
        getDeleteRecordKeys() {
            return deleteRecord;
        },
        //修改值
        handleFieldChange(filedValue, fieldName, record) {
            handleFieldChange(filedValue, fieldName, record);
        },
        //修改对象
        handleObjChange(obj, record) {
            handleObjChange(obj, record)
        }
    }))

    /**
     * 新增一行
     * @param {} newItem 
     */
    const newMember = (newItem) => {
        const newData = data?.map((item) => ({ ...item })) || [];
        newData.push(newItem);
        setData(newData);
    };

    /**
     * 删除行
     */
    const removeRows = () => {
        if (selectedRowKeys.length < 1) {
            message.error('请选择删除项');
            return;
        }
        const deleteRow = [];
        const newData = [];
        for (let i = 0; i < selectedRowKeys.length; i++) {
            removeTreeListItem(data, selectedRowKeys[i], deleteRow);
        }
        for (let ii = 0; expandedRowKeys.length; ii++) {
            for (let iii = 0; iii < selectedRowKeys.length; iii++) {
                expandedRowKeys.splice(expandedRowKeys.findIndex(item => item === selectedRowKeys[iii]), 1);
            }
        }

        const newdd = [...newData, ...data];
        setData(newdd);
        //赋值失败
        const newDelte = [...deleteRecord, ...selectedRowKeys];
        setDeleteRecord(newDelte);
        setSelectedRowKeys([]);
        if (onDeleteListener) {
            onDeleteListener(deleteRow)
        }
    }

    /**
     * 树结构递归查询对应行
     * @param {*} treeList 
     * @param {*} idlist 
     */
    const findTreeListItemRowKey = (treeList, idlist) => { // 根据id属性从数组（树结构）中移除元素
        if (!treeList || !treeList.length) {
            return
        }
        for (let i = 0; i < treeList.length; i++) {
            if (idlist.indexOf(treeList[i][primaryKey]) == -1) {
                idlist.push(treeList[i][primaryKey]);
            }
            if (undefined != treeList[i].children) {
                findTreeListItemRowKey(treeList[i].children, idlist);
            }
        }
    }

    /**
     * 删除树结构的item
     * @param {} treeList 
     * @param {*} id 
     */
    const removeTreeListItem = (treeList, id, deleteRow) => { // 根据id属性从数组（树结构）中移除元素
        if (!treeList || !treeList.length) {
            return
        }
        for (let i = 0; i < treeList.length; i++) {
            if (treeList[i][primaryKey] == id) {
                deleteRow.push(treeList[i]);
                treeList.splice(i, 1);
                break;
            }
            if (undefined != treeList[i].children) {
                removeTreeListItem(treeList[i].children, id, deleteRow);
            }
        }
    }
    /**
     * 获取子节点的key
     * @param {}} valueChild 
     * @param {*} childrenRowkey 
     */
    const getChildrenRowKey = (valueChild, childrenRowkey) => {
        for (let i = 0; i < valueChild.length; i++) {
            childrenRowkey.push(valueChild[i])
            if (undefined != valueChild[i].children) {
                getChildrenRowKey(valueChild[i].children, childrenRowkey);
            }
        }
        return childrenRowkey;
    }

    /**
     * 删除节点下的子项
     * @param {*} valueChild 
     */
    const getChildrenRowKeyForRemove = (valueChild) => {
        valueChild.filter(item => {
            for (let i = 0; i < valueChild.length; i++) {
                if (valueChild[i][primaryKey] === item[primaryKey]) {
                    return false
                }
                if (undefined != item.children) {
                    getChildrenRowKeyForRemove(item.children);
                }
            }
            return true;
        });
    }

    /**
     * 获取子节点数据
     * @param {*} key 
     * @param {*} valueChild 
     * @param {*} childrenRowkey 
     * @param {*} tempData 
     */
    const getChildrenDataByRowKey = (key, valueChild, childrenRowkey, tempData) => {
        for (let i = 0; i < valueChild.length; i++) {
            if (valueChild[i][primaryKey] === key) {
                return valueChild[i];
            }
            if (undefined != valueChild[i].children) {
                tempData = getChildrenDataByRowKey(key, valueChild[i].children, childrenRowkey, tempData);
            }
        }
        return tempData;
    }

    /**
     * 获取行数据
     * @param {*} key 
     * @param {*} valueChild 
     */
    const getRowByKey = (key, valueChild) => {
        let childrenRowkey = [];
        let tempData = null;
        for (let i = 0; i < valueChild.length; i++) {
            if (valueChild[i][primaryKey] === key) {
                return valueChild[i];
            }
            if (undefined != valueChild[i].children) {
                tempData = getChildrenDataByRowKey(key, valueChild[i].children, childrenRowkey, tempData);
            }
        }
        return tempData;
    }


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
     * 字段值修改
     * @param {} filedValue 
     * @param {*} fieldName 
     * @param {*} record 
     */
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

    };

    /**
     * 添加子节点
     * @param {} record 
     */
    const addChilrenItem = (record, item) => {
        if (undefined == record.children) {
            record["children"] = [];
            record.children.push(item);
        } else {
            record.children.push(item)
        }
        addTreeListItem(data, record);
        const newData = [];
        const newdd = [...newData, ...data];
        setData(newdd);
        setSelectedRowKeys([]);

        expandedRowKeys.push(record[primaryKey]);
        const tempss = [...expandedRowKeys];
        setExpandedRowKeys(tempss)
    }

    /**
     *  根据id属性从数组（树结构）中添加元素
     * @param {*} treeList 
     * @param {*} Obj 
     */
    const addTreeListItem = (treeList, Obj) => { // 根据id属性从数组（树结构）中添加元素
        if (!treeList || !treeList.length) {
            return
        }
        for (let i = 0; i < treeList.length; i++) {
            if (treeList[i][primaryKey] == Obj[primaryKey]) {
                treeList[i] = Obj;
                return;
            }
            if (undefined != treeList[i].children) {
                addTreeListItem(treeList[i].children, Obj);
            }
        }
    }

    /**
     * 展开回调
     * @param {}} expandedRows 
     */
    const onExpandedRowsChange = (expandedRows) => {
        setExpandedRowKeys(expandedRows)
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
                if (renderParams?.onRender) {
                    renderParams?.onRender(text, record, index, renderParams)
                }
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
        } else {// 默认输入框
            return <InputEF_A  {...renderParams} />;
        }
    }
    return (
        <>
            <Form
                className={styles2.tableForm}
                key='tableForm'
                form={tableForm}>
                <Table
                    expandable={{
                        defaultExpandAllRows: true,
                        onExpandedRowsChange: onExpandedRowsChange,
                        expandedRowKeys: expandedRowKeys
                    }}
                    rowKey={primaryKey}
                    columns={buildColumns(columns || [])}
                    dataSource={data}
                    pagination={false}
                    rowSelection={{
                        selectedRowKeys: selectedRowKeys,
                        checkStrictly: true,
                        type: 'checkbox',
                        onSelect: onTableSelect,
                        onSelectAll: onTableSelectAll,
                    }}
                />
            </Form>
        </>
    );
});
export default TreeTableForm;
