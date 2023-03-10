<template>
	<photo-base :initIndex="4">
		<folder-view></folder-view>
	</photo-base>
</template>

<script>
import photoBase from "@/views/photos/photoBase";
import folderView from "@/views/photos/photoPages/folderView.vue";

export default {
	props: {
		serverType: {
			type: String,
			default: "photo"
		},
	},
	components: {
		photoBase,
		folderView
	},
	data() {
		return {
			
		}
	},
	created() {
		
	},
	beforeDestroy() {
	
	},
	methods: {
		
	}
}
</script>

<style lang="scss" scoped>
</style>
