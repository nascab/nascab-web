<template>
	<div class="login-root">

		<!-- 左上角logo -->
		<img style="position: fixed;left: 60px;top: 40px;width: 150px;object-fit: contain;"
			src="@/static/common/naslogo.png" mode="widthFix" />

		<div style="display: flex;height: 100%;width: 100%;align-items: center;justify-content: center;">
			<!-- 左边图 -->
			<img src="@/static/login/login-left-img.png" class="left-img" />

			<!-- 右边表单 -->
			<div style="display: flex;flex-direction: column;align-items: center;">
				<!-- title -->
				<div style="margin-bottom: 50px;width: 100%;padding-left: 10px;padding-right: 10px;">
					<div style="font-size:28px;">{{ $t('common.welcomeToNasCab') }}</div>
					<div v-if="hostName">{{$t('system.hostName')}}:{{hostName}}</div>
				</div>
				<!-- 用户名 -->
				<vs-input type="text" color="#F6FAFF" v-model="formInline.username"
					:placeholder="$t('registerAdmin.placeholderUsername')">
					<template #icon>
						<img src="@/static/login/icon-username.png" class="input-icon" />
					</template>
				</vs-input>
				<!-- 密码 -->
				<vs-input type="password" style="margin-top: 30px;" color="#F6FAFF" v-model="formInline.password"
					:placeholder="$t('registerAdmin.placeholderPassword')">
					<template #icon>
						<img src="@/static/login/icon-password.png" class="input-icon" />
					</template>
				</vs-input>
				<!-- 用户协议和隐私协议 -->
				<div
					style="display:flex;align-items: center;justify-content: flex-start;width: 100%;margin-top: 20px;padding-left: 10px;">
					<Checkbox v-model="agreeValue"></Checkbox>
					<span>{{ $t("login.agree") }}</span>
					<a :href="axios.nasCabBaseUrl + '/others/privacy.html'" target="_blank">{{ $t("login.privacy")
					}}</a>
					<span>{{ $t("common.and") }}</span>
					<a :href="axios.nasCabBaseUrl + '/others/agreement.html'" target="_blank">{{ $t("login.agreement")
					}}</a>
				</div>
				<!-- 登录 -->
				<vs-button @click="handleSubmit()"
					style="height: 54px;border-radius: 27px;font-size: 20px;margin-top: 30px;width: 280px;">
					{{ lockMode ? $t('login.unlockScreen') : $t('login.btLogin') }}
				</vs-button>
				<!-- 忘记密码 -->
				<vs-button v-if="!lockMode" @click="$refs.goForgetConfirm.setShow(true)" style="margin-top: 20px;"
					border>{{ $t('login.forgotPwd')
					}}
				</vs-button>
				<!-- 需要从局域网连接 -->
				<div style="padding:20px" v-if="isRemote">
					<div>{{$t('nascab.conFromLan')}}</div>
					<a :href="lanIpPort">{{lanIpPort}}</a>
				</div>
			</div>
		</div>

		<my-dialog-confirm @onOkClick="goForgotPwd" ref="goForgetConfirm" :content="$t('login.getPwdOnlyForAdmin')">
		</my-dialog-confirm>
		<!-- 两步验证对护框 -->
		<my-dialog-input @onOkClick="onAnswerInput" :placeholder="$t('resetPwd.placeholderAnswer')" :showCloseBtn="true"
			ref="twoStepDialog" :content="$t('resetPwd.question') + question"
			:title="$t('setting.security.loginNeedAnswer')">
		</my-dialog-input>
	</div>
</template>

