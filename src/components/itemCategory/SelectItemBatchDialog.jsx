//选择仓库的对话框
import React, { useState, useEffect, useRef } from 'react';
import { Button, Select , message, Tree, Row, Col, Modal, Table, Input, Form  } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import ProCard from '@ant-design/pro-card';
import HttpService from '@/utils/HttpService.jsx';
import StandardFormRow from '@/components/StandardFormRow';
const Search = Input.Search;

const SelectItemBatchDialog = (props) => {

    const { modalVisible, handleOk, handleCancel,columns } = props;
    const [checkKeys, setCheckKeys] = useState([]);
    const [checkRows, setCheckRows] = useState({});
    const [val, setVal] = useState({});

    const selectType = props?.selectType || 'radio';
    console.log(columns);
    const inColumn = columns.map((item, index) => {
        const rc = item.map((record, index) => {
        return (
            <Col
            xl={{ span: 6, offset: 2 }}
            lg={{ span: 6 }}
            md={{ span: 12 }}
            sm={24}
            key={record.segment + index}
            >
            <Form.Item
                label={record.segment_name}
                name={record.segment}
                rules={[{ required: true, message: '请选择' + record.segment_name + '!' }]}
            >
                <Select
                placeholder="请选择"
                name={record.segment}
                mode="multiple"
                onChange={(value,option) => {
                    handleFieldChange(value, record,option);
                }}
                >
                {record.dictList == null
                    ? []
                    : record.dictList.map((item) => (
                        <Option key={item['value_id']} value={item['value_id']}>
                        {item['value_name']}
                        </Option>
                    ))}
                </Select>
            </Form.Item>
            </Col>
        );
        });
        return (
        <StandardFormRow key={'formrow' + index}>
            <Row key={index}>{rc}</Row>
        </StandardFormRow>
        );
    });
    //重置选中状态
    useEffect(() => {
        setVal({});
        setCheckKeys([]);
    }, [modalVisible])

    const handleFieldChange = (selectedKeys, record,optionlist) => {
        setCheckKeys(selectedKeys);

        console.log(optionlist)
        const names=record.segment;
        let newarr=[];
        for(let i=0;i<optionlist.length;i++){
            newarr.push(optionlist[i].children);
        }
        let newcheckRows = checkRows;
        newcheckRows[names]=newarr;
        setCheckRows(newcheckRows);
      

        let newval = val;
        newval[names]=selectedKeys;
        setVal(newval);
        console.log('selectedKeys', selectedKeys)
        console.log('newarr', newarr)
        console.log('newval', newval)
        console.log('newcheckRows', newcheckRows)
    }

    return (
        <Modal title="选择类别" visible={modalVisible} onOk={() => {
            handleOk(val, checkKeys)
           
        }} onCancel={handleCancel}>

        <ProCard collapsible title="关键信息">
          {inColumn}
        </ProCard>
        </Modal>
    );


}


export default SelectItemBatchDialog;




