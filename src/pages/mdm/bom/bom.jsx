/**
 * 物料清单
 */
import React, { useRef, useState, useEffect } from 'react';
import { message, Form, Button, Row, Col, Select, Input, DatePicker } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import TreeTableForm_A from '@/components/EditFormA/TreeTableForm_A';
import SelectItemDialog from '@/components/itemCategory/SelectItemDialog';

import ProCardCollapse from '@/components/ProCard/ProCardCollapse'
import HttpService from '@/utils/HttpService.jsx';
import { history } from 'umi';
import { SaveOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

const formItemLayout2 = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};
const formItemLayout1 = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
};


const count = (props) => {
    const tableRef = useRef();
    const [tableForm] = Form.useForm();
    const [mainForm] = Form.useForm();

    const [selectItemDialogVisible, setSelectItemDialogVisible] = useState(false);
    const [selectItemRecord, setSelectItemRecord] = useState({});

    const [disabled, setDisabled] = useState(false);

    const action = props?.match?.params?.action || 'add';
    const id = props?.match?.params?.id || -1;

    /**
     * 删除回调
     * @param {*} deleteRow 
     */
    const onDeleteListener = (deleteRow) => {
        for (let index in deleteRow) {
            let row = deleteRow[index];
            statisticsAmount(tableRef.current.getTableData(), row);
        }
    }

    const calculateAmount = (value, name, record) => {
        const amount = record['unit_cost'] * record['lose_rate'] * record['quantity'];
        tableRef.current.handleObjChange(
            {
                cost: amount
            },
            record);

        statisticsAmount(tableRef.current.getTableData(), record);
    }

    //向上递归统计金额
    const statisticsAmount = (treeDate, record) => {
        console.log('statisticsAmount treeDate ', treeDate)
        console.log('statisticsAmount record ', record)
        //找到父节点 然后统计值
        if (record.material_pid == -1) {//当前节点为根节点 结束查询
            return;
        }

        for (let index in treeDate) {
            let node = treeDate[index];

            console.log('node.line_id == record.material_pid', node.line_id, record.material_pid, node.line_id == record.material_pid)

            if (node.line_id == record.material_pid) {//判断id是否相同
                //相同则统计当前父节点的金额等 ，统计后继续向上查找 

                let children = node.children;

                //计算子节点的值
                let unit_cost = 0;
                let lose_rate = 0;
                let quantity = 0;
                let cost = 0;

                for (let childrenIndex in children) {
                    const childrenNode = children[childrenIndex];
                    unit_cost = unit_cost + childrenNode['unit_cost'];
                    lose_rate = lose_rate + childrenNode['lose_rate'];
                    quantity = quantity + childrenNode['quantity'];
                    cost = cost + childrenNode['cost'];
                }
                //更新值
                tableRef.current.handleObjChange(
                    {
                        unit_cost: unit_cost,
                        lose_rate: lose_rate,
                        quantity: quantity,
                        cost: cost,
                    },
                    node);

                statisticsAmount(tableRef.current.getTableData(), node);
                break;
            } else {
                if (node.children) {
                    statisticsAmount(node.children, record);
                }
            }
        }
    }




    const buildColumns = () => {
        return [
            {
                title: '物料描述',
                dataIndex: 'material_description',
                renderType: 'InputSearchEF',
                width: '20%',
                renderParams: {
                    formItemParams: {
                        rules: [{ required: true, message: '请选择物料' }]
                    },
                    widgetParams: {
                        onSearch: (name, record) => {
                            setSelectItemRecord(record)
                            setSelectItemDialogVisible(true)
                        }
                    }
                }
            },
            {
                title: '物料id',
                dataIndex: 'material_id',
                hide: true,
                renderParams: {
                    formItemParams: {
                        rules: [{ required: false, message: '请选择物料' }]
                    },
                    widgetParams: { disabled: true }
                }
            },

            {
                title: '单位',
                dataIndex: 'uom',
                renderParams: {
                    formItemParams: {
                        rules: [{ required: true, message: '请输入单位' }]
                    },
                    widgetParams: { disabled: true }
                }
            },

            {
                title: '单位成本',
                dataIndex: 'unit_cost',
                renderType: 'InputNumberEF',
                renderParams: {
                    formItemParams: {
                        rules: [{ required: true, message: '请输入单位成本' }]
                    },
                    widgetParams: { disabled: disabled, onChange: calculateAmount },
                    onRender: (text, record, index, renderParams) => {
                        if (record.children && 0 < record.children.length) {
                            renderParams.widgetParams.disabled = true;
                        } else {
                            renderParams.widgetParams.disabled = false;
                        }
                    }
                }
            },
            {
                title: '损耗率',
                dataIndex: 'lose_rate',
                renderType: 'InputNumberEF',
                renderParams: {
                    formItemParams: {
                        rules: [{ required: true, message: '请输入损耗率' }]
                    },
                    widgetParams: {
                        disabled: disabled, onChange: calculateAmount
                    },
                    onRender: (text, record, index, renderParams) => {
                        if (record.children && 0 < record.children.length) {
                            renderParams.widgetParams.disabled = true;
                        } else {
                            renderParams.widgetParams.disabled = false;
                        }
                    }
                }
            },
            {
                title: '数量',
                dataIndex: 'quantity',
                renderType: 'InputNumberEF',
                renderParams: {
                    formItemParams: {
                        rules: [{ required: true, message: '请输入数量' }]

                    },
                    widgetParams: { disabled: disabled, precision: 0, onChange: calculateAmount },
                    onRender: (text, record, index, renderParams) => {
                        if (record.children && 0 < record.children.length) {
                            renderParams.widgetParams.disabled = true;
                        } else {
                            renderParams.widgetParams.disabled = false;
                        }
                    }
                }

            },
            {
                title: '合计成本',
                dataIndex: 'cost',
                renderType: 'InputNumberEF',
                renderParams: {
                    formItemParams: {
                        rules: [{ required: true, message: '请输入合计成本' }]
                    },
                    widgetParams: { disabled: true, }
                }
            },

            {
                title: '操作',
                dataIndex: 'remark',
                render: (text, record, index) => {
                    return <Button size="small" icon={<PlusOutlined />} onClick={() => {
                        tableRef.current.addChilrenItem(record, {
                            line_id: `NEW_TEMP_ID_${(Math.random() * 1000000).toFixed(0)}`,
                            material_pid: record.line_id
                        })
                    }}></Button>
                }

            },

        ]

    }


    const save = (params) => {
        HttpService.post('reportServer/bom/createBom', JSON.stringify(params)).then((res) => {
            if (res.resultCode == '1000') {
                history.push(`/mdm/bomList`);
                message.success(res.message);
            } else {
                message.error(res.message);
            }
        });
    };

    const update = (params) => {
        HttpService.post('reportServer/bom/updateBomById', JSON.stringify(params)).then(
            (res) => {
                if (res.resultCode == '1000') {
                    history.push(`/mdm/bomList`);
                    message.success(res.message);
                } else {
                    message.error(res.message);
                }
            },
        );
    };

    useEffect(() => {
        if (action === 'edit') {
            //初始化编辑数据
            HttpService.post('reportServer/bom/getBomById', JSON.stringify({ item_id: id })).then(
                (res) => {
                    if (res.resultCode == '1000') {
                        setDisabled(true);
                        mainForm.setFieldsValue({
                            ...res.data.mainData,
                        });
                        tableRef?.current?.initData(res.data.linesData);
                    } else {
                        message.error(res.message);
                    }
                },
            );
        }
    }, []);

    return (
        <PageContainer
            ghost="true"
            title="物料清单"
            header={{
                extra: [
                    <Button
                        key="submit"
                        type="danger"
                        icon={<SaveOutlined />}
                        onClick={() => {
                            mainForm?.submit();
                        }}
                    >
                        保存产品
          </Button>,
                    <Button
                        disabled={disabled}
                        key="reset"
                        onClick={() => {
                            history.goBack();
                        }}
                    >
                        返回
          </Button>,
                ],
            }}
        >
            <Form
                {...formItemLayout2}
                form={mainForm}
                onFinish={async (fieldsValue) => {
                    //验证tableForm
                    tableForm
                        .validateFields()
                        .then(() => {
                            //验证成功
                            let tableData = tableRef.current.getTableData();

                            const values = {
                                ...fieldsValue,
                            };

                            if (action === 'edit') {
                                let deleteRecordKeys = tableRef.current.getDeleteRecordKeys();
                                console.log('deleteRecordKeys', deleteRecordKeys);
                                //过滤deleteRecord中的临时数据
                                let deleteIds = deleteRecordKeys.filter((element) => {
                                    return element.toString().indexOf('NEW_TEMP_ID_') < 0;
                                });
                                values.bill_status = 1;
                                update({
                                    mainData: values,
                                    linesData: tableData,
                                    deleteData: deleteIds.toString(), // 删除项
                                });
                            } else {
                                values.bill_status = 0;
                                save({
                                    mainData: values,
                                    linesData: tableData,
                                });
                            }
                        })
                        .catch((errorInfo) => {
                            console.log(errorInfo);
                            //验证失败
                            message.error('提交失败');
                        });
                }}
            >
                <ProCardCollapse title="基础信息"
                >
                    <Form.Item style={{ display: 'none' }} label="产品id" name="item_id" />
                    <Row>
                        <Col xs={24} sm={10}>
                            <Form.Item
                                name="bom_name"
                                label="产品名称"
                                rules={[{ required: true, message: '请输入产品名称' }]}
                            >
                                <Input disabled={disabled} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={24} sm={20}>
                            <Form.Item {...formItemLayout1} label="备注" name="comment">
                                <Input.TextArea
                                    disabled={disabled}
                                    placeholde="请输入备注"
                                    autoSize={{ minRows: 2, maxRows: 3 }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                </ProCardCollapse>


            </Form>

            <ProCardCollapse
                title="行信息"
                extra={[
                    <Button
                        disabled={disabled}
                        icon={<PlusOutlined />}
                        size="small"
                        onClick={() => {
                            //新增一行
                            tableRef.current.addItem({
                                line_id: `NEW_TEMP_ID_${(Math.random() * 1000000).toFixed(0)}`,
                                material_pid: -1
                            });
                        }}
                    ></Button>,
                    <Button
                        disabled={disabled}
                        size="small"
                        style={{ marginLeft: '6px' }}
                        icon={<MinusOutlined />}
                        onClick={() => {
                            //删除选中项
                            tableRef.current.removeRows();
                        }}
                    ></Button>,
                ]}
            >
                <TreeTableForm_A ref={tableRef} columns={buildColumns()} primaryKey="line_id" tableForm={tableForm} onDeleteListener={onDeleteListener} />
            </ProCardCollapse>
            <SelectItemDialog
                modalVisible={selectItemDialogVisible}
                handleOk={(result) => {
                    console.log('SelectItemDialog : ', result)
                    tableRef.current.handleObjChange(
                        {
                            material_id: result.item_id,
                            material_description: result.item_description,
                            uom: result.uom
                        },
                        selectItemRecord);
                    setSelectItemDialogVisible(false);
                }}
                handleCancel={() => {
                    setSelectItemDialogVisible(false);
                }}
            />
        </PageContainer>
    );
};
export default count;