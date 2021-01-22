import React from 'react';
import { InputNumber, Form } from 'antd';
import styles from './index.less'

const InputNumberEF_A = (props) => {

    const { tableForm, prefix, name, text, record, handleFieldChange } = props;//固定参数
    const { formItemParams } = props; //form item 参数
    const { widgetParams } = props; // 具体的组件参数
    const onChange = widgetParams?.onChange; // 保证组件的onChane参数能用

    const formItemName = `${prefix}_${name}`;

    tableForm.setFieldsValue({ [formItemName]: text });

    return (

        <Form.Item
            className={styles.tableFormItem}
            {...formItemParams}
            name={formItemName}
        >
            <InputNumber
                allowClear
                min={0}//默认最小值为0
                {...widgetParams}
                onChange={(value) => {
                    if (handleFieldChange) {
                        handleFieldChange(value, name, record)
                    }
                    if (onChange) {
                        onChange(value, name, record)
                    }
                }}
            />
        </Form.Item>

    )
}
export default InputNumberEF_A;