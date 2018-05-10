import React, { Component } from 'react';
import { Button, Collapse, Modal, Input, notification, Select } from 'antd';
import ActionButton from './components/ActionButton';
import ButtonContainer from './components/ButtonContainer';
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
// const BOTTLE = require('./assets/bottle.png');

const isIOS = () => {
  if (typeof window === 'undefined' || !window.navigator.userAgent) {
    return false;
  }
  return /(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent);
};

const isAndroid = () => {
  if (typeof window === 'undefined' || !window.navigator.userAgent) {
    return false;
  }
  return /(Android)/i.test(navigator.userAgent);
};


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
    network: 'mainnet',
    loading: false,
  }

  async componentDidMount() {
    window.addEventListener('message', this.getMessage)

    try {
      setTimeout(() => {
        if (!window.webExtensionWallet) {
          this.setState({ noWidget: true })
        }
      }, 10000)

      window.postMessage({
          "target": "contentscript",
          "data":{},
          "method": "getAccount",
      }, "*");

      const bottleCount = await getBottleCount(this.state.network);
      this.setState({ bottleCount: parseInt(bottleCount, 10) });
    } catch (error) {
      notification.error({
        message: '网络异常，请检查钱包以及是不是在' + this.state.network,
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
      if (!myMessage || myMessage === '') {
        notification.error({
          message: '说点什么？'
        });
        return
      }

      if (isIOS() || isAndroid()) {
        notification.error({
          message: '请用桌面Chrome安装星云链插件使用',
        })
        return;
      }

      if (!window.webExtensionWallet) {
        notification.error({
          message: '请安装浏览器插件并刷新页面～',
          description: 'https://github.com/ChengOrangeJu/WebExtensionWallet'
        })
        return
      }

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
      }, 20000)
      setTimeout(() => {
        this.getBottleCount(this.state.network);
      }, 30000)
    } catch (error) {
      notification.error({
        message: '失败啦～',
        description: error
      })
      this.setState({ error });
    }
  }

  getBottle = () => {
    try {
      this.setState({ getBottleVisible: true, loading: true }, async () => {
        const result = await getBottle(this.state.network);
        this.setState({ bottle: result, loading: false });
      })
    } catch (error) {
      notification.error({
        message: '网络异常，请检查钱包是不是在' + this.state.network,
        description: error
      })
      this.setState({ error, loading: false, getBottleVisible: false });
    }
  }

  getMyBottle = () => {
    if (this.state.account === '') {
      if (!window.webExtensionWallet) {
        notification.error({
          message: '请安装浏览器插件并刷新页面～',
          description: 'https://github.com/ChengOrangeJu/WebExtensionWallet'
        })
        return
      }
      notification.error({
        message: '请Unlock浏览器插件账户并刷新页面～',
        description: ''
      })
      return
    }

    try {
      this.setState({ showHistoryModal: true, loading: true }, async () => {
        const result = await getMyBottle(this.state.network, this.state.account);
        this.setState({ myBottles: result, loading: false });
      })
    } catch (error) {
      notification.error({
        message: '网络异常，请检查钱包是不是在' + this.state.network,
        description: error
      })
      this.setState({ error, loading: false, showHistoryModal: false });
    }
  }

  pickBottle = async () => {
    const { hash } = this.state.bottle;
    try {
      if (isIOS() || isAndroid()) {
        notification.error({
          message: '请用桌面Chrome安装星云链插件使用',
        })
        return;
      }

      await pickBottle(this.state.network, hash);
      notification.success({
        message: '成功啦～',
        description: '你捡到一个瓶子，请等待链上确认'
      });
      this.hideBottleModal();
      setTimeout(() => {
        this.getBottleCount(this.state.network);
      }, 10000)
      setTimeout(() => {
        this.getBottleCount(this.state.network);
      }, 20000)
      setTimeout(() => {
        this.getBottleCount(this.state.network);
      }, 30000)
    } catch (error) {
      notification.error({
        message: '失败啦～',
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
        <div className="bottle_count_filter">
          <div className="title">星云链漂流瓶 - Nebulas Bottle</div>
          <div className="subtitle">{`大海中的瓶子数量：${this.state.bottleCount}`}</div>
        </div>

        <div className="bottle_count">
          <div className="title">星云链漂流瓶 - Nebulas Bottle</div>
          <div className="subtitle">{`大海中的瓶子数量：${this.state.bottleCount}`}</div>
        </div>

        <div className="network">
          <Select defaultValue="mainnet" style={{ width: 150 }} onChange={this.onNetworkChange}>
            <Option value="mainnet">主网</Option>
            <Option value="testnet">测试网</Option>
          </Select>
        </div>

        <ButtonContainer>
          <ActionButton
            style={{
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              borderRight: '1px solid rgba(255,255,255,0.1)'
            }}
            text={'捡一个'}
            onClick={this.getBottle}
          />
          <ActionButton
            text={'扔一个'}
            onClick={this.onThrow}
          />
          <ActionButton
            style={{
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              borderRight: '1px solid rgba(255,255,255,0.1)'
            }}
            text={'捡到的瓶子'}
            onClick={this.getMyBottle}
          />
        </ButtonContainer>


        <Modal
          visible={this.state.showHistoryModal}
          onCancel={this.hideHistoryModal}
          title={this.state.loading ? '加载中...' : '我捡到的瓶子'}
          footer={[
            <Button key="back" onClick={this.hideHistoryModal}>确定</Button>
          ]}
        >
          {
            this.state.loading
            ?  <p></p>
            :  this.state.myBottles.length > 0
                ? <Collapse accordion>
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
            <p>
              你还没有安装 NAS Chrome 插件，还不能扔瓶子或者捡瓶子哦～
            </p>
            <p>
              请点击<a href={'https://github.com/ChengOrangeJu/WebExtensionWallet'}>https://github.com/ChengOrangeJu/WebExtensionWallet</a>安装
            </p>
          </div>
        </Modal>

        <Modal
          visible={this.state.getBottleVisible}
          onCancel={this.hideBottleModal}
          title={this.state.loading ? '加载中...' : `来自${this.state.bottle.owner}的漂流瓶`}
          footer={[
            <Button key="back" onClick={this.hideBottleModal}>丢回海中</Button>,
            <Button key="submit" type="primary" onClick={this.pickBottle}>
              捞起来
            </Button>
          ]}
        >
          {
            this.state.loading
            ? <p></p>
            : <div className='bottle_content'>
                {this.state.bottle.message}
              </div>
          }
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
          <Input placeholder="星云链漂流瓶" onChange={this.onBottleMessageChange} />
        </Modal>
      </div>
    );
  }
}

export default App;
