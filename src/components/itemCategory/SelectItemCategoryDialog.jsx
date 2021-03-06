//选择仓库的对话框
import React, { useState, useEffect, useRef } from 'react';
import { Button, Space, message, Tree, Row, Col, Modal, Table, Input, Pagination } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import HttpService from '@/utils/HttpService.jsx';

const Search = Input.Search;

const columns = [{
    title: 'ID',
    dataIndex: 'category_id',
    key: 'category_id'
}, {
    title: '编码',
    dataIndex: 'category_code',
    key: 'category_code'
}, {
    title: '名称',
    dataIndex: 'category_name',
    key: 'category_name',
}];

const SelectItemCategoryDialog = (props) => {

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

        const result = await  HttpService.post('reportServer/itemCategory/getAllList',JSON.stringify({"category_pid":"-1"}));
        console.log('result : ', result);
        return Promise.resolve({
            data: result.data,
            success: result.resultCode ==="1000"
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
        <Modal title="选择类别" visible={modalVisible} onOk={() => {
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

            <div>
                <ProTable
                    onRow={record => {
                        return {
                            // 点击行
                            onClick: event => {

                                if (selectType === 'radio') {
                                    setCheckKeys([record.category_id])
                                    setCheckRows([record])
                                } else {
                                    //有取消的情况
                                    if (isCheck(record.category_id)) { // 选中则移除
                                        //移除key
                                        const newCheckKeys = checkKeys.filter((item) => {
                                            return item !== record.category_id;
                                        })

                                        //移除record
                                        const newCheckRows = checkRows.filter((item) => {
                                            return item.category_id !== record.category_id;
                                        })

                                        setCheckKeys(newCheckKeys);
                                        setCheckRows(newCheckRows);
                                    } else { // 未选中则添加
                                        setCheckKeys([...checkKeys, record.category_id]);
                                        setCheckRows([...checkRows, record]);
                                    }
                                }
                            },
                        };
                    }}
                    columns={columns}
                    request={fetchData}
                    rowKey="category_id"
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
        </Modal>
    );


}


export default SelectItemCategoryDialog;




