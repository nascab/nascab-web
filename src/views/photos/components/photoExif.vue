<template>
	<div class="exif-root">

		<div class="exif-wrapper">
			<div class="title-root">
				<!-- 标题 -->
				<Icon color="white" class="exif-close" type="md-close" size="25" @click="closeExif" />
				<p class="title">{{ $t('file.fileExifInfo') }}</p>
				<!-- 重置缩略图 -->
				<!-- <Button @click="clearTinyImg" size="small"  style="position: absolute;right: 20px;">{{
						this.$t('file.resetTinyImg')
				}}</Button> -->
			</div>
			<Divider plain style="color:white">{{ $t('common.detail') }}</Divider>
			<!-- 基本信息 -->
			<div class="exif-item-root" v-if="indexObj&&indexObj.original_date">
				<!-- 基础信息 -->
				<Icon color="white" type="md-calendar" size="24" />
				<div class="exif-item-right" >
					<p class="exif-item-text-top">{{ indexObj.original_date }}</p>
					<div v-if="dateEditing" style="margin-top: 5px;display:flex;align-items:center">
						<DatePicker @on-change="onDateChange" :editable="true" type="datetime"
							:placeholder="$t('photo.selectPhotoTakeTime')" style="width: 175px" />
						<Icon color="white" type="md-close" size="24" style="cursor: pointer;margin-left: 5px;"
							@click="dateEditing = false; editDateValue = null" />
						<Icon color="white" v-if="editDateValue" type="md-checkmark" size="24"
							style="cursor: pointer;margin-left: 5px;" @click="submitNewDate" />
					</div>
					<p v-if="!dateEditing" class="exif-item-text-bottom">{{utils.formatTimeStamp(indexObj.original_time)
					}}
						<Icon color="white" @click="changeExifTime" style="cursor: pointer;margin-left: 5px;" type="md-create" />
					</p>
				</div>
			</div>
			<div class="exif-item-root" v-if="indexObj">
				<!-- 文件名 大小等 -->
				<Icon color="white" type="md-document" size="24" />
				<div class="exif-item-right">
					<p class="exif-item-text-top">{{ indexObj.path }}</p>
					<p class="exif-item-text-top">{{ indexObj.filename }}</p>
					<p class="exif-item-text-bottom">{{ (indexObj.size / 1024 / 1024).toFixed(2) }}MB
						{{ indexObj.width }}x{{ indexObj.height }}
					</p>
				</div>
			</div>
			<div class="exif-item-root" v-if="indexObj">
				<!-- 光圈 型号等等 -->
				<Icon color="white" type="ios-aperture" size="24"
					v-if="(indexObj.mode && indexObj.mode != 'undefined') || exifStr || (exifInfo && exifInfo.LensModel)" />
				<div class="exif-item-right">
					<p class="exif-item-text-top" v-if="indexObj.mode && indexObj.mode != 'undefined'">{{ indexObj.mode
					}}</p>
					<p class="exif-item-text-bottom" v-if="exifStr">{{ exifStr }}</p>
					<p class="exif-item-text-bottom" v-if="exifInfo && exifInfo.LensModel">{{ exifInfo.LensModel }}
					</p>
				</div>
			</div>
			<div class="geo-root" v-if="geoStr && geoStr != ' '">
				<div class="geo-title-root">
					<Icon color="white" type="md-pin" size="24" />
					<p style="margin-left: 10px;">{{ geoStr }}</p>
				</div>
			</div>
			<div style="margin-top: 20px; width: 100%;height: 100%;" id="exifmap" v-if="showMap"></div>
		</div>
	</div>
</template>

<script>
import L from "leaflet";
import 'leaflet/dist/leaflet.css'
import axios from "@/plugins/axios";

