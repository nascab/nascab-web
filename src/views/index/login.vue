<template>
	<div class="login-root">

		<!-- 左上角logo -->
		<img v-if="!isMobile" style="position: fixed;left: 60px;top: 40px;width: 150px;object-fit: contain;"
			src="@/static/common/naslogo.png" mode="widthFix" />

		<div style="display: flex;height: 100%;width: 100%;align-items: center;justify-content: center;">
			<!-- 左边图 -->
			<img src="@/static/login/login-left-img.png" class="left-img" />

			<!-- 右边表单 -->
			<div style="display: flex;flex-direction: column;align-items: center;">
				<!-- title -->
				<div style="margin-bottom: 50px;width: 100%;padding-left: 10px;padding-right: 10px;">
					<div style="font-size:28px;">{{ $t('common.welcomeToNasCab') }}</div>
					<div v-if="hostName">{{ $t('system.hostName') }}:{{ hostName }}</div>
				</div>
				<!-- 用户名 -->
				<vs-input type="text" color="#F6FAFF" v-model="formInline.username"
					:placeholder="$t('registerAdmin.placeholderUsername')">
					<template #icon>
						<img src="@/static/login/icon-username.png" class="input-icon" />
					</template>
				</vs-input>
				<!-- 密码 -->
				<vs-input @keyup.enter="handleSubmit()" type="password" style="margin-top: 30px;" color="#F6FAFF"
					v-model="formInline.password" :placeholder="$t('registerAdmin.placeholderPassword')">
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

				<!-- 记住用户名密码 -->
				<div v-if="!$store.state.runInElectron"
					style="display:flex;align-items: center;justify-content: flex-start;width: 100%;margin-top: 10px;padding-left: 10px;">
					<Checkbox v-model="saveUsernamePwd"></Checkbox>
					<span>{{ $t("login.saveUsernamePwd") }}</span>
				</div>


				<!-- 登录 -->
				<vs-button @click="handleSubmit()"
					style="height: 46px;border-radius: 23px;font-size: 20px;margin-top: 30px;width: 260px;">
					{{ lockMode ? $t('login.unlockScreen') : $t('login.btLogin') }}
				</vs-button>
				<!-- 忘记密码 -->
				<vs-button v-if="!lockMode" @click="$refs.goForgetConfirm.setShow(true)" style="margin-top: 20px;" border>{{
					$t('login.forgotPwd')
				}}
				</vs-button>
				<!-- 内嵌在app中的时候可以显示选择其他服务器 -->
				<a @click="onChooseOtherServer" v-if="isFromApp" style="margin-top:20px">{{ $t('login.chooseOtherServer')
				}}</a>

				<!-- 使用专属域名时显示这个选择连接通道 -->
				<a style="margin-top:10px" v-if="isNasCabDomain && !isFromApp" @click="showConnectChannel()">{{
					$t('login.checkConChannel')
				}}</a>
			</div>

		</div>

		<my-dialog-confirm @onOkClick="goForgotPwd" ref="goForgetConfirm" :content="$t('login.getPwdOnlyForAdmin')">
		</my-dialog-confirm>
		<!-- 两步验证对护框 -->
		<my-dialog-input @onOkClick="onAnswerInput" :placeholder="$t('resetPwd.placeholderAnswer')" :showCloseBtn="true"
			ref="twoStepDialog" :content="$t('resetPwd.question') + question"
			:title="$t('setting.security.loginNeedAnswer')">
		</my-dialog-input>

		<!-- 检测连接通道的对话框 -->
		<vs-dialog prevent-close v-model="showUrlDetectDialog">
			<h3 style="margin-top:15px;margin-bottom:15px">{{ $t('login.checkConChannel') }}</h3>
			<div v-if="hostName">{{ $t('system.hostName') }}:{{ hostName }}</div>
			<div v-for="ip in waitCheckIpList" style="margin-top:10px;">
				<div style="display:flex;flex-direction:row;align-items: center;justify-content: center;">
					<div @click="goUrl(ip)"><b>{{ ip.type }}</b><a> {{ ip.url }}</a> </div>
				</div>
			</div>
		</vs-dialog>

	</div>
</template>

<script>

