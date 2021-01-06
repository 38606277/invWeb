import React from 'react';
import { Input, Form } from 'antd';

const InputEF = (props) => {

    const { text, record, index } = props;
    const { name, rules } = props;
    const { placeholder, handleFieldChange } = props;
    const { tableForm } = props;

    tableForm.setFieldsValue({ [`${index}_${name}`]: text });

    return (

        <Form.Item
            name={`${index}_${name}`}
            rules={rules}
        >
            <Input
                value={text}
                autoFocus
                onChange={(e) => {
                    handleFieldChange(e.target.value, name, record.key)
                }}
                placeholder={placeholder}
            />
        </Form.Item>

    )
}
export default InputEF;