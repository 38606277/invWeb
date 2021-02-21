//选择仓库的对话框
import React, { useState, useEffect, useRef } from 'react';
import { Button, Space, message, Tree, Row, Col, Modal, Table, Input, Pagination } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import HttpService from '@/utils/HttpService.jsx';

const Search = Input.Search;

const columns = [{
    title: 'ID',
    dataIndex: 'vendor_id',
    key: 'vendor_id'
}, {
    title: '名称',
    dataIndex: 'vendor_name',
    key: 'vendor_name',
}, {
    title: '地址',
    dataIndex: 'vendor_address',
    key: 'vendor_address',
    maxWidth: '200px'
}, {
    title: '联系人',
    dataIndex: 'vendor_link',
    key: 'vendor_link',
    maxWidth: '200px'
}];

const SelectVendorsDialog = (props) => {

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
            startIndex: params.current,
            perPage: params.pageSize,
            vendor_name: '',
            vendor_address: '',
            vendor_link: '',
            vendor_type: ''
        }

        const result = await HttpService.post('/reportServer/vendors/getAllPage',JSON.stringify(requestParam));
        console.log('result : ', result);
        return Promise.resolve({
            data: result.data.list,
            total: result.data.total,
            success: result.resultCode === "1000"
        });
    }


    const selectOnChange = (selectedKeys, selectedRows) => {
        setCheckKeys(selectedKeys);
        setCheckRows(selectedRows)
     
    }

    const isCheck = (vendor_id) => {
        for (let index in checkKeys) {
            if (checkKeys[index] === vendor_id) {
                return true;
            }
        }
        return false;
    }


    return (
        <Modal title="选择供应商" visible={modalVisible} onOk={() => {
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
                                    setCheckKeys([record.vendor_id])
                                    setCheckRows([record])
                                } else {
                                    //有取消的情况
                                    if (isCheck(record.vendor_id)) { // 选中则移除
                                        //移除key
                                        const newCheckKeys = checkKeys.filter((item) => {
                                            return item !== record.vendor_id;
                                        })

                                        //移除record
                                        const newCheckRows = checkRows.filter((item) => {
                                            return item.vendor_id !== record.vendor_id;
                                        })

                                        setCheckKeys(newCheckKeys);
                                        setCheckRows(newCheckRows);
                                    } else { // 未选中则添加
                                        setCheckKeys([...checkKeys, record.vendor_id]);
                                        setCheckRows([...checkRows, record]);
                                    }
                                }
                            },
                        };
                    }}
                    columns={columns}
                    request={fetchData}
                    rowKey="vendor_id"
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


export default SelectVendorsDialog;




