/**
 * 生产订单
 */
import React, { useRef, useState, useEffect } from 'react';
import { message, Form, Button, Row, Col, Select, Input, DatePicker, Tabs } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import TableForm_A from '@/components/EditFormA/TableForm_A';
import SelectItemDialog from '@/components/itemCategory/SelectItemDialog';
import SelectCustomersDialog from '@/components/Customers/SelectCustomersDialog';
import SelectBomDialog from '@/components/Bom/SelectBomDialog';
import ProCardCollapse from '@/components/ProCard/ProCardCollapse'
import HttpService from '@/utils/HttpService.jsx';
import { history } from 'umi';
import moment from 'moment';
import { SaveOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
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

    const materialTableRef = useRef();
    const [materialTableForm] = Form.useForm();

    const [mainForm] = Form.useForm();


    const [selectItemDialogVisible, setSelectItemDialogVisible] = useState(false);
    const [selectItemRecord, setSelectItemRecord] = useState({});

    const [selectCustomersDialogVisible, setSelectCustomersDialogVisible] = useState(false);
    const [selectCustomersFiledName, setSelectCustomersFiledName] = useState('');

    const [selectBomDialogVisible, setSelectBomDialogVisible] = useState(false);

    const [disabled, setDisabled] = useState(false);

    const [tabKey, setTabKey] = useState('product');


    const action = props?.match?.params?.action || 'add';
    const id = props?.match?.params?.id || -1;

    const calculateAmount = (value, name, record) => {
        const amount = record['price'] * record['quantity'];
        tableRef.current.handleObjChange(
            {
                amount: amount
            },
            record);
        calculateMaterial();
    }

    const calculateMaterialAmount = (value, name, record) => {
        const amount = record['price'] * record['quantity'];
        materialTableRef.current.handleObjChange(
            {
                amount: amount
            },
            record);
        //calculateMaterial();
    }

    const calculateMaterial = () => {
        //获取产品列表
        const pdList = tableRef?.current?.getTableData();

        const tempMaterialList = []; //统计各类产品的原料
        console.log('calculateMaterial', pdList)
        for (let pdIndex in pdList) { // 遍历
            const pd = pdList[pdIndex];
            const pdQuantity = pd.quantity || 1; // 默认为1
            const materialList = pd.materialList;
            console.log('materialList', materialList)
            for (let materialIndex in materialList) { // 遍历原料
                const material = materialList[materialIndex];
                let isExist = false;
                for (let tempIndex in tempMaterialList) {//遍历临时存储的原料
                    const tempMaterial = tempMaterialList[tempIndex];

                    if (material.item_id == tempMaterial.item_id) { //判断列表是否存在
                        //合并数量与金额
                        const quantity = (tempMaterial['quantity'] + material['quantity']) * pdQuantity;
                        const amount = (tempMaterial['amount'] + material['amount']) * pdQuantity;
                        const price = amount / quantity;


                        console.log(`calculateMaterial quantity= ${quantity} , amount= ${amount} ,  price= ${price}`)

                        tempMaterial['quantity'] = quantity;
                        tempMaterial['amount'] = amount;
                        tempMaterial['price'] = price;
                        isExist = true;
                        break;

                    }
                }
                if (!isExist) {
                    const quantity = material['quantity'] * pdQuantity;
                    const amount = material['amount'] * pdQuantity;
                    //新增
                    tempMaterialList.push({
                        ...material,
                        quantity,
                        amount
                    });
                }
            }
        }
        console.log('tempMaterialList', tempMaterialList)

        materialTableRef?.current?.initData(tempMaterialList);
    }



    const buildColumns = () => {
        return [
            {
                title: '产品名称',
                dataIndex: 'item_description',
                renderType: 'InputSearchEF',
                width: '20%',
                renderParams: {
                    formItemParams: {
                        rules: [{ required: true, message: '请选择产品' }]
                    },
                    widgetParams: {
                        disabled: disabled,
                        onSearch: (name, record) => {
                            setSelectItemRecord(record)
                            setSelectBomDialogVisible(true)
                        }
                    }
                }
            },
            {
                title: '产品id',
                dataIndex: 'item_id',
                hide: true,
                renderParams: {
                    formItemParams: {
                        rules: [{ required: false, message: '请选择产品' }]
                    },
                    widgetParams: { disabled: true }
                }
            },
            {
                title: '单位',
                dataIndex: 'uom',
                width: '80px',
                renderParams: {
                    formItemParams: {
                        rules: [{ required: true, message: '请输入单位' }]
                    },
                    widgetParams: { disabled: true }
                }
            },

            {
                title: '单价',
                dataIndex: 'price',
                renderType: 'InputNumberEF',
                renderParams: {
                    formItemParams: {
                        rules: [{ required: true, message: '请输入单价' }]
                    },
                    widgetParams: { disabled: disabled, onChange: calculateAmount }
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
                    widgetParams: { disabled: disabled, precision: 0, onChange: calculateAmount }
                }
            },
            {
                title: '金额',
                dataIndex: 'amount',
                renderType: 'InputNumberEF',
                renderParams: {
                    formItemParams: {
                        rules: [{ required: true, message: '请输入合计成本' }]
                    },
                    widgetParams: { disabled: true, }
                }
            }
        ]

    }

    const materialBuildColumns = () => {
        return [
            {
                title: '原料名称',
                dataIndex: 'item_description',
                renderType: 'InputSearchEF',
                width: '20%',
                renderParams: {
                    formItemParams: {
                        rules: [{ required: true, message: '请选择产品' }]
                    },
                    widgetParams: {
                        disabled: disabled,
                        onSearch: (name, record) => {
                            setSelectItemRecord(record)
                            setSelectItemDialogVisible(true)
                        }
                    }
                }
            },
            {
                title: '原料id',
                dataIndex: 'item_id',
                hide: true,
                renderParams: {
                    formItemParams: {
                        rules: [{ required: false, message: '请选择产品' }]
                    },
                    widgetParams: { disabled: true }
                }
            },
            {
                title: '单位',
                dataIndex: 'uom',
                width: '80px',
                renderParams: {
                    formItemParams: {
                        rules: [{ required: true, message: '请输入单位' }]
                    },
                    widgetParams: { disabled: true }
                }
            },
            {
                title: '单位成本',
                dataIndex: 'price',
                renderParams: {
                    formItemParams: {
                        rules: [{ required: true, message: '请输入单位' }]
                    },
                    widgetParams: { disabled: disabled, precision: 0, onChange: calculateMaterialAmount }
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
                    widgetParams: { disabled: disabled, precision: 0, onChange: calculateMaterialAmount }
                }
            },
            {
                title: '金额',
                dataIndex: 'amount',
                renderType: 'InputNumberEF',
                renderParams: {
                    formItemParams: {
                        rules: [{ required: true, message: '请输入合计成本' }]
                    },
                    widgetParams: { disabled: true, }
                }
            }
        ]

    }


    const save = (params) => {
        HttpService.post('reportServer/pd/createPd', JSON.stringify(params)).then((res) => {
            if (res.resultCode == '1000') {
                history.push(`/order/pdList`);
                message.success(res.message);
            } else {
                message.error(res.message);
            }
        });
    };

    const update = (params) => {
        HttpService.post('reportServer/pd/updatePdById', JSON.stringify(params)).then(
            (res) => {
                if (res.resultCode == '1000') {
                    history.push(`/order/pdList`);
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
            HttpService.post('reportServer/pd/getPdById', JSON.stringify({ pd_header_id: id })).then(
                (res) => {
                    if (res.resultCode == '1000') {
                        setDisabled(true);
                        mainForm.setFieldsValue({
                            ...res.data.mainData,
                            begin_date: moment(res.data.mainData.begin_date),
                            end_date: moment(res.data.mainData.end_date),
                        });

                        let linesData = [];
                        let materialLinesData = [];

                        for (let index in res.data.linesData) {
                            const line = res.data.linesData[index];
                            if (line.item_type == '0') {
                                linesData.push(line)
                            } else {
                                materialLinesData.push(line)
                            }
                        }

                        tableRef?.current?.initData(linesData);
                        materialTableRef?.current?.initData(materialLinesData);



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
            title="生产订单"
            header={{
                extra: [
                    <Button
                        disabled={disabled}
                        key="submit"
                        type="danger"
                        icon={<SaveOutlined />}
                        onClick={() => {
                            mainForm?.submit();
                        }}
                    >
                        保存生产订单
          </Button>,
                    <Button
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

                            materialTableForm.validateFields()
                                .then(() => {

                                    //验证成功
                                    let tableData = tableRef?.current?.getTableData();

                                    let materialTableData = materialTableRef?.current?.getTableData();

                                    const values = {
                                        ...fieldsValue,
                                        begin_date: fieldsValue['begin_date'].format('YYYY-MM-DD HH:mm:ss'),
                                        end_date: fieldsValue['end_date'].format('YYYY-MM-DD HH:mm:ss'),
                                    };

                                    if (action === 'edit') {
                                        let deleteRecordKeys = [...tableRef.current.getDeleteRecordKeys(), ...materialTableRef.current.getDeleteRecordKeys()];
                                        console.log('deleteRecordKeys', deleteRecordKeys);
                                        //过滤deleteRecord中的临时数据
                                        let deleteIds = deleteRecordKeys.filter((element) => {
                                            return element.toString().indexOf('NEW_TEMP_ID_') < 0;
                                        });
                                        update({
                                            mainData: values,
                                            linesData: [...tableData, ...materialTableData],
                                            deleteData: deleteIds.toString(), // 删除项
                                        });
                                    } else {
                                        save({
                                            mainData: values,
                                            linesData: [...tableData, ...materialTableData],
                                        });
                                    }

                                }).catch((errorInfo) => {
                                    console.log(errorInfo);
                                    //验证失败
                                    message.error('原料填写错误');
                                });
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
                    <Form.Item hidden label="制作商Id" name="manufactory_id" />
                    <Row>
                        <Col xs={24} sm={10}>
                            <Form.Item
                                name="pd_header_name"
                                label="订单名称"
                                rules={[{ required: true, message: '请输入产品名称' }]}
                            >
                                <Input disabled={disabled} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={11}>
                            <Form.Item
                                label="制作商"
                                name="manufactory_name"
                                rules={[{ required: true, message: '请选择供应商' }]}
                            >
                                <Search
                                    disabled={disabled}
                                    allowClear
                                    readOnly={true}
                                    enterButton
                                    onClick={() => {
                                        setSelectCustomersFiledName('manufactory')
                                        setSelectCustomersDialogVisible(true);
                                    }}
                                    onSearch={() => {
                                        setSelectCustomersFiledName('manufactory')
                                        setSelectCustomersDialogVisible(true);
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs={24} sm={10}>
                            <Form.Item
                                name="begin_date"
                                label="开始时间"
                                rules={[{ required: true, message: '请选择开始时间' }]}
                            >
                                <DatePicker style={{ width: "100%" }} disabled={disabled} showTime format="YYYY-MM-DD HH:mm:ss" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={10}>
                            <Form.Item
                                name="end_date"
                                label="结束时间"
                                rules={[{ required: true, message: '请选择结束时间' }]}
                            >
                                <DatePicker style={{ width: "100%" }} disabled={disabled} showTime format="YYYY-MM-DD HH:mm:ss" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* <Row>
                        <Col xs={24} sm={20}>
                            <Form.Item {...formItemLayout1} label="备注" name="remark">
                                <Input.TextArea
                                    disabled={disabled}
                                    placeholde="请输入备注"
                                    autoSize={{ minRows: 2, maxRows: 3 }}
                                />
                            </Form.Item>
                        </Col>
                    </Row> */}

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

                            if (tabKey == 'product') {//选择产品
                                //新增一行
                                tableRef.current.addItem({
                                    line_id: `NEW_TEMP_ID_${(Math.random() * 1000000).toFixed(0)}`,
                                });
                            } else {//选择原料

                                materialTableRef.current.addItem({
                                    line_id: `NEW_TEMP_ID_${(Math.random() * 1000000).toFixed(0)}`,
                                });

                            }
                        }}
                    ></Button>,
                    <Button
                        disabled={disabled}
                        size="small"
                        style={{ marginLeft: '6px' }}
                        icon={<MinusOutlined />}
                        onClick={() => {

                            //删除选中项

                            if (tabKey == 'product') {//选择产品
                                tableRef.current.removeRows();
                            } else {
                                materialTableRef.current.removeRows();
                            }
                        }}
                    ></Button>,
                ]}
            >

                <Tabs defaultActiveKey="1" onChange={(key) => {
                    setTabKey(key)
                }}>
                    <TabPane forceRender={true} tab="产品" key="product">
                        <TableForm_A ref={tableRef} columns={buildColumns()} primaryKey="line_id" tableForm={tableForm} />
                    </TabPane>
                    <TabPane forceRender={true} tab="原料" key="material">
                        <TableForm_A ref={materialTableRef} columns={materialBuildColumns()} primaryKey="line_id" tableForm={materialTableForm} />
                    </TabPane>

                </Tabs>


            </ProCardCollapse>
            <SelectItemDialog
                modalVisible={selectItemDialogVisible}
                handleOk={(result) => {
                    console.log('SelectItemDialog : ', result)
                    materialTableRef?.current?.handleObjChange(
                        {
                            item_id: result.item_id,
                            item_description: result.item_description,
                            uom: result.uom,
                            quantity: 1
                        },
                        selectItemRecord);
                    setSelectItemDialogVisible(false);
                }}
                handleCancel={() => {
                    setSelectItemDialogVisible(false);
                }}
            />
            <SelectCustomersDialog
                modalVisible={selectCustomersDialogVisible}
                handleOk={(selectCustomers) => {
                    console.log('selectCustomers', selectCustomers)
                    if (selectCustomers) {
                        mainForm.setFieldsValue({
                            [`${selectCustomersFiledName}_id`]: selectCustomers.customer_id,
                            [`${selectCustomersFiledName}_name`]: selectCustomers.customer_name,
                        });
                    }
                    setSelectCustomersDialogVisible(false);
                }}
                handleCancel={() => {
                    setSelectCustomersDialogVisible(false);
                }}
            />
            <SelectBomDialog
                modalVisible={selectBomDialogVisible}
                handleOk={(selectBom) => {
                    console.log('SelectBomDialog', selectBom)

                    HttpService.post('reportServer/bomLines/getBomLinesLeafByItemId', JSON.stringify({
                        item_id: selectBom.item_id
                    }))
                        .then((res) => {
                            if (res.resultCode == '1000') {

                                const materialList = [];
                                for (let materialIndex in res.data) {
                                    let material = res.data[materialIndex];
                                    materialList.push({
                                        line_id: `NEW_TEMP_ID_${(Math.random() * 1000000).toFixed(0)}`,
                                        item_id: material.material_id,
                                        item_description: material.material_description,
                                        uom: material.uom,
                                        quantity: material.quantity,
                                        amount: material.cost,
                                        price: material.unit_cost,
                                        lose_rate: material.lose_rate,
                                        item_type: 1
                                    })
                                }

                                tableRef?.current?.handleObjChange(
                                    {
                                        item_id: selectBom.item_id,
                                        item_description: selectBom.bom_name,
                                        uom: selectBom.uom,
                                        materialList: materialList,
                                        quantity: 1,
                                        amount: selectBom.cost,
                                        price: selectBom.cost,
                                        item_type: 0,
                                    },
                                    selectItemRecord);

                                //计算原料
                                calculateMaterial();

                                setSelectBomDialogVisible(false);
                            } else {
                                message.error(res.message);
                                setSelectBomDialogVisible(false);
                            }
                        });
                }}
                handleCancel={() => {
                    setSelectBomDialogVisible(false);
                }}
            />



        </PageContainer>
    );
};
export default count;