<template>
	<div class="photos-root">
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
				<my-sidebar ref="sidebar" @onItemClick="setLeftMenuId" :optionList="sideOptionList"></my-sidebar>
			</div>
			<!-- 左侧边栏-手机 -->
			<div class="sidebar-mobile-root">
				<my-sidebar-mobile ref="sidebarMobile" @onItemClick="setLeftMenuId" :optionList="sideOptionList">
				</my-sidebar-mobile>
			</div>
			<!-- 右侧内容区域 -->
			<div class="right-layout">
				<photo-list v-if="leftMenuName == '1'"></photo-list>
				<photo-map v-if="leftMenuName == '2'"></photo-map>
				<ai-album v-if="leftMenuName == '3'"></ai-album>
				<ordinary-album v-if="leftMenuName == '4'"></ordinary-album>
				<folder v-if="leftMenuName == '5'"></folder>
				<photo-recent v-if="leftMenuName == '6'"></photo-recent>
				<photo-tools v-if="leftMenuName == '7'"></photo-tools>
				<trash v-if="leftMenuName == '9'"></trash>
				<photo-classes v-if="leftMenuName == '10'"></photo-classes>
				<photo-faces v-if="leftMenuName == '11'"></photo-faces>
			</div>
		</div>
	</div>
</template>
<script>
import myHeader from "@/components/my-header/my-header.vue"
import trash from "./photo-list/trash.vue"
import photoList from "./photo-list/photoList.vue"
import photoRecent from "./photo-list/photoRecent.vue"
import photoMap from "./photo-list/photoMap.vue"
import ordinaryAlbum from "./photo-list/ordinaryAlbum.vue"
import folder from "./photo-list/folder.vue"
import photoTools from "./photo-list/photoTools.vue"
import photoClasses from "./photo-list/photoClasses.vue"
import photoFaces from "./photo-list/photoFaces.vue"
import aiAlbum from "./photo-list/aiAlbum.vue"

export default {
	mounted() {

	},
	beforeDestroy() {
	},
	components: {
		photoClasses,
		myHeader,
		trash,
		photoList,
		photoMap,
		aiAlbum,
		folder,
		ordinaryAlbum,
		photoRecent,
		photoTools,
		photoFaces
	},
	data() {
		return {
			leftMenuName: "1",
			isCollapsed: false,
			sideOptionList: [{
				id: '1',
				title: this.$t('photo.timeline'),
				font: "nasIcons icon-timeline"
			},
			{
				id: '2',
				title: this.$t('photo.footprint'),
				font: "nasIcons icon-footprint"
			},
			{
				id: '3',
				title: this.$t('photo.aiAlbum'),
				font: "nasIcons icon-ai-album"
			},
			{
				id: '4',
				title: this.$t('photo.ordinaryAlbum'),
				font: "nasIcons icon-normal-album"
			},
			{
				id: '5',
				title: this.$t('photo.folder'),
				font: "nasIcons icon-folder-iew"
			},
			// {
			// 	id: '7',
			// 	title: this.$t('photo.tools'),
			// 	font: "nasIcons icon-tools"
			// },
			
			{
				id: '10',
				title: this.$t('photo.aiClasses'),
				font: "nasIcons icon-coco-class"
			},
			{
				id: '11',
				title: this.$t('photo.aiFace'),
				font: "nasIcons icon-face-detect"
			},
			{
				id: '6',
				title: this.$t('photo.recentCheck'),
				font: "nasIcons icon-recent"
			},
			{
				id: '9',
				title: this.$t('file.trashBin'),
				font: "nasIcons icon-trash"
			}
			]
		};
	},

	computed: {

	},
	methods: {
		setLeftMenuId(menuId) {
			this.leftMenuName = menuId
		},

	}
}
</script>
<style lang="scss" scoped>
.photos-root {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
}

.main-layout {
	display: flex;
	flex-direction: row;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.right-layout {
	@media not all and (max-width:640px) {
		min-width: 640px;
	}

	position: relative;
	flex: 2;
	height: 100%;
	width: 100%;
}
</style>
