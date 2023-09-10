<template>
	<photo-base :initIndex="3">
		<ordinary-album-content></ordinary-album-content>
	</photo-base>
</template>

<script>

import photoBase from "@/views/photos/photoBase";
import ordinaryAlbumContent from "@/views/photos/photoPages/ordinaryAlbumContent";

export default {
	props:{
	
	},
	components: {
		ordinaryAlbumContent,
		photoBase
	},
	data() {
		return {
			

		}
	},
	mounted() {
		
	},
	activated() {
		
	},
	beforeDestroy() {

	},
	methods: {
		
	}
}
</script>

<style lang="scss" scoped>

</style>
