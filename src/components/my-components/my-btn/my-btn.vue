<template>
	<Button :disabled="disabled" @click="$emit('click')" class="my-bt"
		:class="[{ 'my-bt-red': type == 'red' }, { 'my-bt-white': type == 'white' }, { 'my-bt-primary': type == 'primary' }]">
		<p>{{ title }}</p>
	</Button>
</template>

<script>
export default {
	props: {
		disabled: {
			default: false,
			type: Boolean
		},
		title: {
			default: "",
			type: String
		},
		type: {
			default: "primary",
			type: String
		}
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
.my-bt {
	margin-left: 5px;
	margin-right: 5px;
	flex-shrink: 0;
	padding-left: 10px;
	padding-right: 10px;
	border-radius: 18px;
	height: 36px;
}

.my-bt-red {
	p {
		color: white;
	}

	color: white;
	background-color: $nas-red;
}

.my-bt-white {
	border: 1px solid $nas-main;

	p {
		color: $nas-main;
	}

	color: $nas-main;
	background-color: white;
	border: 1px solid $nas-main;

	p {
		color: $nas-main ;
	}

	.ivu-btn {
		border: 0px;
		border-color: transparent !important;
	}
}

.my-bt-primary {
	p {
		margin-left: 5px;
		margin-right: 5px;
		color: white;
	}

	color: white;
	background-color: #386DF2;

	.ivu-btn {
		border: 0px;
		border-color: transparent !important;
	}

}

</style>
