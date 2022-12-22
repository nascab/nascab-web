<template>
	<!-- 提示性对话框 -->
	<div>
		<vs-dialog :prevent-close="preventClose" :blur="isBlur" v-model="active" :not-close="!showCloseBtn">
			<template #header>
				<div style="display: flex;align-items: center;margin-top: 20px;">
					<img style="width: 22px;height: 22px;margin-right: 10px;"
						src="@/static/common/icon-dialog-alert.png" />
					<p style="color: #333333;font-size: 22px;text-align: center;">
						{{title}}
					</p>
				</div>
			</template>
			<!-- 提示内容 -->
			<div style="max-width: 386px;color: #99AABF;font-size: 14px;word-break: break-all;">
				{{content}}
			</div>
			<template #footer>
				<div
					style="margin-top: 20px;margin-bottom: 10px;display: flex;align-items: center;justify-content: center;">
					<!-- 按钮 -->
					<vs-button  class="cancelBtn" block @click="onCancelClick">
						{{btCancelTitle}}
					</vs-button>
					<!-- 按钮 -->
					<vs-button :danger="isDanger" :loading="okBtnIsLoading" class="confirmBtn" block @click="onOkClick">
						{{btOkTitle}}
					</vs-button>
				</div>
			</template>
		</vs-dialog>
	</div>
</template>

<script>
	export default {
		props: {
			showCloseBtn: {
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
				default: function() {
					return this.$t("common.confirm")
				},
				type: String,
			},
			//内容
			content: {
				default: "NasCab",
				type: String,
			},
			//取消按钮内容
			btCancelTitle: {
				default: function() {
					return this.$t("common.cancel")
				},
				type: String,
			},
			//确定按钮内容
			btOkTitle: {
				default: function() {
					return this.$t("common.ok")
				},
				type: String,
			},
		},
		components: {},
		data() {
			return {
				okBtnIsLoading:false,
				active: false,
				enableTimer:null,
				isDanger:false
			};
		},
		created() {

		},
		methods: {
			onCancelClick() {
				this.active = false
				this.$emit('onCancelClick')
			},
			onOkClick() {
				this.active = false
				this.$emit('onOkClick')
			},
			setShow(isShow,enableTime,isDanger) {
				this.okBtnIsLoading=false
				if(this.enableTimer){
					clearTimeout(this.enableTimer)
				}
				//enableTime确认按钮需要在多少秒以后才能使用 避免用户无操作 比如删除
				if(enableTime&&enableTime>0){
					this.okBtnIsLoading=true
					this.enableTimer=setTimeout(() => {
						this.okBtnIsLoading=false
					}, enableTime);
				}
				if(isDanger){
					this.isDanger=true
				}else{
					this.isDanger=false
				}
				this.active = isShow
			}
		}
	}
</script>

<style lang="scss" scoped>
	.cancelBtn{
		background-color: $nas-second;
		margin-right: 20px;
		width: 110px;
		height: 40px;
		border-radius: 27px;
	}
	.confirmBtn {
		width: 110px;
		height: 40px;
		border-radius: 27px;
	}
</style>
