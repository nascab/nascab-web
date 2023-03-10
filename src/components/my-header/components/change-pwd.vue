<template>
	<div class="change-pwd-root">
		<!-- 修改密码 -->
		<Form ref="formValidate" :model="formValidate" :rules="ruleValidate" style="width:100%">
			<FormItem :label="$t('common.username')" prop="username">
				<Input disabled v-model="currentUser.username"></Input>
			</FormItem>
			<FormItem :label="$t('header.rawPassword')" prop="oldPassword">
				<Input type="password" v-model="formValidate.oldPassword"
					:placeholder="$t('header.rawPassword')"></Input>
			</FormItem>
			<FormItem :label="$t('header.newPassword')" prop="newPassword">
				<Input type="password" v-model="formValidate.newPassword"
					:placeholder="$t('header.newPassword')"></Input>
			</FormItem>
			<FormItem :label="$t('header.newPasswordConfirm')" prop="newPasswordConfirm">
				<Input type="password" v-model="formValidate.newPasswordConfirm"
					:placeholder="$t('header.newPasswordConfirm')"></Input>
			</FormItem>
		</Form>
		<vs-button :disabled="!btnCanUse" type="info" style="margin-top: 10px;width: 100%;border-radius: 20px;"
			@click="handleSubmit('formValidate')">
			{{$t('common.commit')}}
		</vs-button>
	</div>
</template>

<script>
export default {
	data() {
		return {
			btnCanUse: true,
			currentUser: false,
			formValidate: {
				oldPassword: '',
				newPassword: '',
				newPasswordConfirm: '',
				client: 'PC'
			},
			ruleValidate: {
				oldPassword: [{
					required: true,
					message: this.$t('registerAdmin.placeholderPassword'),
					trigger: 'blur'
				},
				{
					min: 6,
					message: this.$t('registerAdmin.passwordLengthLimit'),
					trigger: 'blur'
				}
				],
				newPassword: [{
					required: true,
					message: this.$t('registerAdmin.placeholderPassword'),
					trigger: 'blur'
				},
				{
					min: 6,
					message: this.$t('registerAdmin.passwordLengthLimit'),
					trigger: 'blur'
				}
				],
				newPasswordConfirm: [{
					required: true,
					message: this.$t('registerAdmin.placeholderPassword'),
					trigger: 'blur'
				},
				{
					min: 6,
					message: this.$t('registerAdmin.passwordLengthLimit'),
					trigger: 'blur'
				}
				]
			}
		}
	},
	mounted() {
		this.currentUser = JSON.parse(localStorage.getItem("currentUser"))
	},
	methods: {
		handleSubmit(name) {
			if (this.formValidate.newPassword != this.formValidate.newPasswordConfirm) {
				return this.showVsNotification(this.$t('header.twoPasswordHaveToSame'))
			}
			this.$refs[name].validate((valid) => {
				if (valid) {
					this.btnCanUse = false
					this.api.post('/api/usersApi/changePassword', this.formValidate).then((res) => {
						if (!res.code) {
							this.showVsAlertDialog(this.$t('common.alert'), this.$t('header.changePasswordSuccess'), () => {
								this.$emit('onClose')
								localStorage.removeItem('token')
								localStorage.removeItem('currentUser')
								this.$router.push({
									path: '/login'
								})
							})

						} else {
							this.btnCanUse = true
						}
					}).catch((error) => {
						if (error.code == 2) {
							this.showVsNotification(this.$t('header.oldPasswordIncorrect'))
						}
						this.btnCanUse = true
					})
				}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.change-pwd-root {
	padding: 10px;
	min-height: 300px;
	width: 100%;
}
</style>
