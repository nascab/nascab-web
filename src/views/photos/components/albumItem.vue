<template>
	<div class="item-root">
		<img :src="imgSrc" class="item-img">
		<div class="item-bottom-root">
			<div class="item-bottom-root-left">
				<!-- 主标题 -->
				<p class="item-title">{{title}}</p>
				<!-- 副标题 -->
				<p class="item-subtitle">{{subTitle}}</p>
			</div>
			<!-- 图标 -->
			<img class="item-icon" src="@/static/photo/icon-setting.png" />
		</div>
	</div>

</template>

<script>
	export default {
		props: {
			title:{
				default:"",
				type:String
			},
			subTitle:{
				default:"",
				type:String
			},
			imgSrc:{
				default:"",
				type:String
			}
		},
		components: {},
		data() {
			return {};
		},
		created() {

		},
		methods: {

		}
	}
</script>

<style lang="scss" scoped>
	.item-root {
		height: 290px;
		width: 220px;
		display: flex;
		flex-direction: column;
		border-radius: 10px;

		.item-img {
			object-fit: contain;
			width: 220px;
			height: 220px;
		}

		.item-bottom-root {
			background-color: white;
			padding: 20px;
			display: flex;
			align-items: center;

			.item-bottom-root-left {
				max-width: 140px;
				margin-right: 15px;
				display: flex;
				flex-direction: column;

				.item-title {
					color: $nas-text-title;
					font-size: 18px;
					font-weight: bolder;
				}

				.item-subtitle {
					margin-top: 2px;
					color: $nas-text-content;
				}
			}

			.item-icon {
				width: 26px;
				height: 26px;
				object-fit: contain;
			}
		}
	}
</style>
