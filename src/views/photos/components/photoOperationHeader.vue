<template>
	<div style="height: 100%;width: 100%;position: relative;">
		<div class="layout-header-bar nas-padding-left nas-padding-right">
			<div class="header-right">
				<div style="display: flex;align-items: center;">
					<!-- 改变图片显示模式 -->
					<div class="root-img-mode">
						<Icon color="#386DF2" size="35" class="icon-showtype" v-if="showMode == 'cover'" type="ios-apps"
							@click="onChangeShowMode" />
						<Icon color="#386DF2" size="35" class="icon-showtype" v-else type="md-list"
							@click="onChangeShowMode" />
					</div>
					<!-- 全部/照片/视频 -->
					<my-menu-select @onItemClick="onChooseDataType" :optionList="typeMenuOptionList"></my-menu-select>
					<!-- 范围选择 -->
					<my-menu-select ref="rangeSelector" v-if="nearMode" style="display: inline-flex;margin-left: 10px;"
						@onItemClick="onChooseRange" :optionList="rangeMenuOptionList"></my-menu-select>
					<!-- 改变图片大小 -->
					<Slider class="zoom-slider" show-tip="never" v-model="sliderValue" :min="sliderMin" :max="sliderMax"
						:step="10" @on-input="onSizeChange">
					</Slider>

					<!-- 选择按钮 手机端显示 <Icon type="logo-android" />-->
					<!-- <div class="select-text" @click="$emit('onSwitchEditMode')">
						{{ editMode ? $t('common.cancelSelect') : $t('common.select') }}</div> -->
				</div>

				<div class="search-root" v-if="showSearchBtn">
					<!-- 安卓的播放器设置按钮 -->
					<!-- <my-btn-icon class="nas-mobile-show" iIcon="logo-android" v-if="isAndroid" style="margin-right:10px"
						@click="showAndroidPlayerSetting = true"></my-btn-icon> -->

					<!-- 搜索栏 -->
					<my-search :placeholder="$t('photo.searchPlaceHolder')" @onSearch="onSearch"></my-search>
				</div>
			</div>
		</div>
		<!-- 照片信息区 在头部显示日期-->
		<div v-if="showDateInfo" class="photo-info">
			<div class="photo-date">{{ datePrefix }} {{ topPhotoDate }}</div>
			<div class="photo-date">
				<span class="photo-geo" v-if="positionStr && positionStr != ' '">{{ positionStr }}</span>
				<span class="photo-mode" v-if="firstPhoto && firstPhoto.mode && firstPhoto.mode != 'undefined'">{{
					firstPhoto.mode
				}}</span>
			</div>
		</div>

	</div>
</template>

