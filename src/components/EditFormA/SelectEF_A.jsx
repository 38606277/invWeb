import React from 'react';
import { Select, Form } from 'antd';
const { Option } = Select;
import styles from './index.less'

const SelectEF = (props) => {

    const { tableForm, prefix, name, text, record, handleFieldChange } = props;//固定参数
    const { formItemParams } = props; //form item 参数
    const { widgetParams } = props; // 具体的组件参数
    const onChange = widgetParams?.onChange; // 保证组件的onChane参数能用
    const dictData = widgetParams?.dictData;
    const keyName = widgetParams?.keyName
    const valueName = widgetParams?.valueName

    const formItemName = `${prefix}_${name}`;


    tableForm.setFieldsValue({ [formItemName]: text });

    return (
        <Form.Item
            className={styles.tableFormItem}
            {...formItemParams}
            name={formItemName}
        >
            <Select
                allowClear
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
export default SelectEF;