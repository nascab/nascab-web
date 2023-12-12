<template>
  <div class="home-root">
    <my-bg :registeSwitchBg="true"></my-bg>
    <!-- logo和刷新 -->
    <div class="top-root" v-if="tabIndex == 0">
      <img class="logo" src="@/static/common/naslogo.png" />

       <!-- 刷新按钮 -->
      <vs-button icon style="background-color: white; flex-shrink: 0">
        <Icon color="#333333"  @click="$bus.$emit('onChangeBg')" type="md-refresh" size="18" />
      </vs-button>
      <!-- <img class="refresh" src="@/static/mobile/ic_refresh.png" @click="$bus.$emit('onChangeBg')" /> -->
    </div>
    <div class="layout">
      <div v-show="tabIndex == 0">
        <!-- 头部 -->
        <div class="menu-root">
          <!-- 首页菜单 -->
          <div v-for="(menu, index) in homeMenuList" :id="menu.id" v-if="menu.isShow" class="menu-item"
            @click="onMenuClick(menu)">

            <img :src="menu.src" alt="" />
            <p>{{ menu.title }}</p>
          </div>
        </div>

        <!-- 快捷功能 -->
        <div style="width:100%;text-align: left;margin-top: 20px;font-size: 16px;font-weight: bold;">{{ $t('home.quickAccess') }}</div>
        <div class="menu-root-b">
          <div class="menu-item" @click="uploadClick">
            <!-- 快速上传 -->
            <p>{{ $t("upload.quickUpload") }}</p>
            <img src="@/static/mobile/ic_upload.png" />
          </div>
          <div class="menu-item" @click="onClickMobileSync()">
            <p> {{ $t("home.albumBackup") }}</p>
            <img src="@/static/mobile/ic_album_backup.png" />
          </div>
        </div>
        <!-- 其他应用 -->
        <div style="width:100%;text-align: left;margin-top: 20px;font-size: 16px;font-weight: bold;">{{ $t('home.others') }}</div>
        <div  class="menu-root" style="margin-top:10px">
          <div v-for="(menu, index) in homeMenuListB" :id="menu.id" v-if="menu.isShow" class="menu-item"
            style="width:20% !important" @click="onMenuClick(menu)">

            <img :src="menu.src" alt="" style="margin-bottom: 0;" />
            <p>{{ menu.title }}</p>
          </div>
        </div>
        <!-- 我的 消息  退出-->
        <div class="menu-root" style="margin-top:10px">
          <div v-if="$store.state.currentUser.is_admin == 1" class="item-bottom" @click="goPathNewWebView('/noticeCenter', $t('notice.info'))">
            <img src="@/static/mobile/ic_msg.png" alt="" />
            <p>{{ $t('home.message') }}</p>
          </div>
          <div class="item-bottom" @click="showUserSetting = true">
            <img src="@/static/mobile/ic_mine.png" alt="" />
            <p>{{ $t('setting.account') }}</p>
          </div>
          <div class="item-bottom" @click="goLogout">
            <img src="@/static/mobile/ic_logout.png" alt="" />
            <p>{{ $t('user.logout') }}</p>
          </div>
        </div>
      </div>

      <!-- 状态 -->
      <div v-if="tabIndex == 1">
        <div style="margin-top:20px">
          <system-state :mobileLayout="true" ref="systemState" :nasAccountInfo="nasAccountInfo"></system-state>
        </div>
        <div style="margin-top:20px">
          <service-state :mobileLayout="true" :nasAccountInfo="nasAccountInfo"></service-state>
        </div>
      </div>
      <!-- 任务 -->
      <div v-if="tabIndex == 2" style="margin-top:20px">
        <img style="width:50%" src="@/static/mobile/ic_task_bg.png"/>
        <bg-task v-if="tabIndex == 2" :mobileLayout="true"></bg-task>
      </div>

    </div>
    <!-- 底部tabbar -->
    <div class="tabbar-root">
      <div class="tabbar-item" @click="tabIndex = 0">
        <img v-if="tabIndex == 0" src="@/static/mobile/ic_apps_selected.png" />
        <img v-if="tabIndex != 0" src="@/static/mobile/ic_apps.png" />
        <p>{{ $t('home.apps') }}</p>
      </div>
      <div class="tabbar-item" @click="tabIndex = 1">
        <img v-if="tabIndex == 1" src="@/static/mobile/ic_status_selected.png" />
        <img v-if="tabIndex != 1" src="@/static/mobile/ic_status.png" />
        <p>{{ $t('home.status') }}</p>
      </div>
      <div class="tabbar-item" @click="tabIndex = 2">
        <img v-if="tabIndex == 2" src="@/static/mobile/ic_task_selected.png" />
        <img v-if="tabIndex != 2" src="@/static/mobile/ic_task.png" />
        <p>{{  $t('home.task')  }}</p>
      </div>
    </div>

    <vs-dialog prevent-close  v-model="showUserSetting">
      <user-setting @onClose="showUserSetting = false"></user-setting>
    </vs-dialog>
  </div>
