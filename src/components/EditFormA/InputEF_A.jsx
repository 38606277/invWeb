import React from 'react';
import { Input, Form } from 'antd';
import styles from './index.less'

const InputEF_A = (props) => {

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
            <Input
                allowClear
                {...widgetParams}
                onChange={(e) => {
                    handleFieldChange(e.target.value, name, record);

                    if (onChange) {//保证组件的onChange函数可控制
                        onChange(e.target.value, name, record);
                    }
                }}

            />
        </Form.Item>

    )
}
export default InputEF_A;