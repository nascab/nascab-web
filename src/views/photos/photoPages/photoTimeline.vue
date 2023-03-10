<template>
	<photo-base :initIndex="0">
		<photo-timeline-content></photo-timeline-content>
	</photo-base>
</template>
<script>

import photoTimelineContent from "@/views/photos/photoPages/photoTimelineContent.vue"
import photoBase from "@/views/photos/photoBase";

export default {
	
	components: {
		photoBase,
		photoTimelineContent
	},
	data() {
		return {
		
		};
	},
	mounted() {
		
	},
	beforeDestroy() {
	},
	methods: {
		
	},
};
</script>
<style lang="scss" scoped>
</style>
