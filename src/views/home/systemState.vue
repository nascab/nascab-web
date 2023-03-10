<template>
  <div class="sys-root">
    <div class="header">
      <div style="display: flex;flex-direction: row;justify-content: flex-start;align-items: center;">
        <p class="top-title">{{ $t("state.systemState") }}</p>
        <Badge dot :offset="[5, -3]" :count="hasNewVersion">
          <a class="versionStr" @click="goToSetting('systemSetting')" style="margin-left: 10px">V{{ version }}</a>
        </Badge>
        <p v-if="systemState && systemState.cpu && systemState.mem" class="systemStr">
          CPU:{{ systemState.cpu.num + "x" }}
          {{ $t("home.RAM") + ":" + Math.ceil(parseFloat(systemState.mem.total / 1024 / 1024 / 1024)) + "GB" }}
        </p>
      </div>

      <div style="display:flex;flex-shrink: 0">
        <!-- 系统信息按钮 -->
        <vs-button v-if="$store.state.currentUser.is_admin == 1" icon style="background-color: white; flex-shrink: 0">
          <Icon color="#333333" @click="showSystemInfomation()" type="md-laptop" size="18" />
        </vs-button>
        <!-- 刷新按钮 -->
        <vs-button icon style="background-color: white; flex-shrink: 0">
          <Icon color="#333333" @click="getSystemState(true)" type="md-refresh" size="18" />
        </vs-button>
      </div>

    </div>
    <div class="content-root">
      <div class="card-root">
        <!-- 照片服务 索引状态 -->
        <Card class="index-monitor" v-if="photoIndexInfo && (photoIndexInfo.photoCount + photoIndexInfo.videoCount) > 0">
          <div class="ring-title" style="display: flex; align-items: center; justify-content: flex-start">
            <Spin v-if="photoIndexInfo.indexing"></Spin>
            <p>
              {{ photoIndexInfo.indexing ? $t("home.indexing") + "..." : $t("home.photoManage") }}
            </p>
          </div>
          <div class="ring-item-title">
            {{ $t("photo.image") + ":" + photoIndexInfo.photoCount }}
          </div>
          <div class="ring-item-title">
            {{ $t("photo.video") + ":" + photoIndexInfo.videoCount }}
          </div>
          <div class="ring-item-title" style="display: flex; align-items: center">
            {{ $t("home.thumbnail") + ":" + photoIndexInfo.tinyCount }}
          </div>

        </Card>
        <!-- 影音管理 索引状态 -->
        <Card class="index-monitor" v-if="movieIndexInfo && (movieIndexInfo.photoCount + movieIndexInfo.videoCount) > 0">
          <div style="display: flex; align-items: center">
            <Spin v-if="movieIndexInfo.indexing"></Spin>
            <p class="ring-title">
              {{ movieIndexInfo.indexing ? $t("home.indexing") + "..." : $t("home.movieManage") }}
            </p>
          </div>
          <div class="ring-item-title">
            {{ $t("photo.image") + ":" + movieIndexInfo.photoCount }}
          </div>
          <div class="ring-item-title">
            {{ $t("photo.video") + ":" + movieIndexInfo.videoCount }}
          </div>
          <div class="ring-item-title" style="display: flex; align-items: center">
            {{ $t("home.thumbnail") + ":" + movieIndexInfo.tinyCount }}
          </div>

        </Card>
        <!-- cpu和内存监控 -->
        <Card id="cpuRam" class="resource-monitor">
          <p class="ring-title" style="width: 100%; text-align: left">CPU / {{ $t('home.RAM') }} {{ $t('usage') }}</p>
          <div class="resource-monitor-wrapper">
            <!-- cpu用量 -->
            <i-circle style="margin-top: 20px; margin-right: 20px"
              :stroke-color="systemState.cpu.load > 90 ? '#ff5500' : '#386DF2'" :size="80" :percent="systemState.cpu.load"
              v-if="systemState.cpu">
              <div style="margin-bottom: 5px">
                <span style="font-size: 14px; color: #386df2">CPU</span>
              </div>
              <span style="font-size: 14px; color: #999999">{{ systemState.cpu.load }}%</span>
            </i-circle>

            <i-circle v-if="systemState.mem" style="margin-top: 20px"
              :stroke-color="systemState.mem.use > 90 ? '#ff5500' : '#386DF2'" :size="80" :percent="systemState.mem.use">
              <div style="margin-bottom: 5px">
                <span style="font-size: 14px; color: #386df2">{{ $t('home.RAM') }}</span>
              </div>
              <span style="font-size: 14px; color: #999999">{{ systemState.mem.use }}%</span>
            </i-circle>
          </div>
        </Card>
        <!-- 磁盘监控 -->
        <Card class="disk-monitor" v-for="(disk, index) in diskList" v-if="!disk.isVirtual">
          <p v-if="disk.isUSB" class="ring-title" style="width: 100%; text-align: left">
            USB:{{ disk.diskSign }}
          </p>
          <p v-else-if="disk.isCard" class="ring-title" style="width: 100%; text-align: left">
            Card:{{ disk.diskSign }}
          </p>
          <p v-else class="ring-title" style="width: 100%; text-align: left">
            {{ $t("home.disk") }}:{{ disk.path }}
          </p>

          <i-circle style="margin-top: 20px" :stroke-color="disk.userPercent > 90 ? '#ff5500' : '#386DF2'" :size="80"
            :percent="disk.userPercent">
            <div style="margin-bottom: 5px">
              <span style="font-size: 14px; color: #386df2">{{ disk.userPercent }}%</span>
            </div>
            <span style="font-size: 14px; color: #999999">{{ disk.sizeStr }}</span>
          </i-circle>
          <div style="margin-bottom: 5px; word-break: break-all"></div>
        </Card>
      </div>
    </div>

    <Modal v-model="showSystemInfo" footer-hide>
      <system-info v-if="showSystemInfo"></system-info>
    </Modal>
  </div>
