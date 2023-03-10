<template>
	<div class="my-bg-root" :style="{ 'background-image': `url(${bgUrl})` }">
		<div class="subBox"></div>
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
	created() {
		let bgIndex = localStorage.getItem('bgIndex')
		if (bgIndex) {
			bgIndex = parseInt(bgIndex)
			this.bgIndex = bgIndex
		}
		if (this.registeSwitchBg) {
			this.$bus.$on('onChangeBg', () => {
				if (this.bgIndex < 15) {
					this.bgIndex = this.bgIndex + 1
				} else {
					this.bgIndex = 1
				}
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
.my-bg-root {
	z-index: 0;
	background-size: cover;
	position: fixed;
	left: 0;
	top: 0;
	height: 100%;
	width: 100%;
}

.subBox {
	position: absolute;
	width: 100%;
	height: 100%;
	backdrop-filter: blur(5px);
}
</style>
