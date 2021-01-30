import React, { useEffect, useRef, useState } from 'react';
import { message, Form, Button, Row, Col, Select, Input, DatePicker } from 'antd';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import FormItem from 'antd/lib/form/FormItem';
import HttpService from '../../../utils/HttpService';
import { history } from 'umi';
import { PlusOutlined, MinusOutlined, ConsoleSqlOutlined } from '@ant-design/icons';
import ProCardCollapse from '@/components/ProCard/ProCardCollapse';
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
  labelCol: { span: 3 },
  wrapperCol: { span: 12 },
};

export default (props) => {
  const [tableForm] = Form.useForm();
  const [mainForm] = Form.useForm();
  const tableRef = useRef();
  const [tableData, setTableData] = useState([]);
  const [catId, setCatId] = useState();
  const [catName, setCatName] = useState();
  const [columnData, setColumnData] = useState([]);
  const [columnData2, setColumnData2] = useState([]);
  const [selectItemCategoryDialogVisible, setSelectItemCategoryDialogVisible] = useState(false);
  const [names, setNames] = useState({});

  useEffect(() => {
    const outlist = [];
    if (
      'null' != props.match.params.category_id &&
      '' != props.match.params.category_id &&
      '-1' != props.match.params.category_id
    ) {
      setCatId(props.match.params.category_id);
      let params = {
        category_id: props.match.params.category_id,
      };
      HttpService.post('reportServer/itemCategory/getAllPageById', JSON.stringify(params)).then(
        (res) => {
          if (res.resultCode == '1000') {
            const resultlist = res.data.list;
            //setColumnData(resultlist);
            const datainfo = res.data.dataInfo;
            mainForm.setFieldsValue({
              item_category_id: datainfo.category_id,
              category_code: datainfo.category_code,
              item_category_name: datainfo.category_name,
            });
            //条件列两两一组进行组合，作为一行显示
            const inlist = [];
            var k = Math.ceil(resultlist.length / 3);
            var j = 0;
            for (var i = 1; i <= k; i++) {
              var arr = new Array();
              for (j; j < i * 3; j++) {
                if (undefined != resultlist[j]) {
                  arr.push(resultlist[j]);
                }
              }
              if (arr.length > 0) {
                inlist.push(arr);
              }
            }
            setColumnData(inlist);

            const resultlist2 = res.data.list2;
          //条件列两两一组进行组合，作为一行显示
          const inlist2 = [];
          var kk = Math.ceil(resultlist2.length / 3);
          var jj = 0;
          for (var ii = 1; ii <= kk; ii++) {
            var arr2 = new Array();
            for (jj; jj < ii * 3; jj++) {
              if (undefined != resultlist2[jj]) {
                arr2.push(resultlist2[jj]);
              }
            }
            if (arr2.length > 0) {
              inlist2.push(arr2);
            }
          }
          setColumnData2(inlist2);
          } else {
            message.error(res.message);
          }
        },
      );
      if (null != props.match.params.item_id && 'null' != props.match.params.item_id) {
        HttpService.post(
          'reportServer/item/getItemByItemId',
          JSON.stringify({ item_id: props.match.params.item_id })
        ).then((res) => {
          if (res.resultCode == '1000') {
            let mainFormV = res.data;
            setCatName(mainFormV.category_name);
            mainForm.setFieldsValue(mainFormV);
            mainForm.setFieldsValue({
              item_category_name: mainFormV.category_name,
            });
          } else {
            message.error(res.message);
          }
        });
      } else {
        mainForm.setFieldsValue({ item_id: '' });
      }
    }
  }, []);

  const getColumnListByCategoryId = (id) => {
    setCatId(id);
    let params = {
      category_id: id,
    };
    HttpService.post('reportServer/itemCategory/getAllPageById', JSON.stringify(params)).then(
      (res) => {
        if (res.resultCode == '1000') {
          const resultlist = res.data.list;
          //条件列两两一组进行组合，作为一行显示
          const inlist = [];
          var k = Math.ceil(resultlist.length / 3);
          var j = 0;
          for (var i = 1; i <= k; i++) {
            var arr = new Array();
            for (j; j < i * 3; j++) {
              if (undefined != resultlist[j]) {
                arr.push(resultlist[j]);
              }
            }
            if (arr.length > 0) {
              inlist.push(arr);
            }
          }
          setColumnData(inlist);

          const resultlist2 = res.data.list2;
          //条件列两两一组进行组合，作为一行显示
          const inlist2 = [];
          var kk = Math.ceil(resultlist2.length / 3);
          var jj = 0;
          for (var ii = 1; ii <= kk; ii++) {
            var arr2 = new Array();
            for (jj; jj < i * 3; jj++) {
              if (undefined != resultlist2[jj]) {
                arr2.push(resultlist2[jj]);
              }
            }
            if (arr2.length > 0) {
              inlist2.push(arr2);
            }
          }
          setColumnData2(inlist2);
        } else {
          message.error(res.message);
        }
      },
    );
  };
  const handleFieldChange = (vale, record) => {
    const valnames = record.segment;
    const valName = 'item_description';
    let vas = '';
    record.dictList.map((item, index) => {
      if (item.value_id === vale) {
        vas = item.value_name;
      }
    });
    names[valnames] == undefined ? '' : vas;
    names[valnames] = vas;
    setNames(names);
    let vvv = '';
    for (var key in names) {
      vvv = vvv + '-' + names[key];
    }
    if (vvv.length > 1) {
      vvv = vvv.substring(1, vvv.length);
    }
    mainForm.setFieldsValue({ [valName]: vvv });
    mainForm.setFieldsValue({ [valnames]: vale });
  };
  const inColumn = columnData.map((item, index) => {
    const rc = item.map((record, index) => {
      return (
        <Col
          xl={{ span: 6, offset: 2 }}
          lg={{ span: 6 }}
          md={{ span: 12 }}
          sm={24}
          key={record.segment + index}
        >
          <Form.Item
            label={record.segment_name}
            name={record.segment}
            rules={[{ required: true, message: '请选择' + record.segment_name + '!' }]}
          >
            <Select
              placeholder="请选择"
              name={record.segment}
              onChange={(value) => {
                handleFieldChange(value, record);
              }}
            >
              {record.dictList == null
                ? []
                : record.dictList.map((item) => (
                    <Option key={item['value_id']} value={item['value_id']}>
                      {item['value_name']}
                    </Option>
                  ))}
            </Select>
          </Form.Item>
        </Col>
      );
    });
    return (
      <StandardFormRow key={'formrow' + index}>
        <Row key={index}>{rc}</Row>
      </StandardFormRow>
    );
  });
  const inColumn2 = columnData2.map((item, index) => {
    const rc = item.map((record, index) => {
      return (
        <Col
          xl={{ span: 6, offset: 2 }}
          lg={{ span: 6 }}
          md={{ span: 12 }}
          sm={24}
          key={record.segment + index}
        >
          <Form.Item
            label={record.segment_name}
            name={record.segment}
            rules={[{ required: true, message: '请输入' + record.segment_name + '!' }]}
          >
            <Select
              placeholder="请选择"
              name={record.segment}
              onChange={(value) => {
                handleFieldChange(value, record);
              }}
            >
              {record.dictList == null
                ? []
                : record.dictList.map((item) => (
                    <Option key={item['value_id']} value={item['value_id']}>
                      {item['value_name']}
                    </Option>
                  ))}
            </Select>
              
          </Form.Item>
        </Col>
      );
    });
    return (
      <StandardFormRow key={'formrow' + index}>
        <Row key={index}>{rc}</Row>
      </StandardFormRow>
    );
  });
  return (
    <PageContainer
      ghost="true"
      title="商品编辑"
      header={{
        extra: [
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              console.log('mainForm', mainForm);
              mainForm?.submit();
            }}
          >
            提交
          </Button>,
          <Button key="back" onClick={() => history.push('/mdm/item/itemList/' + catId)}>
            返回
          </Button>,
        ],
      }}
    >
      <Form
        
        form={mainForm}
        onFinish={async (values) => {
          //验证tableForm
          tableForm
            .validateFields()
            .then(() => {
              //验证成功
              let postData = {
                ...values,
              };
              console.log(postData);
              HttpService.post('reportServer/item/saveItem', JSON.stringify(postData)).then(
                (res) => {
                  if (res.resultCode == '1000') {
                    //刷新
                    message.success('提交成功');
                    history.push('/mdm/item/itemList/' + catId);
                  } else {
                    message.error(res.message);
                  }
                },
              );
            })
            .catch((errorInfo) => {
              //验证失败
              message.error('提交失败');
            });
        }}
      >
        <ProCard
          title="基础信息"
          headerBordered
          collapsible
          onCollapse={(collapse) => console.log(collapse)}
        >
          <Row gutter={24}>
          <Col xl={{ span: 6, offset: 2 }} lg={{ span: 6 }} md={{ span: 12 }} sm={24}>
              <Form.Item
                label="类别名称"
                name="item_category_name"
                rules={[{ required: true, message: '请选择类别名称' }]}
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
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 6 }} md={{ span: 12 }} sm={24}>
              <Form.Item name="item_id" style={{ display: 'none' }}>
                <Input id="item_id" name="item_id" value={mainForm.item_id} />
              </Form.Item>
              <Form.Item label="类别编码" name="category_code">
                <Input id="category_code" name="category_code" />
              </Form.Item>
              <Form.Item name="item_category_id" style={{ display: 'none' }}>
                <Input
                  id="item_category_id"
                  name="item_category_id"
                  value={mainForm.item_category_id}
                />
              </Form.Item>
            </Col>
            
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 6 }} md={{ span: 12 }} sm={24}>
              <Form.Item
                label="单位"
                name="uom"
                rules={[{ required: true, message: '请输入单位' }]}
              >
                <Input id="uom" name="uom" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col xl={{ span: 12, offset: 2 }}  sm={24}>
              <Form.Item label="商品描述" name="item_description" {...formItemLayout1}>
                <Input id="item_description" name="item_description" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
           
          </Row>
        </ProCard>
        <ProCard collapsible title="关键信息">
          {inColumn}
        </ProCard>
        <ProCard collapsible title="属性信息">
          {inColumn2}
        </ProCard>
        <ProCard collapsible title="价格信息">
        <Row gutter={24}>
        <Col xl={{ span: 6, offset: 2 }} lg={{ span: 6 }} md={{ span: 12 }} sm={24}>
              <Form.Item
                label="市场价"
                name="market_price"
                rules={[{ required: true, message: '请输入市场价' }]}
              >
                <Input id="market_price" name="market_price" />
              </Form.Item>
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 6 }} md={{ span: 12 }} sm={24}>
              <Form.Item label="原价" name="price" rules={[{ required: true, message: '请输入原价' }]} >
                <Input id="price" name="price" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 6 }} md={{ span: 12 }} sm={24}>
             <Form.Item
                label="促销价"
                name="promotion_price"
                rules={[{ required: true, message: '请输入促销价' }]}
              >
                <Input id="promotion_price" name="promotion_price" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            
            <Col xl={{ span: 6, offset: 2 }} lg={{ span: 6 }} md={{ span: 12 }} sm={24}>
              <Form.Item
                label="成本价"
                name="cost_price"
                rules={[{ required: true, message: '请输入成本价' }]}
              >
                <Input id="cost_price" name="cost_price" />
              </Form.Item>
            </Col>
          </Row>
        </ProCard>
        <SelectItemCategoryDialog
          modalVisible={selectItemCategoryDialogVisible}
          handleOk={(selectitemCategory) => {
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
      </Form>
    </PageContainer>
  );
};
