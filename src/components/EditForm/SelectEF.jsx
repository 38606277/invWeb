import React from 'react';
import { Select, Form } from 'antd';
const { Option } = Select;

const SelectEF = (props) => {

    const { text, record, index } = props;
    const { name, rules } = props;
    const { placeholder, handleFieldChange } = props;
    const { dictData, keyName, valueName } = props;
    const { tableForm } = props;

    tableForm.setFieldsValue({ [`${index}_${name}`]: text });

    return (<Form.Item
        name={`${index}_${name}`}
        rules={rules}
    >
        <Select allowClear
            placeholder={placeholder}
            onChange={(value) => {
                handleFieldChange(value, name, record.key)
            }}>
            {dictData.map(item => <Option value={item[keyName]}>{item[valueName]}</Option>)}
        </Select>
    </Form.Item>)
}
export default SelectEF;