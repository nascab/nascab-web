<template>
	<div class="select-root">
		<div class="nas-mobile-none">
			<div class="operation-bar">
				<my-btn type="white" @click="$emit('back')" :title="$t('file.returnLastPath')"></my-btn>
				<my-btn @click="$refs.newFolderDialog.setShow(true)" :title="$t('file.newFolder')"></my-btn>
				<my-btn @click="onChoose()" type="red" :title="$t('common.select')"></my-btn>
			</div>
		</div>
		<div class="nas-mobile-show">
			<div class="operation-bar">
				<my-btn type="white" @click="$emit('back')" :title="$t('file.returnLastPath')"></my-btn>
				<my-btn @click="$refs.newFolderDialog.setShow(true)" :title="$t('file.newFolder')"></my-btn>
				<my-btn @click="onChoose()" type="red" :title="$t('common.select')"></my-btn>
			</div>
		</div>
		<!-- 新建文件夹对话框 -->
		<my-dialog-input @onOkClick="createNewFolder" :showCloseBtn="true" ref="newFolderDialog"
			:title="$t('file.newFolder')" :content="$t('file.inputNewFolderName')">
		</my-dialog-input>
	</div>
</template>

<script>
import folderBrowerOperationBar from "@/components/folder-brower/folder-brower-operation-bar.vue"
export default {
	name:"file-select-bar",
	props: {
		fileBrower: {
			default: null,
			type: Object
		},
	},
	components: {
		folderBrowerOperationBar
	},
	data() {
		return {
			disableBack: false
		}
	},
	methods: {
		createNewFolder(folderName) {
			this.$emit('create', folderName)
		},
		onChoose() {
			this.$emit('select')
		}
	}
}
</script>

<style lang="scss" scoped>
.select-root {
	height: 100%;
}

.operation-bar {
	border-bottom-left-radius: 20px;
	border-bottom-right-radius: 20px;
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
