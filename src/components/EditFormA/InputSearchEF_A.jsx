import React from 'react';
import { Input, Form } from 'antd';
import styles from './index.less'
const { Search } = Input;

const InputSearchEF_A = (props) => {

    const { tableForm, prefix, name, text, record, handleFieldChange } = props;//固定参数
    const { formItemParams } = props; //form item 参数
    const { widgetParams } = props; // 具体的组件参数
    const onSearch = widgetParams?.onSearch; // 保证组件的onSearch参数能用

    const formItemName = `${prefix}_${name}`;

    tableForm.setFieldsValue({ [formItemName]: text });

    return (
        <Form.Item
            className={styles.tableFormItem}
            {...formItemParams}
            name={formItemName}
        >
            <Search
                {...widgetParams}
                readOnly
                onChange={(value) => {
                    handleFieldChange(value, name, record)
                }}
                onClick={() => {
                    if (onSearch) {
                        onSearch(name, record)
                    }
                }}
                onSearch={() => {
                    if (onSearch) {
                        onSearch(name, record)
                    }
                }}
            />
        </Form.Item>

    )
}
export default InputSearchEF_A;