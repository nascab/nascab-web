<template>
  <div class="home-root">
    <my-bg :registeSwitchBg="true"></my-bg>
    <my-header bgColor="transparent" :fixed="false"></my-header>
    <div class="layout">
      <!-- 头部 -->
      <div class="top-root">
        <div class="menu-root">
          <!-- 首页菜单 -->
          <div v-for="(menu, index) in homeMenuList" :id="menu.id" v-if="menu.isShow" class="menu-item"
            @click="onMenuClick(menu)" @contextmenu="showRightMenu($event, $root, menu, index)">

            <img style="border-radius:20px" v-lazy="menu.src" alt="" />
            <p>{{ menu.title }}</p>
          </div>

          <!-- 相册备份 -->
          <div v-if="isFromApp" @click="onClickMobileSync" class="menu-item">
            <img src="@/static/home/icon_album_backup.png" alt="" />
            <p>{{ $t("home.albumBackup") }}</p>
          </div>
        </div>
      </div>
      <div class="bottom-root">
        <div class="bottom-left">
          <system-state ref="systemState" :nasAccountInfo="nasAccountInfo"></system-state>
        </div>
        <div class="bottom-right">
          <service-state :nasAccountInfo="nasAccountInfo"></service-state>
        </div>
      </div>
    </div>
    <!-- <v-tour name="myTour" :steps="tourSteps" :options="tourOptions"></v-tour> -->

    <!-- 右键菜单 -->
    <easy-cm @ecmcb="rightMenuClick" :list="rightMenuList"></easy-cm>
  </div>
</template>
<script>
import myHeader from "@/components/my-header/my-header.vue";
import systemState from "@/views/home/systemState.vue";
import serviceState from "@/views/home/serviceState.vue";
import jsBridge from "@/plugins/jsBridge"

