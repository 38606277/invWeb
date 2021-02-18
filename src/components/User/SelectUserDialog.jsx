//选择仓库的对话框
import React, { useState, useEffect, useRef } from 'react';
import { Button, Space, message, Tree, Row, Col, Modal, Table, Input, Pagination, Drawer } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import User from '@/services/user-service.jsx';
const _user = new User();

const Search = Input.Search;

const columns = [{
    title: 'ID',
    dataIndex: 'userId',
    key: 'userId'
}, {
    title: '姓名',
    dataIndex: 'userName',
    key: 'userName',
}, {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    maxWidth: '200px'
}, {
    title: '角色',
    dataIndex: 'isAdminText',
    key: 'isAdminText'
}, {
    title: '入职时间',
    dataIndex: 'creationDate',
    key: 'creationDate'
}];

const SelectUserDialog = (props) => {

    const { modalVisible, handleOk, handleCancel } = props;
    const [checkKeys, setCheckKeys] = useState([]);
    const [checkRows, setCheckRows] = useState([]);

    const selectType = props?.selectType || 'radio';

    //重置选中状态
    useEffect(() => {
        setCheckKeys([]);
        setCheckRows([]);
    }, [modalVisible])



    // 获取数据
    const fetchData = async (params, sort, filter) => {

        const requestParam = {
            pageNum: params.current,
            perPage: params.pageSize,
            searchKeyword: params.keyword,
            ...params

        }

        const result = await _user.getUserList(requestParam);
        console.log('result : ', result);
        return Promise.resolve({
            data: result.data.list,
            total: result.data.total,
            success: result.status === 0
        });
    }


    const selectOnChange = (selectedKeys, selectedRows) => {
        setCheckKeys(selectedKeys);
        setCheckRows(selectedRows)
        // console.log('selectedKeys', selectedKeys)
        // console.log('selectedRows', selectedRows)
    }

    const isCheck = (userId) => {
        for (let index in checkKeys) {
            if (checkKeys[index] === userId) {
                return true;
            }
        }
        return false;
    }


    return (
        <Drawer title="选择用户" visible={modalVisible} onClose={handleCancel}

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

            <div>
                <ProTable
                    onRow={record => {
                        return {
                            // 点击行
                            onClick: event => {

                                if (selectType === 'radio') {
                                    setCheckKeys([record.id])
                                    setCheckRows([record])
                                } else {
                                    //有取消的情况
                                    if (isCheck(record.id)) { // 选中则移除
                                        //移除key
                                        const newCheckKeys = checkKeys.filter((item) => {
                                            return item !== record.id;
                                        })

                                        //移除record
                                        const newCheckRows = checkRows.filter((item) => {
                                            return item.id !== record.id;
                                        })

                                        setCheckKeys(newCheckKeys);
                                        setCheckRows(newCheckRows);
                                    } else { // 未选中则添加
                                        setCheckKeys([...checkKeys, record.id]);
                                        setCheckRows([...checkRows, record]);
                                    }
                                }
                            },
                        };
                    }}
                    columns={columns}
                    request={fetchData}
                    rowKey="id"
                    rowSelection={{
                        type: selectType,
                        onChange: selectOnChange,
                        selectedRowKeys: checkKeys
                    }}
                    tableAlertRender={false}
                    tableAlertOptionRender={false}

                    pagination={{
                        showQuickJumper: true,
                    }}
                    options={{
                        search: true,
                    }}
                    search={false}
                    dateFormatter="string"
                />

            </div>
        </Drawer>
    );


}


export default SelectUserDialog;




