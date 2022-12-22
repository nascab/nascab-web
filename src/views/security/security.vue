<template>
	<div class="security-root">
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
			<div class="security-list-root">
				<!-- 安全设置 -->
				<div style="height:100%;padding-bottom:20px" v-if="leftIndex == 1">
					<security-set></security-set>
				</div>

				<!-- 安全日志 pc-->
				<div style="height:100%" class="nas-mobile-none" v-if="leftIndex == 2">
					<login-records></login-records>
				</div>

				<!-- 安全日志 mobile-->
				<div style="height:100%" class="nas-mobile-show" v-if="leftIndex == 2">
					<login-records-mobile></login-records-mobile>
				</div>

				<!-- 黑名单 pc-->
				<div style="height:100%" class="nas-mobile-none" v-if="leftIndex == 3">
					<ip-list-black type="black"></ip-list-black>
				</div>
				<!-- 黑名单 mobile-->
				<div style="height:100%" class="nas-mobile-show" v-if="leftIndex == 3">
					<ip-list-black-mobile type="black"></ip-list-black-mobile>
				</div>

				<!-- 白名单 pc-->
				<div  style="height:100%" class="nas-mobile-none" v-if="leftIndex == 4">
					<ip-list-white type="white"></ip-list-white>
				</div>
				<!-- 白名单 mobile-->
				<div style="height:100%" class="nas-mobile-show" v-if="leftIndex == 4">
					<ip-list-white-mobile type="white"></ip-list-white-mobile>
				</div>
			</div>
		</div>

	</div>
</template>
<script>
import securitySet from "@/views/security/securitySet.vue"
import myHeader from "@/components/my-header/my-header.vue"
import loginRecords from "@/views/security/loginRecords.vue"
import ipListBlack from "@/views/security/ipList.vue"
import ipListWhite from "@/views/security/ipList.vue"
import loginRecordsMobile from "@/views/security/loginRecordsMobile.vue"
import ipListBlackMobile from "@/views/security/ipListMobile.vue"
import ipListWhiteMobile from "@/views/security/ipListMobile.vue"
export default {
	mounted() {

	},
	beforeDestroy() {
	},
	components: {
		ipListBlackMobile,
		ipListWhiteMobile,
		loginRecordsMobile,
		securitySet,
		myHeader,
		loginRecords,
		ipListBlack,
		ipListWhite
	},

	data() {
		return {
			sideOptionList: [{
				id: '1',
				title: this.$t('setting.securitySetting'),
				font: "nasIcons icon-security"
			}, {
				id: '2',
				title: this.$t('security.logs'),
				font: "nasIcons icon-log"
			}, {
				id: '3',
				title: this.$t('security.blackList'),
				font: "nasIcons icon-black-list"
			}, {
				id: '4',
				title: this.$t('security.whiteList'),
				font: "nasIcons icon-white-list"
			}],
			leftIndex: '1',
		}
	},
	computed: {

	},
	methods: {

		setLeftMenuId(menuId) {
			this.leftIndex = menuId
		},
	}
}
</script>
<style lang="scss" scoped>
.security-root {
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

.security-list-root {
	padding-top: 20px;
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
</style>
