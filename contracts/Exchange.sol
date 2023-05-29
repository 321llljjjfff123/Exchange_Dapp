// SPDX-License-Identifier: GPL-3.0
// 源码遵循协议， MIT...
pragma solidity >=0.4.16 <0.9.0; //限定solidity编译器版本
import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";
import "./LToken.sol";

contract Exchange {
    // 存款事件
    event Deposit(address token, address user, uint256 amount, uint256 balance);
    // 取款事件
    event WithDraw(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );
    // 常见订单事件
    event Order(
        uint256 id, // 订单id
        address user, // 订单账号（用户的地址）
        address tokenGet, // 兑换的货币
        uint256 amountGet, // 兑换货币的数量
        address tokenGive, // 存入的货币
        uint256 amountGive, // 存入货币的数量
        uint256 timestamp // 时间戳
    );
    // 取消订单事件
    event Cancel(
        uint256 id, // 订单id
        address user, // 订单账号（用户的地址）
        address tokenGet, // 兑换的货币
        uint256 amountGet, // 兑换货币的数量
        address tokenGive, // 存入的货币
        uint256 amountGive, // 存入货币的数量
        uint256 timestamp // 时间戳
    );
    // 填充订单的事件
    event Trade(
        uint256 id, // 订单id
        address user, // 订单账号（用户的地址）
        address tokenGet, // 兑换的货币
        uint256 amountGet, // 兑换货币的数量
        address tokenGive, // 存入的货币
        uint256 amountGive, // 存入货币的数量
        uint256 timestamp // 时间戳
    );

    using SafeMath for uint256; //为了uint256后面使用 sub ,add方法，，

    //收费账户地址
    address public feeAccount;
    //费率
    uint256 public feePercent;
    // ETHER以太币对应的地址
    address constant ETHER = address(0);
    // mapping(以太币对应的地址 => mapping(用户地址 => 持有的数量))
    mapping(address => mapping(address => uint256)) public tokens;
    // 订单结构体
    struct _Order {
        uint256 id; // 订单id
        address user; // 订单账号（用户的地址）
        address tokenGet; // 存入的货币
        uint256 amountGet; // 存入货币的数量
        address tokenGive; // 兑换的货币
        uint256 amountGive; // 兑换货币的数量
        uint256 timestamp; // 时间戳
    }
    // 订单池
    mapping(uint256 => _Order) public orders;
    // 订单数
    uint256 public orderCount;
    // 如果取消订单，则标记此映射为true，默认为false
    mapping(uint256 => bool) public orderCancel;
    // 填充订单
    mapping(uint256 => bool) public orderTrade;

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    //存以太币
    function depositEther() public payable {
        //msg.sender
        //msg.value
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
    }

    //存其他货币
    function depositToken(address _token, uint256 _amount) public {
        require(_token != ETHER);

        // 调用对应代币的transferFrom方法完成转账
        require(
            LToken(_token).transferFrom(msg.sender, address(this), _amount)
        );

        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);

        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    // 取款
    // 提取以太币
    function withdrawEther(uint _amount) public {
        (tokens[ETHER][msg.sender] >= _amount);
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
        // payable
        payable(msg.sender).transfer(_amount);
        emit WithDraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
    }

    // 提取L
    function withdrawToken(address _token, uint256 _amount) public {
        require(_token != ETHER);
        require(tokens[_token][msg.sender] >= _amount);

        tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);
        require(LToken(_token).transfer(msg.sender, _amount));
        emit WithDraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    // 查询余额
    function balanceOf(
        address _token,
        address _user
    ) public view returns (uint256) {
        return tokens[_token][_user];
    }

    // makeOrder
    function makeOrder(
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) public {
        // 判断余额
        require(
            balanceOf(_tokenGive, msg.sender) >= _amountGive,
            unicode"创建订单时，余额不足！！！"
        );

        orderCount = orderCount.add(1);
        orders[orderCount] = _Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );

        // 发出订单
        emit Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
    }

    // cancelOrder
    function cancelOrder(uint256 _id) public {
        _Order memory myorder = orders[_id];
        require(myorder.id == _id);
        orderCancel[_id] = true;

        emit Cancel(
            myorder.id,
            msg.sender,
            myorder.tokenGet,
            myorder.amountGet,
            myorder.tokenGive,
            myorder.amountGive,
            block.timestamp
        );
    }

    // fillOrder
    function fillOrder(uint256 _id) public {
        _Order memory myorder = orders[_id];
        require(myorder.id == _id);

        // 交易 (货币转换 && 消费收取)
        /* 
            a       makeOrder
            100L => 1 ETH
            a 增加1ETH
            a 减少100L

            msg.sender     fillOrder
            msg.sender 增加100L
            msg.sender 减少1ETH
         */
        //计算小费（购买人支付）
        uint256 feeAmount = myorder.amountGet.mul(feePercent).div(100); // mul 乘 div 除

        require(
            balanceOf(myorder.tokenGive, myorder.user) >= myorder.amountGive,
            unicode"完成订单的用户余额不足"
        ); // 判断完成订单时，余额是否充足

        require(
            balanceOf(myorder.tokenGet, msg.sender) >=
                (myorder.amountGet.add(feeAmount)),
            unicode"填充订单的用户余额不足"
        ); // 判断填充订单时，余额是否充足

        orderTrade[_id] = true; //完成的订单为true

        // 例如：买方（msg.sender)需要1ETH,愿意支付100LToken（并负担小费），买方（订单创建者）需要100LToken，愿意支付1ETH，则执行以下过程
        tokens[myorder.tokenGet][msg.sender] = tokens[myorder.tokenGet][
            msg.sender
        ].sub(myorder.amountGet.add(feeAmount)); // 购买人减少对应货币的存款

        // 收取小费，转给部署交易所合约时传入的收费地址
        tokens[myorder.tokenGet][feeAccount] = tokens[myorder.tokenGet][
            feeAccount
        ].add(feeAmount);

        tokens[myorder.tokenGet][myorder.user] = tokens[myorder.tokenGet][
            myorder.user
        ].add(myorder.amountGet); // 创建订单的人增加对应货币的存款

        tokens[myorder.tokenGive][msg.sender] = tokens[myorder.tokenGive][
            msg.sender
        ].add(myorder.amountGive); // 购买人增加对应货币的存款

        tokens[myorder.tokenGive][myorder.user] = tokens[myorder.tokenGive][
            myorder.user
        ].sub(myorder.amountGive); // 创建订单的人减少对应货币的存款
        emit Trade(
            myorder.id,
            myorder.user, // 地址是创建订单的人的地址
            myorder.tokenGet,
            myorder.amountGet,
            myorder.tokenGive,
            myorder.amountGive,
            block.timestamp
        );
    }
}
