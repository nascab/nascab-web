<template>
	<div class="user-setting-root">
		<Menu mode="horizontal" theme="light" active-name="1" @on-select="menuChange">
			<MenuItem name="1">
			<Icon class="nas-mobile-none" type="md-help-buoy" size="16" />
			{{$t('header.changePwd')}}
			</MenuItem>
			<MenuItem name="2">
			<Icon class="nas-mobile-none" type="ios-help-circle-outline" size="16" />
			{{$t('header.changeQuestion')}}
			</MenuItem>
		</Menu>
		<!-- 修改密码 -->
		<div style="width:100%" v-if="currentMenuName=='1'">
			<change-pwd @onClose="$emit('onClose')"></change-pwd>
		</div>
		<!-- 修改密保问题 -->
		<div style="width:100%" v-if="currentMenuName=='2'">
			<change-question @onClose="$emit('onClose')"></change-question>
		</div>
	</div>
</template>

<script>
import changePwd from "./components/change-pwd.vue"
import changeQuestion from "./components/change-question.vue"

export default {
	components: {
		changePwd, changeQuestion
	},
	data() {
		return {
			currentMenuName: "1",
		}
	},
	mounted() { },
	methods: {
		menuChange(menuName) {
			console.log(menuName)
			this.currentMenuName = menuName
		}
	}
}
</script>

<style lang="scss" scoped>
.user-setting-root {
	min-height: 300px;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
}
</style>
