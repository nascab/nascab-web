<template>
	<photo-base :initIndex="1">
		<photo-map-content></photo-map-content>
	</photo-base>
</template>

<script>
import photoMapContent from "./photoMapContent.vue"
import photoBase from "@/views/photos/photoBase";

export default {
	name: 'photoMap',
	props: {
		
	},
	components: {
		photoMapContent,
		photoBase
	},
	data() {
		return {
			
		}
	},
	mounted() {
	},
	methods: {
	}
}
</script>

<style lang="scss" scoped>
</style>
