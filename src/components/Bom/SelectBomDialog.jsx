//选择产品的对话框
import React, { useState, useEffect } from 'react';
import { Modal, Input } from 'antd';
import ProTable from '@ant-design/pro-table';
import HttpService from '@/utils/HttpService.jsx';
import LocalStorge from '@/utils/LogcalStorge.jsx';
const localStorge = new LocalStorge();

const Search = Input.Search;


const primaryKey = 'item_id';

const columns = [{
    title: '产品名称',
    dataIndex: 'bom_name',
    key: 'inv_org_id',
    valueType: 'text',
},
{
    title: '创建时间',
    dataIndex: 'create_date',
    valueType: 'dateTime',
},];


const SelectBomDialog = (props) => {

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

        console.log('getByKeyword', params, sort, filter);
        // current: 1, pageSize: 20
        let requestParam = {
            pageNum: params.current,
            perPage: params.pageSize,
            ...params
        };

        let userInfo = localStorge.getStorage('userInfo');
        requestParam.operator = userInfo.id;

        const result = await HttpService.post(
            'reportServer/bom/getListByPage',
            JSON.stringify(requestParam),
        );
        console.log('result : ', result);
        return Promise.resolve({
            data: result.data.list,
            total: result.data.total,
            success: result.resultCode == '1000',
        });
    }


    const selectOnChange = (selectedKeys, selectedRows) => {
        setCheckKeys(selectedKeys);
        setCheckRows(selectedRows)
    }

    const isCheck = (key) => {
        for (let index in checkKeys) {
            if (checkKeys[index] === key) {
                return true;
            }
        }
        return false;
    }


    return (
        <Modal title="选择产品" visible={modalVisible} onOk={() => {
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
                                    setCheckKeys([record[primaryKey]])
                                    setCheckRows([record])
                                } else {
                                    //有取消的情况
                                    if (isCheck(record[primaryKey])) { // 选中则移除
                                        //移除key
                                        const newCheckKeys = checkKeys.filter((item) => {
                                            return item !== record[primaryKey];
                                        })

                                        //移除record
                                        const newCheckRows = checkRows.filter((item) => {
                                            return item[primaryKey] !== record[primaryKey];
                                        })

                                        setCheckKeys(newCheckKeys);
                                        setCheckRows(newCheckRows);
                                    } else { // 未选中则添加
                                        setCheckKeys([...checkKeys, record[primaryKey]]);
                                        setCheckRows([...checkRows, record]);
                                    }
                                }
                            },
                        };
                    }}
                    columns={columns}
                    request={fetchData}
                    rowKey={primaryKey}
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


export default SelectBomDialog;




