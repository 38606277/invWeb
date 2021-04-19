/**
 * 库存补货规则 
 */
import React, { useState, useEffect } from 'react';
import { Input, Drawer, Button, TimePicker, Select, Form, Row, Col, message } from 'antd';


import HttpService from '@/utils/HttpService.jsx';

const { Option } = Select;

const formItemLayout2 = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const InventoryRulesDialog = (props) => {
  const { modalVisible, handleOk, handleCancel } = props;

  const [mainForm] = Form.useForm();
  const [auto, setAuto] = useState('N')

  const orgId = props?.orgId || '-1';
  const itemId = props?.itemId || '-1';

  //重置选中状态
  useEffect(() => {
    //获取规则明细
    if (modalVisible) {
      HttpService.post('reportServer/invOnHand/getItemOnHandSettingByOrgIdAndItemId', JSON.stringify({ org_id: orgId, item_id: itemId }))
        .then(res => {
          if (res.resultCode === "1000") {
            mainForm.setFieldsValue(res.data)
          } else {
            message.error(res.message);
          }
        });
    }

  }, [modalVisible]);

  return (
    <Drawer
      title="仓库规则"
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
              mainForm?.submit();
            }}
            type="primary"
          >
            确定
          </Button>
        </div>
      }
    >
      <div>

        <Form
          {...formItemLayout2}
          form={mainForm}
          initialValues={{ auto: 'N' }}
          onValuesChange={(changedValues, allValues) => {

            if (changedValues?.auto) {
              setAuto(changedValues?.auto)
            }

          }}
          onFinish={async (values) => {
            values.item_id = itemId;
            values.org_id = orgId;

            HttpService.post('reportServer/invOnHand/updateItemOnHand', JSON.stringify(values))
              .then(res => {
                if (res.resultCode === "1000") {
                  mainForm.setFieldsValue(res.data)
                  handleOk();
                } else {
                  message.error(res.message);
                }
              });

          }}
        >
          <Row>
            <Col xs={24} sm={11}>
              <Form.Item label="最小值" name="min">
                <Input placeholder="请输入最小值" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={11}>
              <Form.Item label="最大值" name="max">
                <Input placeholder="请输入最大值" />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col xs={24} sm={11}>
              <Form.Item label="是否自动补单" name="auto">
                <Select placeholder="请选择是否自动补单">
                  <Option value="Y">是</Option>
                  <Option value="N">否</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={11}>
              <Form.Item label="补单时间" name="time">

                <TimePicker
                  style={{ width: '100%' }}
                  disabled={auto == 'N'} />
              </Form.Item>
            </Col>
          </Row>

        </Form>

      </div>
    </Drawer>
  );
};

export default InventoryRulesDialog;
