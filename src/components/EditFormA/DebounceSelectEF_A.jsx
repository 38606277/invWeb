

/**
 * select 多选
 */
import React from 'react';
import { Form } from 'antd';
import styles from './index.less'
import DebounceSelect from '@/components/Select/DebounceSelect'


// Usage of DebounceSelect
async function fetchUserList(username) {
    console.log('fetching user', username);
    return fetch('https://randomuser.me/api/?results=5')
        .then((response) => response.json())
        .then((body) =>
            body.results.map((user) => ({
                label: `${user.name.first} ${user.name.last}`,
                value: user.login.username,
            })),
        );
}

const DebounceSelectEF_A = (props) => {

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
            {/* <Input
                allowClear
                {...widgetParams}
                onChange={(e) => {
                    handleFieldChange(e.target.value, name, record);

                    if (onChange) {//保证组件的onChange函数可控制
                        onChange(e.target.value, name, record);
                    }
                }}

            /> */}

            <DebounceSelect
                mode="multiple"

                placeholder="Select users"
                fetchOptions={fetchUserList}
                onChange={(newValue) => {

                    handleFieldChange(newValue, name, record);
                    if (onChange) {//保证组件的onChange函数可控制
                        onChange(newValue, name, record);
                    }

                }}
                style={{
                    width: '100%',
                }}
            />


        </Form.Item>

    )
}
export default DebounceSelectEF_A;


