/**
 * 折叠卡片
 * 统一实现 右侧折叠
 */
import React, { useState } from 'react';
import ProCard from '@ant-design/pro-card';
import { RightOutlined } from '@ant-design/icons';

const ProCardCollapse = (props) => {
    const [mCollapsed, setMCollapsed] = useState(false);
    return (
        <ProCard
            {...props}
            collapsed={mCollapsed}
            title={
                <div onClick={() => {
                    setMCollapsed(!mCollapsed);
                }}>{props?.title}</div>
            }
            extra={
                props?.extra ?
                    [...props.extra, <RightOutlined
                        style={{ marginLeft: '6px' }}
                        rotate={!mCollapsed ? 90 : undefined}
                        onClick={() => {
                            setMCollapsed(!mCollapsed);
                        }
                        }
                    />] : [<RightOutlined
                        style={{ marginLeft: '6px' }}
                        rotate={!mCollapsed ? 90 : undefined}
                        onClick={() => {
                            setMCollapsed(!mCollapsed);
                        }
                        }
                    />]}
        >
            {props.children}
        </ProCard>
    );
}
export default ProCardCollapse;




