<template>
	<div class="user-add-root">
		<!-- 添加新用户 -->
		<Form style="width:100%" ref="formValidate" :model="formValidate" :rules="ruleValidate" >
			<FormItem :label="$t('common.username')" prop="username">
				<Input autocapitalize="off" autocorrect="off"  :disabled="editUser!=null" v-model="formValidate.username"
					:placeholder="$t('common.username')"></Input>
			</FormItem>
			<FormItem :label="$t('common.password')" prop="password">
				<Input autocapitalize="off" autocorrect="off"   v-model="formValidate.password" :placeholder="$t('common.password')"></Input>
			</FormItem>
			<FormItem :label="$t('common.question')" prop="question">
				<Input  autocapitalize="off" autocorrect="off"  v-model="formValidate.question" :placeholder="$t('registerAdmin.placeholderQuestion')"></Input>
			</FormItem>
			<FormItem :label="$t('common.answer')" prop="answer">
				<Input  autocapitalize="off" autocorrect="off"  v-model="formValidate.answer" :placeholder="$t('registerAdmin.placeholderAnswer')"></Input>
			</FormItem>
		</Form>
		<my-btn style="width: 250px;margin-top: 30px;" :disabled="!btnCanUse" @click="handleSubmit('formValidate')" :title="editUser?$t('common.update'):$t('common.add')"></my-btn>
	</div>
</template>

<script>
	export default {
		props: {
			editUser: {
				default: null,
				type: Object
			}
		},
		data() {
			return {
				btnCanUse: true,
				currentUser: false,
				formValidate: {
					username: this.editUser ? this.editUser.username : '',
					password: '',
					question:"",
					answer:"",
					type: this.editUser ? "edit" : "add"
				},
				ruleValidate: {
					username: [{
							required: true,
							message: this.$t('registerAdmin.placeholderUsername'),
							trigger: 'blur'
						},
						{
							min: 6,
							message: this.$t('registerAdmin.usernameLengthLimit'),
							trigger: 'blur'
						}
					],
					password: [{
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
					question: [{
							required: true,
							message: this.$t('registerAdmin.placeholderQuestion'),
							trigger: 'blur'
						}
					],
					answer: [{
							required: true,
							message: this.$t('registerAdmin.placeholderAnswer'),
							trigger: 'blur'
						}
					],
				}
			}
		},
		mounted() {
			this.currentUser = JSON.parse(localStorage.getItem("currentUser"))
		},
		methods: {
			handleSubmit(name) {
				this.$refs[name].validate((valid) => {
					if (valid) {
						this.btnCanUse = false
						this.api.post('/api/usersApi/addUser', this.formValidate).then((res) => {
							if (!res.code) {
								this.showVsAlertDialog(
									this.$t('common.alert'),
									this.$t('common.operationSuccess'),
									() => {
										this.formValidate.username = ''
										this.formValidate.password = ''
										this.btnCanUse = true
										this.$emit('success')
									}
								)
							} else {
								this.btnCanUse = true
							}
						}).catch((error) => {
							if (error.code == 2) {
								this.showVsNotification(this.$t('user.hadSameUsername'))
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
	.user-add-root {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 10px;
		min-height: 300px;
		width: 100%;
	}
</style>
