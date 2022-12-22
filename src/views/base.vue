<template>
	<div class="root">
	</div>

</template>

<script>
	export default {
		data() {
			return {}
		},
		mounted() {
			
		},
		methods: {
			api(){
				this.api
					.post("/api/photoApi/getTimeLineDateList", {
						type: parseInt(this.showFileType),
					})
					.then((res) => {
						if (!res.code) {
							this.timeLine = res.data;
							this.$refs.timeline.initDate(res.data);
							this.loadFirstPage();
						}
					})
					.catch((error) => {});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.root {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>
