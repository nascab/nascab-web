<template>
	<div class="my-sidebar-root" :style="{'background-image': `url(${bgUrl})`}">
	</div>

</template>

<script>
export default {
	props: {
		registeSwitchBg: {
			default: false,
			type: Boolean
		}

	},
	components: {

	},
	computed: {
		bgUrl: function () {
			return require(`@/static/bg/` + this.bgIndex + `.jpg`)
		}
	},
	data() {
		return {
			bgIndex: 1
		};
	},
	mounted() {
		let bgIndex = localStorage.getItem('bgIndex')
		if (bgIndex) {
			bgIndex = parseInt(bgIndex)
			this.bgIndex = bgIndex
		}
		if (this.registeSwitchBg) {
			console.log('mybg注册bus')
			this.$bus.$on('onChangeBg', () => {
				console.log('onChangeBg')
				if (this.bgIndex < 15) {
					this.bgIndex = this.bgIndex + 1
				} else {
					this.bgIndex = 1
				}
				console.log(this.bgIndex)
				localStorage.setItem('bgIndex', this.bgIndex)
				this.$forceUpdate()
			})
		}
	},
	beforeDestroy() {

	},
	methods: {

	}
}
</script>

<style lang="scss" scoped>
.my-sidebar-root {
	z-index: 0;
	background-size: cover;
	position: fixed;
	left: 0;
	top: 0;
	height: 100%;
	width: 100%;
}
</style>
