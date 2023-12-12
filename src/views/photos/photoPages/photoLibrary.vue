<template>
	<photo-base :initIndex="4">
		

			<library-page :isPhotoLibrary="true"></library-page>
	</photo-base>
	
</template>
<script>
//影音合集 照片合集用一个页面
import libraryPage from "@/views/movies/movieLibrary.vue"
import photoBase from "@/views/photos/photoBase";

export default {

	created() {
	},
	mounted() {
	
	},
	beforeDestroy() {
	},
	components: {
		photoBase,
		libraryPage
	},
	data() {
		return {
		
		};
	},
	methods: {
		
	}
}
</script>
<style lang="scss" scoped>

</style>
