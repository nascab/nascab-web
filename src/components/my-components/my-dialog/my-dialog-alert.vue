<template>
	<!-- 提示性对话框 -->
	<div>
		<vs-dialog :prevent-close="preventClose" :blur="isBlur"  v-model="active" :not-close="!showCloseBtn">
			<template #header>
				<div style="display: flex;align-items: center;margin-top: 20px;">
					<img style="width: 22px;height: 22px;margin-right: 10px;" src="@/static/common/icon-dialog-alert.png"/>
					<p style="color: #333333;font-size: 22px;text-align: center;">
						{{title}}
					</p>
				</div>
			</template>
			<!-- 提示内容 -->
			<div style="color: #99AABF;font-size: 14px;word-break: break-all;">
				{{content}}
			</div>
			<template #footer>
				<div style="margin-top: 20px;margin-bottom: 10px;">
					<!-- 按钮 -->
					<vs-button block @click="onBtnClick">
						{{btTitle}}
					</vs-button>
				</div>
			</template>
		</vs-dialog>
	</div>
</template>

<script>
	export default {
		props: {
			showCloseBtn:{
				default: false,
				type: Boolean,
			},
			//标题
			isBlur: {
				default: false,
				type: Boolean,
			},
			preventClose: {
				default: false,
				type: Boolean,
			},
			//标题
			title: {
				default: "",
				type: String,
			},
			//内容
			content: {
				default: "",
				type: String,
			},
			//按钮内容
			btTitle: {
				default: function() {
					return this.$t("common.iSee")
				},
				type: String,
			},
		},
		components: {},
		data() {
			return {
				active: false
			};
		},
		created() {
			
		},
		methods: {
			onBtnClick(){
				this.active = false
				this.$emit('onOkClick')
			},
			setShow(isShow) {
				this.active = isShow
			}
		}
	}
</script>

<style lang="scss" scoped>
</style>
