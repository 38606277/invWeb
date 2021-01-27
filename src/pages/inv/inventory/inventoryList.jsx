import React, { useEffect, useRef, useState } from 'react';
import { Button, Space, Modal, message, Row, TreeSelect, Tree } from 'antd';
import { EllipsisOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { history } from 'umi';


import HttpService from '@/utils/HttpService.jsx';

const { confirm } = Modal;


//获取数据
const fetchData = async (params, sort, filter) => {
    let requestParam = {
        startIndex: params.current,
        perPage: params.pageSize,
        ...params
    }
    const result = await HttpService.post('reportServer/inventory/getAllPage', JSON.stringify(requestParam));
    return Promise.resolve({
        data: result.data.list,
        total: result.data.total,
        success: result.resultCode == "1000"
    });
}

const inventoryList = () => {

    const ref = useRef();
    const [visible, setVisible] = useState(false);
    const [initData, setInitData] = useState({});

    //定义列
    const columns = [
        {
            title: '商品描述',
            dataIndex: 'item_description',
            valueType: 'text',
            align:"center"
        },
        {
            title: '物料名称',
            dataIndex: 'category_name',
            valueType: 'text',
            align:"center"
        },
        // {
        //     title: 'segment1',
        //     dataIndex: 'segment1',
        //     valueType: 'text',
        //     align:"center"
        // },
        // {
        //     title: 'segment2',
        //     dataIndex: 'segment2',
        //     valueType: 'text',
        //     align:"center"
        // },
        // {
        //     title: 'segment3',
        //     dataIndex: 'segment3',
        //     valueType: 'text',
        //     align:"center"
        // },
        // {
        //     title: 'segment4',
        //     dataIndex: 'segment4',
        //     valueType: 'text',
        //     align:"center"
        // },
        // {
        //     title: 'segment5',
        //     dataIndex: 'segment5',
        //     valueType: 'text',
        //     align:"center"
        // },
        // {
        //     title: 'segment6',
        //     dataIndex: 'segment6',
        //     valueType: 'text',
        //     align:"center"
        // },
        // {
        //     title: 'segment7',
        //     dataIndex: 'segment7',
        //     valueType: 'text',
        //     align:"center"
        // },
        // {
        //     title: 'segment8',
        //     dataIndex: 'segment8',
        //     valueType: 'text',
        //     align:"center"
        // },
        // {
        //     title: 'segment9',
        //     dataIndex: 'segment9',
        //     valueType: 'text',
        //     align:"center"
        // },
        // {
        //     title: 'segment10',
        //     dataIndex: 'segment10',
        //     valueType: 'text',
        //     align:"center"
        // },
        {
            title: '数量',
            dataIndex: 'on_hand_quantity',
            valueType: 'text',
            align:"center"
        },
        {
            title: '单价',
            dataIndex: 'price',
            valueType: 'text',
            align:"center"
        },
        {
            title: '总金额',
            dataIndex: 'amount',
            valueType: 'text',
            align:"center"
        },
        {
            title: '预警最大值',
            dataIndex: 'max',
            valueType: 'text',
            align:"center"
        },
        {
            title: '预警最小值',
            dataIndex: 'min',
            valueType: 'text',
            align:"center"
        },
        {
            title: '仓库',
            dataIndex: 'org_name',
            valueType: 'text',
            align:"center"
        }
    ];

    return (
            <ProTable
                actionRef={ref}
                columns={columns}
                request={fetchData}
                rowKey="id"
                pagination={{
                    showQuickJumper: true,
                }}
                search={{
                    defaultCollapsed: true
                }}
                dateFormatter="string"
                headerTitle="库存列表"
            />

    );
}

export default inventoryList;