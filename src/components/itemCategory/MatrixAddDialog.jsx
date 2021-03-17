//选择仓库的对话框
import React, { useState, useEffect, useRef } from 'react';
import { Button, message, Row, Col, Input, Table, Form, Drawer, Typography } from 'antd';
import TableForm_A from '@/components/EditFormA/TableForm_A';
import DictSelect from '@/components/Select/DictSelect';
import ProCardCollapse from '@/components/ProCard/ProCardCollapse'
import HttpService from '@/utils/HttpService.jsx';

const Search = Input.Search;
const { Text } = Typography;

const formItemLayout2 = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

const primaryKey = 'value_name';

const RowLine = (list) => {
    const rowLineItemList = list.map((record) => {

        if (record.input_mode == "dict") {
            return (<Col xs={24} sm={11}>
                <Form.Item
                    label={record.segment_name}
                    name={record.segment}
                    rules={[{ required: true, message: `请选择${record.segment_name}` }]}
                >
                    <DictSelect dictId={record.dict_id} valueType="name" />
                </Form.Item>
            </Col>);
        } else {
            return (<Col xs={24} sm={11}>
                <Form.Item
                    label={record.segment_name}
                    name={record.segment}
                    rules={[{ required: true, message: `请输入${record.segment_name}` }]}
                >
                    <Input placeholder={`请输入${record.segment_name}`} />
                </Form.Item>
            </Col>);
        }
    })




    return (<Row>{rowLineItemList}</Row>);
}

