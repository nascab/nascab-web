<template>
  <div class="sys-info-root">
    <Dropdown style="margin-top:15px;margin-bottom: 15px;" @on-click="onMenuClick" trigger="click">
      <Button type="primary" style="border-radius: 20px;">
        {{ $t(`system.info.${selectedName}`) }}
        <Icon type="ios-arrow-down"></Icon>
      </Button>
      <template #list>
        <DropdownMenu>
          <!-- <DropdownItem name="system">{{ $t('system.info.system') }}</DropdownItem> -->
          <DropdownItem name="osInfo">{{ $t('system.info.osInfo') }}</DropdownItem>
          <DropdownItem name="cpu">{{ $t('system.info.cpu') }}</DropdownItem>
          <DropdownItem name="mem">{{ $t('system.info.mem') }}</DropdownItem>
          <DropdownItem name="diskLayout">{{ $t('system.info.diskLayout') }}</DropdownItem>
          <DropdownItem name="usb">{{ $t('system.info.usb') }}</DropdownItem>
          <DropdownItem name="audio">{{ $t('system.info.audio') }}</DropdownItem>
          <DropdownItem name="networkInterfaces">{{ $t('system.info.networkInterfaces') }}</DropdownItem>
          <DropdownItem name="bios">{{ $t('system.info.bios') }}</DropdownItem>
          <DropdownItem name="baseboard">{{ $t('system.info.baseboard') }}</DropdownItem>
          <DropdownItem name="graphics">{{ $t('system.info.graphics') }}</DropdownItem>
          <!-- <DropdownItem name="wifiNetworks">{{ $t('system.info.wifiNetworks') }}</DropdownItem> -->
          <DropdownItem name="bluetoothDevices">{{ $t('system.info.bluetoothDevices') }}</DropdownItem>
        </DropdownMenu>
      </template>
    </Dropdown>

    <!-- 一层视图 -->
    <info-list v-if="infoData && infoData.list && isOneLayer" :infoData="infoData"></info-list>
    <!-- 两层视图 -->
    <div v-if="infoData && infoData.list && isTwoLayer" :infoData="infoData">
      <Card v-for="item in infoData.list " style="width:100%;margin-bottom:30px">
        <info-list v-if="item && item.list" :infoData="item"></info-list>
      </Card>
    </div>
  </div>
</template>

<script>
import infoList from "@/views/home/system/infoList"
import infoListTwoLayer from "@/views/home/system/infoListTwoLayer"


//排除不显示的属性
let excludeList = {
  osInfo: ['servicepack', 'hypervisor', 'remoteSession', 'fqdn', 'codename'],
  cpu: ['voltage', 'governor', 'cache'],
  mem: ['slab', 'cached', 'buffers', 'swaptotal', 'swapused', 'swapfree', 'available'],
  baseboard: ['memMax', 'memSlots'],
  usb: ["default"],
  audio: ['status'],
  networkInterfaces: ["operstate", "ieee8021xAuth", "ieee8021xState", "carrierChanges"],
  graphics:["metalVersion","positionX","positionY",'vramDynamic',"subDeviceId","pciBus","clockMemory","utilizationMemory"]
}
export default {
  props: {

  },
  components: {
    infoList,
    infoListTwoLayer
  },
  data() {
    return {
      isOneLayer: false,
      isTwoLayer: false,
      oneLayerType: ['system', 'osInfo', 'cpu', 'mem', 'baseboard', 'bios', 'baseboard'],//一层数据的模块类型
      twoLayerType: ['diskLayout', 'usb', 'audio', 'networkInterfaces', 'graphics', 'bluetoothDevices'],//2层数据的模块类型
      selectedName: "osInfo",
      infoData: null
    }
  },
  mounted() {
    this.getSystemInfomation()
  },
  created() {

  },
  beforeDestroy() {

  },
  methods: {
    onMenuClick(name) {
      this.selectedName = name
      this.getSystemInfomation()

    },
    getSystemInfomation() {
      this.api
        .post("/api/commonApi/getSystemInfomation", {
          type: this.selectedName
        })
        .then((res) => {
          if (!res.code) {
            if (res.data instanceof Object) {
              if (this.oneLayerType.includes(this.selectedName)) {
                this.isTwoLayer = false
                this.isOneLayer = true
              }

              if (this.twoLayerType.includes(this.selectedName)) {
                this.isTwoLayer = true
                this.isOneLayer = false
              }


              this.infoData = {}
              this.infoData.list = []
              this.infoData.type = this.selectedName

              if (this.isOneLayer) {
                for (let key in res.data) {
                  if (excludeList && excludeList[this.selectedName] && excludeList[this.selectedName].includes(key)) {
                    continue
                  }
                  let value = res.data[key]
                  if (this.selectedName == 'mem') {
                    //内存返回的数值是字节 转为gb
                    value = parseInt(value / 1024 / 1024 / 1024 * 100) / 100 + "GB"
                  }
                  this.infoData.list.push({
                    title: key,
                    value: value + ""
                  })
                }
              } else if (this.isTwoLayer) {
                let useData = []
                if (this.selectedName == "graphics") {
                  if (res.data.controllers) {
                    useData =useData.concat(res.data.controllers) 
                  }
                  if (res.data.displays) {
                    useData =useData.concat(res.data.displays) 
                  }
                } else {
                  useData = res.data
                }

                for (let key in useData) {
                  let valueObj = useData[key]
                  let subList = []
                  for (let keyb in valueObj) {
                    if (excludeList && excludeList[this.selectedName] && excludeList[this.selectedName].includes(keyb)) {
                      continue
                    }

                    if (this.selectedName == 'diskLayout' && keyb == "size") {
                      //内存返回的数值是字节 转为gb
                      valueObj[keyb] = parseInt(valueObj[keyb] / 1024 / 1024 / 1024 * 100) / 100 + "GB"
                    }

                    subList.push({
                      title: keyb,
                      value: valueObj[keyb] + ""
                    })
                  }
                  this.infoData.list.push({
                    type: this.selectedName,
                    title: key,
                    list: subList
                  })
                }
                console.log(this.infoData)

              }

            }
          }
        })
        .catch((error) => {
        });
    },
  }
}
</script>

<style lang="scss" scoped>
.sys-info-root {}
</style>
