<template>
	<div class="root" v-if="indexObj">
		<Divider>{{$t('home.photoManage')}}</Divider>
		<div class="item-root">
			<!-- 索引数量 -->
			<div>{{$t('home.indexCount')}}:</div>
			<span style="margin-right: 20px;">{{indexObj.file_index_photo.indexCount}}</span>
			<vs-button type="warn" @click="goResetIndex('photo')" style="height: 25px;">
				{{$t('setting.resetIndex')}}
			</vs-button>
		</div>
		<div class="divider"></div>
		<div class="item-root">
			<div>{{$t('photo.image')}}:</div>
			<span style="margin-right: 20px;">{{indexObj.file_index_photo.photoCount}}</span>
		</div>
		<div class="divider"></div>
		<div class="item-root">
			<div>{{$t('photo.video')}}:</div>
			<span style="margin-right: 20px;">{{indexObj.file_index_photo.videoCount}}</span>
		</div>
		
		<Divider>{{$t('home.movieManage')}}</Divider>
		<div class="item-root">
			<!-- 索引数量 -->
			<div>{{$t('home.indexCount')}}:</div>
			<span style="margin-right: 20px;">{{indexObj.file_index_movie.indexCount}}</span>
			<vs-button type="warn" @click="goResetIndex('movie')" style="height: 25px;">
				{{$t('setting.resetIndex')}}
			</vs-button>
		</div>
		<div class="divider"></div>
		<div class="item-root">
			<div>{{$t('photo.image')}}:</div>
			<span style="margin-right: 20px;">{{indexObj.file_index_movie.photoCount}}</span>
		</div>
		<div class="divider"></div>
		<div class="item-root">
			<div>{{$t('photo.video')}}:</div>
			<span style="margin-right: 20px;">{{indexObj.file_index_movie.videoCount}}</span>
		</div>
	</div>
</template>
<script>
	export default {
		mounted() {
			this.getIndexCount()
		},
		components: {

		},

		data() {
			return {
				indexObj: null
			}
		},
		computed: {

		},
		methods: {
			goResetTiny() {
				this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('setting.resetTinyImageAlert'), () => {
					this.resetTinyImg();
				})
			},
			resetTinyImg() {
				this.api.post('/api/commonApi/resetTinyImg', {}).then((res) => {
					console.log(res)
					this.showVsNotification(this.$t('common.operationSuccess'))
				}).catch((error) => {})
			},
			goResetIndex(serverType) {
				this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('setting.resetIndexAlert'), () => {
					this.resetIndex(serverType);
				})
			},
			resetIndex(serverType) {
				this.api.post('/api/commonApi/resetIndex', {serverType:serverType}).then((res) => {
					console.log(res)
					this.showVsNotification(this.$t('common.operationSuccess'))
					this.getIndexCount()
				}).catch((error) => {})
			},
			getIndexCount() {
				this.api.post('/api/commonApi/getIndexCount', {}).then((res) => {
					console.log(res)
					this.indexObj = res.data
				}).catch((error) => {})
			}

		}
	}
</script>
<style lang="scss" scoped>
	.root {
		display: flex;
		flex-direction: column;
	}

	.item-root {
		padding:10px;
		width: 100%;
		justify-content: flex-start;
		display: flex;
		align-items: center;
		flex-direction: row;
	}

	.divider {
		width: 100%;
		height: 1px;
		background-color: #eee;
	}
</style>
