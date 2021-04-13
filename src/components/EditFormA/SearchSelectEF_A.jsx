import React, { useState } from 'react';
import { Select, Form } from 'antd';
const { Option } = Select;
import styles from './index.less'

const SearchSelectEF = (props) => {

    const { tableForm, prefix, name, text, record, handleFieldChange } = props;//固定参数
    const { formItemParams } = props; //form item 参数
    const { widgetParams } = props; // 具体的组件参数
    const onChange = widgetParams?.onChange; // 保证组件的onChane参数能用
    const keyName = widgetParams?.keyName
    const valueName = widgetParams?.valueName

    const onHandleSearch = widgetParams?.onHandleSearch; // 保证组件的onChane参数能用

    const formItemName = `${prefix}_${name}`;
    tableForm.setFieldsValue({ [formItemName]: text });


    const [dictData, setDictData] = useState([]);

    const handleSearch = (value) => {
        if (value) {
            if (onHandleSearch) {
                onHandleSearch(value, data => setDictData(data));
            }
        } else {
            setDictData([])
        }
    }
    return (
        <Form.Item
            className={styles.tableFormItem}
            {...formItemParams}
            name={formItemName}
        >
            <Select
                showSearch
                defaultActiveFirstOption={false}
                showArrow={false}
                filterOption={false}
                notFoundContent={null}
                onSearch={handleSearch}
                {...widgetParams}
                onChange={(value) => {
                    handleFieldChange(value, name, record)
                    if (onChange) {//保证组件的onChange函数可控制
                        onChange(value, name, record);
                    }
                }}>
                {dictData == null ? [] : dictData.map(item => <Option key={`${formItemName}_${item[keyName]}`} value={item[keyName]}>{item[valueName]}</Option>)}
            </Select>
        </Form.Item>)
}
export default SearchSelectEF;