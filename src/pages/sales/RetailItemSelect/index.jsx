import { Button, Space, Input, Card, Col, Form, List, Row, Select, Typography, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'umi';
import { history } from 'umi';
import moment from 'moment';
import AvatarList from './components/AvatarList';
import StandardFormRow from './components/StandardFormRow';
import TagSelect from './components/TagSelect';
import HttpService from '../../../utils/HttpService';
import styles from './style.less';
import LocalStorge from '@/utils/LogcalStorge';

const { Option } = Select;
const { Search } = Input;
const FormItem = Form.Item;
const { Paragraph } = Typography;
const localStorge = new LocalStorge();
const userInfo = localStorge.getStorage('userInfo');
const getKey = (id, index) => `${id}-${index}`;
const imgurl = window.getServerUrl();
export default () => {
  const [list, setList] = useState([]);
  const [itemCateList, setItemCateList] = useState([]);
  const [orgList, setOrgList] = useState([]);
  const [toatl, setTotal] = useState(0);
  const [categoryCheckVal, setCategoryCheckVal] = useState([]);
  const [orgCheckVal, setOrgCheckVal] = useState([]);
  const [itemDescription, setItemDescription] = useState();
  const [orgid, setOrgid] = useState();

  useEffect( async () => {
    
    await  HttpService.post('reportServer/invOrgUser/getOrgListByUserId', JSON.stringify({ user_id: userInfo.id })).then(
      (res) => {
        if (res.resultCode == '1000') {
          setOrgid(res.data[0].org_id)
        } else {
          message.error(res.message);
        }
      },
    );

    await HttpService.post('reportServer/sales/getItemCategoryAndOrg', {}).then(
      (res) => {
        if (res.resultCode == '1000') {
          setItemCateList(res.data.itemcateList);
          setOrgList(res.data.orgList);
        }
    });
    
    fetchList(0,"",[],[]);
    
  }, []);


    const fetchList = (page,itemDescription,categoryCheckVal,orgCheckVal) => {
      HttpService.post('reportServer/sales/getAllPage', 
      {
        startIndex:page,
        perPage:10,
        item_description:itemDescription,
        category_id:categoryCheckVal.join(","),
        org_id:orgCheckVal.join(",")
      }
      ).then(
        (res) => {
          if (res.resultCode == '1000') {
           setList(res.data.list);
           setTotal(res.data.total);
          }
      });
    }
    const changePage = (page) => {
      fetchList(page,itemDescription,categoryCheckVal,orgCheckVal);
    }
    const formItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
        },
        sm: {
          span: 16,
        },
      },
    };

    const handleChangeCategory = (selectValue) => {
      setCategoryCheckVal(selectValue);
      fetchList(0,itemDescription,selectValue,orgCheckVal);
    }

    const handleChangeOrg = (selectValue) => {
      setOrgCheckVal(selectValue);
      fetchList(0,itemDescription,categoryCheckVal,selectValue);
    }

    const onSearch = (val) => {
      fetchList(0,val,categoryCheckVal,orgCheckVal);
    }

    const addPo = (item) => {
      console.log(item);
      let newitem = {
        ...item,
        category_id:item.item_category_id,
        sales_id:userInfo.id,
        inv_org_id:orgid
      }
      HttpService.post('reportServer/sales/addCategory', 
      
      newitem
      
      ).then(
        (res) => {
          if (res.resultCode == '1000') {
            message.success("添加成功")
          }
      });
    }

    return (
      <div className={styles.coverCardList}>
        <Card bordered={false}>
          <div style={{ textAlign: 'center' }}>
            <span>
              <Search placeholder="输入查找的商品" enterButton="查找" onSearch={onSearch} style={{ width: '800px' }} />
              <Button onClick={() => history.push(`/retail/retailorder`)}>订单</Button>
            </span>
          </div>
        </Card>
        <Card bordered={false}>
          <Form
            layout="inline"
            onValuesChange={() => {
              // 表单项变化时请求数据
              // 模拟查询表单生效
             
            }}
          >
            <StandardFormRow
              title="所属类目"
              block
              style={{
                paddingBottom: 11,
              }}
            >
              <FormItem name="categorySelect">
                <TagSelect expandable onChange={handleChangeCategory}>
                {itemCateList.map((tag, index) => 
                   <TagSelect.Option value={tag.category_id}>{tag.category_name}</TagSelect.Option>
                  )
                }
                </TagSelect>
              </FormItem>
            </StandardFormRow>
            <StandardFormRow
              title="仓库"
              block
              style={{
                paddingBottom: 11,
              }}
            >
              <FormItem name="orgSelect">
                <TagSelect expandable onChange={handleChangeOrg}>
                {orgList.map((tag, index) => 
                   <TagSelect.Option value={tag.org_id}>{tag.org_name}</TagSelect.Option>
                  )
                }
                </TagSelect>
              </FormItem>
            </StandardFormRow>
            <StandardFormRow title="其它选项" grid last>
              <Row gutter={16}>
                <Col lg={8} md={10} sm={10} xs={24}>
                  <FormItem {...formItemLayout} label="作者" name="author">
                    <Select
                      placeholder="不限"
                      style={{
                        maxWidth: 200,
                        width: '100%',
                      }}
                    >
                      <Option value="lisa">王昭君</Option>
                    </Select>
                  </FormItem>
                </Col>
                <Col lg={8} md={10} sm={10} xs={24}>
                  <FormItem {...formItemLayout} label="好评度" name="rate">
                    <Select
                      placeholder="不限"
                      style={{
                        maxWidth: 200,
                        width: '100%',
                      }}
                    >
                      <Option value="good">优秀</Option>
                      <Option value="normal">普通</Option>
                    </Select>
                  </FormItem>
                </Col>
              </Row>
            </StandardFormRow>
          </Form>
        </Card>
        <div className={styles.cardList}>
          <List
            rowKey="id"
            grid={{
              gutter: 16,
              xs: 1,
              sm: 2,
              md: 3,
              lg: 3,
              xl: 5,
              xxl: 5,
            }}
            dataSource={list}
            pagination={{
              onChange: page => {
                changePage(page);
              },
              pageSize: 10,
              total:toatl
            }}
            renderItem={(item) => (
              <List.Item>
                <Card
                  className={styles.card}
                  hoverable
                  cover={
                    item.image_url!=null ? 
                    <img
                      alt={item.item_description}
                      src={imgurl+"/report/"+item.image_url}
                    />:<img
                    alt={item.item_description}
                    src={
                      'https://img11.360buyimg.com/n7/jfs/t22633/109/2567375342/123812/faf849d3/5b862eb9N70c434d2.jpg'
                    }
                  />
                  }
                >
                  <Card.Meta
                    title={<a>{item.mkeyRes}</a>}
                    description={
                      <Paragraph
                        className={styles.item}
                        ellipsis={{
                          rows: 2,
                        }}
                      >
                        {item.skeyRes}
                      </Paragraph>
                    }
                  />
                  <div>
                    <Space align="center" size={50}>
                      <span>仓库:{item.org_name}</span>
                    </Space>
                  </div>
                  <div>
                    <Space align="center" size={50}>
                      <span>库存量 {item.quantity==null?0:<span style={{color:'blue'}}>{item.quantity}</span>}</span>
                    </Space>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '18px' }}>
                    <Space align="center" size={50}>
                      <span>${item.retail_price}</span>
                      <Button size="small" style={{ float: 'right' }} 
                      disabled={item.quantity>0?item.org_id==orgid?false:true:true}
                      onClick={()=>addPo(item)}
                      >
                        加入订单
                      </Button>
                    </Space>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </div>
      </div>
    );
};
