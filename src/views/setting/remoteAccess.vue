<template>
  <div class="remote-root">
    <div class="nas-account-root">
      <Divider>{{ $t("nascab.remoteAccessMenu") }}</Divider>
      <div class="list-root">
        <div class="item-root">
          <span class="item-text-left">{{ $t("nascab.remoteAccess") }}:</span>
          <vs-tooltip v-if="currentVipInfo && currentVipInfo.proxy_subdomain">
            <div v-if="currentVipInfo && currentVipInfo.proxy_subdomain"
              style="display: flex; flex-direction: row; align-items: center">
              <a @click="lanIpClick('https://')">https://{{ currentVipInfo.proxy_subdomain }}{{ currentVipInfo.proxyDomain
              }}</a>
            </div>
            <template #tooltip>
              {{ $t('nascab.pleaseOpenTwoStepsLogin') }}
            </template>
          </vs-tooltip>

          <!-- 去设置 -->
          <a v-else @click="toSetDomain()" style="margin-left: 10px">
            {{ $t("photo.goToSet") }}</a>
        </div>
        <!-- 插件状态-->
        <div class="item-root" v-if="currentVipInfo && currentVipInfo.proxy_subdomain">
          <span class="item-text-left" style="flex-shrink:0;">{{ $t("proxy.pluginState") }}:</span>
          <div class="link-state-root">
            <div style="margin-right:10px;text-align:left">
              <vs-tooltip v-if="currentVipInfo && currentVipInfo.proxy_subdomain">
                <span v-if="pluginExists" style="flex-shrink:0;text-align:left" class="icon-main-color">{{
                  $t("proxy.installed")
                }}</span>
                <span v-else style="color: red;flex-shrink:0;max-width: 600px;text-align:left">{{
                  $t("proxy.uninstalled")
                }}</span>
                <template #tooltip>
                 <p style="word-break: break-all;"> {{ $t('proxy.pluginPath') }}:{{ pluginPath }}</p>
                </template>
              </vs-tooltip>
            </div>
            <div style="display:flex;align-items:center" >
              <!-- 安装插件 -->
              <vs-tooltip v-if="currentVipInfo && currentVipInfo.proxy_subdomain">
                <vs-button v-if="!pluginExists" flat border @click="installFrpc()"
                  style="height: 25px;line-height:25px;flex-shrink:0;min-width:60px">
                  {{ $t('proxy.installPlugin') }}</vs-button>
                <template #tooltip>
                  {{ $t('proxy.firewallAlert') }}
                </template>
              </vs-tooltip>
            </div>
          </div>
        </div>
        <!-- 连接状态 存在vip信息时才显示-->
        <div class="item-root" v-if="currentVipInfo && currentVipInfo.proxy_subdomain && pluginExists && remoteEnable">
          <span class="item-text-left" style="flex-shrink:0;">{{ $t("nascab.connectState") }}:</span>
          <div class="link-state-root">
            <div style="margin-right:10px;text-align:left">
              <span v-if="proxyState && proxyState.status == 'success'" style="flex-shrink:0;text-align:left"
                class="icon-main-color">{{
                  $t("nascab.online")
                }}</span>
              <span v-else-if="proxyState && proxyState.error"
                style="color: red;flex-shrink:0;max-width: 600px;text-align:left">{{
                  proxyState.error
                }}</span>
            </div>
            <div style="display:flex;align-items:center" v-if="remoteEnable">
              <!-- 刷新 -->
              <vs-tooltip v-if="currentVipInfo && currentVipInfo.proxy_subdomain && pluginExists">
                <vs-button flat border @click="getNasAccountInfo()"
                  style="height: 25px;line-height:25px;flex-shrink:0;min-width:60px">
                  {{ $t('common.refresh') }}</vs-button>
                <template #tooltip>
                  {{ $t('nascab.sameAccountLogin') }}
                </template>
              </vs-tooltip>
              <!-- 重新连接 -->
              <vs-tooltip v-if="currentVipInfo && currentVipInfo.proxy_subdomain && pluginExists">
                <vs-button flat border @click="reconnect()"
                  style="height: 25px;line-height:25px;flex-shrink:0;min-width:60px;">{{
                    $t("reconnect")
                  }}</vs-button>
                <template #tooltip>
                  {{ $t('nascab.proxyDelay') }}
                </template>
              </vs-tooltip>
            </div>
          </div>
        </div>
        <!-- 连接线路-->
        <div class="item-root"
          v-if="currentVipInfo && currentVipInfo.proxy_subdomain && pluginExists && proxyServerList && proxyServerList.length > 0 && selectedServer && remoteEnable">
          <span class="item-text-left" style="flex-shrink:0;">{{ $t("nascab.connectLine") }}:</span>
          <div class="link-state-root">
            <div style="margin-right:10px;text-align:left">
              <span style="flex-shrink:0;max-width: 600px;text-align:left">{{
                selectedServer.show_name
              }} ({{ selectedServer.ping_time }} ms)</span>
            </div>
            <div style="display:flex;align-items:center" v-if="remoteEnable">
              <!-- 选择连接线路 -->
              <vs-button flat border @click="showSwitchRoute = true" class="switch-btn">
                {{ $t('switch') }}</vs-button>
            </div>
          </div>
        </div>
        <!-- 启用开关 -->
        <div class="item-root" v-if="currentVipInfo && currentVipInfo.proxy_subdomain && pluginExists">
          <span class="item-text-left">{{ $t("nascab.isEnable") }}:</span>
          <i-switch v-model="remoteEnable" @on-change="remoteEnableSwitch" />
        </div>
        <div style="color:#999"> {{ $t("proxy.cannotLoginMulti") }}</div>

        <Divider>{{  $t("common.faq") }}</Divider>
        <!-- 常见问题 -->
        <div class="faqItem">{{ $t("proxy.faqContent1") }}</div>
        <div class="faqItem">{{ $t("proxy.faqContent2") }}</div>
        <div class="faqItem">{{ $t("proxy.faqContent3") }}</div>
        <div class="faqItem">{{ $t("proxy.faqContent4") }}</div>
        <div class="faqItem">{{ $t("proxy.faqContent5") }}</div>
      </div>

      <vs-dialog overflow-hidden full-screen v-model="showIframeDialog">
        <iframe v-if="showIframeDialog" scrolling="auto" :src="loadUrl" class="iframe"></iframe>
      </vs-dialog>

      <!-- 切换线路对话框 -->
      <vs-dialog scroll v-model="showSwitchRoute">
        <template #header>
          <h4 class="not-margin">
            {{ $t('proxy.routeList') }}
          </h4>
        </template>
        <div v-if="proxyServerList && showSwitchRoute && serverObj.alive" v-for="(serverObj, index) in proxyServerList" >
          <div class="server-root">
            <p>{{ serverObj.show_name }} ({{ serverObj.ping_time }}ms)</p>
            <vs-button v-if="selectedServer._id == serverObj._id" flat border disabled class="switch-btn">
              {{ $t('proxy.currentRoute') }}
            </vs-button>
            <vs-button v-if="selectedServer._id != serverObj._id" flat border @click="doSwitchRoute(serverObj)"
              class="switch-btn">
              {{ $t('switch') }}
            </vs-button>
          </div>
        </div>
      </vs-dialog>
    </div>
  </div>
