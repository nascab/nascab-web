<template>
	<div class="backup-root">
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

			<div class="backup-list-root">
				<!-- 全部 -->
				<backup-list-0 v-if="selectMenu == '0'" :taskType="'0'"></backup-list-0>
				<!-- 一次 -->
				<backup-list-1 v-if="selectMenu == '1'" :taskType="'1'"></backup-list-1>
				<!-- 每天 -->
				<backup-list-2 v-if="selectMenu == '2'" :taskType="'2'"></backup-list-2>
				<!-- 每周 -->
				<backup-list-3 v-if="selectMenu == '3'" :taskType="'3'"></backup-list-3>
				<!-- 每月 -->
				<backup-list-4 v-if="selectMenu == '4'" :taskType="'4'"></backup-list-4>
			</div>
		</div>
	</div>
</template>

<script>
import myHeader from "@/components/my-header/my-header.vue"
import backupList0 from "@/views/fileBackup/backupList.vue"
import backupList1 from "@/views/fileBackup/backupList.vue"
import backupList2 from "@/views/fileBackup/backupList.vue"
import backupList3 from "@/views/fileBackup/backupList.vue"
import backupList4 from "@/views/fileBackup/backupList.vue"

export default {
	components: {
		myHeader,
		backupList0,
		backupList1,
		backupList2,
		backupList3,
		backupList4
	},
	data() {
		return {
			sideOptionList: [{
				id: '0',
				title: this.$t('common.all'),
				font: "nasIcons icon-backup"
			}, {
				id: '1',
				title: this.$t('backup.oneTime'),
				font: "nasIcons icon-backup"
			}, {
				id: '2',
				title: this.$t('backup.everyDay'),
				font: "nasIcons icon-backup"
			}, {
				id: '3',
				title: this.$t('backup.everyWeek'),
				font: "nasIcons icon-backup"
			}, {
				id: '4',
				title: this.$t('backup.everyMonth'),
				font: "nasIcons icon-backup"
			}],
			selectMenu: "0"
		}
	},
	mounted() {

	},
	beforeDestroy() {
	},
	methods: {
		setLeftMenuId(menuId) {
			this.selectMenu = menuId
		},
	}
}
</script>

<style lang="scss" scoped>
.backup-root {
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

.backup-list-root {
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
</style>
