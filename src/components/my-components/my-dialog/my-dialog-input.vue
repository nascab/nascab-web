<template>
	<!-- 提示性对话框 -->
	<div>
		<vs-dialog  :prevent-close="preventClose" :blur="isBlur" v-model="active" :not-close="!showCloseBtn">
			<template #header>
				<div style="display: flex;align-items: center;margin-top: 20px;">
					<img style="width: 22px;height: 22px;margin-right: 10px;"
						src="@/static/common/icon-dialog-alert.png" />
					<p style="color: #333333;font-size: 22px;text-align: center;">
						{{ title }}
					</p>
				</div>
			</template>
			<!-- 内容 -->
			<div style="word-break: break-all;text-align: left;max-width: 100%;">
				{{ content ? content : title }}
			</div>
			<!-- 输入框 -->
			<vs-input @keyup.enter="onBtnClick" :type="isPwd ? 'password' : 'text'" v-model="inputValue" :placeholder="placeholder"  @keydown.down="onBtnClick">
				<template #icon>
					<p>?</p>
				</template>
			</vs-input>
			<!-- <vs-tooltip >
				<template #tooltip>
					<div style="word-break: break-all;">
						{{content?content:title}}
					</div>
				</template>
			</vs-tooltip> -->

			<template #footer>
				<div style="margin-top: 20px;margin-bottom: 10px;">
					<!-- 按钮 -->
					<vs-button block @click="onBtnClick">
						{{ btTitle }}
					</vs-button>
				</div>
			</template>
		</vs-dialog>
	</div>
</template>

<script>
export default {
	props: {
		isPwd: {
			default: false,
			type: Boolean,
		},
		clearOnOpen: {//每次打开的时候是否清空input值
			default: false,
			type: Boolean,
		},
		closeOnClickBtn: {//点击确认的时候是否将对话框关闭
			default: true,
			type: Boolean,
		},
		showCloseBtn: {
			default: false,
			type: Boolean,
		},
		//标题
		isBlur: {
			default: false,
			type: Boolean,
		},
		placeholder: {
			default: "",
			type: String,
		},
		preventClose: {
			default: false,
			type: Boolean,
		},
		//标题
		title: {
			default: function () {
				return this.$t("common.alert")
			},
			type: String,
		},
		//内容
		content: {
			default: "",
			type: String,
		},
		initValue: {
			default: "",
			type: String,
		},
		//按钮内容
		btTitle: {
			default: function () {
				return this.$t("common.ok")
			},
			type: String,
		},
	},
	components: {},
	data() {
		return {
			inputValue: "",
			active: false
		};
	},
	created() {

	},
	methods: {
		onBtnClick() {
			if (this.closeOnClickBtn) {
				this.active = false
			}
			this.$emit('onOkClick', this.inputValue)
		},
		setShow(isShow) {
			this.$nextTick(() => {
				if (isShow) {
					if (this.clearOnOpen) {
						this.inputValue = ''
					}
					if (this.initValue) {
						this.inputValue = this.initValue
					}
				}
				this.active = isShow
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.content-str {
	font-size: 16px;
	color: $nas-text-content;
}

::v-deep .vs-input-content {
	margin: 10px 0px;
	width: calc(100%);
}

::v-deep .vs-input {
	width: 100%;
}
</style>