</template>

<script>
import MyBtn from "../../components/my-components/my-btn/my-btn.vue";
import Divider from "../../plugins/myViewDesign/components/divider/divider.vue";
import axios from '../../plugins/axios'
// let baseUrl = "http://localhost:8080/#/"
let baseUrl = axios.nasCabBaseUrl + "/userCenter/#/"
if (process.env.NODE_ENV !== "development") {
  baseUrl = axios.nasCabBaseUrl + "/userCenter/#/"
}
let loginUrl = baseUrl + "?iframeMode=1";
let setDomainUrl = baseUrl + "pages/proxy/proxy?iframeMode=1&isProxyDomain=1";
let articleUrl = baseUrl + "pages/article/article";
export default {
  data() {
    return {
      showSwitchRoute: false,
      pluginPath: "",//frpc安装路径
      pluginExists: true,//frpc是否安装
      remoteEnable: true,
      loadUrl: loginUrl, //iframe加载的url
      showIframeDialog: false,
      userToken: "",
      currentNasUserInfo: "",
      currentVipInfo: "",
      proxyState: "",
      timer: null,
      proxyServerList: [],
      selectedServer: null
    };
  },
  mounted() {
    window.addEventListener("message", this.dealIframeMessage);
    this.getNasAccountInfo();
    this.getProxyState()
    this.timer = setInterval(() => {
      console.log('getProxyState')
      this.getProxyState()
    }, 5000);
  },
  beforeDestroy() {
    window.removeEventListener("message", this.dealIframeMessage);
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    doSwitchRoute(server) {
      console.log(server)
      this.showVsConfirmDialog(this.$t('common.confirm'), this.$t(
          'proxy.switchAlert'), () => {
            this.switchServer(server)
          }, () => {
          })
    },
    //切换代理服务线路
    switchServer(server) {
      this.reconnect(server._id)
    },
    remoteEnableSwitch(enable) {
      console.log('enable', enable)
      if (enable) {
        this.showVsConfirmDialog(this.$t('common.confirm'), this.$t(
          'nascab.sureEnableRemote'), () => {
            this.switchApi(1)
          }, () => {
            this.remoteEnable = false
          })
      } else {
        this.showVsConfirmDialog(this.$t('common.confirm'), this.$t(
          'nascab.sureDisableRemote'), () => {
            this.switchApi(0)
          }, () => {
            this.remoteEnable = true
          })
      }
    },
    switchApi(nasRemoteEnable) {
      this.api
        .post("/api/nasAccountApi/setRemoteEnable", {
          nasRemoteEnable: nasRemoteEnable
        })
        .then((res) => {
          if (!res.code) {
            this.showVsNotification(this.$t('common.operationSuccess'));
          } else {
            this.showVsNotification(this.$t('common.operationFail'));
          }
        })
    },
    installFrpc() {
      let alertContent = this.$t('proxy.firewallAlert') + "," + this.$t('proxy.frpcGithub')
      this.showVsConfirmDialog(this.$t('common.confirm'), alertContent, () => {
        this.api
          .post("/api/nasAccountApi/downloadFrpc", {
          })
          .then((res) => {
            if (!res.code) {
              this.showVsNotification(this.$t('proxy.installMsgSent'));
            }
          })
      }, null, this.$t("proxy.downloadFrp"))
    },
    showArticle() {
      console.log('showArticle')
      let articleName = this.$t('nascab.customExample')
      console.log('showArticle', articleName)
      this.loadUrl = articleUrl + "?title=" + articleName
      this.showIframeDialog = true;
    },
    goPath(path) {
      this.$router.push({
        path: path
      })
    },
    lanIpClick(protocal) {
      let clip = navigator.clipboard
      if (clip) {
        clip.writeText(protocal + this.currentVipInfo.proxy_subdomain + this.currentVipInfo.proxyDomain)
        this.showVsNotification(this.$t('system.copied'))
      }
    },
    reconnect(serverId) {
      //尝试重连
      this.api
        .post("/api/nasAccountApi/reconnectRemote", {serverId})
        .then((res) => {
          this.showVsAlertDialog(this.$t('common.alert'), this.$t('nascab.reconnectSent'), () => { })
        })
        .catch((error) => {
        });
    },


    getProxyState() {
      this.api
        .post("/api/nasAccountApi/getProxyState", { hideLoading: true })
        .then((res) => {
          if (!res.code) {
            this.proxyState = res.proxyState;
            this.pluginExists = res.pluginExists
            this.pluginPath = res.pluginPath
            if (res.proxyServerList) {
              this.proxyServerList = JSON.parse(res.proxyServerList)
              if (this.proxyServerList) {
                for (let ser of this.proxyServerList) {
                  if (ser.selected) {
                    this.selectedServer = ser
                    break
                  }
                }
              }
            }
          }
        })
        .catch((error) => {
        });
    },
    toSetDomain() {
      if (!this.currentVipInfo) {
        return this.showVsAlertDialog(
          this.$t("common.alert"),
          this.$t("nascab.needUpgrade"),
          () => {
            this.$emit("onToLogin");
          }
        );
      }
      if (!this.currentNasUserInfo) {
        return this.showVsAlertDialog(
          this.$t("common.alert"),
          this.$t("nascab.loginFirst"),
          () => {
            this.$emit("onToLogin");
          }
        );
      }
      this.loadUrl = setDomainUrl + "&token=" + this.userToken;
      if (this.$store.state.language) {
        this.loadUrl += "&language=" + this.$store.state.language;
      }
      this.showIframeDialog = true;
    },

    dealIframeMessage(e) {
      if (e.data && e.data.type == "setSubdomainDone") {
        //设置子域名完成的通知
        this.showIframeDialog = false;
        this.tokenLogin();
      }
    },
    tokenLogin() {
      this.api
        .post("/api/nasAccountApi/nasCabLoginByToken", {
          token: this.userToken,
        })
        .then((res) => {
          if (!res.code) {
            console.log("token登录成功了");
            this.showVsNotification(this.$t("login.success"));
          }
          this.getNasAccountInfo();
        })
        .catch((error) => {
          this.getNasAccountInfo();

          console.log(error);
        });
    },
    //获取缓存的用户登录信息
    getNasAccountInfo() {
      this.api
        .post("/api/nasAccountApi/getNasAccountInfo", { hideLoading: false })
        .then((res) => {
          if (!res.code) {
            this.currentNasUserInfo = res.data.userInfo;
            this.currentVipInfo = res.data.vipInfo;
            if (
              this.currentNasUserInfo &&
              this.currentNasUserInfo.token &&
              this.currentNasUserInfo.token.length > 0
            ) {
              this.userToken = this.currentNasUserInfo.token[
                this.currentNasUserInfo.token.length - 1
              ];
            }
            this.proxyState = res.proxyState;
            console.log('res.remoteEnable', res.nasRemoteEnable)
            this.remoteEnable = res.nasRemoteEnable && parseInt(res.nasRemoteEnable) == 1
            console.log('this.remoteEnable', this.remoteEnable)
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
  components: { MyBtn, Divider },
};
</script>

<style lang="scss" scoped>
::v-deep .vs-input-parent {
  width: 100%;
}

::v-deep .vs-input {
  width: 100%;
}

.iframe {
  width: 100%;
  height: calc(100vh - 50px);
  border: none
}

.remote-root {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.faqItem{
  text-align: left;
  margin-top: 10px;
}
.save-root {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 50px;

}

.link-state-root {
  @media not all and (max-width:640px) {
    display: flex;
    align-items: center;
  }
}

.nas-account-root {
  padding: 15px;

  @media not all and (max-width:640px) {
    padding: 30px;
  }

  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  background-color: white;
  width: 100%;
  overflow: auto;
  height: 100%;

}

.list-root {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
}

.item-root {
  display: flex;
  align-items: center;
  margin-bottom: 30px;


}

.server-root {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.item-text-left {
  margin-right: 10px;
}

.switch-btn {
  height: 25px;
  line-height: 25px;
  flex-shrink: 0;
  min-width: 60px;
  margin-left: 10px;
}
</style>
