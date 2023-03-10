<template>
	<!-- 照片容器 -->
	<div class="photo-wrapper" id="photo-wrapper" ref="photoWrapper">
		<!-- 加载中 -->
		<div v-if="lastHasMore" style="width:100%;display:flex;justify-content:center;height:60px;align-items:center">
			<Spin />
		</div>
		<!-- 照片区域 -->
		<div style="cursor: pointer;" v-for="(photo, index) in photoList" :id="'photoItem' + photo.id" :key="photo.id"
			class="photo-item" :style="{ margin: photoMargin + 'px', width: photoWidth + 'px', height: photoHeight + 'px' }"
			@click="onPhotoClick(index)" @mouseenter="mouseEnterImg(index)" @mouseleave="mouseLeaveImg(index)"
			@contextmenu="showRightMenu($event, $root, photo, index)" @touchstart="touchstart(index)" @touchend="touchend">
			<!-- 照片 -->
			<img :id="'photoImg' + photo.id" :style="{ height: photoHeight + 'px', 'object-fit': showMode }"
				class="photo-img" v-lazy="photo.url" @dragstart.prevent />
			<!-- 播放按钮 -->
			<div class="icon-play-root" v-if="photo.type == 2 && photo.is_livephoto ==0">
				<!-- 视频的时长 -->
				<span style="color: white;font-size: 30px;" class="nasIcons icon-play"></span>
				<p class="icon-duration">{{ utils.formatSeconds(photo.duration) }}</p>
			</div>
			<!-- livephoto标记 -->
			<span v-if="photo.is_livephoto == 1" class="ic-livephoto nasIcons icon-livezhaopian"></span>

			<!-- hover层 -->
			<div class="photo-hover-mask" v-show="photo.hover && !photo.selected">
				<!-- 某张图设置为相册首页 只有在ordinaryAlbumId有值的时候才显示 -->
				<Icon v-if="ordinaryAlbumId" @click.stop="setOrdinaryCover(index)" class="photo-select-icon-setcover"
					:size="25" color="#eee" type="ios-disc" />
				<!-- 勾选框 -->
				<span @click.stop="hoverSelect(index)" class="photo-select-icon-hover nasIcons icon-radio-unchecked"></span>
			</div>
			<!-- 选择层 -->
			<div class="photo-select-mask" v-if="photo.selected">
				<!-- 已选 -->
				<span class="photo-select-icon-hover nasIcons icon-radio-checked"></span>
			</div>
		</div>
		<!-- 底部的loading和没有更多 -->
		<div style="display: flex;justify-content: center;width: 100%;flex-direction:column;align-items:center">
			<!-- 手动加载更多的按钮 -->
			<Button v-if="nextHasMore && photoList.length > 0" @click="loadNextPage()" type="default"
				style="width: 250px;margin-top: 30px;height:45px;border-radius:20px">{{
					$t('common.loadmore')
				}}</Button>
			<Spin v-if="nextLoading" size="large" style="margin-top:30px"></Spin>
			<span v-if="!nextLoading && !nextHasMore" style="margin-top: 30px;">{{
				$t('common.noMore')
			}}</span>
			<div style="height:80px"></div>
		</div>
		<!-- 右键菜单 -->
		<easy-cm v-if="!isMobile" @ecmcb="rightMenuClick" :list="rightMenuList"></easy-cm>

		<!-- 返回顶部按钮 -->
		<my-btn-icon v-if="showToTopBtn" class="to-top" iIcon="md-arrow-up"
			@click="$refs.photoWrapper.scrollTo({ top: 0, behavior: 'smooth' })"></my-btn-icon>

	</div>
</template>
<script>
import axios from "@/plugins/axios";
import utils from "@/plugins/utils";

