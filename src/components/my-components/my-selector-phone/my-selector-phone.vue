<template>
	<div style="padding-top:10px;">
		<div v-for="(option, index) in optionList">
			<Button type="dashed" @click="onItemSelect(index)" class="shrink-item">{{ option.text }}</Button>
		</div>
	</div>
</template>

<script>

export default {
	props: {
		optionList: {
			default: [],
			type: Array
		}
	},
	components: {},
	data() {
		return {
		};
	},
	created() {

	},
	methods: {
		onItemSelect(index){
			console.log('onItemSelect',index)
			this.$emit('onItemClick', this.optionList[index])
		}
	}
}
</script>

<style lang="scss" scoped>
.shrink-item {
	color:white;
	background-color: $nas-main;
	width: 90%;
	margin-bottom:10px;
	border-radius: 20px;
}
</style>
