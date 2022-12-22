<template>
	<!-- 选择对话框 -->
	<div >
		<vs-dialog  prevent-close :blur="isBlur" v-model="active" :not-close="!showCloseBtn">
			<template #header>
				<h4 style="color: #333333;font-size: 22px;margin-top: 20px;">
					{{title}}<b>{{titleB}}</b>
				</h4>
			</template>
			<!-- 提示内容 -->
			<div style="justify-content: center;align-items: center;display: flex;">
				<vs-select :placeholder="placeholder" v-model="selectedValue">
					<vs-option v-for="option in options" :label="option.label" :value="option.value">
						{{option.label}}
					</vs-option>
				</vs-select>
			</div>

			<template #footer>
				<div style="margin-top: 30px;margin-bottom: 10px;">
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
			showCloseBtn: {
				default: false,
				type: Boolean,
			},
			//标题
			isBlur: {
				default: false,
				type: Boolean,
			},
			//标题
			title: {
				default: "NasCab",
				type: String,
			},

			placeholder: {
				default: "",
				type: String,
			},
			//标题中加粗部分
			titleB: {
				default: "",
				type: String,
			},
			options: { //选项数组 [{label:xx,value:xx}]
				default: [],
				type: Array,
			},
			//按钮内容
			btTitle: {
				default: function() {
					return this.$t("common.select")
				},
				type: String,
			},
		},
		components: {},
		data() {
			return {
				selectedValue: '',
				active: false
			};
		},
		created() {

		},
		methods: {
			onBtnClick() {
				if(!this.selectedValue){
					return
				}
				this.active = false
				this.$emit('onOkClick',this.selectedValue)
			},
			setShow(isShow) {
				this.active = isShow
			}
		}
	}
</script>

<style lang="scss" scoped>
	::v-deep .vs-select {
	}
</style>
