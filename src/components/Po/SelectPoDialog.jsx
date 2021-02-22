//选择仓库的对话框
import React, { useState, useEffect, useRef } from 'react';
import { Button, Space, message, Tree, Row, Col, Modal, Table, Input, Pagination, Drawer } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import HttpService from '@/utils/HttpService.jsx';


const columns = [
    {
        title: '订单编号',
        dataIndex: 'header_code',
        valueType: 'text'
    },
    {
        title: '订单类型',
        dataIndex: 'po_type_name',
        key: 'po_type',
        valueType: 'text',
    },
    {
        title: '采购员',
        dataIndex: 'agent_name',
        key: 'agent_id',
    },
    {
        title: '供应商',
        dataIndex: 'vendor_name',
        key: 'vendor_id',
    },
    {
        title: '生效日期',
        dataIndex: 'po_date',
        valueType: 'dateTimeRange'

    },
    {
        title: '收单地点',
        dataIndex: 'bill_to_location',

    },
    {
        title: '收货地点',
        dataIndex: 'ship_to_location',

    },
    {
        title: '订单状态',
        dataIndex: 'status',
    },
    {
        title: '合同编号',
        dataIndex: 'contract_code'
    },
    {
        title: '合同名称',
        dataIndex: 'contract_name',

    },
    {
        title: '合同文件',
        dataIndex: 'contract_file',

    },
    {
        title: '业务描述',
        dataIndex: 'comments',

    },
    {
        title: '创建时间',
        dataIndex: 'create_date',
        valueType: 'dateTimeRange'
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

const SelectPoDialog = (props) => {

    const { modalVisible, handleOk, handleCancel } = props;

    //主信息
    const [mainCheckKeys, setMainCheckKeys] = useState([]);
    const [selectPoHeader, setSelectPoHeader] = useState({});

    //行信息
    const [checkKeys, setCheckKeys] = useState([]);
    const [checkRows, setCheckRows] = useState([]);

    const linesTableRef = useRef();


    //重置选中状态
    useEffect(() => {
        setMainCheckKeys([]);
        setSelectPoHeader({});
        setCheckKeys([]);
        setCheckRows([]);
    }, [modalVisible])

    //选择头信息后刷新行信息列表
    useEffect(() => {
        linesTableRef?.current?.reload();
    }, [selectPoHeader]);



    //获取行数据
    const fetchLinesData = async (params, sort, filter) => {


        if (selectPoHeader?.po_header_id == null) {
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
            po_header_id: selectPoHeader?.po_header_id
        };

        const result = await HttpService.post(
            'reportServer/po/getPoLinesById',
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
            'reportServer/po/getPoListByPage',
            JSON.stringify(requestParam),
        );

        return Promise.resolve({
            data: result.data.list,
            total: result.data.total,
            success: result.resultCode == '1000',
        });
    };



    const mainSelectOnChange = (selectedKeys, selectedRows) => {
        setMainCheckKeys(selectedKeys);
        setSelectPoHeader(selectedRows[0]);
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
        <Drawer title="选择采购订单"
            visible={modalVisible}
            onClose={handleCancel}
            width={1000}
            bodyStyle={{ paddingBottom: 80 }}
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
                        if (selectPoHeader?.po_header_id != null) { //判断是否选择了采购订单
                            //返回订单头信息，行信息
                            handleOk(selectPoHeader, checkRows)
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
                                setSelectPoHeader(record);
                            },
                        };
                    }}
                    columns={columns}
                    request={fetchData}
                    rowKey="po_header_id"
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
                    headerTitle="采购订单"
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
                                if (isCheck(record.po_line_id)) { // 选中则移除
                                    //移除key
                                    const newCheckKeys = checkKeys.filter((item) => {
                                        return item !== record.po_line_id;
                                    })

                                    //移除record
                                    const newCheckRows = checkRows.filter((item) => {
                                        return item.id !== record.po_line_id;
                                    })

                                    setCheckKeys(newCheckKeys);
                                    setCheckRows(newCheckRows);
                                } else { // 未选中则添加
                                    setCheckKeys([...checkKeys, record.po_line_id]);
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


export default SelectPoDialog;




