//选择仓库的对话框
import React, { useState, useEffect, useRef } from 'react';
import { Button, Space, message, Tree, Row, Col, Modal, Table, Drawer } from 'antd';
import HttpService from '@/utils/HttpService.jsx';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';


const columns = [
    {
        title: '名称',
        dataIndex: 'org_name',
        key: 'org_name',
        valueType: 'text',
    },
    {
        title: '类型',
        dataIndex: 'org_type',
        key: 'org_type',
        valueType: 'text',
    },
    {
        title: '地址',
        dataIndex: 'address',
        key: 'address',
        valueType: 'text',
    },
    {
        title: '联系人',
        dataIndex: 'contacts',
        key: 'contacts',
        valueType: 'text',
    }
];

const SelectOrgDialog = (props) => {

    const { modalVisible, handleOk, handleCancel } = props;
    const [checkKeys, setCheckKeys] = useState([]);
    const [checkRows, setCheckRows] = useState([]);
    const [treeData, setTreeData] = useState([]);

    const selectType = props?.selectType || 'radio';

    //初始化数据
    useEffect(() => {
        getAllChildrenRecursionById("0");
    }, [])


    //重置选中状态
    useEffect(() => {
        setCheckKeys([]);
        setCheckRows([]);
    }, [modalVisible])


    // 获取数据
    const getAllChildrenRecursionById = (mOrgPid) => {
        HttpService.post('reportServer/invOrg/getAllChildrenRecursionById', JSON.stringify({ org_pid: mOrgPid }))
            .then(res => {
                if (res.resultCode === "1000") {
                    setTreeData(res.data)
                } else {
                    message.error(res.message);
                }
            });
    }


    return (
        <Drawer title="选择仓库"
            visible={modalVisible}
            onClose={handleCancel}
            bodyStyle={{ paddingBottom: 80 }}
            width={720}
            footer={
                <div
                    style={{
                        textAlign: 'right',
                    }}
                >
                    <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                        取消
              </Button>
                    <Button onClick={() => {
                        if (0 < checkKeys.length) {
                            if (selectType === 'radio') {
                                handleOk(checkRows[0], checkKeys[0])
                            } else {
                                handleOk(checkRows, checkKeys)
                            }
                        } else {
                            handleCancel();
                        }
                    }} type="primary">
                        确定
              </Button>
                </div>
            }

        >

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
                dataSource={treeData}
                pagination={false}
                expandable={{
                    defaultExpandAllRows: true,
                    expandRowByClick: true
                }}
            />

        </Drawer>
    );


}


export default SelectOrgDialog;




