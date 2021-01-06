import React from 'react';
import { Select, Form } from 'antd';
const { Option } = Select;

const SelectEF = (props) => {

    const { text, record, index } = props;
    const { name, rules } = props;
    const { placeholder, handleFieldChange } = props;
    const { dictData, keyName, valueName } = props;
    const { tableForm } = props;

    const formName = `${index}_${name}`;

    tableForm.setFieldsValue({ [formName]: text });

    return (<Form.Item
        name={formName}
        rules={rules}
    >
        <Select allowClear
            placeholder={placeholder}
            onChange={(value) => {
                console.log('handleFieldChange', value)
                console.log('handleFieldChange', handleFieldChange)
                handleFieldChange(value, name, record)
            }}>
            {dictData.map(item => <Option key={`${formName}_${item[keyName]}`} value={item[keyName]}>{item[valueName]}</Option>)}
        </Select>
    </Form.Item>)
}
export default SelectEF;