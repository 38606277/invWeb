import { Button, Space, Input, Card, Col, Form, List, Row, Select, Typography } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'umi';
import { history } from 'umi';
import moment from 'moment';
import AvatarList from './components/AvatarList';
import StandardFormRow from './components/StandardFormRow';
import TagSelect from './components/TagSelect';
import HttpService from '../../../utils/HttpService';
import styles from './style.less';
const { Option } = Select;
const { Search } = Input;
const FormItem = Form.Item;
const { Paragraph } = Typography;

const getKey = (id, index) => `${id}-${index}`;
export default () => {
  const [list, setList] = useState([]);
  const [itemCateList, setItemCateList] = useState([]);
  const [orgList, setOrgList] = useState([]);
  console.log(itemCateList);
  useEffect(() => {
      HttpService.post('reportServer/sales/getItemCategoryAndOrg', {}).then(
        (res) => {
          if (res.resultCode == '1000') {
              console.log(res);
              setItemCateList(res.data.itemcateList);
              setOrgList(res.data.orgList);
              
          }
      });
    }, []);
    const cardList = list && (
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
        renderItem={(item) => (
          <List.Item>
            <Card
              className={styles.card}
              hoverable
              cover={
                <img
                  alt={item.title}
                  src={
                    'https://img11.360buyimg.com/n7/jfs/t22633/109/2567375342/123812/faf849d3/5b862eb9N70c434d2.jpg'
                  }
                />
              }
            >
              <Card.Meta
                title={<a>{'皮皮狗 羊绒衫 '}</a>}
                description={
                  <Paragraph
                    className={styles.item}
                    ellipsis={{
                      rows: 2,
                    }}
                  >
                    {' xxl  红色'}
                  </Paragraph>
                }
              />
              <div>
                <Space align="center" size={50}>
                  <span>库存量 10</span>
                </Space>
              </div>
              <div style={{ fontWeight: 600, fontSize: '18px' }}>
                <Space align="center" size={50}>
                  <span>$1499</span>
                  <Button size="small" style={{ float: 'right' }}>
                    加入订单
                  </Button>
                </Space>
              </div>
            </Card>
          </List.Item>
        )}
      />
    );
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
    return (
      <div className={styles.coverCardList}>
        <Card bordered={false}>
          <div style={{ textAlign: 'center' }}>
            <span>
              <Search placeholder="输入查找的商品" enterButton="查找" style={{ width: '800px' }} />
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
              <FormItem name="category">
                <TagSelect expandable>
                {itemCateList.map((tag, index) => {
                   <TagSelect.Option value={tag.category_id}>{tag.category_name}</TagSelect.Option>
                  })
                }

                  {/* <TagSelect.Option value="cat1">羊毛衫</TagSelect.Option>
                  <TagSelect.Option value="cat2">类目二</TagSelect.Option>
                  <TagSelect.Option value="cat3">类目三</TagSelect.Option>
                  <TagSelect.Option value="cat4">类目四</TagSelect.Option>
                  <TagSelect.Option value="cat5">类目五</TagSelect.Option>
                  <TagSelect.Option value="cat6">类目六</TagSelect.Option>
                  <TagSelect.Option value="cat7">类目七</TagSelect.Option>
                  <TagSelect.Option value="cat8">类目八</TagSelect.Option>
                  <TagSelect.Option value="cat9">类目九</TagSelect.Option>
                  <TagSelect.Option value="cat10">类目十</TagSelect.Option>
                  <TagSelect.Option value="cat11">类目十一</TagSelect.Option>
                  <TagSelect.Option value="cat12">类目十二</TagSelect.Option> */}
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
              <FormItem name="category">
                <TagSelect expandable>
                  <TagSelect.Option value="cat1">仓库一</TagSelect.Option>
                  <TagSelect.Option value="cat2">类目二</TagSelect.Option>
                  <TagSelect.Option value="cat3">类目三</TagSelect.Option>
                  <TagSelect.Option value="cat4">类目四</TagSelect.Option>
                  <TagSelect.Option value="cat5">类目五</TagSelect.Option>
                  <TagSelect.Option value="cat6">类目六</TagSelect.Option>
                  <TagSelect.Option value="cat7">类目七</TagSelect.Option>
                  <TagSelect.Option value="cat8">类目八</TagSelect.Option>
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
        <div className={styles.cardList}>{cardList}</div>
      </div>
    );
};