export default {
	name: "photo-exif",
	props: {
		indexObj: '',
		serverType: {
			default: 'photo',
			type: String
		}
	},
	mounted() {
		this.$nextTick(() => {
			this.initExif()
		})
	},
	data() {
		return {
			showMap: false,//是否显示地图
			dateEditing: false,
			editDateValue: null,
			exifInfo: '',
			exifStr: '',
			geoStr: null,
			map: null,
			imgMaker: null
		};
	},
	watch: {
		indexObj(newV, oldV) {
			console.log('indexObj change', newV)
			this.$nextTick(() => {
				this.initExif()
			})
		}
	},
	methods: {
		initExif() {
			if (!this.indexObj) {
				console.log('this.indexobj 空的')
				return
			}
			this.showMap = false
			this.getExifInfo()
			this.getPositionStr()

			this.dateEditing = false
			this.editDateValue = null
			//照片默认支持修改位置
			if (this.indexObj && this.indexObj.type == 1) {
				this.showMap = true
			}
			//视频不支持修改
			if (this.indexObj && this.indexObj.type == 2 && this.indexObj.latitude && this.indexObj.latitude != 'undefined') {
				this.showMap = true
			}
			if (this.serverType != 'photo') {
				this.showMap = false
			}

			this.$nextTick(() => {
				if (this.map) {
					this.map.remove()
					this.map = null
				}
				this.getZoomInfo()
			})
		},
		getZoomInfo() {
			//获取服务器支持的缩放级别
			this.api
				.post("/api/mapApi/getZoom", {
					hideLoading:true
				})
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
		onDateChange(newDate) {
			this.editDateValue = newDate
		},
		//提交新的拍摄日期
		submitNewDate() {
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('photo.confirmChangePhotoTime'), () => {
				this.editExifByIndexId(null, null, this.editDateValue)
			})
		},
		addMarker() {
			var myIcon = L.icon({
				iconUrl: 'icon_position.png',
				iconSize: [38, 38]
			});

			//创建标记点
			this.imgMaker = L.marker([this.indexObj.latitude, this.indexObj.longitude], {
				icon: myIcon
			})
			if (this.map && this.imgMaker) {
				this.imgMaker.addTo(this.map)
			}
		},
		initMap(minZoom, maxZoom) {
			if (!this.showMap) {
				console.log('!this.showMap')
				return
			}
			let hasPosition = true
			if (!this.indexObj.latitude || !this.indexObj.longitude || this.indexObj.longitude == "undefined" || this.indexObj.longitude == "undefined") {
				hasPosition = false
			}

			var url_normal = axios.mapUrl;

			let center = null
			let zoomLevel = 8
			if (hasPosition) {
				center = new L.LatLng(this.indexObj.latitude, this.indexObj.longitude);
			} else {
				zoomLevel = 3
				center = new L.LatLng(36, 106);
			}
			var glayer_normal = new L.TileLayer(url_normal, {
				minZoom: minZoom,
				maxZoom: maxZoom,
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
				attributionControl: false
			}

			this.map = new L.Map('exifmap', mapParams);
			//地图点击事件
			this.map.on('click', (ev) => {
				//视频暂时不支持修改位置
				if (this.indexObj.type != 1) {
					return this.showVsNotification(this.$t('photo.onlySupportPhoto'))
				}
				console.log('地图点击事件出发', new Date())
				//询问用户是否修改位置
				this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('photo.changePosition'), () => {
					this.editExifByIndexId(ev.latlng.lat, ev.latlng.lng)
				})
			});
			if (hasPosition) this.addMarker()

		},
		changeExifTime() {
			this.dateEditing = true
		},
		//编辑exif信息
		editExifByIndexId(latitude, longitude, newDate) {
			if (this.indexObj.type != 1 || (!this.indexObj.filename.toLowerCase().endsWith(".jpeg")&&!this.indexObj.filename.toLowerCase().endsWith(".jpg"))) {
				return this.showVsNotification(this.$t('photo.onlySupportPhoto'))
			}

			this.api
				.post("/api/photoApi/editExifByIndexId", {
					latitude: latitude,
					longitude: longitude,
					newDate: newDate,
					id: this.indexObj.id
				})
				.then((res) => {
					if (!res.code) {
						this.$emit('onIndexUpdate', res.newIndex)
						this.$bus.$emit('onIndexUpdate', res.newIndex)
						this.initExif()
					}
				})
				.catch((error) => {
				});
		},
		getPositionStr() {
			if (!this.indexObj.geohash) {
				return
			}
			this.api
				.post("/api/mapApi/getLocationStr", {
					hideLoading: true,
					indexId: this.indexObj.id
				})
				.then((res) => {
					if (!res.code) {
						this.geoStr = res.geo.name + ' ' + res.geo.cn_name
					}
				})
				.catch((error) => { });
		},
		getExifInfo() {
			this.api.post('/api/fileApi/getInfo', {
				hideLoading: true,
				indexId: this.indexObj.id
			}).then((res) => {
				let result = res.data
				let exifStr = ""
				if (result.exifInfo) {
					if (result.exifInfo.FNumber) {
						let fnum = result.exifInfo.FNumber
						exifStr += `f/` + fnum
					}
					if (result.exifInfo.ExposureTime) {
						let exTime = Math.round(1 / result.exifInfo.ExposureTime)
						exifStr += ` 1/` + exTime
					}
					if (result.exifInfo.FocalLength) {
						let focalLen = Math.round(result.exifInfo.FocalLength)
						let focalLen35 = Math.round(result.exifInfo.FocalLengthIn35mmFormat)

						exifStr += ` ${focalLen}mm`
					}
					if (result.exifInfo.ISO) {
						let ISO = Math.round(result.exifInfo.ISO)
						exifStr += ` ISO:${ISO}`
					}
				}
				this.exifInfo = result.exifInfo
				this.exifStr = exifStr
			}).catch((error) => { })
		},
		closeExif() {
			this.$emit('closeExif')
		},
		clearTinyImg() {
			this.api
				.post("/api/fileApi/clearTinyImg", {
					indexId: this.indexObj.id,
				})
				.then((res) => {
					if (!res.code) {
						this.showVsNotification(this.$t('file.resetTinyImgSuccess'));
					}
				})
				.catch((error) => {
					this.showVsNotification(this.$t('common.operationFail'))
				});
		}
	},

}
</script>

<style lang="scss" scoped>
.geo-root {
	width: 100%;
	margin-left: 20px;
	margin-top: 20px;
	display: flex;
	flex-direction: column;

	.geo-title-root {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
}

.exif-root {
	padding-top: 20px;
	z-index: 999;
	position: fixed;
	height: 100%;
	width: 300px;
	min-width: 300px;
	background: $nas-bg-dark;
	right: 0;
	top: 0;
	p{
		color:white;
		font-size:14px;
	}
}

.exif-wrapper {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: flex-start;

	.title-root {
		position: relative;
		display: flex;
		flex-direction: row;
		align-items: center;
		width: 100%;
		height: 60px;

		.title {
			margin-left: 10px;
			word-break: break-all;

		}

		.exif-close {
			cursor:pointer;
			margin-left: 10px;
		}

	}

	.text-detail {
		margin-left: 20px;
		margin-top: 10px;
	}

	.exif-item-root {
		margin-top: 15px;
		display: flex;
		flex-direction: row;
		align-items: center;
		width: 100%;
		padding-left: 20px;
		padding-right: 20px;

		.exif-item-right {
			display: flex;
			flex-direction: column;
			margin-left: 10px;

			.exif-item-text-top {
				text-align: left;
				word-break: break-all;

			}

			.exif-item-text-bottom {
				text-align: left;
				margin-top: 3px;
				word-break: break-all;

			}
		}
	}

}
</style>