export default {
	props: {
		//每次网络请求加载行数
		pageRows: {
			default: 10,
			type: Number
		},
		//如果传入则代表获取附近的
		geohash: {
			default: '',
			type: String
		},
		//要查询的普通相册id
		ordinaryAlbumId: {
			default: '',
			type: String
		},
		//要查询的智能分类
		aiClassId: {
			default: '',
			type: String
		},
		//要查询的人脸id
		faceId: {
			default: '',
			type: String
		},
		//要查询的智能相册id 查看相册详情时候传入
		albumId: {
			default: '',
			type: String
		},
		showMode: {
			default: "cover",
			type: String
		},
		showFileType: {
			default: "0",
			type: String
		},
		showRangeType: {
			default: "0",
			type: String
		},
		trash: {
			default: 0,
			type: Number
		},
		sortField: {
			default: "original_time",
			type: String
		},
		marginRight: {
			default: '0',
			type: String
		},
		searchStr: {
			default: '',
			type: String
		}
	},
	data() {
		return {
			showToTopBtn: false,
			rightMenuList: [{
				text: this.$t('file.check'),
				type: "CHECK",
			}],
			listMaxLength: 500,
			sortType: 'desc',
			scrollBarWidth: 0, //滚动条宽度
			token: utils.getToken(),
			itemBaseWidth: 200,
			photoWidth: 200, //照片宽度百分比
			photoHeight: 0, //aspectFill模式下的图片高度 需要动态计算
			photoMargin: 5, //照片周围margin
			photoList: [], //照片数据列表
			lastHasMore: false, //前面还有没有更多了
			nextHasMore: true, //后面还有没有更多了
			lastLoading: false, //下一页是否正在加载
			nextLoading: false, //上一页是否正在加载
			baseUrl: axios.baseUrl, //服务器地址
			dataColumns: 10, //数据有多少咧
			selectedIndex: null,
			selectedFile: null

		};
	},
	mounted() {
		if (this.isMobile) {
			this.itemBaseWidth = 180
		}

		// 根据索引id删除列表中的数据 在图片详情中删除图片会触发这个事件
		this.$bus.$on('removeIndexById', (indexId) => {
			if (this.photoList && this.photoList.length > 0) {
				for (let i in this.photoList) {
					if (this.photoList[i].id == indexId) {
						this.photoList.splice(i, 1)
					}
				}
			}
		})

		this.$bus.$on('onIndexUpdate', (updatedIndex) => {
			for (let i in this.photoList) {
				if (this.photoList[i].id == updatedIndex.id) {
					this.photoList[i] = updatedIndex
					this.dealPhotoUrl(this.photoList[i])
				}
			}
		})

		this.$nextTick(() => {
			//如果是人脸相册 右键菜单加一个设置为人物相册海报
			console.log("faceId:" + this.faceId)
			if (this.faceId) {
				console.log("添加设置人脸首页菜单")
				this.rightMenuList.push({
					text: this.$t('photo.setFacePoster'),
					type: "SET_FACE_POSTER",
				})
				this.rightMenuList.push({
					text: this.$t('photo.removeFromFace'),
					type: "REMOVE_FROM_FACE",
				})
				this.$forceUpdate()
			}
			if (this.trash != 1) {
				this.rightMenuList.push({
					text: this.$t('photo.putInTrash'),
					type: "TRASH",
				})
			}
		})
	},
	beforeDestroy() {
		this.$bus.$off("removeIndexById");
		this.$bus.$off("onIndexUpdate");

	},
	methods: {
		touchstart(index) {
			clearTimeout(this.longPressTimeout); //再次清空定时器，防止重复注册定时器
			this.longPressTimeout = setTimeout(() => {
				this.hoverSelect(index)
			}, 800);
		},
		touchend() {
			clearTimeout(this.longPressTimeout); //清空定时器，防止重复注册定时器
		},
		cancelTouchEvent() {
			//滚动的时候清空计时器 防止触发菜单
			if (this.longPressTimeout) {
				clearTimeout(this.longPressTimeout);
				this.longPressTimeout = null
			}
		},
		setShowTopBtn(show) {
			this.showToTopBtn = show
		},
		showRightMenu(event, root, file, index) {
			if(file.selected){
				return event.preventDefault()
			}
			if (this.isMobile) return event.preventDefault()
			this.selectedFile = file
			this.selectedIndex = index
			this.$easycm(event, root)
		},
		//右键菜单点击
		rightMenuClick(indexList) {
			let type = this.rightMenuList[indexList[0]].type
			if (type == 'CHECK') { //查看
				this.onPhotoClick(this.selectedIndex)
			} else if (type == "TRASH") {
				this.$bus.$emit("onTrashMsg", this.photoList[this.selectedIndex].id)
			} else if (type == "SET_FACE_POSTER") {
				//设置为人脸相册海报
				this.setFacePosterApi(this.selectedIndex)
			} else if (type == "REMOVE_FROM_FACE") {
				//从人脸相册移除
				this.removeFromFaceApi(this.selectedIndex)
			}
		},
		removeFromFaceApi(index) {
			// 从人脸相册移除
			this.api
				.post("/api/photoApi/removeFromFace", {
					photoIndexId: this.photoList[index].id,
					rawFaceId: this.photoList[index].face_id
				})
				.then((res) => {
					if (!res.code) {
						this.showVsNotification(this.$t('common.changeSuccess'));
						this.photoList.splice(index, 1)
					}
				})
				.catch((error) => { });
		},
		setFacePosterApi(index) {
			//  照片设置为人物的封面
			this.api
				.post("/api/photoApi/setFacePoster", {
					photoIndexId: this.photoList[index].id,
					setFaceId: this.faceId,
					rawFaceId: this.photoList[index].face_id
				})
				.then((res) => {
					if (!res.code) {
						this.showVsNotification(this.$t('common.changeSuccess'));
					}
				})
				.catch((error) => { });
		},
		setOrdinaryCover(index) {
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('album.setPhotoAsCover'), () => {
				// 将照片设置为普通相册首页
				this.api
					.post("/api/ordinaryAlbumApi/setAlbumCover", {
						indexId: this.photoList[index].id,
						albumId: this.ordinaryAlbumId
					})
					.then((res) => {
						if (!res.code) {
							this.showVsNotification(this.$t('common.changeSuccess'));
						}
					})
					.catch((error) => { });
			})
		},
		setPhotoSelected(index, stat) {
			this.photoList[index].selected = stat
			this.$forceUpdate()
		},
		clearList() {
			this.photoList = [];
			this.lastHasMore = true;
			this.nextHasMore = true;
			this.lastLoading = false;
			this.nextLoading = false;
		},
		mouseEnterImg(index) {
			if (!this.isMobile) {
				this.$set(this.photoList[index], "hover", true);
			}
		},
		mouseLeaveImg(index) {
			if (!this.isMobile) {
				this.photoList[index].hover = false;
			}
		},
		hoverSelect(index) {
			this.$emit('onHoverSelected', index)
		},
		onTrashInSuc() {
			for (let i = this.photoList.length - 1; i >= 0; i--) {
				if (this.photoList[i].selected == true) {
					this.photoList.splice(i, 1);
				}
			}
		},
		//清除已选数据
		clearSelected() {
			for (var i = 0; i < this.photoList.length; i++) {
				this.photoList[i].selected = false;
			}
			this.$forceUpdate()
		},
		// 照片点击事件
		onPhotoClick(index) {
			this.$emit('onPhotoClick', index)
		},
		//-------------图片大小相关设置---------------------
		calculateImgHeight() {
			if (!this.$refs.photoWrapper) {
				return;
			}
			let wrapper = this.$refs.photoWrapper.getBoundingClientRect();
			if (wrapper) {
				let photoWidth = this.utils.calItemWidth(wrapper, this.itemBaseWidth, this.photoMargin)
				this.photoWidth = photoWidth
				this.photoHeight = this.photoWidth
				this.dataColumns = parseFloat(wrapper.width / this.itemBaseWidth).toFixed()
			}
		},
		// 加载上一页
		loadLastPage() {
			console.log('loadLastPage', this.lastHasMore)
			if (this.lastHasMore) {
				if (this.photoList.length > 0) {
					this.getPhotoByTime(this.photoList[0][this.sortField], 2);
				}
			}
		},
		// 加载下一页
		loadNextPage() {
			if (this.nextHasMore) {
				if (this.photoList.length > 0) {
					this.getPhotoByTime(
						this.photoList[this.photoList.length - 1][this.sortField], 1);
				}
			}
		},
		dealPhotoUrl(photo) {
			let url = axios.getImgFullPath(photo.id, true, photo.filename);
			let rawUrl = axios.getImgFullPath(photo.id, false, photo.filename);
			photo.url = url;
			photo.rawUrl = rawUrl;
		},
		//根据日期获取数据
		getPhotoByDate(dateStr, timeType) {
			let timestamp = new Date(dateStr.original_date).getTime() + 16 * 3600000;
			this.getPhotoByTime(timestamp, timeType);
		},
		//根据时间戳获取数据 loadLastPage为获取本页数据后是否自动获取上一页 因为点击时间轴后需要自动加载上一页提升用户体验
		getPhotoByTime(timestamp, timeType, loadLastPageAfterReq) {
			this.sortType = timeType == 1 ? "desc" : "asc";
			// 防止重复触发
			if (this.lastLoading || this.nextLoading) {
				console.log('防止重复出发', this.lastLoading, this.nextLoading)
				return;
			}
			timeType = parseInt(timeType);
			if (timeType == 2) {
				this.lastLoading = true;
			} else {
				this.nextLoading = true;
			}
			// 要排除时间戳一样的id 因为接口的查询条件包含时间戳等于的部分，防止有些复制出来的文件orginal_time一摸一样
			let excludeIds = [];
			for (var i = 0; i < this.photoList.length; i++) {
				if (this.photoList[i][this.sortField] == timestamp) {
					excludeIds.push(this.photoList[i].id);
				}
			}
			//每次加载10行
			let reqCount = this.dataColumns * this.pageRows;

			let params = {
				hideLoading: true,
				timestamp: timestamp,
				timeType: timeType,
				count: reqCount,
				excludeIds: excludeIds,
				fileType: parseInt(this.showFileType),
				sortField: this.sortField,
				sortType: this.sortType,
				trash: this.trash,
			}
			if (this.geohash) {
				let geoParam = this.geohash.substr(0, 5)
				if (this.showRangeType == '1') {
					geoParam = this.geohash.substr(0, 4)
				} else if (this.showRangeType == '2') {
					geoParam = this.geohash.substr(0, 3)
				} else if (this.showRangeType == '3') {
					geoParam = this.geohash.substr(0, 2)
				}
				params.geohash = geoParam
			}
			if (this.albumId) {
				params.albumId = this.albumId
			}
			if (this.ordinaryAlbumId) {
				params.ordinaryAlbumId = this.ordinaryAlbumId
			}
			if (this.aiClassId) {
				params.aiClassId = parseInt(this.aiClassId)
			}
			if (this.faceId) {
				params.faceId = this.faceId
			}
			if (this.searchStr) {
				params.searchStr = this.searchStr
			}
			this.api
				.post("/api/photoApi/getPhotoByTime", params)
				.then((res) => {
					for (let i = 0; i < res.data.length; i++) {
						this.dealPhotoUrl(res.data[i])
					}
					//1为获取时间戳之前的 2为获取时间戳之后的 1是向下拉触发 2是向上拉触发
					if (timeType == 2) {
						if (res.data.length < reqCount) {
							this.lastHasMore = false;
						}
						//往列表前面加 res.data的时间顺序是从小到大 所以反过来再连上之前的就行
						this.photoList = res.data.reverse().concat(this.photoList)

						//滚动到之前的位置
						let targetPosition = (this.photoWidth + this.photoMargin * 2) * res.data.length / this.dataColumns
						targetPosition = targetPosition > 0 ? targetPosition : 0
						this.$nextTick(() => {
							this.$refs.photoWrapper.scrollTop = targetPosition
						})
						this.$nextTick(() => {
							//列表超过长度限制 删除尾部元素
							if (res.data.length > 0 && this.photoList.length > this.listMaxLength) {
								for (var i = 0; i < res.data.length; i++) {
									this.photoList.pop();
								}
							}
							console.log('往列表前面追加', this.photoList.length)
						});
					} else {
						//往列表后面加
						this.photoList = this.photoList.concat(res.data)

						if (res.data.length < reqCount) {
							this.nextHasMore = false;
						}
						if (!this.isMobile) {
							//手机上有兼容性问题 目前只在pc做这个操作
							if (res.data.length > 0 && this.photoList.length > this.listMaxLength) {
								//从前面删除一页
								this.photoList.splice(0, res.data.length)
								let resHeight = (this.photoWidth + this.photoMargin * 2) * res.data.length / this.dataColumns
								this.$nextTick(() => {
									this.$refs.photoWrapper.scrollTop = this.$refs.photoWrapper.scrollTop - resHeight
								})
							}
						}

						console.log('往列表后面追加', this.photoList.length)
					}
					if (timeType == 2) {
						this.lastLoading = false;
					} else {
						//往列表后面加
						this.nextLoading = false;
					}
					this.$nextTick(() => {
						this.calculateImgHeight();
						this.$emit('onPhotoLoadOver')
						if (loadLastPageAfterReq) {
							this.loadLastPage();
						}
					});
				})
				.catch((error) => {
					// 无论成功失败都会回调
					if (timeType == 2) {
						this.lastLoading = false;
					} else {
						//往列表后面加
						this.nextLoading = false;
					}
				});
		},
	},
};
</script>
<style lang="scss" scoped>
.to-top {
	position: fixed;
	right: 90px;
	bottom: 35px;
	z-index: 9999;
	width: 40px;
	height: 40px;
	border-radius: 30px;

	@media all and (max-width:640px) {
		//手机端不显示灰色圆点
		display: none;
	}
}

