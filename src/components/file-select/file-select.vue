<template>
	<div class="select-root">
		<div style="padding-bottom:80px">
			<folder-brower @onSelect="onSelect" :fileType="fileType" :initPath="initPath" :selectMode="true" ref="fileBrower"
				@onParentChange="onParentChange">
			</folder-brower>
		</div>
	</div>
</template>

<script>
import folderBrower from "@/components/folder-brower/folder-brower.vue"
import folderBrowerOperationBar from "@/components/folder-brower/folder-brower-operation-bar.vue"
import fileSelectBar from "@/components/file-select/file-select-bar.vue"

export default {
	props: {
		initPath: {
			default: '',
			type: String
		},
		fileType: { //显示的类型 0全部  2文件夹
			default: 2,
			type: Number
		}
	},
	components: {
		fileSelectBar,
		folderBrower,
		folderBrowerOperationBar
	},
	data() {
		return {
			disableBack: false
		}
	},
	methods: {
		goBack() {
			this.$refs.fileBrower.goBack()
		},
		onSelect(filePath) {
			this.$emit('onSelect', filePath)
		},
		// folderBrowerOperationBar中的选中按钮被点了
		onSelect() {
			console.log('onSelect')
			let selPath = this.$refs.fileBrower.getCurrentSelectedPath()
			if (selPath) {
				this.$emit('onSelect', selPath)
			}
		},
		onParentChange(path, isRoot) {
			this.disableBack = isRoot
		},
		createNewFolder(folderName) {
			this.$refs.fileBrower.createNewFolder(folderName)
		}
	}
}
</script>

<style lang="scss" scoped>


.select-root {
	height: 100%;
}

.operation-bar {
	border-top: 1px solid $nas-second;
	padding-right: 10px;
	height: 80px;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	background-color: white;
	right: 0;
	bottom: 0;
	position: absolute;
}
</style>
