<!-- 内容单独定义 有多个页面用到了 -->
<template>
	<div class="map-root">
		<div :style="{ 'border-top-left-radius': borderRadius, 'border-top-right-radius': borderRadius }"
			class="map-content" id="mainmap"></div>
		<Modal footer-hide ref="myModal" v-model="showPhotoGeo" fullscreen @on-visible-change="onModalShow"
			:closable="false">
			<album-detail v-if="showPhotoGeo" @onClose="showPhotoGeo = false" :propsNearMode="true"
				:propsShowSearchBtn="false" :propsTitle="selectPositionStr" :propsGeoHash="clickGeohash">
			</album-detail>
		</Modal>
	</div>
</template>

<script>
import L from "leaflet";
import 'leaflet/dist/leaflet.css'
import axios from "@/plugins/axios";
import albumDetail from "./albumDetail.vue"

export default {
	name: 'photoMap',
	props: {
		borderRadius: {
			default: "20px",
			type: String
		},
		albumId: {
			default: '',
			Type: String
		},
		ordinaryAlbumId: {
			default: '',
			Type: String
		}
	},
	components: {
		albumDetail
	},
	data() {
		return {
			albumFirstPhoto: null,
			showPhotoGeo: false,
			map: null,
			markerGroup: null,
			clickGeohash: null,
			selectPositionStr: ""
		}
	},
	mounted() {
		this.getZoomInfo()
		//监听后退事件
		window.addEventListener('popstate', this.onPopstate)
	},
	beforeDestroy() {
		window.removeEventListener('popstate', this.onPopstate);
	},
	// zoom5匹配经度2合适 6配3  9配4
	methods: {
		onPopstate() {
			console.log("后退点击")
			//后退按钮被点击 如果当前正在播放视频 则关闭视频 如果每播放 则后退
			if (this.showPhotoGeo) {
				this.showPhotoGeo = false
			} else {
				this.$router.go(-1)
			}
		},
		getZoomInfo() {
			//获取服务器支持的缩放级别
			this.api
				.get("/api/mapApi/getZoom", {})
				.then((res) => {
					console.log(res)
					if (!res.code) {
						this.initMap(parseInt(res.zoomInfo.minZoom), parseInt(res.zoomInfo.maxZoom))
					}
				})
				.catch((error) => {
					console.log(error)
				});
		},
		initMap(minZoom, maxZoom) {
			var url_normal = axios.mapUrl;
			// url_normal="https://tile.openstreetmap.org/{z}/{x}/{y}.png	"
			minZoom = minZoom < 4 ? 4 : minZoom
			var glayer_normal = new L.TileLayer(url_normal, {
				minZoom: minZoom,
				maxZoom: maxZoom,
				attribution: 'NORMAL'
			});
			glayer_normal.setZIndex(1)

			let lastCenterLat = localStorage.getItem('map-center-lat')
			let lastCenterLng = localStorage.getItem('map-center-lng')
			let centerLat = 38.8225909761771
			let centerLng = 105.380859375
			if (lastCenterLat && lastCenterLng) {
				centerLat = lastCenterLat
				centerLng = lastCenterLng
			}
			var center = new L.LatLng(centerLat, centerLng);

			var corner1 = L.latLng(-90, -360),
				corner2 = L.latLng(90, 360),
				bounds = L.latLngBounds(corner1, corner2);

			this.map = new L.Map('mainmap', {
				maxBounds: bounds,
				center: center,
				zoom: minZoom,
				attributionControl: false,
				layers: [glayer_normal]
			});

			if (this.albumId || this.ordinaryAlbumId) {
				this.getAlbumPhotoList()
			} else {
				this.map.on('moveend', (e) => {
					let center = this.map.getCenter()
					localStorage.setItem('map-center-lat', center.lat)
					localStorage.setItem('map-center-lng', center.lng)
					this.getHashBox(e)
				})
				//触发一次moveend
				this.map.zoomIn()
			}
			this.markerGroup = L.layerGroup().addTo(this.map);
		},
		onModalShow(e) {
			if (e) {
				// 动态修改一下modal的padding
				let modalBody = document.getElementsByClassName('ivu-modal-body')
				for (let i = 0; i < modalBody.length; i++) {
					if (modalBody[i] && modalBody[i].style) {
						modalBody[i].style.padding = 0
					}
				}
			}
		},
		dealPhotoMap(zoomLevel, photoList) {
			this.markerGroup.clearLayers();
			for (let i in photoList) {
				console.log(i)
				let photo = photoList[i]

				// 创建icon内容
				let img = document.createElement('img')
				img.src = axios.getImgFullPath(photo.id, true)
				img.style =
					"width: 100%;height: 100%; object-fit: cover;padding:2%"

				var myIcon = L.divIcon({
					iconSize: [10 * zoomLevel * 1.2, 10 * zoomLevel * 1.2],
					html: img
				});
				if (photo.latitude == 0 && photo.longitude == 0) {
					continue
				}
				if (photo.latitude == 'undefined' || photo.longitude == 'undefined') {
					continue
				}
				this.albumFirstPhoto = photo
				//创建标记点
				let imgMaker = L.marker([photo.latitude, photo.longitude], {
					icon: myIcon,
					indexId: photo.id
				})
				imgMaker.on('click', (e) => {
					this.api
						.post("/api/mapApi/getLocationStr", {
							indexId: photo.id,
						})
						.then((res) => {
							if (!res.code) {
								this.selectPositionStr = res.geo.name + ' ' + res.geo
									.cn_name
								this.clickGeohash = photo.geohash
								this.showPhotoGeo = true
								this.pushState()
							}
						})
						.catch((error) => {
							console.log(error)
						});
				})
				imgMaker.addTo(this.markerGroup);
			}
			if (this.albumId || this.ordinaryAlbumId) {
				//相册模式 中心点移动到第一张图片处
				if (this.albumFirstPhoto) {
					let newCenter = new L.LatLng(this.albumFirstPhoto.latitude, this.albumFirstPhoto.longitude)
					this.map.flyTo(newCenter)
				}
			}
		},
		getAlbumPhotoList() {
			let params = {}
			if (this.albumId) {
				params.albumId = this.albumId
			} else if (this.ordinaryAlbumId) {
				params.ordinaryAlbumId = this.ordinaryAlbumId
			}
			this.api
				.post("/api/photoApi/getAlbumPhotoForMap", params)
				.then((res) => {
					if (!res.code) {
						this.dealPhotoMap(4, res.mapPhoto)
					}
				})
				.catch((error) => {
					console.log(error)
					this.showVsNotification(JSON.stringify(error))
				});
		},
		getHashBox(e) {
			let zoomLevel = e.target._zoom
			let currentBounds = this.map.getBounds()
			let southWest = currentBounds._southWest
			let northEast = currentBounds._northEast
			let minLat = southWest.lat < northEast.lat ? southWest.lat : northEast.lat
			let maxLat = northEast.lat > southWest.lat ? northEast.lat : southWest.lat
			let minLng = southWest.lng < northEast.lng ? southWest.lng : northEast.lng
			let maxLng = northEast.lng > southWest.lng ? northEast.lng : southWest.lng
			let params = {
				hideLoading: true,
				minLat: minLat,
				minLng: minLng,
				maxLat: maxLat,
				maxLng: maxLng,
				zoom: zoomLevel
			}

			this.api
				.post("/api/photoApi/getBoundsPhoto", params)
				.then((res) => {
					if (!res.code) {
						this.dealPhotoMap(zoomLevel, res.mapPhoto)
					}
				})
				.catch((error) => {
				});

		}
	}
}
</script>

<style lang="scss" scoped>
.marker-img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: 10px;
}

.map-root {

	width: 100%;
	height: 100%;
}

.map-content {
	z-index: 1;
	width: 100%;
	height: 100%;
	min-width: 200px;
	min-height: 500px;
	position: relative;
}
</style>
