<template>
	<vs-button :class="type"
		style="height:40px;width:40px;border-radius:50%;z-index:5;text-align: center;line-height: 40px;"
		@click="$emit('click')">
		<Icon :type="iIcon" size="25" />
	</vs-button>

</template>

<script>
export default {
	props: {
		type: {
			default: 'primary',
			type: String
		},
		iIcon: {
			default: 'md-home',
			type: String
		},
	},
	components: {},
	data() {
		return {};
	},
	created() {

	},
	methods: {

	}
}
</script>

<style lang="scss" scoped>
.primary {
	background-color: #5b86f2
}

.red {
	background-color: red;
}

.white {
	color: $nas-main;
	background-color: white;
}
</style>