</template>
<script>
import systemInfo from "@/views/home/system/systemInfo"

export default {
  props: {
    nasAccountInfo: {
      default: {},
      type: Object,
    }
  },
  components: {
    systemInfo
  },
  data() {
    return {
      showSystemInfo: false,
      hasNewVersion: 0,
      loading: false,
      version: "", //nascab版本
      intervalSystemState: null,
      intervalSystemStateGap: 15000, //多长时间获取一次系统信息
      photoIndexInfo: false,
      movieIndexInfo: false,
      systemState: {},
      diskList: []
    }
  },
  mounted() {
    this.init()

  },
  created() {
    this.intervalSystemState = setInterval(() => {
      this.getSystemState()
    }, this.intervalSystemStateGap)

  },
  beforeDestroy() {
    if (this.intervalSystemState) {
      clearInterval(this.intervalSystemState)
      this.intervalSystemState = null
    }
  },
  methods: {
    showSystemInfomation() {
      this.showSystemInfo = true
    },
    goToSetting(pageName) {
      if (this.$store.state.currentUser.is_admin == 1) {
        this.goPathNewWebView("/setting?pageName=" + pageName, this.$t('home.settingCenter'), { pageName: pageName })
      } else {
        this.showVsNotification(this.$t('common.noPermission'))
      }
    },
    init() {
      this.getSystemState()
    },

    showIndexAlert() {
      this.showVsAlertDialog(this.$t('common.alert'), this.$t('home.indexAlert'))
    },
    // 获取系统状态 cpu和内存用量
    getSystemState(force) {
      if (!this.$store.state.token) { return }
      if (this.loading) return
      this.loading = true
      this.api
        .post("/api/commonApi/getSystemState", {
          hideLoading: true,
          force
        })
        .then((res) => {
          this.loading = false
          this.version = res.version;
          for (let i = 0; i < res.data.length; i++) {
            let title = res.data[i].title
            let value = res.data[i].value
            console.log(title)
            if (title == "globalMemInfo") {
              //解析内存信息
              this.systemState.mem = JSON.parse(value)
              if (this.systemState.mem.free && this.systemState.mem.total) {
                this.systemState.mem.use = 100 - parseInt(parseFloat(this.systemState.mem.free /
                  this
                    .systemState.mem.total) * 100)
              }
            } else if (title == "globalCpuInfo") {
              //解析cpu信息
              this.systemState.cpu = JSON.parse(value)
              console.log(this.systemState.cpu)
            } else if (title == "globalDiskInfo") {
              //解析磁盘
              this.diskList = JSON.parse(value)
              for (let i = 0; i < this.diskList.length; i++) {
                let disk = this.diskList[i]
                console.log(disk)
                if (disk.space && disk.space.free && disk.space.total) {
                  this.diskList[i].userPercent = parseInt((1 - parseFloat(disk.space.free / disk.space.total)) * 100)
                } else {
                  this.diskList[i].userPercent = 0
                }
              }
            } else if (title == "globalIndexInfofile_index_movie") {
              this.movieIndexInfo = JSON.parse(value)

            } else if (title == "globalIndexInfofile_index_photo") {
              this.photoIndexInfo = JSON.parse(value)
            }
          }
        })
        .catch((error) => {
          this.loading = false
        });
    },
  }
}
</script>

<style lang="scss" scoped>
.card-item {
  @media all and (max-width:640px) {
    width: 100% !important;
    margin-right: 0 !important;
  }
}

.sys-root {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.header {
  width: 100%;
  padding: 15px;
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
  flex-shrink: 0;
  color: $nas-text-title;
  font-size: 18px;
  font-weight: bold;
}

.card-root {
  scrollbar-width: none;
  /* Firefox 64 */
  padding-left: 15px;
  padding-right: 15px;
  padding-bottom: 15px;
  overflow: scroll;
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
}

.card-root::-webkit-scrollbar {
  display: none;
}

.index-monitor {
  margin-right: 10px;
  border-radius: 20px;
  margin-top: 10px;
  min-width: 180px;
  @extend .card-item;
}

.resource-monitor {
  margin-right: 10px;
  border-radius: 20px;
  margin-top: 10px;
  min-width: 180px;
  @extend .card-item;

  .resource-monitor-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }
}

.disk-monitor {
  margin-right: 10px;
  border-radius: 20px;
  margin-top: 10px;
  min-width: 120px;
  @extend .card-item;
}

.ring-title {
  color: $nas-text-title;
  font-size: 16px;
}

.ring-item-title {
  color: $nas-text-grey;
  margin-top: 10px;
  text-align: left;
}

.systemStr {
  font-size: 16px;
  color: #999999;
  margin-left: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.versionStr {
  font-size: 16px;
  color: $nas-main;
  margin-left: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
