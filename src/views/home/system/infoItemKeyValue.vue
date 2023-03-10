<template>
  <div style="margin-bottom:10px" v-if="value&&value!='null'">
    <div style="display:flex;align-items:center">
      <Icon type="ios-information-circle-outline" />
      <p style="margin-left:3px;" class="title">{{ $t(`system.info.${type}.${title}`) }}:</p>
    </div>
    <div style="margin-left:17px;margin-top: 5px;">
        <div @click="copyText(value ? value : '--')" class="value max-line-one enable-text-select" v-if="value != 'false' && value != 'true'">{{ value ? value : "--" }}</div>
        <div class="value" v-if="value == 'false' || value == 'true'">{{ value == 'true' ? $t("common.yes") : $t("common.no") }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      default: "system",
      type: String
    },
    title: {
      default: "",
      type: String
    },
    value: {
      default: ""
    },
  },
  components: {

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

  }
}
</script>

<style lang="scss" scoped>
.title{
  color:$nas-text-title;
}
.value{
  color:$nas-text-grey;
}
</style>
