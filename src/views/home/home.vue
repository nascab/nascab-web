<template>
  <div class="home-root">
    <my-bg :registeSwitchBg="true"></my-bg>
    <my-header bgColor="transparent" :fixed="false"></my-header>
    <div class="layout">
      <!-- 头部 -->
      <div class="top-root">
        <div class="menu-root">
          <!-- 照片管理 -->
          <div id="photoManage" class="menu-item" @click="goPath('/photos')">
            <img src="@/static/home/icon-photo-manage.png" alt="" />
            <p>{{ $t("home.photoManage") }}</p>
          </div>
          <!-- 影音管理 -->
          <div id="movieManage" class="menu-item" @click="goPath('/movies')">
            <img src="@/static/home/icon-movie-manage.png" alt="" />
            <p>{{ $t("home.movieManage") }}</p>
          </div>
          <!-- 文件浏览器 -->
          <div class="menu-item" @click="goPath('/filesBrower')">
            <img src="@/static/home/icon-folder-browser.png" alt="" />
            <p>{{ $t("home.fileBrower") }}</p>
          </div>
          <!-- 备份 -->
          <div v-if="$store.state.currentUser.is_admin == 1" class="menu-item" @click="goPath('/backup')">
            <img src="@/static/home/icon-file-backup.png" alt="" />
            <p>{{ $t("home.backup") }}</p>
          </div>
          <!-- 分享 -->
          <div v-if="$store.state.currentUser.is_admin == 1" class="menu-item" @click="goPath('/share')">
            <img src="@/static/home/icon-file-share.png" alt="" />
            <p>{{ $t("home.sharing") }}</p>
          </div>
          <!-- 加密空间 -->
          <div class="menu-item" @click="goPath('/privateSpace')">
            <img src="@/static/home/icon-private-space.png" alt="" />
            <p>{{ $t("photo.privateSpace") }}</p>
          </div>
          <!-- 安全中心 -->
          <div v-if="$store.state.currentUser.is_admin == 1" class="menu-item" @click="goPath('/security')">
            <img src="@/static/home/icon-security.png" alt="" />
            <p>{{ $t("home.securityCenter") }}</p>
          </div>
          <!-- 配置中心 -->
          <div v-if="$store.state.currentUser.is_admin == 1" class="menu-item" @click="goPath('/setting')">
            <img src="@/static/home/icon-setting.png" alt="" />
            <p>{{ $t("home.settingCenter") }}</p>
          </div>
        </div>
      </div>
      <div class="bottom-root">
        <div class="bottom-left">
          <system-state :nasAccountInfo="nasAccountInfo"></system-state>
        </div>
        <div class="bottom-right">
          <service-state :nasAccountInfo="nasAccountInfo"></service-state>
        </div>
      </div>
    </div>
    <v-tour name="myTour" :steps="tourSteps" :options="tourOptions"></v-tour>

  </div>
</template>
<script>
import myHeader from "@/components/my-header/my-header.vue";
import systemState from "@/views/home/systemState.vue";
import serviceState from "@/views/home/serviceState.vue";

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
      ]
    }
  },
  mounted() {

  },
  activated() {
    this.getNasAccountInfo();
  },
  created() {
    this.shouldShowTour('home', () => {
      this.$tours['myTour'].start()
    })
  },
  beforeDestroy() { },
  methods: {
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
    goPath(path, query) {
      this.switchUpload(false)
      this.$router.push({
        path: path,
        query: query,
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
