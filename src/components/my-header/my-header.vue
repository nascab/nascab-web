<template>
	<div class="my-header-root" :style="{ 'background-color': bgColor, 'position': fixed ? 'fixed' : 'relative' }">
		<div class="my-header-left">
			<img src="@/static/common/naslogo.png" class="logo">
			<!-- pc端显示在左边 -->
			<vs-button v-if="showHome" @click="goHome()" class="iconBtn" style="margin-left: 30px;"
				animation-type="vertical">
				<img class="btnImg" src="@/static/home/icon-home.png" />
				<template #animate v-if="!isMobile">
					Home
				</template>
			</vs-button>
		</div>
		<!-- unreadMsgCount -->
		<div class="my-header-right">
			<!-- 手机端显示在右边 -->
			<vs-button @click="goHome()" v-if="showHome" class="iconBtn rightHomeBtn" animation-type="vertical">
				<img class="btnImg" src="@/static/home/icon-home.png" />
				<template #animate v-if="!isMobile">
					Home
				</template>
			</vs-button>
			<!-- 更换背景 -->
			<vs-button v-if="!showHome && currentUser" class="iconBtn" @click="switchBg" animation-type="vertical">
				<Icon type="md-refresh" size="25" class="btnIconFont" />
				<template #animate v-if="!isMobile">
					{{ $t('home.refreshBg') }}
				</template>
			</vs-button>
			<!-- 背景任务 -->

			<vs-button id="switchBg" class="iconBtn" v-if="currentUser" @click="switchBgTask" animation-type="vertical">
				<Icon type="md-pulse" size="25" class="btnIconFont" />
				<template #animate v-if="!isMobile">
					{{ $t('home.task') }}
				</template>
			</vs-button>
			<!-- 上传 -->
			<vs-button class="iconBtn" v-if="currentUser" @click="uploadClick" animation-type="vertical">
				<Icon type="md-arrow-round-up" size="25" class="btnIconFont" />
				<template #animate v-if="!isMobile">
					{{ $t('common.upload') }}
				</template>
			</vs-button>
			<!-- 消息 -->
			<Badge dot :offset="[7, 7]" overflow-count="99" :count="$store.state.unreadMsgCount"
				v-if="$store.state.currentUser.is_admin == 1">
				<vs-button id="checkMsg" class="iconBtn" @click="goPathNewWebView('/noticeCenter', $t('notice.info'))"
					animation-type="vertical">
					<img class="btnImg" src="@/static/home/icon-msg.png" />
					<template #animate v-if="!isMobile">
						{{ $t('notice.info') }}
					</template>
				</vs-button>
			</Badge>
			<vs-button class="iconBtn" v-if="currentUser" @click="showUserSetting = true" animation-type="vertical">
				<img class="btnImg" src="@/static/home/icon-my.png" />
				<template #animate v-if="!isMobile">
					{{ $t('home.mine') }}
				</template>
			</vs-button>
			<vs-button class="iconBtn" @click="goLogout" gradient animation-type="vertical">
				<img class="btnImg" src="@/static/home/icon-exit.png" />
				<template #animate v-if="!isMobile">
					{{ $t('user.logout') }}
				</template>
			</vs-button>
		</div>

		<vs-dialog prevent-close blur v-model="showUserSetting">
			<user-setting @onClose="showUserSetting = false"></user-setting>
		</vs-dialog>

		<!-- <Modal fullscreen footer-hide v-model="lockScreenIsShow" width='600' :mask-closable="false" :closable="false">
			<login v-if="lockScreenIsShow" :lockMode="true" @onLogin='lockScreenIsShow = false'></login>
		</Modal> -->
	</div>
</template>

<script>
import userSetting from "./user-setting.vue"
import login from "@/views/index/login.vue"
import jsBridge from "@/plugins/jsBridge"

export default {
	props: {
		bgColor: {
			default: "transparent",
			type: String
		},
		fixed: {
			default: true,
			type: Boolean
		}
	},
	components: {
		userSetting,
		login
	},
	computed: {

	},
	data() {
		return {
			showHome: true,
			lockScreenIsShow: false,
			currentUser: '',
			showUserSetting: false
		};
	},
	created() {
		if (this.$route.path == "/home") {
			this.showHome = false
		} else {
			this.showHome = true
		}
		this.currentUser = JSON.parse(localStorage.getItem("currentUser"))
	},
	methods: {
		uploadClick() {
			if (this.isFromApp) {
				this.switchUpload(true)
			} else {
				this.switchUpload()
			}
		},
		switchBg() {
			console.log('点击切换背景')
			this.$bus.$emit('onChangeBg')
		},
		lockScreen() {
			this.lockScreenIsShow = true
		},
		goLogout() {
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('header.okLogout'), () => {
				localStorage.removeItem('token')
				localStorage.removeItem('currentUser')
				localStorage.removeItem('autoLogin')
				this.showVsNotification(this.$t('header.logoutSuccess'))
				setTimeout(() => {
					if (this.isFromApp && jsBridge) {
						jsBridge.onClickLogout()
					} else {
						this.$router.push({
							path: '/login'
						})
					}
				}, 500)
			})
		}

	}
}
</script>

<style lang="scss" scoped>
.btnIconFont {
	font-size: 25px;
	color: white;
}

.my-header-root {
	z-index: 2;
	top: 0;
	left: 0;
	width: 100%;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;

	@media all and (max-width:640px) {
		//手机减少padding
		padding: 10px;
		justify-content: space-between;
		height: 80px;
	}

	@media not all and (max-width:640px) {
		justify-content: space-between;
		padding: 20px 30px;
		height: 80px;

		// 高度过低的情况下
		@media all and (max-height:640px) {
			padding: 10px 30px;
			height: 60px;
		}
	}


}

.my-header-left {
	float: left;
	position: relative;
	display: flex;
	flex-direction: row;
	align-items: center;

	@media all and (max-width:640px) {
		//手机不显示logo和home按钮
		display: none;
	}

	.logo {
		object-fit: contain;
		height: 30px;

		// 高度过低的情况下
		@media all and (max-height:640px) {
			height: 27px;
		}
	}
}

.rightHomeBtn {
	@media all and (min-width:450px) {
		//手机不显示logo和home按钮
		display: none;
	}
}

.iconBtn {
	@media not all and (max-width:640px) {
		//pc端设置图标间隙
		margin-left: 20px;
	}

	width: 40px;
	height: 40px;

	// 高度过低的情况下
	@media all and (max-height:640px) {
		height: 36px;
		width: 36px;
		margin-left: 10px;
	}
}

.btnImg {
	width: 25px;
	height: 25px;
}

.my-header-right {
	display: flex;
	flex-direction: row;
	align-items: center;

	@media all and (max-width:640px) {
		width: 100%;
		justify-content: flex-end;
	}
}
</style>