.photo-wrapper {
	z-index: 1;
	display: flex;
	flex-wrap: wrap;
	flex-direction: row;
	width: 100%;
	height: 100%;
	overflow-y: auto;
	overflow-x: hidden;
	align-content: flex-start;
	scrollbar-width: none;

	@media all and (max-width:640px) {
		-webkit-overflow-scrolling: touch;
	}

}

.photo-wrapper::-webkit-scrollbar {
	display: none
}

.photo-item {
	display: flex;
	justify-content: center;
	position: relative;

	.ic-livephoto {
		position: absolute;
		right: 5px;
		top: 5px;
		color: white;
		font-size: 30px;
	}

	.photo-select-mask {
		height: 100%;
		border-radius: 10px;
		position: absolute;
		width: 100%;
		background: rgba(0, 0, 0, 0.4);
	}

	.photo-select-icon {
		width: 15%;
		right: 10px;
		bottom: 10px;
		position: absolute;
	}

	.photo-hover-mask {
		height: 100%;
		border-radius: 10px;
		position: absolute;
		width: 100%;
		background: rgba(0, 0, 0, 0.2);
	}
}

.photo-select-icon-hover {
	color: white;
	font-size: 20px;
	border-radius: 10px;
	right: 10px;
	bottom: 10px;
	height: 28px;
	width: 28px;
	position: absolute;
}

.photo-select-icon-setcover {
	left: 12px;
	bottom: 12px;
	position: absolute;
}

.photo-img {
	pointer-events: none;
	border-radius: 10px;
	width: 100%;
}

.icon-play-root {
	border-top-left-radius: 10px;
	border-top-right-radius: 10px;
	top: 0;
	padding: 3% 5%;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	flex-direction: column;
	position: absolute;
	justify-content: center;
	// background: linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.2));


	.icon-duration {
		margin-right: 8px;
		margin-top: 3px;
		font-size: 16px;
		color: white;
		// font-weight: bold;
	}
}</style>
