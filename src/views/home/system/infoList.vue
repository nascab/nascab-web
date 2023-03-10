<template>
  <div >
    <info-item-key-value  v-for="info in infoData.list" :title="info.title" :value="info.value" :type="infoData.type"></info-item-key-value>
    <div v-if="!infoData" style="margin-top:30px ;">Loading...</div>
  </div>
</template>

<script>

import infoItemKeyValue from "@/views/home/system/infoItemKeyValue"



export default {
  props: {
    infoData: {
      default: null,
      type: Object
    }
  },
  components: {
    infoItemKeyValue
  },
  data() {
    return {
    }
  },
  mounted() {
  },
  created() {

  },
  beforeDestroy() {

  },
  methods: {
    onMenuClick(name) {
      this.selectedName = name
    }
  }
}
</script>

<style lang="scss" scoped></style>
