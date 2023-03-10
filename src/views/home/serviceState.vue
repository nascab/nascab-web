<template>
  <div class="service-root">
    <div class="header">
      <div style="display: flex; flex-direction: row; justify-content: flex-start;  align-items: center;">
        <p class="top-title">{{ $t("state.serverState") }}</p>
        <!-- 版本提示 -->
        <a @click="goToSetting('nasAccount')" v-if="!nasAccountInfo.vipInfo" class="versionStr">{{
          $t("nascab.versionFree")
        }}</a>
        <a @click="goToSetting('nasAccount')" v-if="nasAccountInfo.vipInfo && nasAccountInfo.vipInfo.type == 1"
          class="versionStr">{{ $t("nascab.versionPro") }}</a>
        <a @click="goToSetting('nasAccount')" v-if="nasAccountInfo.vipInfo && nasAccountInfo.vipInfo.type == 2"
          class="versionStr">{{ $t("nascab.versionTeam") }}</a>
        <div class="max-line-one" style="margin-left:10px">{{ hostName }}</div>
      </div>
      <!-- 刷新按钮 -->
      <vs-button icon style="background-color: white; flex-shrink: 0">
        <Icon color="#333333" @click="getServerState()" type="md-refresh" size="18" />
      </vs-button>
    </div>
    <div class="content-root">
      <div class="card-root">
        <!-- 局域网访问地址 -->
        <Card id="lanIp" class="card-item ">
          <p class="card-title">
            {{ apiServerStateStr }}
          </p>
          <div v-if="ipv4List.length > 0" v-for="lanIp in ipv4List"
            @click="showQrCodeDialog('http://' + lanIp.ip + ':' + apiServer.port)" class="card-item-title access-link enable-text-select">
            {{ 'http://' + lanIp.ip + ":" + apiServer.port }}
          </div>
          <div v-if="ipv4List.length < 1" class="card-item-title access-link">
            {{ $t("state.netStateNoFound") }}
          </div>
        </Card>


        <!-- 外网访问地址 -->
        <Card class="card-item">
          <p class="card-title">
            {{ $t("nascab.remoteAccess") }}
          </p>
          <div class="card-item-title access-link">
            <a v-if="nasAccountInfo.vipInfo && nasAccountInfo.vipInfo.subdomain" class=" enable-text-select"
              @click="showQrCodeDialog('http://' + nasAccountInfo.vipInfo.subdomain + nasAccountInfo.vipInfo.proxyDomain)">
              http://{{ nasAccountInfo.vipInfo.subdomain }}{{ nasAccountInfo.vipInfo.proxyDomain }}</a>
            <!-- 去设置 -->
            <span v-if="!nasAccountInfo.vipInfo || !nasAccountInfo.vipInfo.subdomain" @click="goToSetting('remoteAccess')"
              class="card-item-title access-link">
              {{ $t('photo.goToSet') }}
            </span>
          </div>
        </Card>
        <!-- IPV6地址 -->
        <Card id="lanIp6" class="card-item">
          <p class="card-title">
            {{ $t("state.ipv6url") }}<Icon @click="showVsAlertDialog($t('common.alert'), $t('state.ipv6alert'))" style="cursor: pointer;" size="16" type="ios-help-circle-outline" />
          </p>
          <div v-if="ipv6List.length > 0" v-for="lanIp in ipv6List"
            @click="showQrCodeDialog('http://[' + lanIp.ip + ']:' + apiServer.port)"
            class="card-item-title access-link max-line-one  enable-text-select">
            {{ 'http://[' + lanIp.ip + "]:" + apiServer.port }}
          </div>
          <div v-if="ipv6List.length < 1" class="card-item-title access-link"
            @click="showVsAlertDialog($t('common.alert'), $t('state.ipv6alert'))">
            {{ $t("state.netStateNoFound") }}
          </div>
        </Card>
        <!-- ftp服务状态 -->
        <Card class="card-item" v-if="ftpServer && ftpServer.state == 'run'">
          <p class="card-title">FTP{{ ftpServerStr }}</p>
          <div v-if="ipv4List.length > 0" v-for="lanIp in ipv4List"
            @click="lanIpClick('ftp://' + lanIp + ':' + ftpServer.port)" class="card-item-title access-link  enable-text-select">
            {{ 'ftp://' + lanIp.ip + ":" + ftpServer.port }}
          </div>
          <div v-else class="card-item-title access-link">
            {{ $t("state.netStateNoFound") }}
          </div>
        </Card>
        <!-- webdav服务状态 -->
        <Card class="card-item" v-if="webDavServer && webDavServer.state == 'run'">
          <p class="card-title">WebDav{{ webDavServerStr }}</p>
          <div v-if="ipv4List.length > 0" v-for="lanIp in ipv4List"
            @click="lanIpClick('http://' + lanIp + ':' + webDavServer.port)" class="card-item-title access-link enable-text-select">
            {{ 'http://' + lanIp.ip + ":" + webDavServer.port }}
          </div>
          <div v-else class="card-item-title access-link">
            {{ $t("state.netStateNoFound") }}
          </div>
        </Card>
      </div>
    </div>

    <!-- 弹窗展示地址url -->
    <vs-dialog v-model="showUrlDialog">
      <template #header>
        <h4 class="not-margin">
          {{ $t('home.scanToAccess') }}
        </h4>
      </template>
      <div @click="lanIpClick(showUrl)"> <a> {{ showUrl }}</a></div>

      <!-- 二维码容器 -->
      <div style="display:flex;align-items:center;justify-content:center">
        <div id="lanQrcode"></div>
      </div>
    </vs-dialog>
  </div>
