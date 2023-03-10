<template>
	<div class="share-root">
		<my-bg></my-bg>
		<!-- 顶部菜单栏 手机端不显示 -->
		<div class="nas-mobile-none">
			<p class="my-header-position"></p>
		</div>
		<div class="nas-mobile-none">
			<my-header></my-header>
		</div>


		<div class="main-layout  nas-padding-right-zero">
			<!-- 左侧边栏 -->
			<div class="sidebar-root">
				<my-sidebar ref="sidebar" @onItemClick="setLeftMenuId" :optionList="sideOptionList"></my-sidebar>
			</div>
			<!-- 左侧边栏-手机 -->
			<div class="sidebar-mobile-root">
				<my-sidebar-mobile ref="sidebarMobile" @onItemClick="setLeftMenuId" :optionList="sideOptionList">
				</my-sidebar-mobile>
			</div>
			<div class="share-list-root">
				<share-list1 serverType="WebDav" v-if="selectMenu == '1'"></share-list1>
				<share-list2 serverType="FTP" v-if="selectMenu == '2'"></share-list2>
			</div>
		</div>
	</div>
</template>

<script>
import myHeader from "@/components/my-header/my-header.vue"
import shareList1 from "@/views/fileShare/shareList.vue"
import shareList2 from "@/views/fileShare/shareList.vue"

export default {
	components: {
		myHeader,
		shareList1,
		shareList2
	},
	data() {
		return {
			sideOptionList: [{
				id: '1',
				title: this.$t('share.WebDav'),
				font: "nasIcons icon-webdav"
			}, {
				id: '2',
				title: this.$t('share.FTP'),
				font: "nasIcons icon-ftp"
			}],
			selectMenu: "1"
		}
	},
	mounted() { 

	},
	beforeDestroy() {
	},
	methods: {


		setLeftMenuId(menu) {
			let menuId=menu.id
			this.selectMenu = menuId
		},
		onSelectMenu(name) {
			this.selectMenu = name
		}
	}
}
</script>

<style lang="scss" scoped>
.share-root {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
}

.share-list-root {
	position: relative;
	width: 100%;
	height: 100%;
	background-color: rgba(255, 255, 255, 0.6);

	@media not all and (max-width:640px) {
		padding-left: 20px;
		padding-right: 20px;
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
	}
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
