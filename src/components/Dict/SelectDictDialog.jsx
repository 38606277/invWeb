//选择仓库的对话框
import React, { useState, useEffect, useRef } from 'react';
import { Button, Space, message, Tree, Row, Col, Modal, Table } from 'antd';
import HttpService from '@/utils/HttpService.jsx';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';


const columns = [
    {
        title: 'ID',
        dataIndex: 'dict_id',
        key: 'dict_id',
        valueType: 'text',
    },
    {
        title: '名称',
        dataIndex: 'dict_name',
        key: 'dict_name',
        valueType: 'text',
    },
    {
        title: '编码',
        dataIndex: 'dict_code',
        key: 'dict_code',
        valueType: 'text',
    }
];

const SelectDictDialog = (props) => {

    const { modalVisible, handleOk, handleCancel } = props;
    const [checkKeys, setCheckKeys] = useState([]);
    const [checkRows, setCheckRows] = useState([]);
    const [treeData, setTreeData] = useState([]);

    const selectType = props?.selectType || 'radio';

    //初始化数据
    useEffect(() => {
        getAllChildrenRecursionById();
    }, [])


    //重置选中状态
    useEffect(() => {
        setCheckKeys([]);
        setCheckRows([]);
    }, modalVisible)


    // 获取数据
    const getAllChildrenRecursionById = () => {
        HttpService.post('reportServer/mdmDict/getAll',{})
            .then(res => {
                if (res.resultCode === "1000") {
                    setTreeData(res.data)
                } else {
                    message.error(res.message);
                }
            });
    }


    return (
        <Modal title="选择字典" visible={modalVisible} onOk={() => {
            if (0 < checkKeys.length) {
                if (selectType === 'radio') {
                    handleOk(checkRows[0], checkKeys[0])
                } else {
                    handleOk(checkRows, checkKeys)
                }
            } else {
                handleCancel();
            }
        }} onCancel={handleCancel}>

            <Table
                columns={columns}
                rowSelection={{
                    type: selectType,
                    onChange: (selectedRowKeys, selectedRows) => {
                        // console.log('selectedRowKeys - ', selectedRowKeys)
                        // console.log('selectedRows - ', selectedRows)
                        setCheckKeys(selectedRowKeys);
                        setCheckRows(selectedRows);
                    }
                }}
                rowKey={"dict_id"}
                dataSource={treeData}
                pagination={false}
                expandable={{
                    defaultExpandAllRows: false,
                    expandRowByClick: true
                }}
            />

        </Modal>
    );


}


export default SelectDictDialog;




