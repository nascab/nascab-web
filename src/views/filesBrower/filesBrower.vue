<template>
	<div class="brower-root">
		<my-bg></my-bg>
		<!-- 顶部菜单栏 手机端不显示 -->
		<div class="nas-mobile-none">
			<p class="my-header-position"></p>
		</div>
		<div class="nas-mobile-none">
			<my-header></my-header>
		</div>

		<div class="main-layout nas-padding-right-zero">
			<!-- 左侧边栏 -->
			<div class="sidebar-root">
				<my-sidebar name="filebrower"  ref="sidebar" @onItemClick="setLeftMenuId" :optionList="sideOptionList"></my-sidebar>
			</div>
			<!-- 左侧边栏-手机 -->
			<div class="sidebar-mobile-root">
				<my-sidebar-mobile name="filebrower"  ref="sidebarMobile" @onItemClick="setLeftMenuId" :optionList="sideOptionList">
				</my-sidebar-mobile>
			</div>

			<files-operation-record v-if="menuActive == 'operation_record'"></files-operation-record>
			<!-- 所有用户共享的文件夹管理 -->
			<files-share-for-all v-else-if="menuActive == 'share_manage'"></files-share-for-all>
			<!-- 快速共享 -->
			<files-quick-share v-else-if="menuActive == 'share_temp'"></files-quick-share>
			<div v-else class="brower-list-root">
				<folder-brower-operation-bar ref="fileBar" style="position: absolute;left: 0;"
				@onClickOrder="onClickOrder"
					@onBack="$refs.fileBrowser.goBack()" :showSlider="!isMobile" @createNewFolder="createNewFolder"
					@onSliderChange="onSliderChange" :showSearch="menuActive == 'list'" :showClearBtn="menuActive != 'list'"
					@onClear="onClear" :showCreateNew="showCreateNew" @onRefresh="$refs.fileBrowser.refresh()"
					@onCopy="$refs.fileBrowser.copy()" @onSearch="(val) => $refs.fileBrowser.onSearch(val)">
				</folder-brower-operation-bar>
				<div style="width: 100%;height: 100%;overflow: hidden;padding-top: 60px;">
					<folder-brower style="width: 100%;height: 100%; z-index: 0;overflow-y: auto;" ref="fileBrowser"
						@onParentChange="onParentChange">
					</folder-brower>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import myHeader from "@/components/my-header/my-header.vue"
import folderBrower from "@/components/folder-brower/folder-brower.vue"
import folderBrowerOperationBar from "@/components/folder-brower/folder-brower-operation-bar.vue"
import filesOperationRecord from "./filesOperationRecord.vue"
import filesShareForAll from "./filesShareForAll.vue"
import filesQuickShare from "./filesQuickShare.vue"

export default {
	components: {
		myHeader,
		folderBrower,
		folderBrowerOperationBar,
		filesOperationRecord,
		filesShareForAll,
		filesQuickShare
	},
	data() {
		return {
			showCreateNew: true,
			sideOptionList: [{
				id: 'list',
				title: this.$t('file.fileList'),
				font: "nasIcons icon-file-list"
			}, {
				id: 'collect',
				title: this.$t('file.collect'),
				font: "nasIcons icon-file-collect"
			}, {
				id: 'recent',
				title: this.$t('file.recent'),
				font: "nasIcons icon-file-recent"
			}, {
				id: 'share_manage',
				title: this.$t('home.shareManage'),
				font: "nasIcons icon-white-list",
				onlyAdmin:true
			}, {
				id: 'share_temp',
				title: this.$t('home.shareTemp'),
				font: "nasIcons icon-link"
			}, {
				id: 'operation_record',
				title: this.$t('file.logs'),
				font: "nasIcons icon-log"
			}
			// 
		],
			menuActive: "list"
		}
	},
	mounted() {
		window.addEventListener("resize", this.onWindowResize);
		this.$nextTick(() => {
			let saveSliderValue = localStorage.getItem('folderImageSize')
			if (saveSliderValue && parseInt(saveSliderValue) >= 40) {
				this.$refs.fileBar.sliderValue = parseInt(saveSliderValue)
				this.onSliderChange(parseInt(saveSliderValue))
			}
		})
	},
	beforeDestroy() {
		window.removeEventListener("resize", this.onWindowResize);
		if (this.$refs.fileBar) localStorage.setItem('folderImageSize', this.$refs.fileBar.sliderValue)
	},
	methods: {
		onClear() {
			//清除按钮点击
			if (this.menuActive == 'recent') {
				this.$refs.fileBrowser.clearRecent('')
			} else if (this.menuActive == 'collect') {
				this.$refs.fileBrowser.clearCollect('')
			}
		},
		setLeftMenuId(menu) {
			let menuId = menu.id
			//从日志跳到文件列表 不刷新文件列表类型 否则会重复调用接口
			let shouldChangeShowType = true
			if (this.menuActive == "operation_record") shouldChangeShowType = false
			this.menuActive = menuId
			this.$nextTick(() => {
				if (this.$refs.fileBrowser && shouldChangeShowType) {
					this.$refs.fileBrowser.changeShowType(menuId)
				}
			})
		},
		onWindowResize(e) {
			if (this.$refs.fileBrowser) {
				this.$refs.fileBrowser.calImageWidth()
			}
		},
		onSliderChange(sliderValue) {
			//改变图标大小
			if (this.$refs.fileBrowser && this.$refs.fileBrowser.itemBaseWidth != sliderValue) {
				this.$refs.fileBrowser.setItemBaseWidth(sliderValue)
				this.$refs.fileBrowser.calImageWidth()
			}
		},
		onParentChange(path, isRoot) {
			this.$nextTick(() => {
				this.$refs.fileBar.setShowPath(path, isRoot)
			})
		},
		createNewFolder(folderName) {
			this.$refs.fileBrowser.createNewFolder(folderName)
		},
		onClickOrder(sortField,sortType){
			this.$refs.fileBrowser.onClickOrder(sortField,sortType)
		}
	}
}
</script>

<style scoped lang="scss">
.brower-root {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
}

.brower-list-root {
	position: relative;
	width: 100%;
	height: 100%;
	padding-left: 10px;
	padding-right: 10px;

	@media not all and (max-width:640px) {
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
		padding-left: 20px;
		padding-right: 20px;
	}

	background-color: rgba(255, 255, 255, 0.6);

}

.main-layout {
	position: relative;
	display: flex;
	flex-direction: row;
	width: 100%;
	height: 100%;
	overflow: hidden;
}
</style>
