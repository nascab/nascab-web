<template>
	<div class="album-detail-root">
		<my-bg></my-bg>
		<div style="overflow: hidden; width: 100%;height: 100%; ">
			<div class="album-detail-header">
				<div style="display: flex;align-items:center">
					<!-- 返回按钮 -->
					<vs-button icon>
						<Icon style="cursor:pointer" @click="goBack" size="20" type="md-return-left" />
					</vs-button>
					<!-- 标题 -->
					<div class="max-line-one" style="font-size: 18px;font-weight: bold;height: 100%;margin-left: 20px;">
						{{ title }}</div>
				</div>
			</div>
			<div class="album-detail-content">
				<movie-list :isAiCollection="isAiCollection" :collectionId="collectionId" :collectionPwd="collectionPwd"></movie-list>
			</div>
		</div>
	</div>
</template>

<script>
import movieList from "@/views/movies/movieList.vue"

export default {
	props: {
		isAiCollection:{
			default: false,
			type: Boolean
		},
		collectionId: {
			default: 0,
			type: Number
		},
		title: {
			default: "",
			type: String
		},
		collectionPwd: {
			default: "",
			type: String
		}
	},
	components: {
		movieList
	},
	data() {
		return {
		
		}
	},
	mounted() {
		
	},
	beforeDestroy() {

	},
	methods: {
		goBack() {
				this.$emit('onClose')
		}
	}
}
</script>
<style lang="scss" scoped>
.album-detail-root {
	background-color: white;
	width: 100%;
	height: 100%;
}

.album-detail-header {
	padding-left: 30px;
	padding-right: 30px;
	height: 80px;

	@media all and (max-width:640px) {
		padding-left: 10px;
		padding-right: 10px;
		height: 60px;
	}

	position: absolute;
	flex-shrink: 0;
	z-index: 2;
	width: 100%;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
}


.album-detail-content {
	width: 100%;
	height: 100%;
	padding-top: 60px;

	@media not all and (max-width:640px) {
		padding-left: 30px;
		padding-right: 30px;
		padding-top: 80px;

	}
}
</style>
