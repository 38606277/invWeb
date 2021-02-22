//选择生产订单的对话框
import React, { useState, useEffect, useRef } from 'react';
import { Button, Space, message, Tree, Row, Col, Modal, Table, Input, Pagination, Drawer } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import HttpService from '@/utils/HttpService.jsx';


const columns = [
    {
        title: '订单名称',
        dataIndex: 'pd_header_name',
        key: 'pd_header_id',
        valueType: 'text',
    },
    {
        title: '制造商',
        dataIndex: 'manufactory_name',
        key: 'manufactory_id',
        valueType: 'text',
    },
    {
        title: '更新时间',
        dataIndex: 'update_date',
        valueType: 'dateTime',
    }


];



const linesColumns = [
    {
        title: '物料描述',
        dataIndex: 'item_description',
    },
    {
        title: '物料类别',
        dataIndex: 'category_name',
    },
    {
        title: '单价',
        dataIndex: 'price',
    },
    {
        title: '单位',
        dataIndex: 'uom',
    },
    {
        title: '数量',
        dataIndex: 'quantity',
    },
    {
        title: '金额',
        dataIndex: 'amount'
    },
    {
        title: '已接收数量',
        dataIndex: 'rcv_quantity'
    },
    {
        title: '未接收数量',
        dataIndex: 'not_rcv_quantity'
    }
]

const linesKey = 'line_id';

const SelectPdDialog = (props) => {

    const { modalVisible, handleOk, handleCancel } = props;

    //主信息
    const [mainCheckKeys, setMainCheckKeys] = useState([]);
    const [selectPdHeader, setSelectPdHeader] = useState({});

    //行信息
    const [checkKeys, setCheckKeys] = useState([]);
    const [checkRows, setCheckRows] = useState([]);

    const linesTableRef = useRef();


    const item_type = props?.item_type || '0';

    //重置选中状态
    useEffect(() => {
        setMainCheckKeys([]);
        setSelectPdHeader({});
        setCheckKeys([]);
        setCheckRows([]);
    }, [modalVisible])

    //选择头信息后刷新行信息列表
    useEffect(() => {
        //console.log('selectPdHeader')
        linesTableRef?.current?.reload();
    }, [selectPdHeader]);



    //获取行数据
    const fetchLinesData = async (params, sort, filter) => {

        if (selectPdHeader?.pd_header_id == null) {
            return Promise.resolve({
                data: [],
                total: 0,
                success: true,
            });
        }

        let requestParam = {
            pageNum: params.current,
            perPage: params.pageSize,
            ...params,
            header_id: selectPdHeader?.pd_header_id,
            item_type: item_type
        };

        const result = await HttpService.post(
            'reportServer/pd/getPdOrderLinesById',
            JSON.stringify(requestParam),
        );

        return Promise.resolve({
            data: result.data.list,
            total: result.data.total,
            success: result.resultCode == '1000',
        });
    };


    //获取主数据
    const fetchData = async (params, sort, filter) => {
        let requestParam = {
            pageNum: params.current,
            perPage: params.pageSize,
            ...params,
        };
        const result = await HttpService.post(
            'reportServer/pd/getListByPage',
            JSON.stringify(requestParam),
        );

        return Promise.resolve({
            data: result.data.list,
            total: result.data.total,
            success: result.resultCode == '1000',
        });
    };



    const mainSelectOnChange = (selectedKeys, selectedRows) => {
        console.log('mainSelectOnChange', selectedRows)
        setMainCheckKeys(selectedKeys);
        setSelectPdHeader(selectedRows[0]);
    }


    const selectOnChange = (selectedKeys, selectedRows) => {
        setCheckKeys(selectedKeys);
        setCheckRows(selectedRows);
    }

    const isCheck = (recordId) => {
        for (let index in checkKeys) {
            if (checkKeys[index] === recordId) {
                return true;
            }
        }
        return false;
    }


    return (
        <Drawer title="选择生产订单" visible={modalVisible}
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
                        if (selectPdHeader?.pd_header_id != null) { //判断是否选生产订单
                            //返回订单头信息，行信息
                            handleOk(selectPdHeader, checkRows)
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
                                setMainCheckKeys([record.po_header_id]);
                                setSelectPdHeader(record);
                            },
                        };
                    }}
                    columns={columns}
                    request={fetchData}
                    rowKey="pd_header_id"
                    rowSelection={{
                        type: 'radio',
                        onChange: mainSelectOnChange,
                        selectedRowKeys: mainCheckKeys
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
                    headerTitle="生产订单"
                />

                <ProTable
                    actionRef={linesTableRef}
                    onRow={record => {
                        return {
                            // 点击行
                            onClick: event => {
                                if (record.not_rcv_quantity == '0') {
                                    return;
                                }

                                //有取消的情况
                                if (isCheck(record[linesKey])) { // 选中则移除
                                    //移除key
                                    const newCheckKeys = checkKeys.filter((item) => {
                                        return item !== record[linesKey];
                                    })

                                    //移除record
                                    const newCheckRows = checkRows.filter((item) => {
                                        return item[linesKey] !== record[linesKey];
                                    })

                                    setCheckKeys(newCheckKeys);
                                    setCheckRows(newCheckRows);
                                } else { // 未选中则添加
                                    setCheckKeys([...checkKeys, record[linesKey]]);
                                    setCheckRows([...checkRows, record]);
                                }
                            },
                        };
                    }}
                    columns={linesColumns}
                    request={fetchLinesData}
                    rowKey="line_id"
                    rowSelection={{
                        type: 'checkbox',
                        onChange: selectOnChange,
                        selectedRowKeys: checkKeys,
                        getCheckboxProps: (record) => ({
                            disabled: record.not_rcv_quantity == '0', // Column configuration not to be checked
                        }),
                    }}
                    tableAlertRender={false}
                    tableAlertOptionRender={false}

                    pagination={{
                        showQuickJumper: true,
                    }}
                    options={false}
                    search={false}
                    dateFormatter="string"
                    headerTitle="行信息"
                />
            </div>
        </Drawer>
    );


}


export default SelectPdDialog;




