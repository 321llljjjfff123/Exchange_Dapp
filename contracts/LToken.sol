//SPDX-License-Identifier: MIT
import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";
pragma solidity ^0.8.3;

contract LToken {
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    using SafeMath for uint256; //为了uint256后面使用 sub, add...等方法

    string public name = "lToken";
    string public symbol = "L";

    // 精度
    uint256 public decimals = 18;

    // token发行总量
    uint256 public totalSupple;

    // 自动生成getter方法

    // mapping
    mapping(address => uint256) public balanceOf;

    mapping(address => mapping(address => uint256)) public allowance;

    constructor() {
        totalSupple = 1000000 * (10 ** decimals);
        // 部署账号
        balanceOf[msg.sender] = totalSupple;
    }

    function transfer(
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(_to != address(0));
        _tranfer(msg.sender, _to, _value);
        return true;
    }

    function _tranfer(address _from, address _to, uint256 _value) internal {
        require(balanceOf[_from] >= _value, "not sufficient funds");
        // 完成交易
        balanceOf[_from] = balanceOf[_from].sub(_value); // 使用安全函数
        balanceOf[_to] = balanceOf[_to].add(_value);

        emit Transfer(_from, _to, _value);
    }

    function approve(
        address _spender,
        uint256 _value
    ) public returns (bool success) {
        // msg.sender 当前网页登陆的账号
        // _spender 第三方的交易所账号地址
        // _value 授权的钱数
        require(_spender != address(0));
        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    //被授权的交易所调用
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        //_from 某个放款账号
        //_to   收款账户
        //msg.sender 交易所账户地址
        require(balanceOf[_from] >= _value);
        require(allowance[_from][msg.sender] >= _value);

        allowance[_from][msg.sender] = allowance[_from][msg.sender].sub(_value);
        _tranfer(_from, _to, _value);
        return true;
    }
}