import axios from "@/plugins/axios";
import jsBridge from "@/plugins/jsBridge"
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
			currentProtocol: "",
			showUrlDetectDialog: false,
			saveUsernamePwd: false, //是否记住用户名密码
			agreeValue: true,
			showTwoStep: false,
			twoStepAnswer: '',
			question: "",
			btnCanUse: true,
			hostName: "",
			formInline: {
				username: '',
				password: ''
			},
			waitCheckIpList: [],
			isNasCabDomain: false,
			detectFinishCount: 0 //已经检测完几个ip 用来判断是否全部检测完成
		};
	},
	mounted() {
		this.currentProtocol = window.location.protocol
		// 请求服务器 获得ip列表
		if (this.isFromApp) {
			this.init()
		} else {
			if (window.location.hostname.endsWith("nas-cab.com")) {
				this.isNasCabDomain = true
			}
			if (this.isNasCabDomain && !sessionStorage.hadShownUrlDialog) {
				//这个对话框每次会话只显示一次
				sessionStorage.hadShownUrlDialog = true
				this.showConnectChannel()
			} else {
				this.init()
			}
			
		}
	},
	methods: {
		showConnectChannel() {
			this.api.post('/api/usersApi/checkIsNasServer', {}).then((res) => {
				if (!res.code) {
					// 设置主机名
					if (res.hostName) {
						this.hostName = res.hostName
					}
					if (res.ipList && res.ipList.length > 1) {
						//有ip列表 弹出框进行检测
						console.log("有ip列表 弹出框进行检测")
						let hasIpv6=false
						let useList=[]
						for (let i in res.ipList) {
							let ipItem = res.ipList[i]
							res.ipList[i].state = "loading"
							if (ipItem.type == "ipv4") {
								ipItem.url = `http://${ipItem.ip}:${res.apiPort}`
							} else if (ipItem.type == "ipv6") {
								if(hasIpv6){//ipv6只显示一个就行了
									continue
								}
								ipItem.url = `http://[${ipItem.ip}]:${res.apiPort}`
								hasIpv6=true
							} else if (ipItem.type == "domain") {
								ipItem.url = `${this.currentProtocol}//${ipItem.ip}`
							}
							useList.push(ipItem)
						}
						this.waitCheckIpList = useList
						this.showUrlDetectDialog = true
					} else {
						this.init()
					}
				}
			}).catch((error) => {
				this.init()
			});
		},
		goUrl(ipItem) {
			console.log("ipItem.url", ipItem.url)
			if (window.location.origin == ipItem.url) {
				this.showUrlDetectDialog = false
			} else {
				window.location.href = ipItem.url
			}
		},
		addDetectCountAndCheckIsFinish() {
			this.detectFinishCount += 1
			if (this.detectFinishCount >= this.waitCheckIpList.length) {
				console.log("ip检测全部完成了", this.detectFinishCount)
			}
		},
		init() {
			console.log("login init")
			if (this.lockMode) {
				if (this.$store.state.currentUser) {
					this.formInline.username = this.$store.state.currentUser.username
				}
			}
			this.hasAdmin()

			//查看是否缓存了用户名密码 有可能app跳转的时候带过来的 在index.vue中保存到了sessionStorage
			let username = localStorage.getItem('username')
			if (username) {
				this.formInline.username = decodeURIComponent(username)
				localStorage.removeItem('username')
			}
			let password = localStorage.getItem('password')
			if (password) {
				this.formInline.password = decodeURIComponent(password)
				localStorage.removeItem('password')
			}

			let answer = localStorage.getItem('answer')
			if (answer) {
				this.twoStepAnswer = answer
				localStorage.removeItem('answer')
			}
			if (!username && !password) {
				//检查本地是否保存了
				let autoLogin = localStorage.getItem("autoLogin")
				if (autoLogin && autoLogin == 1) {
					//开启了自动登录
					this.saveUsernamePwd = true
					let saveUserName = localStorage.getItem("cacheLoginUsername")
					let savePwd = localStorage.getItem("cacheLoginPassword")
					let saveAnswer = localStorage.getItem("cacheLoginAnswer")

					if (saveUserName) {
						this.formInline.username = saveUserName
					}
					if (savePwd) {
						this.formInline.password = this.base64.decode(savePwd)
					}
					if (saveAnswer) {
						this.formInline.answer = this.base64.decode(saveAnswer)
					}
				}
			}
			//自动登录
			if (this.formInline.username && this.formInline.password) {
				this.handleSubmit()
			}
			//预加载loading图片 防止首页跳
			let img = new Image()
			img.src = require("@/assets/loading.gif")
		},
		onChooseOtherServer() {
			// 通知app切换到其他服务器
			if (jsBridge) { jsBridge.onChooseOtherServer() }
		},
		getFirstKey(ip) {
			for (var key in ip) {
				// 过滤虚拟网卡
				if (key.indexOf("vEthernet") == -1) {
					return ip[key];
				}
			}
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
			if (this.saveUsernamePwd) {
				localStorage.setItem("cacheLoginUsername", this.formInline.username)
				localStorage.setItem("cacheLoginPassword", this.base64.encode(this.formInline.password))
				if (this.formInline.answer) localStorage.setItem("cacheLoginAnswer", this.base64.encode(this.formInline.answer))
				localStorage.setItem("autoLogin", 1)
			} else {
				localStorage.removeItem("cacheLoginUsername")
				localStorage.removeItem("cacheLoginPassword")
				localStorage.removeItem("cacheLoginAnswer")
				localStorage.removeItem("autoLogin")
			}
			this.btnCanUse = false
			this.api.post('/api/usersApi/login', {
				username: this.formInline.username,
				password: this.base64.encode(this.formInline.password),
				client: "PC",
				answer: this.twoStepAnswer
			}).then((res) => {
				if (!res.code) {
					if (this.lockMode) {
						this.$emit('onLogin')
					} else {
						localStorage.setItem('token', res.token)
						localStorage.setItem('currentUser', JSON.stringify(res.user))
						this.$store.state.currentUser = res.user
						this.$store.state.token = res.token
						this.showVsNotification(this.$t('login.success'))

						setTimeout(() => {
							// 跳转到首页
							this.$router.push({
								path: '/home'
							})
						}, 500)

						//通知app登陆成功
						jsBridge.onLoginSuc(JSON.stringify({
							username: this.formInline.username,
							password: this.base64.encode(this.formInline.password),
							answer: this.twoStepAnswer
						}))

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
	width: 350px;
	height: 45px;

	@media all and (max-width:840px) {
		width: 300px;
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