<script>
import axios from "@/plugins/axios";
export default {
	components: {
	},
	props: {
		lockMode: {
			default: false,
			type: Boolean
		}
	},
	data() {
		return {
			agreeValue: true,
			showTwoStep: false,
			twoStepAnswer: '',
			question: "",
			btnCanUse: true,
			lanIpPort: "",
			hostName:"",
			formInline: {
				username: '',
				password: ''
			},
			isRemote:false
		};
	},
	mounted() {
		if (this.lockMode) {
			if (this.$store.state.currentUser) {
				this.formInline.username = this.$store.state.currentUser.username
			}
		}
		this.hasAdmin()

		//远程访问的情况下 检查一下局域网能不能连
		if (window.location.href.indexOf(axios.nasRemoteUrl) != -1) {
			this.isRemote=true
		}
		this.getServerIpAndSign()
	},
	methods: {
		getFirstKey(ip) {
			for (var key in ip) {
				// 过滤虚拟网卡
				if (key.indexOf("vEthernet") == -1) {
					return ip[key];
				}
			}
		},
		//获取局域网地址和服务器名称
		getServerIpAndSign() {

			this.api.post('/api/commonApi/getServerIpAndSign', {}).then((res) => {
				if (!res.code) {
					if (res.ipList) {
						//设置服务运行状态字符串
						let ipList = JSON.parse(res.ipList.value);
						let apiServer = JSON.parse(res.apiServer.value);
						let firstIp = this.getFirstKey(ipList);
						this.hostName=res.hostName
						if (apiServer && firstIp && firstIp.length > 0) {
							this.lanIpPort = "http://" + firstIp[0] + ":" + apiServer.port
						}
					}
				}
			}).catch((error) => {
				console.log(error);
			});
		},
		// 调用接口检查是否已经创建了管理员账号
		hasAdmin() {
			this.api.post('/api/usersApi/hasAdmin', {}).then((res) => {
				if (!res.code) {
					let hasAdmin = res.hasAdmin
					if (parseInt(hasAdmin) != 0) {
						// 跳转到用户名密码登陆页面

					} else {
						// 未创建过管理员账号 引导创建
						this.$router.push({
							path: '/create_admin'
						})
					}
				}
			}).catch((error) => {
				console.log(error);
			});
		},
		onAnswerInput(answer) {
			this.twoStepAnswer = answer
			this.handleSubmit()
		},
		goForgotPwd() {
			this.$router.push({
				path: '/forgotPwd'
			})
		},
		handleSubmit() {
			if (this.formInline.username.length < 6) {
				return this.showVsNotification(this.$t('registerAdmin.usernameLengthLimit'))
			}
			if (this.formInline.password.length < 6) {
				return this.showVsNotification(this.$t('registerAdmin.passwordLengthLimit'))
			}
			this.btnCanUse = false
			this.api.post('/api/usersApi/login', {
				username: this.formInline.username,
				password: this.base64(this.formInline.password),
				client: "PC",
				answer: this.twoStepAnswer
			}).then((res) => {
				if (!res.code) {
					if (this.lockMode) {
						this.$emit('onLogin')
					} else {
						sessionStorage.setItem('token', res.token)
						sessionStorage.setItem('currentUser', JSON.stringify(res.user))
						this.$store.state.currentUser = res.user
						this.$store.state.token = res.token
						this.showVsNotification(this.$t('login.success'))
						setTimeout(() => {
							// 跳转到首页
							this.$router.push({
								path: '/home'
							})
						}, 500)
					}
				} else {
					this.btnCanUse = true
				}
				this.twoStepAnswer = ''
			}).catch((error) => {
				if (error.code == 2) {
					this.question = error.question
					this.showTwoStep = true
					this.$refs.twoStepDialog.setShow(true)
				}
				this.twoStepAnswer = ''
				this.btnCanUse = true
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.left-img {
	object-fit: contain;
	margin-right: 150px;

	@media all and (max-width:840px) {
		display: none;
	}

	@media not all and (max-width:840px) {
		display: block;
		width: 400px;
	}

	@media not all and (max-width:1200px) {
		display: block;
		width: 500px;
	}
}

body {
	width: 100vh;
	height: 100vh;
}

.login-root {
	overflow: hidden;
	height: 100%;
	widows: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;

	.logo {
		width: 100px;
		margin-bottom: 20px;
	}

	.slogan {
		font-size: 16px;
		margin-bottom: 20px;
	}

}

::v-deep .vs-input {
	width:350px;
	height: 45px;

	@media all and (max-width:840px) {
		width:280px;
	}
}

::v-deep .vs-input__label {
	font-size: 16px;
}

::v-deep .vs-input--has-icon {
	font-size: 16px;
}


.alert-text {
	font-size: 14px;
	color: $nas-text-content;
	margin-top: 20px;
}

.input-icon {
	width: 16px;
	height: 16px;
}
</style>
