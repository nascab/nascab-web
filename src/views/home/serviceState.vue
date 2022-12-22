<template>
  <div class="service-root">
    <div class="header">
      <div style="display: flex; flex-direction: row; justify-content: flex-start;  align-items: center;">
        <p class="top-title">{{ $t("state.serverState") }}</p>
        <!-- 版本提示 -->
        <a @click="goToSetting(7)" v-if="!nasAccountInfo.vipInfo" class="versionStr">{{ $t("nascab.versionFree") }}</a>
        <a @click="goToSetting(7)" v-if="nasAccountInfo.vipInfo && nasAccountInfo.vipInfo.type == 1"
          class="versionStr">{{ $t("nascab.versionPro") }}</a>
        <a @click="goToSetting(7)" v-if="nasAccountInfo.vipInfo && nasAccountInfo.vipInfo.type == 2"
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
        <!-- <vs-tooltip style="width:100%"> -->
        <Card id="lanIp" class="card-item">
          <p class="card-title">
            {{ apiServerStateStr }}
          </p>
          <div @click="showQrCodeDialog(lanIpAndPort)" class="card-item-title access-link">{{ lanIpAndPort }}
          </div>
        </Card>
        <!-- <template #tooltip>
            {{ $t('nascab.lanAccessAlert') }}
          </template>
        </vs-tooltip> -->

        <!-- 外网访问地址 -->
        <Card class="card-item">
          <p class="card-title">
            {{ $t("nascab.remoteAccess") }}
          </p>
          <div class="card-item-title access-link">
            <a v-if="nasAccountInfo.vipInfo && nasAccountInfo.vipInfo.subdomain"
              @click="showQrCodeDialog('http://' + nasAccountInfo.vipInfo.subdomain + nasAccountInfo.vipInfo.proxyDomain)">
              http:// {{ nasAccountInfo.vipInfo.subdomain }}{{ nasAccountInfo.vipInfo.proxyDomain }}</a>
            <!-- 去设置 -->
            <span v-if="!nasAccountInfo.vipInfo || !nasAccountInfo.vipInfo.subdomain" @click="goToSetting(6)"
              class="card-item-title access-link">
              {{ $t('photo.goToSet') }}
            </span>
          </div>
        </Card>

        <!-- ftp服务状态 -->
        <Card class="card-item" v-if="ftpServer && ftpServer.state == 'run'">
          <p class="card-title">FTP{{ ftpServerStr }}</p>
          <div class="card-item-title"><a>{{ ftpServerSub }}</a></div>
        </Card>
        <!-- webdav服务状态 -->
        <Card class="card-item" v-if="webDavServer && webDavServer.state == 'run'">
          <p class="card-title">WebDav{{ webDavServerStr }}</p>
          <div class="card-item-title"><a>{{ webDavServerSub }}</a></div>
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
      showUrlDialog: false,
      showUrl: "",
      intervalSystemState: null,
      ftpServer: null,
      ftpServerStr: "",
      ftpServerSub: "",
      webDavServerSub: "",
      webDavServerStr: "",
      apiServerStateStr: "",
      apiServer: null,
      webDavServer: null,
      lanIpAndPort: "",
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
    }
  },
  methods: {
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
    goToSetting(index) {
      if (this.$store.state.currentUser.is_admin == 1) {
        this.$router.push({
          path: "/setting",
          query: {
            index: index,
          },
        });
      } else {
        this.showVsNotification(this.$t('common.noPermission'))
      }
    },
    getIp(ipList) {
      let ipStrList = []
      let useIp = ''
      for (var key in ipList) {
        // 先把ip过滤出来
        if (ipList[key] && ipList[key].length > 0) {
          ipStrList.push(ipList[key][0])
        }
      }
      for (let i in ipStrList) {
        let ip = ipStrList[i]
        console.log(ip)
        //有192.168开头的优先使用 避免虚拟网卡的172开头的排在前面
        if (ip.startsWith('192.168')) {
          useIp = ip
          break
        }
      }
      if (!useIp && ipStrList.length > 0) {
        //找不到的话使用第一个
        useIp = ipStrList[0]
      }
      return useIp
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
      this.api
        .post("/api/commonApi/getServerState", {
          serverName: "all",
          hideLoading: true,
        })
        .then((res) => {
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
              console.log(ipList)
            }
          }
          let lanIp = this.getIp(ipList);
          if (ipList && lanIp) {
            this.lanIpAndPort = "http://" + lanIp;
            if (this.apiServer.port != 80) {
              this.lanIpAndPort = this.lanIpAndPort + ":" + this.apiServer.port
            }
            this.ftpServerSub = "ftp://" + lanIp + ":" + this.ftpServer.port;
            let webDavUrl = "http://" + lanIp + ":" + this.webDavServer.port;
            this.webDavServerSub = webDavUrl;
            sessionStorage.setItem('webDavUrl', webDavUrl)
            sessionStorage.setItem('ftpUrl', this.ftpServerSub)
          } else {
            this.lanIpAndPort = this.$t("state.netStateNoFound");
            this.ftpServerSub = this.$t("state.netStateNoFound");
            this.webDavServerSub = this.$t("state.netStateNoFound");
          }


        })
        .catch((error) => { });
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
  font-size: 20px;
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
  height: 100px;
  width: 100%;

  .card-title {
    text-align: left;
    font-size: 16px;
    color: $nas-text-title;
  }

  .card-item-title {
    text-align: left;
    margin-top: 10px;
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
}
</style>
