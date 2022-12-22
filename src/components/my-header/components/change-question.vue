<template>
	<div class="root">
		<!-- 修改密保问题 -->
		<Form ref="formValidate" :model="formValidate" :rules="ruleValidate" >
			<FormItem :label="$t('header.rawQuestion')" prop="username">
				<Input disabled v-model="currentUser.question"></Input>
			</FormItem>
			<FormItem :label="$t('header.newQuestion')" prop="newQuestion">
				<Input v-model="formValidate.newQuestion" :placeholder="$t('header.newQuestion')"></Input>
			</FormItem>
			<FormItem :label="$t('header.newAnswer')" prop="newAnswer">
				<Input v-model="formValidate.answer" :placeholder="$t('header.newAnswer')"></Input>
			</FormItem>
		</Form>
		<vs-button :disabled="!btnCanUse" type="info" style="margin-top: 20px;width: 100%;border-radius: 20px;"
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
					newQuestion: '',
					answer: '',
				},
				ruleValidate: {
					newQuestion: [{
						required: true,
						message: this.$t('header.newQuestion'),
						trigger: 'blur'
					}],
					answer: [{
						required: true,
						message: this.$t('registerAdmin.placeholderAnswer'),
						trigger: 'blur'
					}]
				}
			}
		},
		mounted() {
			this.currentUser = JSON.parse(sessionStorage.getItem("currentUser"))
			this.getCurrentUserInfo()
		},
		methods: {
			getCurrentUserInfo() {
				this.api.post('/api/usersApi/getCurrentUserInfo', this.formValidate).then((res) => {
					if (!res.code) {
						this.currentUser = res.userInfo
					}
				}).catch((error) => {})
			},
			handleSubmit(name) {
				if (this.formValidate.newPassword != this.formValidate.newPasswordConfirm) {
					return this.showVsNotification(this.$t('header.twoPasswordHaveToSame'))
				}
				this.$refs[name].validate((valid) => {
					if (valid) {
						this.btnCanUse = false
						this.api.post('/api/usersApi/changeQuestion', this.formValidate).then((res) => {
							if (!res.code) {
								this.showVsAlertDialog(this.$t('common.alert'),this.$t('header.changeQuestionSuccess'),()=>{
									this.$emit('onClose')
								});
							} else {
								this.btnCanUse = true
							}
						}).catch((error) => {
							this.btnCanUse = true
						})
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.root {
		padding: 10px;
		min-height: 300px;
		width: 100%;
	}
</style>
