import React from 'react'
import { useSelector } from 'react-redux'
// import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons'
import { Card, Col, Row, Statistic } from 'antd'

function convert (n) {
  // windows.web
  if (!window.web) return ""
  return window.web.web3.utils.fromWei(n, "ether")
}

export default function Balance () {
  const { TokenWallet, TokenExchange, EtherWallet, EtherExchange } = useSelector(state => state.balance)
  return (
    <div>
      <Row >
        <Col span={6}>
          <Card bordered={false} hoverable={true}>
            <Statistic
              title="钱包中以太币："
              value={convert(EtherWallet)}
              precision={3}
              valueStyle={{ color: '#3f8600' }}
            /* prefix={<ArrowUpOutlined />}
            suffix="%" */
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} hoverable={true}>
            <Statistic
              title="钱包中LT："
              value={convert(TokenWallet)}
              precision={3}
              valueStyle={{ color: '#1677ff' }}
            /* prefix={<ArrowUpOutlined />}
            suffix="%" */
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} hoverable={true}>
            <Statistic
              title="交易所中以太币："
              value={convert(EtherExchange)}
              precision={3}
              valueStyle={{ color: '#faad14' }}
            /* prefix={<ArrowUpOutlined />}
            suffix="%" */
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} hoverable={true}>
            <Statistic
              title="交易所中LT："
              value={convert(TokenExchange)}
              precision={3}
              valueStyle={{ color: '#cf1332' }}
            /* prefix={<ArrowUpOutlined />}
            suffix="%" */
            />
          </Card>
        </Col>
      </Row>
      {/* <h3>钱包中以太币：{convert(EtherWallet)}</h3>
      <h3>钱包中LT：{convert(TokenWallet)}</h3>
      <h3>交易所中以太币：{convert(EtherExchange)}</h3>
      <h3>交易所中LT：{convert(TokenExchange)}</h3> */}
    </div>
  )
}
