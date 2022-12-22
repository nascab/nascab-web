<template>
	<div class="root-tools">
		<div class="grid-line">
			<div class="grid-item" @click="goAddGps">
				<vs-card class="menu-card" type="1">
					<template #title>
						<h3 class="item-title">{{$t('photo.addPhotoGpsInfo')}}</h3>
					</template>
					<template #img>
						<span class="nasIcons icon-position" style="font-size: 80px;"></span>
					</template>
					<template #text>
						<p>
						</p>
					</template>
				</vs-card>
			</div>
		</div>
		<!-- 照片位置补充 -->
		<Modal v-model="showAddGps" fullscreen footer-hide>
			<div slot="header"
				style="width: 100%;height: 100%;display: flex;flex-direction: row;align-items: center;justify-content: space-between;">
				<div style="display: flex;">
					<Icon @click="showAddGps = false" size="24" type="md-return-left" />
					<Icon @click="showAddGpsHelp" style="margin-left: 10px;" type="ios-help-circle-outline" size="24" />
				</div>		
				<span>{{ $t('photo.addPhotoGpsInfo') }}</span>
				<span></span>
			</div>
			<add-gps v-if="showAddGps" ref="addGps"></add-gps>
		</Modal>

	</div>
</template>
<script>
	import addGps from "@/views/photos/photo-list/photoTools/addGps.vue";

	export default {
		props: {

		},
		components: {
			addGps
		},
		data() {
			return {
				showAddGps: false,
			};
		},
		mounted() {

		},
		beforeDestroy() {

		},
		methods: {
			showAddGpsHelp() {
				console.log('showHelp')
				this.showVsAlertDialog(this.$t('help.howToWork'), this.$t('help.addGpsHelp'))
			},
			goAddGps() {
				this.showAddGps = true
			}
		}
	};
</script>
<style lang="scss" scoped>
	.root-tools {
		padding: 20px;
		position: relative;
		z-index: 1;
		width: 100%;
		height: 100%;
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
		background-color: rgba(255, 255, 255, 0.6);
	}

	.grid-line {
		display: flex;
		flex-direction: row;
		align-items: center;

		.grid-item {
			cursor: pointer;
			border-radius: 20%;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
		}
		.menu-card{
			width: 220px;
			height: 220px;
		}

		.grid-item-text {
			color: white;
			margin-top: 5px;
			font-size: 16px;
		}
	}
</style>
