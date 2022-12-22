<template>
	<div class="create-root">
		<!-- 左上角logo -->
		<img style="position: fixed;left: 60px;top: 40px;width: 150px;object-fit: contain;"
			src="@/static/common/naslogo.png" mode="widthFix"></img>

		<div style="display: flex;height: 100%;width: 100%;align-items: center;justify-content: center;">
			<!-- 左边图 -->
			<img   src="@/static/login/login-left-img.png" class="left-img"/>

			<!-- 右边表单 -->
			<div style="display: flex;flex-direction: column;align-items: center;">
				<!-- title -->
				<div style="font-size:40px;margin-bottom: 50px;">{{$t('registerAdmin.registerAdmin')}}</div>
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

				<!-- 密保问题 -->
				<vs-input  style="margin-top: 30px;" color="#F6FAFF" v-model="formInline.question"
					:placeholder="$t('registerAdmin.placeholderQuestion')">
					<template #icon>
						<img src="@/static/login/icon-question.png" class="input-icon" />
					</template>
				</vs-input>

				<!-- 密保答案 -->
				<vs-input type="text" style="margin-top: 30px;" color="#F6FAFF" v-model="formInline.answer"
					:placeholder="$t('registerAdmin.placeholderAnswer')">
					<template #icon>
						<img src="@/static/login/icon-answer.png" class="input-icon" />
					</template>
				</vs-input>
				<!-- 登录 -->
				<vs-button @click="handleSubmit()"
					style="height: 54px;border-radius: 27px;font-size: 20px;margin-top: 30px;width: 350px;">
					{{$t('login.btLogin')}}
				</vs-button>
				<div class="alert-text">{{$t('registerAdmin.firstUseAlertText')}}</div>
			</div>
		</div>

		<!-- 提示对话框 -->
		<my-dialog-alert :preventClose="true" :isBlur="true" ref="createDialog" :title="$t('common.welcomeToNasCab')"
			:content="$t('registerAdmin.success')" @onOkClick="goHome()"></my-dialog-alert>
	</div>
</template>

<script>

	export default {
		mounted() {},
		components: {
		},
		data() {
			return {
				btnCanUse: true,
				formInline: {
					username: '',
					password: '',
					question: "",
					answer: ""
				}
			};
		},
		methods: {
			goHome(){
				this.$router.push({
					path: '/home'
				})
			},
			handleSubmit() {
				if (this.formInline.username.length < 6) {
					return this.showVsNotification(this.$t('registerAdmin.usernameLengthLimit'))
				}
				if (this.formInline.password.length < 6) {
					return this.showVsNotification(this.$t('registerAdmin.passwordLengthLimit'))
				}
				if (this.formInline.password==this.formInline.username) {
					return this.showVsNotification(this.$t('registerAdmin.uesrnameAndPwdCantSame'))
				}
				if (!this.formInline.question) {
					return this.showVsNotification(this.$t('registerAdmin.placeholderQuestion'))
				}
				if (!this.formInline.answer) {
					return this.showVsNotification(this.$t('registerAdmin.placeholderAnswer'))
				}
				if(this.formInline.answer==this.formInline.question){
					return this.showVsNotification(this.$t('registerAdmin.questionAndAnswerCantSame'))
				}
				this.btnCanUse = false
				this.api.post('/api/usersApi/registAdmin', this.formInline).then((res) => {
					if (!res.code) {
						sessionStorage.setItem('token', res.token)
						sessionStorage.setItem('currentUser', JSON.stringify(res.user))
						this.$refs.createDialog.setShow(true)
					} else {
						this.btnCanUse = true
					}
				}).catch((error) => {
					console.log(error)
					this.btnCanUse = true
				})
			}
		}
	}
</script>
<style>

</style>
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
	// 覆盖三方组件css
	::v-deep .vs-input {
		width: 350px;
		height: 45px;
		
	}
	::v-deep .vs-input__label{
			font-size: 16px;
	}
	::v-deep .vs-input--has-icon{
		font-size: 16px;
	}
	.alert-text {
		padding-left: 10px;
		padding-right: 10px;
		font-size: 16px;
		margin-top: 20px;
	}

	.input-icon {
		width: 16px;
		height: 16px;
	}

	.create-root {
		overflow: hidden;
		height: 100%;
		widows: 100%;
	}
</style>
