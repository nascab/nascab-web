<template>
	<div style="padding-top:10px;">
		<div v-for="(option, index) in optionList">
			<div @click="onItemSelect(index)" class="shrink-item">{{ option.text }}</div>
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
	padding: 10px;
	font-size: 16px;
}
</style>
