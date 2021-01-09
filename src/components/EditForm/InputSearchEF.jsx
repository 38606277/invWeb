import React from 'react';
import { Input, Form } from 'antd';
import styles from './index.less'
const { Search } = Input;

const InputSearchEF = (props) => {

    const { text, record, index } = props;
    const { name, rules } = props;
    const { placeholder, handleFieldChange, onSearch } = props;
    const { tableForm } = props;

    tableForm.setFieldsValue({ [`${index}_${name}`]: text });

    return (

        <Form.Item
            className={styles.tableFormItem}
            name={`${index}_${name}`}
            rules={rules}
        >
            <Search
                value={text}
                readOnly
                onChange={(e) => {
                    handleFieldChange(e.target.value, name, record)
                }}
                onClick={() => {
                    onSearch(name, record)
                }}
                onSearch={() => {
                    onSearch(name, record)
                }}
                placeholder={placeholder}
            />
        </Form.Item>

    )
}
export default InputSearchEF;