</template>

<script>
import qrcode from "@/plugins/qrcode.js"
export default {
  props: {
    nasAccountInfo: {
      default: {},
      type: Object,
    },
  },
  computed: {

  },
  data() {
    return {
      loading: false,
      showUrlDialog: false,
      showUrl: "",
      intervalSystemState: null,
      ftpServer: null,
      ftpServerStr: "",
      webDavServerStr: "",
      apiServerStateStr: "",
      apiServer: null,
      webDavServer: null,
      lanIpAndPort: "",
      ipv4List: [],//局域网ip列表
      ipv6List: [],
      hostName: ""
    };
  },

  mounted() {
    this.getServerState();
  },
  created() {
    this.intervalSystemState = setInterval(() => {
      this.getServerState();
    }, 20000);
  },
  beforeDestroy() {
    if (this.intervalSystemState) {
      clearInterval(this.intervalSystemState);
      this.intervalSystemState = null
    }
  },
  methods: {
    goToSetting(pageName) {
      if (this.$store.state.currentUser.is_admin == 1) {
        this.goPathNewWebView("/setting?pageName=" + pageName, this.$t('home.settingCenter'), { pageName: pageName })
      } else {
        this.showVsNotification(this.$t('common.noPermission'))
      }
    },
    lanIpClick(url) {
      let clip = navigator.clipboard
      if (clip) {
        clip.writeText(url)
        this.showVsNotification(this.$t('system.copied'))
      }
    },
    showQrCodeDialog(url) {
      this.showUrlDialog = true
      this.showUrl = url
      this.$nextTick(() => {
        this.showQrCode(url, 'lanQrcode')
      })
    },

    getIp(ipList) {
      let ipStrList = []
      let useIp = ''
      for (var key in ipList) {
        // 先把ip过滤出来
        if (key.indexOf('VMware') != -1) {
          //过滤虚拟网卡
          continue
        }
        if (ipList[key] && ipList[key].length > 0) {
          ipStrList.push(ipList[key][0])
        }
      }
      return ipStrList
    },
    showQrCode(qrdata, tagId) {
      var typeNumber = 4;
      var errorCorrectionLevel = 'L';
      var qr = qrcode(typeNumber, errorCorrectionLevel);
      qr.addData(qrdata);
      qr.make();
      document.getElementById(tagId).innerHTML = qr.createImgTag(3);
    },
    getServerState() {
      //没登陆的情况下不获取
      if (!this.$store.state.token) {
        return;
      }
      if (this.loading) return
      this.loading = true
      this.api
        .post("/api/commonApi/getServerState", {
          serverName: "all",
          hideLoading: true,
        })
        .then((res) => {
          this.loading = false

          this.$store.state.unreadMsgCount = res.unreadMsgCount;
          let ipList = [];
          this.hostName = res.hostName
          for (let i = 0; i < res.data.length; i++) {
            if (res.data[i].title == "apiServer") {
              //设置服务运行状态字符串
              this.apiServer = JSON.parse(res.data[i].value);
              this.apiServerStateStr = this.$t("state.lanUrl");
            } else if (res.data[i].title == "webDavServer") {
              //设置服务运行状态字符串
              this.webDavServer = JSON.parse(res.data[i].value);
              this.webDavServerStr = this.$t("state.fileShare");
              this.webDavServerStr += ":";
              this.webDavServerStr +=
                this.webDavServer.state == "run"
                  ? this.$t("state.run")
                  : this.$t("state.error");


            } else if (res.data[i].title == "FTPServer") {
              //设置服务运行状态字符串
              this.ftpServer = JSON.parse(res.data[i].value);
              this.ftpServerStr = this.$t("state.fileShare");
              this.ftpServerStr += ":";
              this.ftpServerStr +=
                this.ftpServer.state == "run"
                  ? this.$t("state.run")
                  : this.$t("state.error");
            } else if (res.data[i].title == "globalIpList") {
              //设置服务运行状态字符串
              ipList = JSON.parse(res.data[i].value);
              console.log("ipList", ipList)
            }
          }
          this.ipv4List = []
          this.ipv6List = []

          for (let i = 0; i < ipList.length; i++) {
            if (ipList[i].type == "ipv4") {
              this.ipv4List.push(ipList[i])
            } else if (ipList[i].type == "ipv6") {
              this.ipv6List.push(ipList[i])
            }
          }

          if (this.ipv4List.length > 0) {
            if (this.webDavServer && this.webDavServer.state == "run" && this.ipv4List.length > 0) {
              localStorage.setItem("webDavUrl", 'http://' + this.ipv4List[0].ip + ":" + this.webDavServer.port)
            }
            if (this.ftpServer && this.ftpServer.state == "run" && this.ipv4List.length > 0) {
              localStorage.setItem("ftpUrl", 'ftp://' + this.ipv4List[0].ip + ":" + this.ftpServer.port)
            }
          }

        })
        .catch((error) => {
          this.loading = false
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.service-root {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.header {
  width: 100%;
  padding: 15px 15px;
  height: 60px;
  position: absolute;
  display: flex;
  justify-content: space-between;
  align-items: center;

  // 高度过低的情况下
  @media all and (max-height:640px) {
    padding: 5px 15px;
    height: 50px;
  }

}

.content-root {
  padding-top: 60px;
  overflow: hidden;
  width: 100%;
  display: flex;
  height: 100%;

  // 高度过低的情况下
  @media all and (max-height:640px) {
    padding-top: 50px;
  }
}

.top-title {
  color: $nas-text-title;
  font-size: 18px;
  font-weight: bold;
  flex-shrink: 0;
}

.card-root {
  scrollbar-width: none;
  /* Firefox 64 */
  width: 100%;
  padding-left: 15px;
  padding-right: 15px;
  padding-bottom: 15px;
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
  align-content: flex-start;
}

.card-item {
  margin-top: 10px;
  border-radius: 20px;
  width: 100%;

  .card-title {
    text-align: left;
    font-size: 14px;
    color: $nas-text-title;
  }

  .card-item-title {
    text-align: left;
    margin-top: 8px;
    font-size: 14px;
    color: $nas-text-grey;
  }

  p {
    font-size: 14px;
  }
}

.versionStr {
  flex-shrink: 0;
  font-size: 16px;
  color: $nas-main;
  margin-left: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.access-link {
  cursor: pointer;
  color: $nas-main !important;
}</style>
