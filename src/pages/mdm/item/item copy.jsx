import React, { useEffect, useRef, useState } from 'react';
import { message, Form, Button, Row, Col, Select, Input, DatePicker } from 'antd';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import TableForm from './TableForm';
import FormItem from 'antd/lib/form/FormItem';
import HttpService from '../../../utils/HttpService';
import { history } from 'umi';
import { PlusOutlined, MinusOutlined, ConsoleSqlOutlined } from '@ant-design/icons';
import SelectEF from '@/components/EditForm/SelectEF';

const { RangePicker } = DatePicker;
const { Option } = Select;

export default (props) => {

  const [tableForm] = Form.useForm();
  const [mainForm] = Form.useForm();
  const tableRef = useRef();
  const [tableData, setTableData] = useState([]);
  const [catId, setCatId] = useState();
  const [catName, setCatName] = useState();
  const [columnData, setColumnData] = useState([]);

  useEffect(() => {
    const outlist = [];
    if ("null" != props.match.params.category_id && "" != props.match.params.category_id) {
        setCatId(props.match.params.category_id);
        let params = {
            "category_id":props.match.params.category_id
        }
        HttpService.post('reportServer/itemCategory/getAllPageById', JSON.stringify(params))
        .then(res => {
            if (res.resultCode == "1000") {
                const resultlist=res.data;
                setColumnData(resultlist);
            } else {
                message.error(res.message);
            }
        })
        HttpService.post('reportServer/item/getAllPageByCategoryId', 
        JSON.stringify({ item_category_id: props.match.params.category_id }))
        .then(res => {
          if (res.resultCode == "1000") {
            
            let mainFormV = res.data.mainForm;
            let lineFormV = res.data.lineForm;
            setCatName(mainFormV.category_name);
            mainForm.setFieldsValue({
              category_id: mainFormV.category_id,
              category_code: mainFormV.category_code,
              category_name: mainFormV.category_name,
              category_pid: mainFormV.category_pid
            });

            //初始化数据
            tableRef?.current?.initData(lineFormV);
          } else {
            message.error(res.message);
          }
        });
    }
  }, []);


  return (
    <PageContainer
      header={
        {
          extra: [
            <Button key="submit" type='primary' onClick={() => {
              console.log('mainForm', mainForm)
              mainForm?.submit()
            }}>提交</Button>,
            <Button key="back" onClick={() => history.push('/mdm/item/itemList')}>返回</Button>,
          ]
        }
      }
    >
      <Form
        form={mainForm}
        onFinish={async (values) => {
          //验证tableForm
          tableForm.validateFields()
            .then(() => {
              //验证成功
              let postData = {
                lineForm: tableData,
                lineDelete: tableRef?.current?.getDeleteData()
              }
              console.log(postData)
              HttpService.post('reportServer/item/saveItem', JSON.stringify(postData))
                .then(res => {
                  if (res.resultCode == "1000") {
                    //刷新
                    message.success('提交成功');
                    history.push("/mdm/item/itemList");
                  } else {
                    message.error(res.message);
                  }
                });
            }).catch(errorInfo => {
              //验证失败
              message.error('提交失败');
            });
        }} >

        <ProCard title="基础信息" headerBordered
          collapsible
          onCollapse={(collapse) => console.log(collapse)}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <Form.Item
                label="类别编码"
                name="category_code"
              >
                  <Input id='category_code' name='category_code' value={mainForm.category_code} style={{border:'0px'}}  readOnly={true}/>
              </Form.Item>
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <Form.Item
                label="类别名称"
                name="category_name"
              >
                <Input
                value={mainForm.category_name}
                  style={{ width: '100%',border:'0px'}}
                  readOnly={true}
                />
              </Form.Item>
            </Col>

          </Row>
        </ProCard>

        <ProCard
          title="行信息"
          style={{ marginTop: '30px' }}
          headerBordered
          collapsible
          onCollapse={(collapse) => console.log(collapse)}
          extra={
            [
              <Button onClick={() => {
                //新增一行
                const newObj={
                    item_id: `NEW_${(Math.random() * 1000000).toFixed(0)}`,
                    item_category_id:catId,
                    item_description:catName,
                    editable: true,
                    isNew: true,
                  };
               // console.log(columnData);
                columnData.map((itemss,index)=>{
                    const keyV=itemss.segment.toLowerCase();
                    newObj[keyV]="";
                });
                tableRef.current.addItem(newObj);
              }} icon={<PlusOutlined />}>
              </Button>,
              <Button style={{ margin: '12px' }} onClick={() => {
                //删除选中项
                tableRef.current.removeRows();
              }} icon={<MinusOutlined />}></Button>
            ]
          }
        >
          <TableForm
            ref={tableRef}
            primaryKey='item_id'
            value={tableData}
            columnData={columnData}
            onChange={(newTableData) => {
              //onChange实时回调最新的TableData 
              //手动获取方式 tableRef?.current?.getTableData()，可以节省onChange方法
              setTableData(newTableData);
            }}
            tableForm={tableForm} />
        </ProCard>
      </Form >

    </PageContainer >);
};
