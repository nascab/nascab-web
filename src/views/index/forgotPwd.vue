<template>
	<div class="root">

		<!-- 左上角logo -->
		<img v-if="!isMobile" style="position: fixed;left: 60px;top: 40px;width: 150px;object-fit: contain;"
			src="@/static/common/naslogo.png" mode="widthFix" />

		<div style="display: flex;height: 100%;width: 100%;align-items: center;justify-content: center;">
			<!-- 左边图 -->
			<img src="@/static/login/login-left-img.png" class="left-img" />

			<!-- 右边表单 -->
			<div style="display: flex;flex-direction: column;align-items: center;">
				
				<!-- title -->
				<div style="font-size:28px;margin-bottom: 50px;">{{ $t('login.getPwdBack') }}</div>

				<vs-tooltip>
					<!-- 答案 -->
					<vs-input autocapitalize="off" autocorrect="off" type="text" color="#F6FAFF" v-model="formInline.answer"
						:placeholder="$t('resetPwd.placeholderAnswer')">
						<template #icon>
							<img src="@/static/login/icon-answer.png" class="input-icon" />
						</template>
					</vs-input>
					<template #tooltip>
						<div style="word-break: break-all;">
							{{ $t('resetPwd.question') }}{{ formInline.question }}
						</div>
					</template>
				</vs-tooltip>

				<!-- 用户名 -->
				<vs-input autocapitalize="off" autocorrect="off" type="text" style="margin-top: 30px;" color="#F6FAFF" v-model="formInline.username"
					:placeholder="$t('registerAdmin.placeholderUsername')">
					<template #icon>
						<img src="@/static/login/icon-username.png" class="input-icon" />
					</template>
				</vs-input>

				<!-- 密码 -->
				<vs-input autocapitalize="off" autocorrect="off"  type="password" style="margin-top: 30px;" color="#F6FAFF" v-model="formInline.password"
					:placeholder="$t('resetPwd.placeholderPassword')">
					<template #icon>
						<img src="@/static/login/icon-password.png" class="input-icon" />
					</template>
				</vs-input>

				<!-- 提交 -->
				<vs-button @click="handleSubmit()"
					style="height: 54px;border-radius: 27px;font-size: 20px;margin-top: 30px;width: 280px;">
					{{ $t('login.getPwdBack') }}
				</vs-button>

				<!-- 去登陆 -->
				<vs-button @click="goLogin" style="margin-top: 20px;" border>{{ $t('login.goLogin') }}
				</vs-button>
				<a @click="showForgetAnswer" style="margin-top:10px">{{ $t('login.forgetAnswer') }}</a>

			</div>
			<!-- <img v-if="isMobile" style="position: fixed;bottom: 40px;width: 120px;object-fit: contain;"
				src="@/static/common/naslogo.png" mode="widthFix" /> -->
		</div>

	</div>
</template>

<script>
export default {
	data() {
		return {
			btnCanUse: true,
			formInline: {
				username: '',
				password: '',
				answer: "",
				question: ""
			}
		};
	},
	mounted() {
		this.getInfo()
	},
	methods: {
		showForgetAnswer(){
			this.showVsAlertDialog(this.$t('common.alert'), this.$t('login.forgetAnswerAlert',{dbPath:`WINDOWS:C:\\Users\\USERNAME\\AppData\\Roaming\\nascab\\database      MAC:/Users/USERNAME/Library/Application Support/nascab/database`}))
		},
		goLogin() {
			this.$router.push({
				path: '/login'
			})
		},
		getInfo() {
			this.api.post('/api/usersApi/resetPwdInfo', this.formInline).then((res) => {
				if (this.$store.state.runInElectron) {
					if (res.data.username) {
						this.formInline.username = res.data.username
					}
				}
				if (res.data.question) {
					this.formInline.question = res.data.question
				}
			}).catch((error) => {
				this.btnCanUse = true
			})
		},
		handleSubmit() {
			if (this.formInline.username.length < 2) {
				return this.showVsNotification(this.$t('registerAdmin.usernameLengthLimit'))
			}
			if (this.formInline.password.length < 2) {
				return this.showVsNotification(this.$t('registerAdmin.passwordLengthLimit'))
			}
			this.btnCanUse = false
			this.api.post('/api/usersApi/resetPwd', this.formInline).then((res) => {
				this.showVsAlertDialog(null, this.$t('common.operationSuccess'), () => {
					this.$router.push({
						path: '/login'
					})
				})
			}).catch((res) => {
				if (res.code == 3) {
					this.showVsAlertDialog(null, this.$t('resetPwd.answerIsWrong'))
				}
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

.root {
	height: 100vh;
	width: 100%;
	// background-size: 100% 100%;
	// background-image: url('../../static/home-bg-1.jpg');
}


::v-deep .vs-input {
	width: 350px;
	height: 45px;

	@media all and (max-width:840px) {
		width: 280px;
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

.login-root {
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

.form {
	width: 400px;



}
</style>
