//选择仓库的对话框
import React, { useState, useEffect, useRef } from 'react';
import { Button, message, Row, Col, Input, Table, Form, Drawer, Typography } from 'antd';
import TableForm_A from '@/components/EditFormA/TableForm_A';
import HttpService from '@/utils/HttpService.jsx';
const Search = Input.Search;
const { Text } = Typography;

const MatrixAddDialog = (props) => {
    const tableRef = useRef();
    const [tableForm] = Form.useForm();

    const { modalVisible, handleOk, handleCancel } = props;

    const categoryId = props?.categoryId || '-1';

    const [columnList, setColumnList] = useState([]);

    const [primaryKey, setPrimaryKey] = useState([]);
    const [firstColumnName, setFirstColumnName] = useState('');

    //重置选中状态
    useEffect(() => {
        //获取主键信息
        if (modalVisible) {
            let postData = {
                item_category_id: categoryId
            }

            // HttpService.post('reportServer/itemCategory/getMKeySegmentByCategoryId', JSON.stringify(postData))
            //     .then(res => {
            //         if (res.resultCode == "1000") {

            //             //动态生成头表单
            //             let mKeySegmentList = res.data;

            //             let keySegmentLayout = [];





            //             mKeySegmentList.forEach((value, index) => {
            //                 if (index / 2 == 0) {

            //                 }
            //             })



            //             } else {
            //                 message.error(res.message);
            //             }
            //         });

            getItemRowAndColumn();
        }



    }, [modalVisible])



    const getItemRowAndColumn = () => {
        let postData = {
            item_category_id: categoryId,
            segment3: 'ABC111'
        }

        HttpService.post('reportServer/item/getItemRowAndColumn', JSON.stringify(postData))
            .then(res => {
                if (res.resultCode == "1000") {
                    const rSegment = res.data.r.segment;
                    const rSegmentName = res.data.r.segmentName;
                    const rList = res.data.r.list;

                    let rowDataList = [];
                    rList.forEach((value) => {
                        rowDataList.push({
                            name: value[rSegment],
                            count: 0
                        });
                    })

                    const cSegment = res.data.c.segment;
                    const cSegmentName = res.data.c.segmentName;
                    const cList = res.data.c.list;

                    let columnDataList = [];
                    cList.forEach((value) => {
                        columnDataList.push(value[cSegment])
                    })

                    setPrimaryKey(rSegment)
                    setFirstColumnName(`${rSegmentName}/${cSegmentName}`)
                    setColumnList(columnDataList);

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
            dataIndex: 'name',
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
                        widgetParams: {
                            precision: 0,
                            onChange: calculateCount,
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
            width={720}
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
                            handleOk([], []);
                        }}
                        type="primary"
                    >
                        确定
            </Button>
                </div>
            }>


            <Row>
                <Col xs={24} sm={10}>
                    <Form.Item
                        label="货号"
                        name="huohoa"
                        rules={[{ required: true, message: '请输入货号' }]}
                    >
                        <Search
                            placeholder="请输入货号"
                            allowClear
                            enterButton
                            onClick={() => {
                                console.log('数据---', tableRef.current.getTableData());
                            }}
                            onSearch={() => {
                                console.log('数据---', tableRef.current.getTableData());
                            }}
                        />
                    </Form.Item>
                </Col>

                <Col xs={24} sm={11}>
                    <Form.Item
                        label="品名"
                        name="pinming"
                        rules={[{ required: true, message: '品名' }]}
                    >
                        <Input placeholder="品名" />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={11}>
                    <Form.Item
                        label="品牌"
                        name="pinpai"
                        rules={[{ required: true, message: '品牌' }]}
                    >
                        <Input placeholder="品牌" />
                    </Form.Item>
                </Col>
            </Row>

            <TableForm_A
                ref={tableRef}
                columns={buildColumns(firstColumnName, columnList)}
                primaryKey={primaryKey}
                tableForm={tableForm}

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




