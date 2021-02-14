
/** 
 * 
 * 
  多TableForm组件：
    参数：tableFormDataList
    格式：[
        {   
            primaryId: any //tableForm 唯一标识
            title:String  // 标题
            tableFormData:Array //数据
            columnList:Array //列数据
            tableRef: Ref //引用对象
        }
    ]

    参数：disabled    // 是否失效
    参数：primaryKey  // 数据唯一标识 
    参数：onAddClick  // 新增点击事件
 * 
 */
import React, { forwardRef, useState, useImperativeHandle } from 'react';
import { Button } from 'antd';
import TableForm_A from '@/components/EditFormA/TableForm_A';
import ProCardCollapse from '@/components/ProCard/ProCardCollapse'
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

const TableFormList = forwardRef(({ disabled, primaryKey, onAddClick }, ref) => {

    const [data, setData] = useState([]); //列表行数据

    //通过ref暴露函数
    useImperativeHandle(ref, () => ({
        //获取表格数据
        getTableFormDataList() {
            return data;
        },
        //设置数据
        setTableFormDataList(newTableFormDataList) {
            const newData = newTableFormDataList?.map((item) => ({ ...item })) || [];
            setData(newData)
            console.log('setTableFormDataList', newData)
        }
    }));




    let tableFormList = [];
    for (let index in data) {
        let tableFormData = data[index];

        tableFormList.push(<ProCardCollapse
            title={tableFormData.title}
            extra={[
                <Button
                    disabled={disabled}
                    icon={<PlusOutlined />}
                    size="small"
                    onClick={() => {
                        if (onAddClick) {
                            onAddClick(tableFormData);
                        }
                    }}
                ></Button>,
                <Button
                    disabled={disabled}
                    size="small"
                    style={{ marginLeft: '6px' }}
                    icon={<MinusOutlined />}
                    onClick={() => {
                        //删除选中项
                        tableFormData?.tableRef?.current?.removeRows();
                    }}
                ></Button>,
            ]}
        >
            <TableForm_A
                tableParams={
                    { scroll: { x: 1300 } }
                }
                ref={tableFormData.tableRef}
                columns={tableFormData.columnList}
                primaryKey={primaryKey}
                value={tableFormData.dataList}
            />
        </ProCardCollapse>
        );
    }
    return tableFormList;
});

export default TableFormList;

