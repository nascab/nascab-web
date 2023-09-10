<template>
	<Button class="btn" :class="type" @click="$emit('click')" type="text" shape="circle" :icon="iIcon"></Button>
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
.btn {
	height: 35px;
	width: 35px
}

::v-deep .ivu-icon {
	font-size: 20px;
	line-height: 30px;
}

.primary {
	color: white;
	background-color: $nas-main;
}

.red {
	color: white;
	background-color: red;
}

.white {
	color: $nas-main;
	background-color: white;
}

.grey {
	color: white;
	background-color: $nas-grey;
}


.dark-grey {
	color: white;
	background-color: #5f5f5f;
}
</style>
