<template>
	<div class="bar-root">

		<div >
			<my-btn-icon :disabled="disableBtn" style="margin-right:10px;" iIcon="md-arrow-up" @click="$emit('onBack')"></my-btn-icon>
		</div>

		<my-btn style="margin-right:10px;" v-if="showCreateNew" :title="$t('file.newFolder')"
			@click="$refs.newFolderDialog.setShow(true)"></my-btn>
		<my-btn  v-if="selectMode" :title="$t('upload.selectFolder')"
			@click="$emit('onSelectClick')"></my-btn>
		<!-- 改变图片大小 -->
		<Slider v-if="showSlider" class="zoom-slider" show-tip="never" v-model="sliderValue" :min="sliderMin"
			:max="sliderMax" :step="10" @on-input="onSizeChange">
		</Slider>
		<!-- <p v-if="showCurrentPath" style="margin-left: 20px;text-align: left;">{{ showPath }}</p> -->
		<!-- 新建文件夹 -->
		<my-dialog-input @onOkClick="onCreateNewFolder" :showCloseBtn="true" ref="newFolderDialog"
			:title="$t('file.newFolder')" :content="$t('file.inputNewFolderName')">
		</my-dialog-input>
		<!-- 清除按钮 -->
		<div @click="$emit('onClear')" v-if="showClearBtn&&!selectMode" style="margin-left: 10px;position:absolute;right:20px">
			<my-btn type="red" :title="$t('common.clear')"></my-btn>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		showClearBtn: {
			default: true,
			type: Boolean
		},
		showCurrentPath: {
			default: true,
			type: Boolean
		},
		showCreateNew: {
			default: true,
			type: Boolean
		},
		showSlider: {
			default: false,
			type: Boolean
		},
		selectMode: { //选择模式
			default: false,
			type: Boolean
		}
	},
	computed: {},
	data() {
		return {
			sliderMin: 100,
			sliderMax: 200,
			sliderValue: 100,
			newFolderName: "",
			showPath: '',
			disableBtn: false
		}
	},
	methods: {
		onCreateNewFolder(inputVal) {
			this.$emit('createNewFolder', inputVal)
		},
		onSizeChange() {
			this.$emit('onSliderChange', this.sliderValue)
		},
		setShowPath(path, isRoot) {
			this.showPath = path
			this.disableBtn = isRoot
		}
	}
}
</script>

<style lang="scss" scoped>
.bar-root {
	position: relative;
	width: 100%;
	height: 80px;
	display: flex;
	align-items: center;
	padding-left: 10px;
	padding-right: 10px;

	@media not all and (max-width:640px) {
		padding-left: 30px;
		padding-right: 30px;
	}

}

.zoom-slider {
	flex-shrink: 0;
	margin-left: 20px;
	width: 60px;
	display: inline-flex;

	@media all and (max-width:640px) {
		width: 40px;
		margin-left: 10px;
	}
}
</style>