<script>
export default {
	props: {
		datePrefix: {
			default: "",
			type: String
		},
		albumId: {
			default: '',
			type: String
		},
		nearMode: {
			default: false,
			type: Boolean
		},
		editMode: {
			default: false,
			type: Boolean
		},
		showSearchBtn: {
			default: true,
			type: Boolean
		}
	},
	data() {
		return {
			showAndroidPlayerSetting: false,
			typeMenuOptionList: [{
				title: this.$t('photo.all'),
				id: "0"
			}, {
				title: this.$t('photo.photo'),
				id: "1"
			}, {
				title: this.$t('photo.video'),
				id: "2"
			}],
			rangeMenuOptionList: [{
				title: this.$t('photo.5km'),
				id: "0"
			}, {
				title: this.$t('photo.10km'),
				id: "1"
			}, {
				title: this.$t('photo.80km'),
				id: "2"
			}],
			sliderMin: 130,
			sliderMax: 350,
			sliderValue: 200,
			lastSliderValue: 200,
			itemBaseWidth: 200,
			itemWidth: 200,
			itemMargin: 5,
			searchStr: "",
			firstPhoto: null, //左上角第一个元素的索引
			loadingPositionStr: false,
			positionStr: "", //左上角第一个photo的位置描述字符串
			firstPhotoGeohash: "", //左上角第一个photo的geohash
			showRangeType: "0", //0为5km 对应geohash长度5位 1为20kmgeohash长度4位 2为150kmgeohash长度3位
			showMode: "cover", //图像显示模式
			showDateInfo: false,
			showFileType: "0", //拉的文件类型 0为全部 1为照片 2为视频
			topPhotoDate: "", //列表顶部的图片的日期
		}
	},
	mounted() {
		console.log(this.albumId)
		// 获取之前的设置
		let sliderValue = localStorage.getItem("photo-settging-img-size");
		if (sliderValue) {
			this.sliderValue = parseInt(sliderValue);
			this.$emit('onSizeChange', parseInt(sliderValue))
		}
		// 设置为保存的显示模式
		let showMode = localStorage.getItem("photo-settging-show-mode");
		if (showMode && this.showMode != showMode) {
			this.showMode = showMode;
			this.$emit('onChangeShowMode', this.showMode)
		}

		//设置为保存的范围
		let showRangeType = localStorage.getItem("photo-settging-show-range");
		if (showRangeType && this.showRangeType != showRangeType) {
			this.showRangeType = showRangeType;
			this.$nextTick(() => {
				if (this.$refs.rangeSelector && this.showRangeType > 0 && this.showRangeType <= 2)
					this.$refs.rangeSelector.setSelectedIndex(this.showRangeType)
			})
		}
		//触发加载第一页数据
		this.$emit('onChooseRange', this.showRangeType)
	},
	methods: {
		onSearch(searchStr) {
			this.searchStr = searchStr
			this.$emit('onSearch', this.searchStr)
		},
		onSearchClear() {
			this.$emit('onSearch', '')
		},
		//文件类型切换 0全部 1照片 2视频
		onChooseDataType(val) {
			console.log(val)
			this.showFileType = val;
			this.$emit('onChooseDataType', val)
		},
		onChooseRange(val) {
			this.showRangeType = val
			localStorage.setItem("photo-settging-show-range", this.showRangeType);
			this.$emit('onChooseRange', val)
		},
		//slider图像大小切换
		onSizeChange(value) {
			// 防止高频率重复触发
			if (this.lastSliderValue != value) {
				this.lastSliderValue = value;
				localStorage.setItem("photo-settging-img-size", value);
				this.$emit('onSizeChange', value)
			}
		},
		// -------------图片显示模式相关---------------------
		onChangeShowMode() {
			if (this.showMode == "cover") {
				this.showMode = "contain";
			} else {
				this.showMode = "cover";
			}
			localStorage.setItem("photo-settging-show-mode", this.showMode);
			this.$emit('onChangeShowMode', this.showMode)
		},
		getPositionStr(photo) {
			let cacheStr = this.$store.state.geoCache.get(photo.geohash.substr(0, 5))
			if (cacheStr) {
				this.positionStr = cacheStr
				return
			}
			this.loadingPositionStr = true
			this.api
				.post("/api/mapApi/getLocationStr", {
					indexId: photo.id,
					hideLoading: true
				})
				.then((res) => {
					if (!res.code) {
						this.positionStr = res.geo.name + ' ' + res.geo.cn_name
						this.$store.state.geoCache.set(photo.geohash.substr(0, 5), this.positionStr)

					}
					this.loadingPositionStr = false
				})
				.catch((error) => {
					this.loadingPositionStr = false
				});
		},
		//计算透明层应该显示的日期
		calPhotoDate(scrollTop, photoList, dataColumns, photoHeight) {
			this.showDateInfo = photoList.length > 0
			// 通过滑动距离/高度 可以算出滑动到第几行了
			// 通过100/宽度(百分比) 可以算出一行几个，这样就可以算出左上角的照片在数据列表中的索引
			let row = parseInt(
				scrollTop / (photoHeight)
			);
			let idx = row * dataColumns;
			if (photoList.length - 1 > idx) {
				let firstPhoto = photoList[idx]
				this.firstPhoto = firstPhoto
				if (firstPhoto && firstPhoto.geohash) {
					if (!this.loadingPositionStr && this.firstPhotoGeohash.substr(0, 5) != firstPhoto.geohash
						.substr(0, 5)) {
						this.firstPhotoGeohash = firstPhoto.geohash
						this.getPositionStr(firstPhoto)
					}
				} else {
					this.positionStr = ""
				}
				this.topPhotoDate = firstPhoto.original_date;
				this.$store.state.firstIndex = firstPhoto
				return firstPhoto
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.layout-header-bar {
	min-width: 600px;
	height: 100%;
	z-index: 2;
	width: 100%;
	display: flex;
	align-items: center;

	.header-right {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}
}

.photo-info {
	position: absolute;
	z-index: 2;
	height: 100px;
	width: 100%;
	pointer-events: none; //禁止响应点击事件
	background: linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1));
	flex-direction: column;

	.photo-date {
		margin-left: 10px;
		margin-top: 10px;
		line-height: 20px;
		width: 100%;
		text-align: left;
		font-size: 1rem;
		color: white;
		font-weight: bolder;
	}

	.photo-geo {
		margin-right: 30px;
	}
}

.select-text {
	font-size: 16px;
	color: $nas-main;

	@media not all and (max-width:640px) {
		display: none;
	}
}

.search-root {
	position: absolute;
	display: flex;
	align-items: center;

	@media all and (max-width:640px) {
		right: 10px
	}

	@media not all and (max-width:640px) {
		right: 30px
	}
}

.root-img-mode {
	margin-right: 20px;

	@media all and (max-width:640px) {
		margin-right: 15px;
	}
}

.zoom-slider {

	margin-left: 20px;
	margin-right: 20px;
	width: 60px;
	display: inline-flex;

	@media all and (max-width:640px) {
		width: 40px;
		margin-left: 15px;
		margin-right: 15px;
	}
}

.icon-img-mode {
	margin-left: 20px;
}

.icon-layout {
	cursor: pointer;
	font-size: 28px;
	color: $nas-main;
}
</style>
