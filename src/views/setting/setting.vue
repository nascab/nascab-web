<template>
	<div class="setting-root">
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
			<div class="setting-list-root">
				<!-- 通用设置 -->
				<common-set v-if="leftIndex == 'commonSetting'"></common-set>
				<!-- 用户管理 -->
				<user-manage v-if="leftIndex == 'userManage'"></user-manage>
				<!-- 系统设置 -->
				<system-set v-if="leftIndex == 'systemSetting'"></system-set>
				<!-- 远程访问 -->
				<remote-access v-if="leftIndex == 'remoteAccess'" @onToLogin="switchToNasLogin"></remote-access>
				<!-- nascab账号 -->
				<nascab-account ref="nasAccount" v-if="leftIndex =='nasAccount'"></nascab-account>
			</div>
		</div>
	</div>
</template>
<script>
import myHeader from "@/components/my-header/my-header.vue"
import userManage from "@/components/user-manage/user-manage.vue"
import fileSelect from "@/components/file-select/file-select.vue"
import commonSet from "@/views/setting/commonSet.vue"
import systemSet from "@/views/setting/systemSet.vue"
import nascabAccount from "@/views/setting/nascabAccount.vue"
import remoteAccess from "@/views/setting/remoteAccess.vue"

export default {
	mounted() {
		// 默认选中通用设置
		if (this.$route.query && this.$route.query.pageName) {
			this.$nextTick(() => {
				this.$refs.sidebar.setSelectById(this.$route.query.pageName)
				this.$refs.sidebarMobile.setSelectById(this.$route.query.pageName)
				this.leftIndex = this.$route.query.index
			})
		}

		if (this.$route.query.newToken && this.$route.query.newToken.length > 0) {
			//从微信内部网页登录跳转回来的
			this.$refs.sidebar.setSelectById("nasAccount")
			this.$refs.sidebarMobile.setSelectById("nasAccount")
			this.leftIndex = "nasAccount"
			this.$nextTick(() => {
				//使用token去登录
				this.$refs.nasAccount.userToken = this.$route.query.newToken
				this.$refs.nasAccount.tokenLogin()
			})
		}

	},
	beforeDestroy() {
	},
	components: {
		myHeader,
		userManage,
		fileSelect,
		commonSet,
		systemSet,
		nascabAccount,
		remoteAccess
	},
	data() {
		return {
			sideOptionList: [{
				id: 'commonSetting',
				title: this.$t('setting.commonSetting'),
				font: "nasIcons icon-setting-common"
			}, {
				id: 'userManage',
				title: this.$t('setting.userManage'),
				font: "nasIcons icon-setting-user"
			},
			{
				id: 'systemSetting',
				title: this.$t('setting.systemSetting'),
				font: "nasIcons icon-setting-system"
			},
			{
				id: 'remoteAccess',
				title: this.$t('nascab.remoteAccessMenu'),
				font: "nasIcons icon-download"
			},
			{
				id: 'nasAccount',
				title: this.$t('nascab.account'),
				font: "nasIcons icon-vip"
			}],
			leftIndex: 'commonSetting',
		}
	},
	computed: {

	},
	methods: {
		switchToNasLogin() {
			this.$refs.sidebar.setSelectById("nasAccount")
			this.$refs.sidebarMobile.setSelectById("nasAccount")
			this.leftIndex = "nasAccount"
		},

		setLeftMenuId(menu) {
			this.leftIndex = menu.id
		},
	}
}
</script>
<style lang="scss" scoped>
.setting-root {
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

.setting-list-root {
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
