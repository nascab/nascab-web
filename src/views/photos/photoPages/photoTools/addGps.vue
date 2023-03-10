<template>
	<div class="root">
		<!-- 上半部分 待确认的照片列表 -->
		<div class="top">
			<!-- 标题 待补充位置的照片  -->
			<p class="title">{{$t('photo.dealListForAddGps')}}:</p>
			<div v-if="dealList.length<1&&!loading">{{$t('photo.noCanAddGpsPhoto')}}</div>
			<div class="photo-list">
				<div @click="onPhotoClick(index)" class="photo-root" v-for="(item, index) in dealList">
					<!-- 选中图 -->
					<!-- <img @click.stop="changeSelect(index,true)" v-if="!item.selected" class="icon-select"
						src="@/static/photo/icon-img-select.png"></img>
					<img @click.stop="changeSelect(index,false)" v-else class="icon-select"
						src="@/static/photo/icon-img-selected.png"></img> -->
					<!-- 图片预览 -->
					<img class="photo-img" :src="item.url"></img>
					<!-- 文件名称 -->
					<p style="margin-top: 5px;font-size: 16px;max-width: 150px;word-break: break-all;">
						{{item.fullPath}}
					</p>
					<div style="color: grey;margin-top: 3px;">{{item.original_date}}</div>
				</div>
			</div>
		</div>
		<Divider></Divider>
		<!-- 下半部分 地图和确认位置的按钮 -->
		<div class="bottom-root" v-if="dealList.length>0">
			<!-- 标题 确认照片拍摄位置-点击地图可以修改 -->
			<div class="bottom-left">
				<p style="margin-bottom: 20px;" class="title">{{$t('photo.confirmPhotoLocation')}}</p>
				<!--  地图 -->
				<div class="map-root">
					<div class="positionMap" id="positionMap"></div>
					<!-- 位置显示 -->
					<div
						style="position: absolute;right: 10px;top: 10px;z-index: 400;background-color: white;padding: 10px;">
						<p style="font-size: 16px;">{{locationStr}}</p>
					</div>
				</div>
			</div>

			<div class="bottom-right">
				<p style="margin-bottom: 20px;" class="title">{{$t('common.options')}}</p>

				<div style="display: flex;flex-direction: column;height: 100%;">
					<!-- 搜索位置 -->
					<AutoComplete @on-select='onSearchSelect' :clearable='true' v-model="placeStr"
						@on-search="searchPlace" class="search" :placeholder="$t('photo.searchPlace')"
						icon="ios-search">
						<Option v-for="(item,index) in placeList" :value="getOptionStr(item)">
							{{ getOptionStr(item) }}
						</Option>
					</AutoComplete>
					<!-- 恢复到推荐位置 -->
					<Button @click="resetPosition" size="large" class="btn-item"
						icon="md-sync">{{$t('photo.restorePosition')}}</Button>
					<!-- 跳过这些照片 -->
					<Button @click="skipList" type="warning" size="large" class="btn-item"
						icon="md-fastforward">{{$t('photo.skipAddGps')}}</Button>
					<!-- 将位置写入照片 -->
					<Button @click="confirmList" size="large" class="btn-item" type="primary"
						icon="md-pin">{{$t('photo.wirteGps')}}</Button>
				</div>
			</div>
		</div>
		<!-- 点击照片显示详情 -->
		<Modal v-model="showPhotoDetail" fullscreen footer-hide style="background-color: transparent;">
			<photo-detail v-if="showPhotoDetail" @onClose="showPhotoDetail = false" ref="photoDetail"></photo-detail>
		</Modal>
	</div>