const MatrixAddDialog = (props) => {
    const tableRef = useRef();
    const [mainForm] = Form.useForm();

    const { modalVisible, handleOk, handleCancel } = props;

    const categoryId = props?.categoryId || '-1';

    const [columnList, setColumnList] = useState([]);

    const [firstColumnName, setFirstColumnName] = useState('');

    const [rSegment, setRSegment] = useState('');
    const [cSegment, setCSegment] = useState('');

    const [itemList, setItemList] = useState([]);


    const [mainLayout, setMainLayout] = useState([]);

    //重置选中状态
    useEffect(() => {
        //获取主键信息
        if (modalVisible) {
            let postData = {
                item_category_id: categoryId
            }

            HttpService.post('reportServer/itemCategory/getMKeySegmentByCategoryId', JSON.stringify(postData))
                .then(res => {
                    if (res.resultCode == "1000") {

                        //动态生成头表单
                        const mKeySegmentList = res.data;

                        const keySegmentLayout = [];

                        const length = mKeySegmentList.length;
                        const count = Math.ceil(length / 2);
                        console.log('length - ', length)
                        console.log('count - ', count)

                        for (let i = 0; i < count; i++) {
                            console.log('i - ', i)
                            let tempArr = [];
                            if ((i * 2) < length) {
                                tempArr.push(mKeySegmentList[i * 2]);
                            }
                            if (i * 2 + 1 < length) {
                                tempArr.push(mKeySegmentList[i * 2 + 1]);
                            }
                            keySegmentLayout.push(RowLine(tempArr))
                        }

                        console.log('keySegmentLayout', keySegmentLayout)
                        setMainLayout(keySegmentLayout);
                    } else {
                        message.error(res.message);
                    }
                });

            // getItemRowAndColumn();
        }



    }, [modalVisible])



    const getItemRowAndColumn = (params) => {
        let postData = {
            ...params,
            item_category_id: categoryId,
        }

        HttpService.post('reportServer/item/getItemRowAndColumn2', JSON.stringify(postData))
            .then(res => {
                if (res.resultCode == "1000") {
                    const itemList = res.data.itemList
                    const rSegment = res.data.r.segment;
                    const rSegmentName = res.data.r.segmentName;
                    const rList = res.data.r.list;

                    let rowDataList = [];
                    rList.forEach((value) => {
                        value.count = 0;
                        rowDataList.push(value);
                    })

                    const cSegment = res.data.c.segment;
                    const cSegmentName = res.data.c.segmentName;
                    const cList = res.data.c.list;

                    let columnDataList = [];
                    cList.forEach((value) => {
                        columnDataList.push(value['value_name'])
                    })

                    setRSegment(rSegment);
                    setCSegment(cSegment);

                    setFirstColumnName(`${rSegmentName}/${cSegmentName}`)

                    setColumnList(columnDataList);
                    setItemList(itemList);

                    tableRef.current.initData(rowDataList);


                } else {
                    message.error(res.message);
                }
            });
    }


    const calculateCount = (value, name, record) => {
        //统计count
        const count = (record['X'] || 0) + (record['XL'] || 0) + (record['XXL'] || 0) + (record['XXXL'] || 0);
        tableRef?.current?.handleObjChange(
            {
                count: count,
            },
            record,
        );
    }

    const buildColumns = (firstName, cloumnDataList) => {
        const cloumnList = [];
        cloumnList.push({
            title: firstName,
            dataIndex: 'value_name',
            renderParams: {
                widgetParams: { disabled: true },
            },
        });
        cloumnDataList.forEach((value) => {
            cloumnList.push(
                {
                    title: value,
                    dataIndex: value,

                    renderType: 'InputNumberEF',
                    renderParams: {
                        widgetParamsBuild: (text, record, index) => {
                            const itemResult = itemList.find((item) => {
                                const rBoo = item[rSegment] == record[primaryKey];
                                const cBoo = item[cSegment] == value;
                                return rBoo && cBoo;
                            });
                            return {
                                precision: 0,
                                onChange: calculateCount,
                                disabled: itemResult ? false : true
                            };
                        }
                    },
                },
            )
        });
        cloumnList.push({
            title: '合计',
            dataIndex: 'count',
            renderParams: {
                widgetParams: { disabled: true }
            }
        });
        return cloumnList;
    };

    return (
        <Drawer
            title="快捷添加"
            visible={modalVisible}
            onClose={handleCancel}
            bodyStyle={{ paddingBottom: 80 }}
            width={960}
            footer={
                <div
                    style={{
                        textAlign: 'right',
                    }}
                >
                    <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                        取消
            </Button>
                    <Button
                        onClick={() => {

                            const tableData = tableRef?.current?.getTableData();

                            //匹配item信息出来
                            console.log('tableData', tableData)

                            const resultList = [];

                            columnList.forEach((col) => { //  列

                                tableData.forEach((row) => { //   行

                                    itemList.forEach((item) => { //   item
                                        const rBoo = item[rSegment] == row[primaryKey];
                                        const cBoo = item[cSegment] == col;
                                        if (rBoo && cBoo) { // 行和列的信息相同
                                            // 获取数量
                                            const quantity = row[col];
                                            resultList.push({
                                                ...item,
                                                quantity: quantity

                                            })

                                        }
                                    })

                                })


                            })

                            //tableData 为行 value_name 为值
                            //columnList 为列

                            handleOk(resultList);

                        }}
                        type="primary"
                    >
                        确定
            </Button>
                </div>
            }>
            {/* <ProCardCollapse
                title="基础信息"
            > */}
            <Form
                {...formItemLayout2}
                form={mainForm}
                onFinish={async (values) => {
                    console.log(values)
                    getItemRowAndColumn(values);

                }}
            >

                {mainLayout}

                <Row>
                    <Col xs={22} sm={22}><Button style={{ float: 'right', marginBottom: '10px' }} type='primary' onClick={() => {
                        mainForm?.submit();
                    }}>查询</Button></Col>
                </Row>

            </Form>
            {/* </ProCardCollapse> */}



            <TableForm_A
                ref={tableRef}
                columns={buildColumns(firstColumnName, columnList)}
                primaryKey={primaryKey}
                tableParams={
                    {
                        rowSelection: false,
                        summary: (pageData) => {

                            let dataMap = {};

                            pageData.forEach((dataItem) => {
                                columnList.forEach((columnName) => {
                                    let oldValue = (dataMap[columnName] || 0) //取出原值
                                    let newValue = oldValue + (dataItem[columnName] || 0);
                                    dataMap[columnName] = newValue;
                                });
                            });

                            //根据列的数量统计值
                            let total = 0;
                            let totalList = [];
                            columnList.forEach((columnName) => {
                                let cloumnTotal = dataMap[columnName]
                                total += cloumnTotal;

                                totalList.push(
                                    <Table.Summary.Cell>
                                        <Text >{cloumnTotal}</Text>
                                    </Table.Summary.Cell>
                                )
                            })


                            totalList.push(
                                <Table.Summary.Cell>
                                    <Text >{total}</Text>
                                </Table.Summary.Cell>
                            )
                            return (
                                <>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell>合计</Table.Summary.Cell>
                                        {totalList}
                                    </Table.Summary.Row>
                                </>
                            );
                        }
                    }
                }
            />

        </Drawer>
    );


}


export default MatrixAddDialog;




