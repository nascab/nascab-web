<template>
	<div style="display: flex;flex-direction: column;align-items: center;justify-content: center;">
		<img style="width: 145px;height: 145px;object-fit: contain;" src="@/static/common/icon-no-data.png" />
		<div class="alert-text" style="margin-top: 15px;">{{title}}</div>
		<my-btn v-if="btnTitle" @click="onBtnClick" :title="btnTitle" style="margin-top: 18px;"></my-btn>
	</div>

</template>

<script>
	export default {
		props: {
			title: {
				default: "",
				type: String
			},
			btnTitle: {
				default: "",
				type: String
			}
		},
		components: {},
		data() {
			return {};
		},
		created() {

		},
		methods: {
			onBtnClick() {
				this.$emit('onBtnClick')
			}
		}
	}
</script>

<style lang="scss" scoped>
	.alert-text {
		word-break: break-all;
		font-size: 16px;
		color: #666;
		max-width: 350px;
		
	}
</style>

