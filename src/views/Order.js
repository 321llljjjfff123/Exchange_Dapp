import React from 'react'
import { Row, Col, Card, Table, Button } from 'antd'
import { useSelector } from 'react-redux'
import moment from 'moment/moment'

function converTime (t) { // 要乘以1000
  return moment(t * 1000).format("YYYY/MM/DD")
}

function convert (n) {
  // windows.web
  if (!window.web || !n) return "" // 因为刚传入可能是undefined，所以判断一下
  return window.web.web3.utils.fromWei(n, "ether")
}

function getRenderOrder (order, type) {
  if (!window.web) return []
  const account = window.web.account

  // 1. 排除已经完成， 以及取消订单
  let filterIds = [...order.CancelOrders, ...order.FillOrders].map(item => item.id) // 获取取消的订单和完成的订单的id
  // console.log(filterIds)

  // 正在交易的订单
  let pendingOrders = order.AllOrders.filter(item => !filterIds.includes(item.id)) // 过滤掉这些id

  // console.log(pendingOrders)

  if (type === 1) { // 当前账户的订单
    return pendingOrders.filter(item => item.user === account)
  } else { // 其他账户的订单
    return pendingOrders.filter(item => item.user !== account)

  }
  // 2. account
}

export default function Order () {
  const order = useSelector(state => state.order)

  console.log(order)

  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      render: (timestamp) => <div>{converTime(timestamp)}</div>
    },
    {
      title: 'LT',
      dataIndex: 'amountGet',
      render: (amountGet) => <b>{convert(amountGet)}</b>
    },
    {
      title: 'ETH',
      dataIndex: 'amountGive',
      render: (amountGive) => <b>{amountGive && convert(amountGive)}</b> // 第二种方法，在这里判断是否为undefined
    },
  ]

  const columns1 = [
    ...columns,
    {
      title: '操作', // 不设置dataIndex，item拿到的是完整的对象
      render: (item) => <Button type="primary" onClick={() => {
        const { exchange, account } = window.web
        exchange.methods.cancelOrder(item.id).send({ from: account }) // send()是因为会改变区块链的状态，需要gas
      }}>取消</Button>
    },
  ]

  const columns2 = [
    ...columns,
    {
      title: '操作', // 不设置dataIndex，item拿到的是完整的对象
      render: (item) => <Button danger type="primary" onClick={() => {
        const { exchange, account } = window.web
        exchange.methods.fillOrder(item.id).send({ from: account })
      }}>买入</Button>
    },
  ]

  return (
    <div>
      <div style={{ marginTop: "10px" }}>
        <Row>
          <Col span={8}>
            <Card title="已完成交易" bordered={false} style={{ margin: 10 }} hoverable={true}>
              <Table dataSource={order.FillOrders} columns={columns} rowKey={item => item.id} />

            </Card>
          </Col>
          <Col span={8}>
            <Card title="交易中-我创建的订单" bordered={false} style={{ margin: 10 }} hoverable={true}>
              <Table dataSource={getRenderOrder(order, 1)} columns={columns1} rowKey={item => item.id} />
            </Card>
          </Col>
          <Col span={8}>
            <Card title="交易中-其他人的订单" bordered={false} style={{ margin: 10 }} hoverable={true}>
              <Table dataSource={getRenderOrder(order, 2)} columns={columns2} rowKey={item => item.id} />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

