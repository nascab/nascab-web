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
				<my-sidebar :initIndex="initIndex" ref="sidebar" @onItemClick="setLeftMenuId" :optionList="sideOptionList"></my-sidebar>
			</div>
			<!-- 左侧边栏-手机 -->
			<div class="sidebar-mobile-root">
				<my-sidebar-mobile :initIndex="initIndex" ref="sidebarMobile" @onItemClick="setLeftMenuId" :optionList="sideOptionList">
				</my-sidebar-mobile>
			</div>
			<!-- 右侧内容区域 -->
			<div class="right-layout">
				<slot></slot>
			</div>
		</div>
	</div>
</template>

<script>
import myHeader from "@/components/my-header/my-header.vue"

export default {
	props: {
		initIndex:{
			default: 0,
			type: Number
		}
	},
	components: {
		myHeader
	},
	data() {
		return {
			sideOptionList: [{
				id: '/photoTimeline',
				title: this.$t('photo.timeline'),
				font: "nasIcons icon-timeline"
			},
			{
				id: '/photoMap',
				title: this.$t('photo.footprint'),
				font: "nasIcons icon-footprint"
			},
			{
				id: '/aiAlbum',
				title: this.$t('photo.aiAlbum'),
				font: "nasIcons icon-ai-album"
			},
			{
				id: '/ordinaryAlbum',
				title: this.$t('photo.ordinaryAlbum'),
				font: "nasIcons icon-normal-album"
			},
			{
				id: '/photoFolderView',
				title: this.$t('photo.folder'),
				font: "nasIcons icon-folder-iew"
			},
			{
				id: '/photoAI',
				title: this.$t('photo.ai'),
				font: "nasIcons icon-face-detect"
			},
			// {
			// 	id: '/photoClasses',
			// 	title: this.$t('photo.aiClasses'),
			// 	font: "nasIcons icon-coco-class"
			// },
			// {
			// 	id: '/photoFaces',
			// 	title: this.$t('photo.aiFace'),
			// 	font: "nasIcons icon-face-detect"
			// },
			{
				id: '/photoRecent',
				title: this.$t('photo.recentCheck'),
				font: "nasIcons icon-recent"
			},
			{
				id: '/photoTrash',
				title: this.$t('file.trashBin'),
				font: "nasIcons icon-trash"
			}, {
				id: '/photoSourceSet',
				title: this.$t('setting.photoSourceSetting'),
				font: "nasIcons icon-setting-system"
			}
			]
		};
	},

	computed: {
		
	},
	methods: {

		setLeftMenuId(menu) {
			this.goPath(menu.id)
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
