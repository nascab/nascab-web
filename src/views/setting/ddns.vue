<template>
  <div class="remote-root">
    <div class="nas-account-root">
      <Divider>DDNS<Icon @click="showVsAlertDialog($t('common.alert'), $t('setting.ddnsExplain'))" style="margin-left: 10px;" type="ios-help-circle-outline" /></Divider>
      <div class="list-root">
        <div class="item-root">
          <span class="item-text-left">{{ $t("nascab.myDomain") }}:</span>
          <div v-if="currentVipInfo && currentVipInfo.subdomain"
            style="display: flex; flex-direction: row; align-items: center">
            <a class=" enable-text-select" @click="lanIpClick('https://')">{{ currentVipInfo.subdomain }}{{
              currentVipInfo.proxyDomain }}</a>
          </div>
          <!-- 去设置 -->
          <a v-else @click="toSetDomain()" style="margin-left: 10px">
            {{ $t("photo.goToSet") }}</a>
        </div>
        <!-- 连接状态 存在vip信息时才显示-->
        <div class="item-root" v-if="currentVipInfo && currentVipInfo.subdomain">
          <span class="item-text-left" style="flex-shrink:0;">{{ $t("nascab.ddnsIp") }}:</span>
          <div class="link-state-root">
            <div style="margin-right:10px;text-align:left;flex-wrap: wrap;" class="flex-row">
              <span v-if="ddnsIp" style="flex-shrink:0;text-align:left"
                class="icon-main-color enable-text-select">
                {{ ddnsIp }}</span>
              <span v-else style="color: red;flex-shrink:0;max-width: 600px;text-align:left">{{
                ddnsState ? ddnsState.error : ""
              }}</span>
              <!-- 刷新 -->
              <vs-button v-if="ddnsEnable" flat border @click="ddnsEnableSwitch(true, true)"
                style="height: 25px;line-height:25px;flex-shrink:0;min-width:60px;margin-left: 10px;">{{
                  $t("common.refresh")
                }}</vs-button>
            </div>

          </div>
        </div>
        <div class="item-root" v-if="currentVipInfo && currentVipInfo.subdomain">
          <span class="item-text-left">{{ $t("nascab.ddnsType") }}:</span>
          <RadioGroup v-model="ddnsType" @on-change="setDdnsType">
            <Radio label="ipv4">
              <span>IPV4</span>
            </Radio>
            <Radio label="ipv6">
              <span>IPV6</span>
            </Radio>
          </RadioGroup>
        </div>
        <!-- 启用开关 -->
        <div class="item-root" v-if="currentVipInfo && currentVipInfo.subdomain">
          <span class="item-text-left">{{ $t("nascab.isEnable") }} DDNS:</span>
          <i-switch v-model="ddnsEnable" @on-change="ddnsEnableSwitch" />
        </div>

        <div class="item-root" v-if="currentVipInfo && currentVipInfo.subdomain">
          <span class="item-text-left">{{ $t("nascab.useNasCabCert") }}:</span>
          <i-switch v-model="useNasCabCerts" @on-change="httpsCertSwitch" />
        </div>
        <Divider>{{  $t("common.faq") }}</Divider>
        <!-- 常见问题 -->
        <div class="faqItem">{{ $t("ddns.faqContent1") }}</div>
        <div class="faqItem">{{ $t("ddns.faqContent2") }}</div>
        <div class="faqItem">{{ $t("ddns.faqContent3") }}</div>
        <div class="faqItem">{{ $t("ddns.faqContent4") }}</div>
        <div class="faqItem">{{ $t("ddns.faqContent5") }}</div>

        
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
      ddnsIp:"",
      useNasCabCerts: false,//是否使用nas-cab.com的https证书
      ddnsType: "ipv4",
      ddnsEnable: true,
      loadUrl: loginUrl, //iframe加载的url
      showIframeDialog: false,
      userToken: "",
      currentNasUserInfo: "",
      currentVipInfo: "",
      ddnsState: "",
      timer: null,
      customProxIp: "",
      customProxPort: ""
    };
  },
  mounted() {
    window.addEventListener("message", this.dealIframeMessage);
    this.getNasAccountInfo();
    this.timer = setInterval(() => {
      this.getDDNSState()
    }, 5000);
    this.getDDNSState()
    this.getDDNSType()
  },
  beforeDestroy() {
    window.removeEventListener("message", this.dealIframeMessage);
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    getDDNSType() {
      this.api.post('/api/commonApi/getAllConfig', { keys: "('ddnsType','useNasCabCerts')" }).then((res) => {
        for (let i = 0; i < res.data.allConfig.length; i++) {
          let configItem = res.data.allConfig[i]
          if (configItem.title == 'ddnsType') {
            this.ddnsType = configItem.value
          } else if (configItem.title == 'useNasCabCerts') {
            this.useNasCabCerts = configItem.value==1
          }
        }
      }).catch((error) => { })
    },
    setDdnsType(ddnsType) {
      this.api
        .post("/api/nasAccountApi/setDdnsType", {
          ddnsType: ddnsType
        })
        .then((res) => {
          if (!res.code) {
            this.showVsNotification(this.$t('common.operationSuccess'));
          } else {
            this.showVsNotification(this.$t('common.operationFail'));
          }
        })
    },
    switchHttpsCertApi(useNasCabCerts) {
      this.api
        .post("/api/nasAccountApi/setUseNasCabCert", {
          useNasCabCerts: useNasCabCerts
        })
        .then((res) => {
          if (!res.code) {
            this.showVsNotification(this.$t('common.operationSuccess'));
          } else {
            this.showVsNotification(this.$t('common.operationFail'));
          }
        })
    },
    httpsCertSwitch(enable) {
      if (enable) {
        this.showVsConfirmDialog(this.$t('common.confirm'), this.$t(
          'nascab.useNasCabCertAlert'), () => {
            this.switchHttpsCertApi(1)
          }, () => {
            this.useNasCabCerts = false
          })
      } else {
        this.showVsConfirmDialog(this.$t('common.confirm'), this.$t(
          'nascab.useNasCabCertCloseAlert'), () => {
            this.switchHttpsCertApi(0)
          }, () => {
            this.useNasCabCerts = true
          })
      }
    },
    ddnsEnableSwitch(enable, ignorAlert) {
      console.log('enable', enable)
      if (enable) {
        if (ignorAlert) {
          this.switchApi(1)
        } else {
          this.showVsConfirmDialog(this.$t('common.confirm'), this.$t(
            'nascab.sureEnableDDNS'), () => {
              this.switchApi(1)
            }, () => {
              this.ddnsEnable = false
            })
        }

      } else {
        this.showVsConfirmDialog(this.$t('common.confirm'), this.$t(
          'nascab.sureDisableDDNS'), () => {
            this.switchApi(0)
          }, () => {
            this.ddnsEnable = true
          })
      }
    },
    switchApi(nasDdnsEnable) {
      this.api
        .post("/api/nasAccountApi/setDdnsEnable", {
          nasDdnsEnable: nasDdnsEnable
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
        clip.writeText(protocal + this.currentVipInfo.subdomain + this.currentVipInfo.proxyDomain)
        this.showVsNotification(this.$t('system.copied'))
      }
    },
    getDDNSState() {
      this.api
        .post("/api/nasAccountApi/getDDNSState", { hideLoading: true })
        .then((res) => {
          if (!res.code) {
            this.ddnsState = res.ddnsState;
            this.ddnsIp=this.ddnsState.ddnsIp?this.ddnsState.ddnsIp:""
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
            this.ddnsState = res.ddnsState;
            this.ddnsEnable = res.nasDdnsEnable && parseInt(res.nasDdnsEnable) == 1
            console.log('this.ddnsEnable', this.ddnsEnable)
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
.faqItem{
  text-align: left;
  margin-top: 10px;
}
.item-text-left {
  margin-right: 10px;
}
</style>
