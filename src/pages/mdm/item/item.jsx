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
import SelectItemCategoryDialog from '@/components/itemCategory/SelectItemCategoryDialog';
import StandardFormRow from '@/components/StandardFormRow';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;
const formItemLayout2 = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const formItemLayout1 = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

export default (props) => {

  const [tableForm] = Form.useForm();
  const [mainForm] = Form.useForm();
  const tableRef = useRef();
  const [tableData, setTableData] = useState([]);
  const [catId, setCatId] = useState();
  const [catName, setCatName] = useState();
  const [columnData, setColumnData] = useState([]);
  const [selectItemCategoryDialogVisible, setSelectItemCategoryDialogVisible] = useState(false);

  const [names, setName] = useState();

  useEffect(() => {
    const outlist = [];
    if ("null" != props.match.params.category_id && "" != props.match.params.category_id && "-1" != props.match.params.category_id) {
        setCatId(props.match.params.category_id);
        let params = {
            "category_id":props.match.params.category_id
        }
        HttpService.post('reportServer/itemCategory/getAllPageById', JSON.stringify(params))
        .then(res => {
            if (res.resultCode == "1000") {
                const resultlist=res.data.list;
                //setColumnData(resultlist);
                const datainfo = res.data.dataInfo;
                mainForm.setFieldsValue({
                  item_category_id: datainfo.category_id,
                  category_code: datainfo.category_code,
                  item_category_name: datainfo.category_name,
                });
                 //条件列两两一组进行组合，作为一行显示
            const inlist=[];
            var k = Math.ceil(resultlist.length / 2);
            var j = 0;
            for (var i = 1; i <= k; i++) {
                var arr = new Array();
                for (j; j < i * 2; j++) {
                    if (undefined != resultlist[j]) {
                        
                            arr.push(resultlist[j]);
                       
                    }
                }
                if (arr.length > 0) {
                    inlist.push(arr);
                }
            }
            console.log(inlist);
            setColumnData(inlist);
            } else {
                message.error(res.message);
            }
        })
        if(null!=props.match.params.item_id && 'null'!=props.match.params.item_id){
            HttpService.post('reportServer/item/getItemByItemId', 
            JSON.stringify({ item_id: props.match.params.item_id }))
            .then(res => {
              if (res.resultCode == "1000") {
                
                let mainFormV = res.data;
                setCatName(mainFormV.category_name);
                mainForm.setFieldsValue(mainFormV);
                mainForm.setFieldsValue({
                  // item_category_id: mainFormV.category_id,
                  // category_code: mainFormV.category_code,
                  item_category_name: mainFormV.category_name,
                  // item_id: mainFormV.item_id,
                  // segment1:mainFormV.segment1,
                });
              
              } else {
                message.error(res.message);
              }
            });
          }else{
            mainForm.setFieldsValue({'item_id':""});
          }
    }
  }, []);

  const getColumnListByCategoryId = (id) => {
    setCatId(id);
    let params = {
        "category_id":id
    }
    HttpService.post('reportServer/itemCategory/getAllPageById', JSON.stringify(params))
    .then(res => {
        if (res.resultCode == "1000") {
            const resultlist=res.data.list;
            
            console.log(resultlist);
            //条件列两两一组进行组合，作为一行显示
            const inlist=[];
            var k = Math.ceil(resultlist.length / 2);
            var j = 0;
            for (var i = 1; i <= k; i++) {
                var arr = new Array();
                for (j; j < i * 2; j++) {
                    if (undefined != resultlist[j]) {
                        
                            arr.push(resultlist[j]);
                       
                    }
                }
                if (arr.length > 0) {
                    inlist.push(arr);
                }
            }
            console.log(inlist);
            setColumnData(inlist);
        } else {
            message.error(res.message);
        }
    })
  }
  const handleFieldChange = ( vale, record) => {
      const valName='item_description';
      let vas= mainForm.getFieldValue('item_description');
      if(undefined==vas){
        vas="";
      }
      record.dictList.map((item,index)=>{
        if(item.value_id===vale){
          vas=vas==""?item.value_name:vas+"-"+item.value_name;
        }
      })
      mainForm.setFieldsValue({[valName]:vas});
      mainForm.setFieldsValue({[record.segment]:vale});
  }
  const inColumn =columnData.map((item, index) => {
    const rc =item.map((record, index) => { 
           return  (
                <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24} key={record.segment + index}>
                  <Form.Item
                    label={record.segment_name}
                    name={record.segment}
                    rules={[{ required: true, message: '请选择'+record.segment_name+'!'}]}
                  >
                    <Select
                      placeholder="请选择" 
                      name={record.segment}
                      onChange={(value) => {
                          handleFieldChange(value, record)
                      }}>
                      {record.dictList==null?[]:record.dictList.map(item => <Option key={item['value_id']} value={item['value_id']}>{item['value_name']}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
      )
    });
    return <StandardFormRow key={'formrow' + index}><Row key={index}>{rc}</Row></StandardFormRow>;
  }); 
  return (
    <PageContainer
      header={
        {
          extra: [
            <Button key="submit" type='primary' onClick={() => {
              console.log('mainForm', mainForm)
              mainForm?.submit()
            }}>提交</Button>,
            <Button key="back" onClick={() => history.push('/mdm/item/itemList/'+catId)}>返回</Button>,
          ]
        }
      }
    >
      <Form
      {...formItemLayout2}
        form={mainForm}
        onFinish={async (values) => {
          //验证tableForm
          tableForm.validateFields()
            .then(() => {
              //验证成功
              let postData={
                ...values
              }
              console.log(postData)
              HttpService.post('reportServer/item/saveItem', JSON.stringify(postData))
                .then(res => {
                  if (res.resultCode == "1000") {
                    //刷新
                    message.success('提交成功');
                    history.push("/mdm/item/itemList/"+catId);
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
          <Row gutter={24}>
          <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <Form.Item name="item_id" style={{display:'none'}}>
                <Input id='item_id' name='item_id' value={mainForm.item_id} />
              </Form.Item>
              <Form.Item
                label="类别编码"
                name="category_code"
              >
                  <Input id='category_code' name='category_code' />
              </Form.Item>
              <Form.Item name="item_category_id" style={{ display: 'none' }}>
                <Input id='item_category_id' name='item_category_id' value={mainForm.item_category_id} />

              </Form.Item>
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
              <Form.Item
                label="类别名称"
                name="item_category_name"
              >
                <Search
                    placeholder="请选择分类"
                    allowClear
                    readOnly={true}
                    enterButton
                    onClick={() => {
                      setSelectItemCategoryDialogVisible(true);
                    }}
                    onSearch={() => {

                      setSelectItemCategoryDialogVisible(true);
                    }}
                />
              </Form.Item>
            </Col>

          </Row>
          <Row gutter={24} >
          <Col xl={{ span: 14, offset: 2 }} lg={{ span: 8 }} md={{ span: 24 }} sm={24}>
              <Form.Item
               {...formItemLayout1} 
                label="商品描述"
                name="item_description"
              >
                <Input
                id='item_description' name='item_description'
                  style={{ width: '100%'}}
                />
              </Form.Item>
            </Col>
          </Row>
          {inColumn}
        </ProCard>
        <SelectItemCategoryDialog
                modalVisible={selectItemCategoryDialogVisible}
                handleOk={(selectitemCategory) => {
                    console.log('selectItemCategoryDialog', selectitemCategory)
                    if (selectitemCategory) {
                      getColumnListByCategoryId(selectitemCategory.category_id);
                        mainForm.setFieldsValue({
                            item_category_id: selectitemCategory.category_id,
                            category_code: selectitemCategory.category_code,
                            item_category_name: selectitemCategory.category_name,
                        });
                    }
                    setSelectItemCategoryDialogVisible(false);
                }}
                handleCancel={() => {
                  setSelectItemCategoryDialogVisible(false);
                }}
            />
      </Form >

    </PageContainer >);
};
