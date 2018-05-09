import React, { Component } from 'react';
import { Button, Collapse, Modal, Input, notification, Select } from 'antd';
import ActionButton from './components/ActionButton';
import {
  getBottleCount,
  throwBottle,
  getBottle,
  pickBottle,
  getMyBottle,
} from './request';
import BG_IMG from './assets/ocean.jpg';
const Panel = Collapse.Panel;
const Option = Select.Option;

class App extends Component {
  state = {
    error: null,
    bottleCount: 0,
    myBottles: [],
    bottle: {
      message: '',
      hash: '',
    },
    getBottleVisible: false,
    noWidget: false,
    throwBottleModal: false,
    account: '',
    myMessage: '',
    network: 'mainnet'
  }

  async componentDidMount() {
    window.addEventListener('message', this.getMessage)

    try {

      setTimeout(() => {
        if (!window.webExtensionWallet) {
          this.setState({ noWidget: true })
        }
      }, 5000)

      window.postMessage({
          "target": "contentscript",
          "data":{},
          "method": "getAccount",
      }, "*");

      const bottleCount = await getBottleCount(this.state.network);
      this.setState({ bottleCount: parseInt(bottleCount, 10) });
    } catch (error) {
      notification.error({
        message: '网络异常，请检查钱包是不是在' + this.state.network,
        description: error
      })
      this.setState({ error });
    }
  }

  getMessage = e => {
    if(e.data && e.data.data && e.data.data.account){
      this.setState({ account: e.data.data.account })
    }
  }

  getBottleCount = async () => {
    try {
      const bottleCount = await getBottleCount(this.state.network);
      this.setState({ bottleCount });
    } catch (error) {
      notification.error({
        message: '网络异常，请检查钱包是不是在' + this.state.network,
        description: error
      })
      this.setState({ error });
    }
  }

  throwBottle = async () => {
    try {
      const { myMessage } = this.state;
      const res = await throwBottle(this.state.network, myMessage);
      console.log(res);
      this.setState({ myMessage: '', throwBottleModal: false });
      notification.success({
        message: '瓶子成功丢进大海～',
        description: '区块链上的人都有可能捡到它哦！'
      });
      setTimeout(() => {
        this.getBottleCount(this.state.network);
      }, 10000)
      setTimeout(() => {
        this.getBottleCount(this.state.network);
      }, 10000)
    } catch (error) {
      notification.error({
        message: '网络异常，请检查钱包是不是在' + this.state.network,
        description: error
      })
      this.setState({ error });
    }
  }

  getBottle = async () => {
    try {
      const result = await getBottle(this.state.network);
      this.setState({ bottle: result, getBottleVisible: true });
    } catch (error) {
      notification.error({
        message: '网络异常，请检查钱包是不是在' + this.state.network,
        description: error
      })
      this.setState({ error });
    }
  }

  getMyBottle = async () => {
    if (this.state.account === '') {
      notification.error({
        message: '请Unlock浏览器插件账户并刷新页面～',
        description: ''
      })
      return
    }

    try {
      const result = await getMyBottle(this.state.account);
      this.setState({ myBottles: result, showHistoryModal: true });
    } catch (error) {
      notification.error({
        message: '网络异常，请检查钱包是不是在' + this.state.network,
        description: error
      })
      this.setState({ error });
    }
  }

  pickBottle = async () => {
    const { hash } = this.state.bottle;
    try {
      await pickBottle(this.state.network, hash);
      notification.success({
        message: '你捡到一个瓶子～'
      });
      this.hideBottleModal();
      setTimeout(() => {
        this.getBottleCount(this.state.network);
      }, 10000)
    } catch (error) {
      notification.error({
        message: '网络异常，请检查钱包是不是在' + this.state.network,
        description: error
      })
      this.setState({ error });
    }
  }

  onThrow = () => {
    this.setState({ throwBottleModal: true })
  }

  onBottleMessageChange = e => {
    this.setState({
      myMessage: e.target.value
    });
  }

  hideBottleModal = () => {
    this.setState({ getBottleVisible: false });
  }

  hideNoWidgetModal = () => {
    this.setState({ noWidget: false })
  }

  hideHistoryModal = () => {
    this.setState({ showHistoryModal: false })
  }

  hideThrowBottleModal = () => {
    this.setState({ throwBottleModal: false })
  }

  onNetworkChange = network => {
    this.setState({ network }, () => {
      this.getBottleCount()
    });
  }

  render() {
    return (
      <div className="App" style={{ backgroundImage: BG_IMG }}>

        <div className="bottle_count">
          <div className="title">区块链漂流瓶 - Nebulas Dapp</div>
          <div className="subtitle">{`大海中的瓶子数量：${this.state.bottleCount}`}</div>
        </div>

        <div className="network">
          <Select defaultValue="mainnet" style={{ width: 120 }} onChange={this.onNetworkChange}>
            <Option value="mainnet">mainnet</Option>
            <Option value="testnet">testnet</Option>
          </Select>
        </div>

        <div className="actions">
          <ActionButton text={'捡一个'} onClick={this.getBottle} />
          <ActionButton text={'扔一个'} onClick={this.onThrow} />
          <ActionButton text={'捡到的瓶子'} onClick={this.getMyBottle} />
        </div>


        <Modal
          visible={this.state.showHistoryModal}
          onCancel={this.hideHistoryModal}
          title={'我捡到的瓶子'}
          footer={[
            <Button key="back" onClick={this.hideHistoryModal}>确定</Button>
          ]}
        >
          {
            this.state.myBottles.length > 0
              ?<Collapse accordion>
                {
                  this.state.myBottles.map((item, index) => (
                    <Panel header={`from: ${item.owner}`} key={index}>
                      <p>{item.message}</p>
                    </Panel>
                  ))
                }
              </Collapse>
            : <p>还没有捡起瓶子哦～</p>
          }
        </Modal>

        <Modal
          title={'安装插件'}
          visible={this.state.noWidget}
          onCancel={this.hideNoWidgetModal}
          footer={[
            <Button key="back" onClick={this.hideNoWidgetModal}>取消</Button>
          ]}
        >
          <div>
            你还没有安装 NAS Chrome 插件。
            请点击<a href={'https://github.com/ChengOrangeJu/WebExtensionWallet'}>https://github.com/ChengOrangeJu/WebExtensionWallet</a>安装
          </div>
        </Modal>

        <Modal
          visible={this.state.getBottleVisible}
          onCancel={this.hideBottleModal}
          title={`来自${this.state.bottle.owner}的漂流瓶`}
          footer={[
            <Button key="back" onClick={this.hideBottleModal}>丢回海中</Button>,
            <Button key="submit" type="primary" onClick={this.pickBottle}>
              捞起来
            </Button>
          ]}
        >
          <div className='bottle_content'>
            {this.state.bottle.message}
          </div>
        </Modal>

        <Modal
          visible={this.state.throwBottleModal}
          onCancel={this.hideThrowBottleModal}
          title={'扔一个瓶子'}
          footer={[
            <Button key="back" onClick={this.hideThrowBottleModal}>取消</Button>,
            <Button key="submit" type="primary" onClick={this.throwBottle}>
              扔入海中
            </Button>
          ]}
        >
          <Input placeholder="区块链漂流瓶" onChange={this.onBottleMessageChange} />
        </Modal>
      </div>
    );
  }
}

export default App;
