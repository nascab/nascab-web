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

export default {
	mounted() {
		if(this.$store.state.currentUser.is_admin == 1){
			this.sideOptionList.push({
				id: 'movieSet',
				title: this.$t('movie.movieSet'),
				font: "nasIcons icon-movies-source"
			})	
			this.sideOptionList.push({
				id: 'sourceSet',
				title: this.$t('setting.movieSourceSetting'),
				font: "nasIcons icon-setting-system"
			})	
		}
	},
	beforeDestroy() {
	},
	components: {
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
			}
			]
		};
	},
	computed: {

	},
	methods: {
		setViewType(viewType){
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