</template>
<script>
	import photoDetail from "@/views/photos/components/photoDetail.vue";
	import L from "leaflet";
	import 'leaflet/dist/leaflet.css'
	export default {
		props: {

		},
		components: {
			photoDetail
		},
		data() {
			return {
				locationStr: '',
				currentLatitude: null, //当前经纬度
				currentLongitude: null, //当前经纬度
				placeList: [],
				placeStr: '',
				map: null,
				imgMaker: null,
				showPhotoDetail: false,
				dealList: [],
				loading: false,
				nearIndex: null
			};
		},
		mounted() {
			this.getWaitAddGpsIndex()
		},
		beforeDestroy() {

		},
		methods: {
			changeSelect(index, selected) {

				this.dealList[index].selected = selected
				this.$forceUpdate()

			},
			// 跳过
			skipList() {
				this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('photo.sureSkipAddGps'), () => {
					this.confirmAddGps('SKIP')
				})
			},
			//确认写入位置
			confirmList() {
				this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('photo.sureAddGps'), () => {
					this.confirmAddGps('CONFIRM')
				})
			},
			//跳过或者确认位置
			confirmAddGps(type) {
				if (this.dealList.length < 1) {
					return this.showVsNotification(this.$t('photo.noPendingPhotos'))
				}
				let indexIdList = []
				for (let i in this.dealList) {
					if (this.dealList[i].selected) {
						indexIdList.push(this.dealList[i].id)
					}
				}
				this.api
					.post("/api/addGpsApi/confirmAddGps", {
						type: type,
						latitude: this.currentLatitude,
						longitude: this.currentLongitude,
						indexIdList,
						hideLoading: true
					})
					.then((res) => {
						if (!res.code) {
							if (type == 'CONFIRM') {
								this.showVsNotification(this.$t('photo.gpsAddSuccess'))
								setTimeout(() => {
									this.getWaitAddGpsIndex()
								}, 500)
							} else {
								this.getWaitAddGpsIndex()
							}

						}
					})
					.catch((error) => {});
			},
			getOptionStr(option) {
				return option.cn_name + ' ' + option.name
			},
			onSearchSelect(optionStr) {
				for (let i in this.placeList) {
					if (optionStr == this.getOptionStr(this.placeList[i])) {
						this.addMarker(this.placeList[i].latitude, this.placeList[i].longitude)
						return
					}
				}
			},
			onPhotoClick(index) {
				this.showPhotoDetail = true;
				this.$nextTick(() => {
					this.$refs.photoDetail.showImg(this.dealList, index);
				});
			},
			getLocationStr() {
				this.api
					.post("/api/mapApi/getLocationStr", {
						lat: this.currentLatitude,
						lng: this.currentLongitude,
						hideLoading: true
					})
					.then((res) => {
						if (!res.code) {
							this.locationStr = this.getOptionStr(res.geo)
						}
					})
					.catch((error) => {});
			},
			//根据用户输入的关键字搜索
			searchPlace(value) {
				value = value.trim()
				if (value) {
					this.api
						.post("/api/mapApi/searchLocation", {
							searchStr: value,
							count: 15,
							hideLoading: true
						})
						.then((res) => {
							if (!res.code) {
								this.placeList = res.data
							}
						})
						.catch((error) => {});
				}
			},
			// 恢复到推荐位置
			resetPosition() {
				if (this.map && this.nearIndex) {

					this.addMarker(this.nearIndex.latitude, this.nearIndex.longitude)

				}
			},
			addMarker(latitude, longitude) {
				if (this.imgMaker) {
					this.map.removeLayer(this.imgMaker)
				}
				var myIcon = L.icon({
					iconUrl: 'icon_position.png',
					iconSize: [38, 38]
				});
				this.imgMaker = L.marker([latitude, longitude], {
					icon: myIcon
				})
				if (this.map) {
					this.currentLatitude = latitude
					this.currentLongitude = longitude
					this.getLocationStr()
					this.imgMaker.addTo(this.map)
					let newCenter = new L.LatLng(latitude, longitude)
					this.map.flyTo(newCenter)
				}
			},
			initMap() {
				if (!this.nearIndex) {
					console.log('!this.nearIndex')
					return
				}
				var url_normal = this.axios.mapUrl;
				let center = new L.LatLng(this.nearIndex.latitude, this.nearIndex.longitude);
				let zoomLevel = 7
				var glayer_normal = new L.TileLayer(url_normal, {
					minZoom: 4,
					maxZoom: 9,
					attribution: 'NORMAL'
				});
				var corner1 = L.latLng(-90, -360),
					corner2 = L.latLng(90, 360),
					bounds = L.latLngBounds(corner1, corner2);
				let mapParams = {
					maxBounds: bounds,
					zoom: zoomLevel,
					center: center,
					layers: [glayer_normal],
					attributionControl:false
				}
				this.map = new L.Map('positionMap', mapParams);
				//地图点击事件
				this.map.on('click', (ev) => {
					this.addMarker(ev.latlng.lat, ev.latlng.lng)
				});
				//创建标记点
				this.addMarker(this.nearIndex.latitude, this.nearIndex.longitude)
			},
			getWaitAddGpsIndex() {
				this.loading = true
				this.dealList = []
				this.locationStr = ""
				this.api
					.post("/api/addGpsApi/getWaitAddGpsIndex", {})
					.then((res) => {
						this.loading = false
						if (!res.code) {
							if (!res.data.dealList) {
								return this.showVsAlertDialog(this.$t('common.alert'), this.$t(
									'photo.noPendingPhotos'))
							} else {
								//nearIndex就是在相似时间拍摄的带有位置信息的照片索引
								this.nearIndex = res.data.nearIndex
								this.dealList = res.data.dealList
								for (let i in this.dealList) {
									let item = this.dealList[i]
									this.dealList[i].url = this.axios.getImgFullPath(item.id, true, item.filename);
									this.dealList[i].rawUrl = this.axios.getImgFullPath(item.id, false, item
										.filename);

									//默认为选中状态
									this.dealList[i].selected = true
								}
								this.$nextTick(() => {
									this.initMap()
								})
							}
						}
					})
					.catch((error) => {
						this.loading = false
					});
			}
		}
	};
</script>
<style lang="scss" scoped>
	.root {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow-y: hidden;
	}

	.top {
		width: 100%;

		.photo-list {
			display: flex;
			flex-direction: row;
			align-items: center;
			overflow-x: auto;

			.photo-root {
				position: relative;
				margin-right: 20px;
				margin-top: 20px;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;

				.icon-select {
					position: absolute;
					width: 30px;
					height: 30px;
					top: -10px;
					right: -10px;
				}

				.photo-img {
					object-fit: cover;
					width: 180px;
					height: 180px;
					border-radius: 20px;

				}
			}
		}
	}

	.title {
		font-size: 16px;
		font-weight: bold;
	}

	.bottom-root {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: row;

		.bottom-left {
			flex: 2;
			min-width: 500px;
			height: 100%;

			.map-root {
				position: relative;
				height: 100%;
				width: 100%;
			}
		}

		.bottom-right {
			margin-left: 20px;
			min-width: 200px;
			flex: 1;

			.search {
				margin-bottom: 20px;
			}
		}

		.positionMap {
			height: 90%;
			min-width: 500px;
		}
	}

	.btn-item {
		margin-top: 20px;
	}
</style>
