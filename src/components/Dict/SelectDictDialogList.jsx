//选择仓库的对话框
import React, { useState, useEffect, useRef } from 'react';
import { Button, Space, message, Tree, Row, Col, Modal } from 'antd';
import ProTable from '@ant-design/pro-table';
import HttpService from '@/utils/HttpService.jsx';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';


// 获取数据
const fetchData = async (params, sort, filter) => {
    console.log('getByKeyword', params, sort, filter);

    const requestParam = {
        path: '-1-',
        pageNum: params.current,
        perPage: params.pageSize,
        ...params

    }

    const result = await HttpService.post('reportServer/invOrg/getByKeyword', JSON.stringify(requestParam));
    console.log('result : ', result);
    return Promise.resolve({
        data: result.data,
        total: result.data.length,
        success: result.resultCode === "1000"
    });
}


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
        valueEnum: {
            1: '仓库',
            2: '门店'
        }
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
    },
];


const SelectOrgDialog = (props) => {

    const { modalVisible, handleOk, handleCancel } = props;
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectOrg, setSelectOrg] = useState({});


    const selectOnChange = (selectedKeys, selectedRows) => {
        setSelectedRowKeys(selectedKeys);
        if (0 < selectedRows.length) {
            let org = selectedRows[0];
            setSelectOrg(org);
        } else {
            setSelectOrg({});
        }
    }
    return (
        <Modal title="选择仓库" visible={modalVisible} onOk={() => {
            handleOk(selectOrg)
        }} onCancel={handleCancel}>
            <ProTable
                onRow={record => {
                    return {
                        // 点击行
                        onClick: event => {
                            setSelectedRowKeys([record.org_id]);
                            setSelectOrg(record)
                        },
                    };
                }}
                headerTitle="仓库列表"
                columns={columns}
                request={fetchData}
                rowKey="org_id"
                rowSelection={{
                    type: 'radio',
                    onChange: selectOnChange,
                    selectedRowKeys: selectedRowKeys
                }}
                tableAlertRender={false}
                tableAlertOptionRender={false}

                // tableAlertRender={({ selectedRows }) => {
                //     return (
                //         <Space size={24}>
                //             <span>

                //                 已选中 {selectedRows.length < 1 ? '' : selectedRows[0].org_name}

                //             </span>
                //         </Space>
                //     )
                // }}
                // tableAlertOptionRender={({ onCleanSelected }) => (
                //     <Space size={16}>
                //         <a
                //             onClick={onCleanSelected}
                //         >
                //             取消选中
                //     </a>
                //     </Space>
                // )}
                toolBarRender={false}
                pagination={{
                    showQuickJumper: true,
                }}
                search={false}
                dateFormatter="string"
            />

        </Modal>
    );
}
export default SelectOrgDialog;




