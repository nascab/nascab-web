<template>
  <div class="remote-root">
    <div class="nas-account-root">
      <Divider>{{ $t("nascab.remoteAccessMenu") }}</Divider>
      <div class="list-root">
        <div class="item-root">
          <span class="item-text-left">{{ $t("nascab.remoteAccess") }}:</span>
          <vs-tooltip v-if="currentVipInfo && currentVipInfo.subdomain">
            <!-- <div v-if="currentVipInfo && currentVipInfo.subdomain"
              style="display: flex; flex-direction: row; align-items: center">
              <a @click="lanIpClick('http://')">http://{{ currentVipInfo.subdomain }}{{ currentVipInfo.proxyDomain }}</a>
            </div> -->
            <div v-if="currentVipInfo && currentVipInfo.subdomain"
              style="display: flex; flex-direction: row; align-items: center">
              <a @click="lanIpClick('https://')">https://{{ currentVipInfo.subdomain }}{{ currentVipInfo.proxyDomain }}</a>
            </div>
            <template #tooltip>
              {{ $t('nascab.pleaseOpenTwoStepsLogin') }}
            </template>
          </vs-tooltip>

          <!-- 去设置 -->
          <a v-else @click="toSetDomain()" style="margin-left: 10px">
            {{ $t("photo.goToSet") }}</a>
        </div>
        <!-- 连接状态 存在vip信息时才显示-->
        <div class="item-root" v-if="currentVipInfo && currentVipInfo.subdomain">
          <span class="item-text-left" style="flex-shrink:0;">{{ $t("nascab.connectState") }}:</span>
          <div class="link-state-root">
            <div style="margin-right:10px;text-align:left">
              <span v-if="proxyState && proxyState.status == 'success'" style="flex-shrink:0;text-align:left"
                class="icon-main-color">{{
                    $t("nascab.online")
                }}</span>
              <span v-else style="color: red;flex-shrink:0;max-width: 600px;text-align:left">{{
                    proxyState.error
                }}</span>
            </div>
            <div style="display:flex;align-items:center" v-if="remoteEnable">
              <!-- 刷新 -->
              <vs-tooltip v-if="currentVipInfo && currentVipInfo.subdomain">
                <vs-button flat border @click="getNasAccountInfo()"
                  style="height: 25px;line-height:25px;flex-shrink:0;min-width:60px">
                  {{ $t('common.refresh') }}</vs-button>
                <template #tooltip>
                  {{ $t('nascab.sameAccountLogin') }}
                </template>
              </vs-tooltip>
              <!-- 重新连接 -->
              <vs-tooltip v-if="currentVipInfo && currentVipInfo.subdomain">
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
        <!-- 启用开关 -->
        <div class="item-root" v-if="currentVipInfo && currentVipInfo.subdomain">
          <span class="item-text-left">{{ $t("nascab.isEnable") }}:</span>
          <i-switch v-model="remoteEnable" @on-change="remoteEnableSwitch" />
        </div>
      </div>
    
      <vs-dialog overflow-hidden full-screen v-model="showIframeDialog">
        <iframe v-if="showIframeDialog" scrolling="auto" :src="loadUrl" class="iframe"></iframe>
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
let setDomainUrl = baseUrl + "pages/proxy/proxy?iframeMode=1";
let articleUrl = baseUrl + "pages/article/article";
export default {
  data() {
    return {
      remoteEnable: true,
      loadUrl: loginUrl, //iframe加载的url
      showIframeDialog: false,
      userToken: "",
      currentNasUserInfo: "",
      currentVipInfo: "",
      proxyState: "",
      timer: null,
      customProxIp: "",
      customProxPort: ""
    };
  },
  mounted() {
    window.addEventListener("message", this.dealIframeMessage);
    this.getNasAccountInfo();
    this.getCustomProxy()
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
        clip.writeText(protocal+this.currentVipInfo.subdomain + this.currentVipInfo.proxyDomain)
        this.showVsNotification(this.$t('system.copied'))
      }
    },
    reconnect() {
      //尝试重连
      this.api
        .post("/api/nasAccountApi/reconnectRemote", {})
        .then((res) => {
          this.showVsAlertDialog(this.$t('common.alert'), this.$t('nascab.reconnectSent'), () => { })
        })
        .catch((error) => {
        });
    },
    setCustomProxy(clear) {
      function isValidIP(ip) {
        var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
        return reg.test(ip);
      }
      function isValidPort(port) {
        if (port < 1 || port > 65535) {
          return false
        } else {
          return true
        }
      }
      if (!clear) {
        if (!isValidIP(this.customProxIp)) {
          return this.showVsNotification(this.$t('nascab.invalidIp'))
        }
        if (!isValidPort(this.customProxPort)) {
          return this.showVsNotification(this.$t('nascab.invalidPort'))
        }
      }

      this.api
        .post("/api/nasAccountApi/setCustomProxy", {
          hideLoading: true,
          local_ip: this.customProxIp,
          local_port: this.customProxPort,
          clear: clear
        })
        .then((res) => {
          if (!res.code) {
            this.showVsNotification(this.$t('common.operationSuccess'));
          } else {
            this.showVsNotification(this.$t('common.operationFail'));
          }
          this.getCustomProxy()
        })
    },
    getCustomProxy() {
      this.api
        .post("/api/nasAccountApi/getCustomProxy", { hideLoading: true })
        .then((res) => {
          if (!res.code) {
            if (res.data) {
              this.customProxIp = res.data.localIp
              this.customProxPort = res.data.localPort
            } else {
              this.customProxIp = ''
              this.customProxPort = ''
            }

          }
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

.item-text-left {
  margin-right: 10px;
}
</style>
