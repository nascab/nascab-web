<template>
	<div class="root">
		<!-- 相册类型 -->
		<div class="nas-mobile-none">
			<Menu mode="horizontal" theme="light" active-name="date" @on-select="onChangeAlbumType">
				<!-- 智能日期 -->
				<MenuItem name="date">
				<Icon type="md-calendar" />
				{{ $t('album.aiDateAlbum') }}
				</MenuItem>
				<!-- 地理围栏 -->
				<MenuItem name="geo">
				<Icon type="md-plane" />
				{{ $t('album.geoAlbum') }}
				</MenuItem>
				<!-- 设备相册 -->
				<MenuItem name="mode">
				<Icon type="md-phone-portrait" />
				{{ $t('album.modeAlbum') }}
				</MenuItem>
				<!-- 条件相册 -->
				<MenuItem name="condition">
				<Icon type="ios-options" />
				{{ $t('photo.filterAlubm') }}
				</MenuItem>
			</Menu>
		</div>
		<!-- 手机端ui -->
		<div class="nas-mobile-show" style="width:100%">
			<vs-select placeholder="Select" v-model="albumType" class="type-select">
				<vs-option :label="$t('album.aiDateAlbum')" value="date">
					{{ $t('album.aiDateAlbum') }}
				</vs-option>
				<vs-option :label="$t('album.geoAlbum')" value="geo">
					{{ $t('album.geoAlbum') }}
				</vs-option>
				<vs-option :label="$t('album.modeAlbum')" value="mode">
					{{ $t('album.modeAlbum') }}
				</vs-option>
				<vs-option :label="$t('photo.filterAlubm')" value="condition">
					{{ $t('photo.filterAlubm') }}
				</vs-option>
			</vs-select>
		</div>
		<!-- 智能日期 -->
		<div class="date-root" v-if="albumType == 'date'">
			<div style="display: flex;flex-direction: column;align-items: flex-start">
				<h4 style="margin-bottom: 10px;text-align: left;">
					{{ $t('album.dateType') }}:
				</h4>
				<RadioGroup v-model="dateType">
					<Radio label="aiDate">
						<Icon type="md-sunny" size="16"></Icon>
						<span>{{ $t('album.memoryDate') }}</span>
					</Radio>
					<Radio label="holidays">
						<Icon type="md-beer" size="16"></Icon>
						<span>{{ $t('album.holidays') }}</span>
					</Radio>
					<Radio label="fix">
						<Icon type="md-pricetags" size="16"></Icon>
						<span>{{ $t('album.fixDate') }}</span>
					</Radio>
					<Radio label="section">
						<Icon type="md-swap" size="16"></Icon>
						<span>{{ $t('album.sectionDate') }}</span>
					</Radio>
				</RadioGroup>


			</div>
			<!--  例如：您的生日是1月1日，您可以选择'每年1月1日'，这样，每年1月1日拍摄的照片将位于此相册中-->
			<div v-if="dateType == 'aiDate'" style="margin-top: 10px;text-align: left;">
				<p>{{ $t('album.aiDateExample') }}</p>
			</div>
			<div v-if="dateType == 'fix'" style="margin-top: 10px;text-align: left;">
				<p>{{ $t('album.fixDateExample') }}</p>
			</div>
			<div v-if="dateType == 'section'" style="margin-top: 10px;text-align: left;">
				<p>{{ $t('album.sectionDateExample') }}</p>
			</div>

			<div style="display: flex;flex-direction: column;align-items: flex-start;">
				<div style="margin-top: 30px;">
					<!-- 拍摄日期 -->
					<h4 style="margin-bottom: 10px;text-align: left;">
						{{ $t('album.takePhotoDate') }}:
					</h4>

					<!-- 智能日期 -->
					<div v-if="dateType == 'aiDate'" style="display: flex;align-items: center;">

						<Cascader :placeholder="$t('album.chooseDate')" style="width: 150px;" :data="aiDateList"
							v-model="aiDateValue"></Cascader>
						<RadioGroup v-model="aiDateType" style="margin-left:10px">
							<!-- 公历 -->
							<Radio label="solar">
								<span>{{ $t('photo.solar') }}</span>
							</Radio>
							<!-- 农历 -->
							<Radio label="lunar">
								<span>{{ $t('photo.lunar') }}</span>
							</Radio>
						</RadioGroup>
					</div>
					<!-- 节假日 -->
					<div v-if="dateType == 'holidays'">
						<Select @on-select="onHolidaySelect" style="width:200px">
							<Option v-for="(item, index) in holidayList" :value="index">{{ item.label }}</Option>
						</Select>
					</div>
					<!-- 固定日期 -->
					<div v-if="dateType == 'fix'">
						<DatePicker type="date" v-model="fixDateValue" :placeholder="$t('album.chooseDate')"
							style="width: 150px"></DatePicker>
						<!-- 等于大于小于 -->
						<Select v-model="fixDateFilterValue" style="width:80px;margin-left: 10px;">
							<Option v-for="item in fixFilterList" :value="item.value" :key="item.value">{{ item.label }}
							</Option>
						</Select>

					</div>
					<!-- 区间日期 -->
					<div v-if="dateType == 'section'">
						<DatePicker type="daterange" v-model="sectionDateValue" :placeholder="$t('album.chooseDateSection')"
							style="width: 300px">
						</DatePicker>
					</div>
				</div>
			</div>
		</div>
		<!-- 地理围栏相册-->
		<div v-if="albumType == 'geo'">
			<h4 style="margin-top: 30px;margin-bottom: 20px;">{{ $t('album.geoAlbumExample') }}</h4>
			<div id="albumMap" style="width: 100%;height: 300px;"></div>
			<Button type="info" @click="startSelectArea" style="margin-right: 20px;margin-top: 20px;">{{
				$t('album.selectArea')
			}}</Button>
			<Button type="success" @click="clearSelectArea" style="margin-top: 20px;">{{ $t('album.clearSelectArea')
			}}</Button>
		</div>
		<!-- 按设备型号创建相册 -->
		<div v-if="albumType == 'mode'" style="display: flex;flex-direction: column;align-items: flex-start;">
			<h4 style="margin-bottom: 10px;margin-top: 10px;">
				{{ $t('album.mode') }}:
			</h4>
			<AutoComplete v-model="inputModeValue" :data="modeList" @on-search="searchMode" placeholder="input here"
				style="width:200px" :placeholder="$t('album.pleaseInputMode')"></AutoComplete>
			<h4 style="margin-top: 20px;">{{ $t('album.modeAlbumExample') }}</h4>

		</div>

		<!-- 按条件筛选 -->
		<div v-if="albumType == 'condition'" style="display: flex;flex-direction: column;align-items: flex-start;">
			<h4 style="margin-bottom: 10px;margin-top: 10px;">
				{{ $t('photo.filterInfo') }}:
			</h4>
			<div>
				<!-- 条件字段 -->
				<Select v-model="conditionName" style="width:100px;" @on-change="onConditionChange">
					<Option v-for="item in conditionList" :value="item.value" :key="item.value">{{ item.label }}
					</Option>
				</Select>
				<!-- 等于大于小于 -->
				<Select v-model="filterValue" style="width:100px;margin-left: 10px;">
					<Option v-for="item in filterList" :value="item.value" :key="item.value">{{ item.label }}
					</Option>
				</Select>
				<!-- 筛选值 -->
				<Input autocapitalize="off" autocorrect="off" maxlength="30" v-model="conditionValue"
					:placeholder="$t('movie.filterValue')" style="width: 80px;margin-left: 10px;" />
				<span style="margin-left: 5px;" v-if="conditionName == 'size'">MB</span>
				<span style="margin-left: 5px;" v-if="conditionName == 'width' || conditionName == 'height'">{{ $t("pixel")
				}}</span>
				<span style="margin-left: 5px;" v-if="conditionName == 'duration'">{{ $t("second") }}</span>
			</div>
		</div>

		<div style="margin-top: 30px;">
			<!-- 相册名字 -->
			<h4 style="margin-bottom: 10px;text-align: left;">
				{{ $t('album.albumName') }}:
			</h4>
			<div style="display: flex;align-items: center;">
				<Input autocapitalize="off" autocorrect="off" maxlength="30" v-model="albumName"
					:placeholder="$t('album.albumName')" style="width: 300px" />
				<!-- 创建相册按钮 -->
				<vs-button @click="createAlbum" type="primary" style="margin-left: 20px;padding-left:10px;padding-right:10px;flex-shrink:0">
					<!-- <Icon type="md-add-circle" style="margin-right: 10px;" /> -->
					{{ $t('album.createAlbum') }}
				</vs-button>
			</div>
		</div>
	</div>
