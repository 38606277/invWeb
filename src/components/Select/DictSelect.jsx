/**
 * 字典数据选择器
 * 传入 dict_code
 */
import React, { useState, useEffect } from 'react';
import { message, Select } from 'antd';
const { Option } = Select;
import HttpService from '@/utils/HttpService.jsx';

const DictSelect = (props) => {

    const [dataList, setDataList] = useState([])
    const { dictCode } = props;
    const { dictId } = props;

    const valueType = props?.valueType || 'code'; // code or name


    useEffect(() => {
        //监听类型是否改变 
        //发起网络请求
        if (dictCode != null) {
            HttpService.post('/reportServer/mdmDict/getDictByCode', JSON.stringify({ dict_code: dictCode })).then(
                (res) => {
                    if (res.resultCode == '1000') {
                        setDataList(res.data);
                    } else {
                        message.error(res.message);
                    }
                },
            );
        } else if (dictId != null) {
            HttpService.post('/reportServer/mdmDict/getDictValueByDictId', JSON.stringify({ dict_id: dictId })).then(
                (res) => {
                    if (res.resultCode == '1000') {
                        setDataList(res.data);
                    } else {
                        message.error(res.message);
                    }
                },
            );
        } else {
            setDataList([]);
        }
    }, [dictCode]);

    return (<Select {...props}>
        {dataList == null ? [] : dataList.map(item => <Option key={item.value_code} value={valueType == 'code' ? item.value_code : item.value_name}> {item.value_name} </Option>)}
    </Select>);
}


export default DictSelect;