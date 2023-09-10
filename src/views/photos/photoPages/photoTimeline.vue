<template>
	<photo-base :initIndex="0">
		<photo-timeline-content v-if="showContent"></photo-timeline-content>
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
			showContent:false
		};
	},
	mounted() {
		//检查一下之前缓存的左侧菜单
		if(localStorage.photoViewType&&localStorage.photoViewType!="/photoTimeline"){
			this.goPath(localStorage.photoViewType)
			console.log("go path ",localStorage.photoViewType)
			return
		}
		this.showContent=true
	},
	beforeDestroy() {
	},
	methods: {
		
	},
};
</script>
<style lang="scss" scoped>
</style>
