<template>
	<div class="content">
		<div style="margin-top: 50px;">{{ $t('index.title') }}</div>
	</div>

</template>

<script>
export default {
	data() {
		return {}
	},
	mounted() {
		let token = sessionStorage.getItem('token')
		if (token) {
			this.$store.state.token = token
		}
		let currentUser = sessionStorage.getItem('currentUser')
		console.log('session',currentUser)
		if (currentUser) {
			currentUser = JSON.parse(currentUser)
			this.$store.state.currentUser = currentUser
		}
		if (token&&currentUser) {
			this.$router.push({
				path: '/home'
			})
		} else {
			this.hasAdmin()
		}
	},
	methods: {
		// 调用接口检查是否已经创建了管理员账号
		hasAdmin() {
			this.api.post('/api/usersApi/hasAdmin', {hideLoading:true}).then((res) => {
				if (!res.code) {
					let hasAdmin = res.hasAdmin
					if (parseInt(hasAdmin) != 0) {
						// 跳转到用户名密码登陆页面
						this.$router.push({
							path: '/login'
						})
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
		}
	}
}
</script>

<style lang="scss" scoped>
.content {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}
</style>
