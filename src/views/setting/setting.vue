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
				<common-set v-if="leftIndex == 1"></common-set>
				<source-set-photo v-if="leftIndex == 2" sourceType="photo"></source-set-photo>
				<source-set-movie v-if="leftIndex == 3" sourceType="movie"></source-set-movie>
				<!-- 用户管理 -->
				<user-manage v-if="leftIndex == 4"></user-manage>
				<!-- 系统设置 -->
				<system-set v-if="leftIndex == 5"></system-set>
				<!-- 远程访问 -->
				<remote-access v-if="leftIndex == 6" @onToLogin="switchToNasLogin"></remote-access>
				<!-- nascab账号 -->
				<nascab-account ref="nasAccount" v-if="leftIndex == 7"></nascab-account>
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
import sourceSetPhoto from "@/views/setting/sourceSet.vue"
import sourceSetMovie from "@/views/setting/sourceSet.vue"
import nascabAccount from "@/views/setting/nascabAccount.vue"
import remoteAccess from "@/views/setting/remoteAccess.vue"

export default {
	mounted() {
		// 默认选中通用设置
		if (this.$route.query && this.$route.query.index) {
			this.$nextTick(() => {
				this.$refs.sidebar.setIndex(parseInt(this.$route.query.index) - 1)
				this.leftIndex = this.$route.query.index
			})
		}

		if (this.$route.query.newToken && this.$route.query.newToken.length > 0) {
			//从微信内部网页登录跳转回来的
			this.$refs.sidebar.setIndex(6)
			this.leftIndex = 7
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
		sourceSetPhoto,
		sourceSetMovie,
		nascabAccount,
		remoteAccess
	},
	data() {
		return {
			sideOptionList: [{
				id: '1',
				title: this.$t('setting.commonSetting'),
				font: "nasIcons icon-setting-common"
			}, {
				id: '2',
				title: this.$t('setting.photoSourceSetting'),
				font: "nasIcons icon-photos-source"
			}, {
				id: '3',
				title: this.$t('setting.movieSourceSetting'),
				font: "nasIcons icon-movies-source"
			}, {
				id: '4',
				title: this.$t('setting.userManage'),
				font: "nasIcons icon-setting-user"
			},
			{
				id: '5',
				title: this.$t('setting.systemSetting'),
				font: "nasIcons icon-setting-system"
			},
			{
				id: '6',
				title: this.$t('nascab.remoteAccessMenu'),
				font: "nasIcons icon-download"
			},
			{
				id: '7',
				title: this.$t('nascab.account'),
				font: "nasIcons icon-vip"
			}],
			leftIndex: '1',
		}
	},
	computed: {

	},
	methods: {
		switchToNasLogin() {
			this.$refs.sidebar.setIndex(parseInt(6))
			this.leftIndex = 7
		},

		setLeftMenuId(menuId) {
			this.leftIndex = menuId
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
