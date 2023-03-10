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
	background-color: $nas-main;
	box-shadow: 0 3px 5px 0 rgba(0, 0, 0, 0.15), 0 5px 10px 0 rgba(0, 0, 0, 0.15);

}

.red {
	background-color: red;
	box-shadow: 0 3px 5px 0 rgba(0, 0, 0, 0.15), 0 5px 10px 0 rgba(0, 0, 0, 0.15);

}

.white {
	color: $nas-main;
	background-color: white;
	box-shadow: 0 3px 5px 0 rgba(0, 0, 0, 0.15), 0 5px 10px 0 rgba(0, 0, 0, 0.15);

}

.grey {
	color: white;
	background-color:  $nas-grey;
	box-shadow: 0 3px 5px 0 rgba(0, 0, 0, 0.15), 0 5px 10px 0 rgba(0, 0, 0, 0.15);
}
</style>
