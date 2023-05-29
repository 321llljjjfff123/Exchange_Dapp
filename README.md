# Exchange_Dapp
简易版的交易所Dqpp，待完善发送，提款，存款
openzeppelin-solidity下的math，只能使用旧版本，新版本会有问题，一：路径问题，二：函数方法不对
此应用采用，React


运行：
一：npm i 或 yarn start

二：启动ganache-cli 建议加上-d，加上后以后再次运行ganache-cli -d，在钱包（例如metamask）不需要重新导入密钥

三：部署合约 truffle -migrate --reset

四： npm start 运行项目

五（可选）：运行测试脚本 truffle exec .\scripts\下的测试脚本
