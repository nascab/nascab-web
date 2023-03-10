<template>
	<div class="content">
		<div style="margin-top: 50px;">{{ $t('index.title') }}</div>
	</div>
</template>

<script>
import base64 from '@/plugins/base64/index.js'

export default {
	data() {
		return {}
	},
	mounted() {


		console.log("index index index index index")
		// 检查是否从app来的 并保存 
		let query = this.$route.query;
		let from = query.from
		console.log('query', query)
		if (from && from == 'app') {
			localStorage.setItem('from', 'app')
		} else {
			localStorage.removeItem('from')
		}
		//如果从app来的 有可能带来了用户名密码 免得用户重复输入
		if (query.username) {
			localStorage.setItem('username', query.username)
		}
		if (query.password) {
			localStorage.setItem('password', base64.decode(query.password))
		}
		if (query.answer) {
			localStorage.setItem('answer', query.answer)
		}

		console.log(query)

		if (this.$store.state.token && this.$store.state.currentUser) {
			this.$router.push({
				path: '/home'
			})
		} else {
			if (query.token) {
				console.log("待token来的 使用token登录")

				//待token来的 比如electorn的windows加载网页时为了省去登录步骤 就可能待token来
				this.tokenLogin(query.token)
			} else {
				console.log("没有token 正常流程")
				this.hasAdmin()
			}
			
		}
	},
	methods: {
		tokenLogin(token) {
			this.api.post('/api/usersApi/tokenLogin', {
				token: token
			}).then((res) => {
				if (!res.code) {
					localStorage.setItem('token', res.token)
					localStorage.setItem('currentUser', JSON.stringify(res.user))
					this.$store.state.currentUser = res.user
					this.$store.state.token = res.token
					setTimeout(() => {
						this.$router.push({
						path: '/home'
					})
					}, 500);
					//通知app登陆成功
					jsBridge.onLoginSuc(JSON.stringify({
						username: this.formInline.username,
						password: this.base64.encode(this.formInline.password),
						answer: this.twoStepAnswer
					}))
				}

			}).catch((error) => {
				this.hasAdmin()
			})
		},
		// 调用接口检查是否已经创建了管理员账号
		hasAdmin() {
			this.api.post('/api/usersApi/hasAdmin', { hideLoading: true }).then((res) => {
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
