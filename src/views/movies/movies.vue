<template>
	<div class="movies-root">
		<my-bg></my-bg>
		<!-- myheader占位 -->
		<div class="nas-mobile-none">
			<p class="my-header-position"></p>
		</div>
		<div class="nas-mobile-none">
			<my-header></my-header>
		</div>
		<!-- 主布局 -->
		<div class="main-layout nas-padding-right-zero">
			<!-- 左侧边栏 -->
			<div class="sidebar-root">
				<my-sidebar ref="sidebar" @onItemClick="setLeftMenuId" :optionList="sideOptionList"></my-sidebar>
			</div>
			<!-- 左侧边栏-手机 -->
			<div class="sidebar-mobile-root">
				<my-sidebar-mobile ref="sidebarMobile" @onItemClick="setLeftMenuId"
					:optionList="sideOptionList"></my-sidebar-mobile>
			</div>
			<!-- 影视列表 -->
			<div style="width: 100%;height: 100%;">
				<movie-list @setViewType="setViewType" v-if="viewType == 'list'" ref="movieList">
				</movie-list>
				<!-- 文件夹视图 -->
				<folder serverType="movie" v-if="viewType == 'folder'"></folder>
				<!-- 影音设置 -->
				<movie-set :hasPadding="true" serverType="movie" v-if="viewType == 'movieSet'"></movie-set>
				<source-set-movie :hasPadding="true" v-if="viewType == 'sourceSet'" sourceType="movie"></source-set-movie>
				<!-- 观看历史 -->
				<movie-history :hasPadding="true" v-if="viewType == 'history'"></movie-history>
				<!-- 我的影集 -->
				<movie-collection :hasPadding="true" v-if="viewType == 'collections'"></movie-collection>
				<movie-ai-collection :hasPadding="true" v-if="viewType == 'aiCollections'"></movie-ai-collection>
			</div>
		</div>
	</div>
</template>
<script>
import myHeader from "@/components/my-header/my-header.vue"
import movieList from "@/views/movies/movieList.vue"
import folder from "@/views/photos/photoPages/folderView.vue"
import movieSet from "@/views/movies/movieSet.vue"
import sourceSetMovie from "@/views/movies/movieSourceSet.vue"
import movieHistory from "@/views/movies/movieHistory.vue"
import movieCollection from "@/views/movies/movieCollection.vue"
import movieAiCollection from "@/views/movies/movieAiCollection.vue"

export default {
	mounted() {
	
	},
	beforeDestroy() {
	},
	components: {
		movieAiCollection,
		movieCollection,
		movieHistory,
		sourceSetMovie,
		myHeader,
		movieList,
		folder,
		movieSet
	},
	data() {
		return {
			viewType: 'list',
			sideOptionList: [{
				id: 'list',
				title: this.$t('movie.viewVideoList'),
				font: "nasIcons icon-movies-library"
			},
			{
				id: 'folder',
				title: this.$t('movie.viewFolder'),
				font: "nasIcons icon-folder-iew"
			},
			{
				id: 'history',//观看历史
				title: this.$t('movie.history'),
				font: "nasIcons icon-movie-history"
			},
			{
				id: 'aiCollections',//智能影集
				title: this.$t('movie.smartCollection'),
				font: "nasIcons icon-ai-album"
			},
			{
				id: 'collections',//我的影集
				title: this.$t('movie.collection'),
				font: "nasIcons icon-movie-collection"
			},{
				id: 'movieSet',
				title: this.$t('movie.movieSet'),
				font: "nasIcons icon-setting-system",
				onlyAdmin:true
			},
			{
				id: 'sourceSet',
				title: this.$t('setting.movieSourceSetting'),
				font: "nasIcons icon-movies-source",
				onlyAdmin:true
			}
		]
		};
	},
	computed: {

	},
	methods: {
		setViewType(viewType) {
			this.viewType = viewType
			this.$refs.sidebar.setSelectById(viewType)
			this.$refs.sidebarMobile.setSelectById(viewType)
		},
		setLeftMenuId(menu) {
			let menuId = menu.id
			this.viewType = menuId
		}
	}
}
</script>
<style lang="scss" scoped>
.movies-root {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
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