</template>

<script>

import geohash from "ngeohash"
import chooseData from "./chooseData/aiDataValue.js"
import axios from "@/plugins/axios";
import L from "leaflet";
import 'leaflet/dist/leaflet.css'
import '@/plugins/leafletAreaSelection/styles.module.css';
import {
	DrawAreaSelection
} from '@/plugins/leafletAreaSelection';
export default {
	data() {
		return {
			modeList: [], //输入型号的时候待选列表
			inputModeValue: '', //输入的型号值
			selectGeoHash: [],
			areaSelection: null,
			map: null,
			albumName: "", //相册名称
			albumType: "date", //选中的相册类型 默认日期相册
			dateType: "aiDate", //日期相册的类型 默认智能日期相册
			aiDateType: "solar",//solar 公历 lunar 农历
			aiDateValue: [], //智能日期选择后的值
			selectedHoliday: null,
			aiDateList: chooseData.aiDataValue, //智能日期的选项 太长放在在另外的js里
			holidayList: chooseData.holidayList,//节日列表
			sectionDateValue: "", //区间日期值
			fixDateValue: "", //固定日期选择值
			fixDateFilterValue: "=", //固定日期的 符号 等于 大于 小于
			fixFilterList: [{ //固定日期数据源 符号 等于 大于 小于
				value: '=',
				label: this.$t('album.eq')
			},
			{
				value: '>',
				label: this.$t('album.gt')
			},
			{
				value: '<',
				label: this.$t('album.lt')
			}
			],
			filterValue: "", //条件符号 
			conditionName: "", //要筛选的字段名
			conditionValue: "",//要筛选的字段值
			conditionList: [
				{ //固定日期数据源 符号 等于 大于 小于
					value: 'filename',
					label: this.$t('movie.filename')
				},
				{
					value: 'path',
					label: this.$t('common.filepath')
				},
				{
					value: 'size',
					label: this.$t('file.size')
				},
				{
					value: 'duration',
					label: this.$t('video.duration')
				},
				{
					value: 'width',
					label: this.$t('width')
				},
				{
					value: 'height',
					label: this.$t('height')
				}
			],
			filterNumber: [
				{
					value: '>',
					label: this.$t('common.gt')
				},
				{
					value: '=',
					label: this.$t('common.eq')
				},

				{
					value: '<',
					label: this.$t('common.lt')
				}
			],
			fiterStr: [
				{
					value: 'like',
					label: this.$t('common.contain')
				}
			],
			filterList: []
		}
	},
	watch: {
		albumType: function (newVal) {
			this.onChangeAlbumType(newVal)
		}
	},
	mounted() { },
	methods: {
		onConditionChange(conditionItem) {
			if (conditionItem == "size" || conditionItem == "duration" || conditionItem == "width" || conditionItem == "height") {
				this.filterList = this.filterNumber
			} else {
				this.filterList = this.fiterStr
			}
			this.filterValue = this.filterList[0].value
		},

		onHolidaySelect(holidayIndex) {
			this.selectedHoliday = this.holidayList[holidayIndex.value]
			this.albumName = this.selectedHoliday.label
		},
		//根据用户输入的关键字搜索
		searchMode(value) {
			value = value.trim()
			if (value) {
				this.api
					.post("/api/photoApi/searchMode", {
						key: value,
						hideLoading: true
					})
					.then((res) => {
						if (!res.code) {
							this.modeList = res.data
						}
					})
					.catch((error) => { });
			}
		},
		//提交创建相册
		createAlbum() {
			if (!this.albumName) {
				this.showVsNotification(this.$t('album.pleaseInputAlbumName'))
				return
			}
			let searchField = ''
			let searchValue = ''
			let dataValue = {}
			if (this.albumType == 'date') {
				dataValue.type = this.dateType
				//日期相册
				searchField = 'original_date'
				if (this.dateType == 'aiDate') { //智能日期
					if (this.aiDateValue.length < 3) {
						this.showVsNotification(this.$t('album.chooseDate'))
						return
					}
					dataValue.year = this.aiDateValue[0]
					dataValue.month = this.aiDateValue[1]
					dataValue.day = this.aiDateValue[2]
					console.log("this.aiDateType", this.aiDateType)
					if (this.aiDateType == "solar") {//公历
						searchValue = "LIKE '" + this.aiDateValue[0] + '-' + this.aiDateValue[1] + '-' + this.aiDateValue[
							2] + "'"
					} else if (this.aiDateType == "lunar") {//阴历
						dataValue.isLunar = 1
						searchValue = chooseData.getLunarInSql(dataValue.month, dataValue.day)
					}
					console.log("searchValue", searchValue)
				} else if (this.dateType == 'fix') { //固定日期
					searchField = 'original_time'
					if (this.fixDateValue.length < 3) {
						this.showVsNotification(this.$t('album.chooseDate'))
						return
					}
					let chooseDate = new Date(this.fixDateValue)
					let chooseTime = chooseDate.getTime()
					if (this.fixDateFilterValue == '=') {
						//等于某一天的时候 需要查询一天之内整个区间
						let endTims = chooseTime + 24 * 60 * 60 * 1000
						searchValue = "between " + chooseTime + " and " + endTims
					} else {
						searchValue = this.fixDateFilterValue + " " + chooseTime
					}
					dataValue.sign = this.fixDateFilterValue
					dataValue.year = chooseDate.getFullYear()
					dataValue.month = chooseDate.getMonth() + 1
					dataValue.day = chooseDate.getDate()

				} else if (this.dateType == 'section') { //区间日期
					searchField = 'original_time'
					if (this.sectionDateValue.length < 2) {
						this.showVsNotification(this.$t('album.chooseDateSection'))
						return
					}
					let startDate = new Date(this.sectionDateValue[0])
					let startTims = startDate.getTime()
					let endDate = new Date(this.sectionDateValue[1])
					let endTims = endDate.getTime()
					searchValue = "between " + startTims + " and " + endTims

					dataValue.year_start = startDate.getFullYear()
					dataValue.month_start = startDate.getMonth() + 1
					dataValue.day_start = startDate.getDate()
					dataValue.year_end = endDate.getFullYear()
					dataValue.month_end = endDate.getMonth() + 1
					dataValue.day_end = endDate.getDate()

				} else if (this.dateType == 'holidays') {
					searchValue = this.selectedHoliday.searchValue
					dataValue.holidayName = this.selectedHoliday.label
				}
			} else if (this.albumType == "geo") {
				//地理围栏相册
				if (this.selectGeoHash.length < 1) {
					this.showVsNotification(this.$t('album.pleaseSelectArea'))
					return
				}
				searchField = 'geohash' + this.selectGeoHash[0].length
				searchValue += "("
				for (let i = 0; i < this.selectGeoHash.length; i++) {
					searchValue += ("'" + this.selectGeoHash[i] + "'")
					if (i != this.selectGeoHash.length - 1) {
						searchValue += ","
					}
				}
				searchValue += ")"
				dataValue.geoHash = this.selectGeoHash[parseInt(this.selectGeoHash.length / 2)]

			} else if (this.albumType == "mode") {
				//根据设备型号创建相册
				if (this.inputModeValue.length < 1) {
					this.showVsNotification(this.$t('album.pleaseInputMode'))
					return
				}
				searchField = 'mode'
				searchValue = this.inputModeValue
				dataValue.mode = this.inputModeValue
			} else if (this.albumType == "condition") {
				//条件相册
				if (!this.filterValue || !this.conditionName || !this.conditionValue) {
					return this.showVsNotification(this.$t('movie.pleaseCompleteFilterInfo'))
				}
				searchField = this.conditionName
				searchValue = ` ${this.conditionName} ${this.filterValue} `
				if (this.filterValue == "like") {
					searchValue += ` '%${this.conditionValue}%' `
				} else {
					if (!Number.isInteger(parseInt(this.conditionValue))) {
						this.showVsNotification(this.$t('valueMustBeNum'))
						return
					}
					if (this.conditionName == "size") {
						searchValue += ` ${parseInt(this.conditionValue) * 1024 * 1024}`
					} else if (this.conditionName == "duration") {
						searchValue = ` (duration!='undefined' and duration ${this.filterValue} ${parseInt(this.conditionValue)})`
					} else if (this.conditionName == "width" || this.conditionName == "height") {
						searchValue += ` ${parseInt(this.conditionValue)}`
					}
				}
				// 设置相册描述文字
				try {

					let filedName = ""
					let filedConditionName = ""
					for (let i in this.conditionList) {
						if (this.conditionList[i].value == this.conditionName) {
							filedName = this.conditionList[i].label
							break
						}
					}
					for (let i in this.filterList) {
						if (this.filterList[i].value == this.filterValue) {
							filedConditionName = this.filterList[i].label
							break
						}
					}
					dataValue = filedName + " " + filedConditionName + " " + this.conditionValue
					if (this.conditionName == "size") {
						dataValue += "MB"
					} else if (this.conditionName == "duration") {
						dataValue += this.$t("second")
					} else if (this.conditionName == "width" || this.conditionName == "height") {
						dataValue += this.$t("pixel")
					}
				} catch (err) {
					dataValue = ""
				}
			}
			// 调用添加接口
			this.api
				.post("/api/photoApi/addAlbum", {
					type: this.albumType,
					data: {
						searchField: searchField,
						searchValue: searchValue
					},
					name: this.albumName,
					data_value: dataValue
				})
				.then((res) => {
					if (!res.code) {
						this.showVsAlertDialog(this.$t('common.alert'), this.$t('album.createAlbumSuccess'),
							() => {
								this.albumName = ''
								this.$emit('onAdd')
							})
					}
				})
				.catch((error) => { });
		},
		initMap(minZoom, maxZoom) {
			if (this.map) {
				return
			}
			var url_normal = axios.mapUrl;
			var glayer_normal = new L.TileLayer(url_normal, {
				minZoom: minZoom,
				maxZoom: maxZoom,
				attribution: 'MAP'
			});
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
			this.map = new L.Map('albumMap', {
				maxBounds: bounds,
				attributionControl: false,
				center: center,
				zoom: parseInt(maxZoom/2),
				layers: [glayer_normal]
			});



			this.areaSelection = new DrawAreaSelection({
				//地图圈选回调
				onPolygonReady: (polygon) => {
					if (polygon._bounds) {
						let southWWest = polygon._bounds._southWest
						let northEast = polygon._bounds._northEast
						let minLat = southWWest.lat < northEast.lat ? southWWest.lat : northEast.lat
						let maxLat = northEast.lat > southWWest.lat ? northEast.lat : southWWest.lat
						let minLng = southWWest.lng < northEast.lng ? southWWest.lng : northEast.lng
						let maxLng = northEast.lng > southWWest.lng ? northEast.lng : southWWest.lng
						let latGap = maxLat - minLat
						let lngGap = maxLng - minLng
						//选取的范围过大 缩小geohash精度
						let precision = 5
						if (latGap > 1 || lngGap > 1) {
							precision = 4
						}
						if (latGap > 2 || lngGap > 2) {
							precision = 3
						}
						if (latGap > 15 || lngGap > 15) {
							precision = 2
						}
						let selectGeoHash = geohash.bboxes(minLat, minLng, maxLat, maxLng, precision)
						this.selectGeoHash = selectGeoHash
					}
				}
			});

			this.map.addControl(this.areaSelection);
		},
		startSelectArea() {
			this.areaSelection.activate()
		},
		clearSelectArea() {
			this.areaSelection.deactivate()
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
		onChangeAlbumType(val) {
			console.log(val)
			this.albumType = val
			if (this.albumType == "geo") {
				this.$nextTick(() => {
					this.getZoomInfo()
				})
			} else {
				this.map = null
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.root {
	padding: 10px;
	min-height: 350px;
	width: 100%;
}

.date-root {
	margin-top: 30px;
}
</style>