export default {
  mounted() { },
  components: {
    myHeader,
    systemState,
    serviceState,
  },
  computed: {},
  data() {
    return {
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
      tourSteps: [
        {
          target: '#photoManage',  // We're using document.querySelector() under the hood
          content: this.$t('tour.photoManage')
        },
        {
          target: '#movieManage',
          content: this.$t('tour.movieManage')
        },
        {
          target: '#switchBg',
          content: this.$t('tour.switchBg')
        },
        {
          target: '#checkMsg',
          content: this.$t('tour.msg')
        },
        {
          target: '#lanIp',
          content: this.$t('tour.lanIp')
        },
        {
          target: '#cpuRam',
          content: this.$t('tour.cpuRam')
        }
      ],

    }
  },
  computed: {
    //首页菜单
    homeMenuList() {
      return [
        // 照片管理
        { id: "photoManage", src: require("@/static/home/icon-photo-manage.png"), path: "/photoTimeline", title: this.$t("home.photoManage"), isShow: true },
        // 影音管理
        { id: "movieManage", src: require("@/static/home/icon-movie-manage.png"), path: "/movies", title: this.$t("home.movieManage"), isShow: true },
        //  文件浏览器
        { id: "filesBrower", src: require("@/static/home/icon-folder-browser.png"), path: "/filesBrower", title: this.$t("home.fileBrower"), isShow: true },
        //  备份
        { id: "backup", src: require("@/static/home/icon-file-backup.png"), path: "/backup", title: this.$t("home.backup"), isShow: this.$store.state.currentUser.is_admin == 1 },
        // 分享
        { id: "sharing", src: require("@/static/home/icon-file-share.png"), path: "/share", title: this.$t("home.sharing"), isShow: this.$store.state.currentUser.is_admin == 1 },
        // 私有空间
        { id: "privateSpace", src: require("@/static/home/icon-private-space.png"), path: "/privateSpace", title: this.$t("photo.privateSpace"), isShow: true  },
        // 安全
        { id: "security", src: require("@/static/home/icon-security.png"), path: "/security", title: this.$t("home.securityCenter"), isShow: this.$store.state.currentUser.is_admin == 1 },
        // 终端
        { id: "terminal", src: require("@/static/home/icon-terminal.png"), path: "/terminal", title: this.$t("home.terminal"), isShow: this.$store.state.currentUser.is_admin == 1 },
        // 配置中心
        { id: "settingCenter", src: require("@/static/home/icon-setting.png"), path: "/setting", title: this.$t("home.settingCenter"), isShow: this.$store.state.currentUser.is_admin == 1 },

      ]
    }
  },
  mounted() {

  },
  activated() {
    this.getNasAccountInfo();
  },
  created() {
    // this.shouldShowTour('home', () => {
    //   this.$tours['myTour'].start()
    // })

    //检查更新
    this.getVersionInfo()
  },
  beforeDestroy() { },
  methods: {
    rightMenuClick(indexList, clickType) {
      let type = clickType ? clickType : this.rightMenuList[indexList[0]].type
      if (type == "NEW_WINDOW") {
        console.log(window.location)
        if (this.selectedMenu.id == "terminal" && window.location.protocol.startsWith("https")) {
          //打开terminal强制使用http协议
          window.open('http://' + window.location.host + "/#" + this.selectedMenu.path, "_blank");
        }else{
          window.open(window.location.origin + "/#" + this.selectedMenu.path)
        }
      }
    },
    showRightMenu(event, root, menu, index) {
      if (this.isMobile) return event.preventDefault()
      this.selectedMenu = menu
      this.$easycm(event, root)
    },
    onMenuClick(menu) {
      console.log("menu", menu)
      //https的时候要强制开新页面 跳http 因为安全策略 https无法访问ws协议 只能访问wss协议
      if (menu.id == "terminal" && (window.location.protocol.startsWith("https")||this.$store.state.runInElectron)) {
        window.open('http://' + window.location.host + "/#" + menu.path, "_blank");
      } else {
        this.goPathNewWebView(menu.path, menu.title, null, menu.newTag)
      }
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
      }).catch((error) => { })
    },
    //手机同步点击
    onClickMobileSync() {
      jsBridge.onClickMobileSync(this.$store.state.token)
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
$shadow-color: #1c1c1e;

::v-deep .v-step {
  border-radius: 10px;
}

::v-deep .v-step__button {
  border-radius: 10px;
}

.home-root {
  background-size: cover;
  position: fixed;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
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
  padding-bottom: 30px;

  @media (max-width:640px) {
    padding-bottom: 10px;
  }
}

.top-root {
  @media (max-width:640px) {
    padding-left: 10px;
    padding-right: 10px;
  }

  padding-left: 30px;
  padding-right: 30px;
  flex-shrink: 0;
}

.menu-root {
  padding: 10px;
  min-height: 120px;

  @media (max-width:640px) {
    padding: 2%;
  }

  width: 100%;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  align-content: flex-start;

  .menu-item {
    cursor: pointer;
    position: relative;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    @media all and (max-width:640px) {
      width: 33.33%;
      height: auto;
      padding: 6px;
    }

    @media not all and (max-width:640px) {
      width: 120px;
      height: 120px;
      margin: 10px;
      transition: -webkit-transform 0.2s;
      transition: transform 0.25s;
      transition: transform 0.25s, -webkit-transform 0.2s;

      @media all and (max-height:640px) {
        width: 100px;
        height: 100px;
      }
    }



    /* Animation */
    img {
      width: 100%;
      height: 100%;
    }

    p {
      font-weight: bold;
      position: absolute;
      bottom: 10px;
      font-size: 16px;
    }
  }

  .menu-item:hover {

    @media not all and (max-width:640px) {
      -webkit-transform: scale(1.1);
      transform: scale(1.1);

    }
  }
}

.bottom-root {

  margin-top: 20px;
  width: 100%;
  height: 100%;

  @media all and (max-width:640px) {
    //手机
    padding-left: 10px;
    padding-right: 10px;
  }

  @media not all and (max-width:640px) {
    //pc
    padding-left: 30px;
    padding-right: 30px;
    display: flex;
    flex-direction: row;
    min-height: 350px;
  }

  .bottom-left {
    border-radius: 20px;
    flex-shrink: 0;
    background-color: rgba(255, 255, 255, 0.6);

    @media all and (max-width:640px) {
      //手机
      width: 100%;
    }

    @media not all and (max-width:640px) {
      //pc
      width: 63%;
      margin-right: 2%;
      height: 100%;
    }
  }

  .bottom-right {
    background-color: rgba(255, 255, 255, 0.6);
    overflow-y: auto;
    border-radius: 20px;

    @media all and (max-width:640px) {
      //手机
      width: 100%;
      margin-top: 20px;
    }

    @media not all and (max-width:640px) {
      //pc
      height: 100%;
      width: 35%;
    }

  }

  .bottom-right::-webkit-scrollbar {
    display: none;
  }

  .bottom-left::-webkit-scrollbar {
    display: none;
  }
}
</style>