</template>
<script>
import jsBridge from "@/plugins/jsBridge"
import userSetting from "@/components/my-header/user-setting.vue"
import systemState from "@/views/home/systemState.vue";
import serviceState from "@/views/home/serviceState.vue";
import bgTask from "@/components/bg-task/bg-task.vue";
import axios from "@/plugins/axios";

export default {
  mounted() { },
  components: {
    userSetting,
    systemState,
    serviceState,
    bgTask
  },
  computed: {},
  data() {
    return {
      showMenuArr: ["photoManage", "movieManage", "filesBrower", "backup", "sharing", "privateSpace", "security"],
      tabIndex: 0,//底部选中的index
      showUserSetting: false,
      rightMenuList: [{
        text: this.$t('file.openInNewWindow'),
        type: "NEW_WINDOW",
      }],
      selectedMenu: null,
      nasAccountInfo: {},
      tourOptions: {
        useKeyboardNavigation: false,
        labels: {
          buttonSkip: this.$t('tour.skip'),
          buttonPrevious: this.$t('tour.last'),
          buttonNext: this.$t('tour.next'),
          buttonStop: this.$t('tour.finish'),
        }
      },
    }
  },
  computed: {
    //首页菜单
    homeMenuList() {
      return [
        // 照片管理
        { id: "photoManage", src: require("@/static/mobile/ic_photo.png"), path: "/photoTimeline", title: this.$t("home.photoManage"), isShow:this.showMenuArr.includes('photoManage')},
        // 影音管理
        { id: "movieManage", src: require("@/static/mobile/ic_movie.png"), path: "/movies", title: this.$t("home.movieManage"), isShow: this.showMenuArr.includes('movieManage') },
        //  文件浏览器
        { id: "filesBrower", src: require("@/static/mobile/ic_folder.png"), path: "/filesBrower", title: this.$t("home.fileBrower"), isShow: this.showMenuArr.includes('filesBrower') },
        //  音乐管理
        { id: "musicManage", src: require("@/static/mobile/ic_music.png"), path: "music", title: this.$t("home.musicManage"), isShow: this.showMenuArr.includes("musicManage") ,newTag:true },
      ]
    },
    homeMenuListB() {
      return [
        { id: "backup", src: require("@/static/mobile/ic_backup.png"), path: "/backup", title: this.$t("home.backup"), isShow: this.$store.state.currentUser.is_admin == 1&&this.showMenuArr.includes('backup')  },

        // 分享
        { id: "sharing", src: require("@/static/mobile/ic_share.png"), path: "/share", title: this.$t("home.sharing"), isShow: this.$store.state.currentUser.is_admin == 1&&this.showMenuArr.includes('sharing') },
        // 私有空间
        { id: "privateSpace", src: require("@/static/mobile/ic_private.png"), path: "/privateSpace", title: this.$t("photo.privateSpace"), isShow: this.showMenuArr.includes('privateSpace') },
        // 安全
        { id: "security", src: require("@/static/mobile/ic_security.png"), path: "/security", title: this.$t("home.securityCenter"), isShow: this.$store.state.currentUser.is_admin == 1&&this.showMenuArr.includes('security') },
        // 配置中心
        { id: "settingCenter", src: require("@/static/mobile/ic_setting.png"), path: "/setting", title: this.$t("home.settingCenter"), isShow: this.$store.state.currentUser.is_admin == 1 },
        // 终端
        // { id: "terminal", src: require("@/static/mobile/ic_terminal.png"), path: "/terminal", title: this.$t("home.terminal"), isShow: this.$store.state.currentUser.is_admin == 1 },
      ]
    }
  },
  mounted() {

  },
  activated() {
    this.getNasAccountInfo();
  },
  created() {
    //检查更新
    this.getVersionInfo()
  },
  beforeDestroy() { },
  methods: {
    onClickMobileSync() {
      console.log("onClickMobileSync")
      if (!this.isFromApp) {
        return this.showVsNotification(this.$t('common.onlyCanUseInApp'))
      }
      jsBridge.onClickMobileSync(this.$store.state.token)
    },
    goLogout() {
      this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('header.okLogout'), () => {
        localStorage.removeItem('token')
        localStorage.removeItem('currentUser')
        localStorage.removeItem('autoLogin')
        this.showVsNotification(this.$t('header.logoutSuccess'))
        setTimeout(() => {
          if (this.isFromApp && jsBridge) {
            jsBridge.onClickLogout()
          } else {
            this.$router.push({
              path: '/login'
            })
          }
        }, 500)

        this.api.post('/api/usersApi/logout',{
					token:this.$store.state.token,
          hideLoading: true
				}).then((res) => {})
      })
    },
    uploadClick() {
      if (this.isFromApp) {
        this.switchUpload(true)
      } else {
        this.switchUpload()
      }
    },
    onMenuClick(menu) {
      console.log("menu", menu)
      //https的时候要强制开新页面 跳http 因为安全策略 https无法访问ws协议 只能访问wss协议
      if (menu.id == "terminal" && (window.location.protocol.startsWith("https") || this.$store.state.runInElectron)) {
        window.open('http://' + window.location.host + "/#" + menu.path, "_blank");
      } else {
        this.goPathNewWebView(menu.path, menu.title, null, menu.newTag)
      }
    },
    openTerminalPage() {
      let terminalUrl = `http://${window.location.host}/#/?token=${this.$store.state.token}&target=terminal`;
      window.open(terminalUrl, "_blank");
    },
    getVersionInfo() {
      this.api.post('/api/commonApi/getVersionInfo', { hideLoading: true }).then((res) => {
        if (res.currentVersion) {
          let currentVersionInt = res.currentVersion.replaceAll(".", '')
          if (res.versionInfo.version) {
            let newVersionInt = res.versionInfo.version.replaceAll(".", '')
            if (newVersionInt > currentVersionInt) {
              this.$refs.systemState.hasNewVersion = 1
            }
          }
        }
        if (res.showMenuArr) {
          this.showMenuArr = res.showMenuArr
        }else{
          this.showMenuArr = ["photoManage", "movieManage", "musicManage", "filesBrower", "backup", "sharing", "privateSpace", "security"];
        }
        console.log(this.showMenuArr)
      }).catch((error) => {
        this.showMenuArr = ["photoManage", "movieManage", "musicManage", "filesBrower", "backup", "sharing", "privateSpace", "security"];
       })
    },
    getNasAccountInfo() {
      this.api
        .post("/api/nasAccountApi/getNasAccountInfo", { hideLoading: true })
        .then((res) => {
          if (!res.code) {
            this.nasAccountInfo = res.data ? res.data : {}
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },

  },
};
</script>
<style lang="scss" scoped>
.top-root {
  display: flex;
  z-index: 1;
  padding: 30px 10px;
  justify-content: space-between;

  .logo {
    object-fit: contain;
    width: 133px;
  }

  .refresh {
    object-fit: contain;
    height: 32px;
    width: 32px;
  }
}

.home-root {
  background-size: cover;
  position: fixed;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding-left: 10px;
  padding-right: 10px;
}

.layout {
  scrollbar-width: none;
  /* Firefox 64 */
  height: 100%;
  z-index: 1;
  width: 100%;
  display: flex;
  overflow: auto;
  flex-direction: column;
  padding-bottom: 80px;
}


.menu-root-b {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .menu-item {
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-top: 10px;
    padding: 10px;
    width: 48%;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 10px;

    p {
      font-size: 14px;
    }

    img {
      width: 40%;
      height: 40%;
    }
  }
}

.menu-root {
  padding: 10px;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  align-content: flex-start;

  .menu-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 25%;

    /* Animation */
    img {
      object-fit: contain;
      width: 80%;
      height: 80%;
    }

    p {
      font-size: 14px;
    }
  }

  .item-bottom {
    padding-top: 10px;
    padding-bottom: 10x;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 20%;

    /* Animation */
    img {
      object-fit: contain;
      width: 35%;
      height: 35%;
      margin-bottom: 8px;
    }

    p {
      font-size: 14px;
    }
  }

}

.tabbar-root {
  z-index: 2;
  display: flex;
  width: 100%;
  height: 55px;
  justify-content: space-around;
  position: fixed;
  bottom: 0;
  left: 0;
  background-color: white;
  align-items: center;
  border-top: 1px solid #ECECEC;

  .tabbar-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    img {
      height: 22px;
      width: 22px;
    }

    p {
      margin-top: 3px;
      font-size: 12px;
      color: #BAC8D8;
    }
  }
}
</style>
