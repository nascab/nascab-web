<template>
	<div class="bar-root">
		<!-- 上一级 -->
		<div>
			<my-btn-icon :disabled="isRoot" style="margin-right:10px;" iIcon="md-arrow-round-back"
				@click="$emit('onBack')"></my-btn-icon>
		</div>
		<!-- 新建文件夹 -->
		<!-- <my-btn style="margin-right:10px;" v-if="showCreateNew" :title="$t('file.newFolder')"
						@click="$refs.newFolderDialog.setShow(true)"></my-btn> -->
		<my-btn-icon style="margin-right:10px;" iIcon="md-add" @click="$refs.newFolderDialog.setShow(true)"></my-btn-icon>

		<!-- 改变图片大小 -->
		<Slider v-if="showSlider" class="zoom-slider" show-tip="never" v-model="sliderValue" :min="sliderMin"
			:max="sliderMax" :step="10" @on-input="onSizeChange">
		</Slider>
		<!-- 新建文件夹 -->
		<my-dialog-input @onOkClick="onCreateNewFolder" :showCloseBtn="true" ref="newFolderDialog"
			:title="$t('file.newFolder')" :content="$t('file.inputNewFolderName')">
		</my-dialog-input>
		<!-- 清除按钮 -->

		<div style="display:flex;align-items:center;position:absolute;right:20px">
			<!-- 搜索栏 -->
			<my-search v-if="showSearch" :placeholder="$t('movie.searchPlaceHolder')" @onSearch="onSearch"></my-search>
			<!-- 清除 -->
			<div @click="$emit('onClear')" v-if="showClearBtn" style="margin-left: 10px;">
				<my-btn type="red" :title="$t('common.clear')"></my-btn>
			</div>

			<!-- 上传到当前文件夹 -->
			<my-btn-icon iIcon="md-cloud-upload" style="margin-left:10px;"
				@click="$bus.$emit('onUploadToCurrentPath')"></my-btn-icon>
			<!-- 黏贴 -->
			<my-btn-icon v-if="!isRoot && showPaste" style="margin-left:10px;" iIcon="md-copy"
				@click="$emit('onCopy')"></my-btn-icon>
			<!-- 刷新 -->
			<my-btn-icon style="margin-left:10px;" iIcon="md-sync" @click="$emit('onRefresh')"></my-btn-icon>

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
		showSearch: {
			default: false,
			type: Boolean
		},
		showCreateNew: {
			default: true,
			type: Boolean
		},
		showSlider: {
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
			isRoot: false,
			showPaste: ""
		}
	},
	mounted() {
		this.$bus.$on('onShowPaste', (isShow) => {
			this.showPaste = isShow
		})
	},
	beforeDestroy() {
		this.$bus.$off("onShowPaste");
	},
	methods: {
		onSearch(searchValue) {
			this.$emit('onSearch', searchValue)
		},
		onCreateNewFolder(inputVal) {
			this.$emit('createNewFolder', inputVal)
		},
		onSizeChange() {
			this.$emit('onSliderChange', this.sliderValue)
		},
		onCutCopy(showPaste) {
			console.log("onCutCopy", showPaste)
			this.showPaste = showPaste
		},
		setShowPath(path, isRoot) {
			this.showPath = path
			this.isRoot = isRoot
		}
	}
}
</script>

<style lang="scss" scoped>
.bar-root {
	position: relative;
	width: 100%;
	height: 70px;
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
