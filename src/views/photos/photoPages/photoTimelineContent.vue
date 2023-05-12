<!-- 内容单独定义 有多个页面用到了 -->
<template>
	<div class="photo-list-root" ref="photoListRoot">
		<!-- 头部操控条 -->
		<div class="photo-header">
			<photo-operation-header ref="photoHeader" @showSearchBtn="showSearchBtn" @onChooseDataType="onChooseDataType"
				@onChangeShowMode="onChangeShowMode" @onSizeChange="setImgSize" :editMode="editMode"
				@onChooseRange="onChooseRange" :nearMode="nearMode" @onSearch="onSearch" @albumId="albumId"
				@onSwitchEditMode="switchEditMode">
			</photo-operation-header>
		</div>
		<div class="photo-content">
			<!-- 照片列表容器 -->
			<photo-list-content ref="photoContent" @onHoverSelected="onHoverSelected" @onPhotoClick="onPhotoClick"
				@onPhotoLoadOver="onPhotoLoadOver" :showMode="showMode" :geohash="geohash" :albumId="albumId"
				:aiClassId="aiClassId" :ordinaryAlbumId="ordinaryAlbumId" :showRangeType="showRangeType"
				:showFileType="showFileType" :searchStr="searchStr" :faceId="faceId">
			</photo-list-content>
			<!-- 时间轴 -->
			<photo-timeline class="timeline-wrapper" v-show="timeLine.length > 0" ref="timeline" :geohash="geohash"
				:albumId="albumId" @onTimeChoose="onTimeChoose" @onTimeLineGet="onTimeLineGet">
			</photo-timeline>
		</div>
		<!-- 多选后的操作栏 -->
		<div v-show="editMode" class="bottom-select-root">
			<photo-bottom-select @onRemoveFromAlbum="onTrashInSuc" :ordinaryAlbumId="ordinaryAlbumId"
				:showRemoveFromAlbum="showRemoveFromAlbum" :showAddToAlbum="showAddToAlbum" ref="selectView"
				@onUnSelect="onUnSelect" @onTrashInSuc="onTrashInSuc()" :editMode="editMode">
			</photo-bottom-select>
		</div>
		<!-- 点击照片后弹出的照片详情 -->
		<Modal v-model="showPhotoDetail" fullscreen footer-hide style="background-color: transparent;">
			<photo-detail @onImageChange="onImageChange" v-if="showPhotoDetail" @onClose="showPhotoDetail = false"
				ref="photoDetail"></photo-detail>
		</Modal>
		<Modal v-model="showVideoDetail" fullscreen footer-hide :closable="false">
			<video-detail propsServerType="photo" v-if="showVideoDetail" @onClose="showVideoDetail = false"
				ref="videoPlayer"></video-detail>
		</Modal>
	</div>
</template>
<script>

//底部选择指示器
import photoBottomSelect from "@/views/photos/components/photoBottomSelect.vue";
//时间轴
import photoTimeline from "@/views/photos/components/photoTimeline.vue";
//照片点击详情
import photoDetail from "@/views/photos/components/photoDetail.vue";
//视频点击详情
import videoDetail from "@/views/videoDetail/videoDetail.vue";
//头部控制组件
import photoOperationHeader from "@/views/photos/components/photoOperationHeader.vue"
//照片列表内容组件
import photoListContent from "@/views/photos/components/photoListContent.vue"
import jsBridge from "@/plugins/jsBridge"

export default {
	props: {
		// 是否展示左侧sider占位组件
		hasSider: {
			default: false,
			type: Boolean
		},
		//附近模式 查找附近的照片 如点击地图上的marker
		nearMode: false,
		// 附近模式开启的时候传入 参考位置点的geohash
		geohash: {
			default: '',
			type: String
		},
		//是否显示搜索
		showSearchBtn: {
			default: true,
			type: Boolean
		},
		//是否展示添加到相册按钮
		showAddToAlbum: {
			default: true,
			type: Boolean
		},
		//是否展示从相册移除按钮
		showRemoveFromAlbum: {
			default: false,
			type: Boolean
		},
		//要查询的普通相册id
		ordinaryAlbumId: {
			default: '',
			type: String
		},
		//要查询的智能相册id 查看相册详情时候传入
		albumId: {
			default: '',
			type: String
		},
		aiClassId: {
			default: '',
			type: String
		},
		faceId: {
			default: '',
			type: String
		}

	},
	components: {
		photoBottomSelect,
		photoTimeline,
		photoDetail,
		videoDetail,
		photoOperationHeader,
		photoListContent
	},
	data() {
		return {
			searchStr: "",
			showRangeType: '0',
			showVideoDetail: false,
			scrollTop: 0, //页面滑动距离顶部距离
			timeLine: [], //时间轴数据
			showPhotoDetail: false,
			editMode: false, //当前是否处于编辑模式
			showMode: "cover", //图像显示模式
			showFileType: '0'
		};
	},
	created() {
		//在header的mounted中触发加载第一页数据 在onChooseRange
		// 监听滚动条
		window.addEventListener("scroll", this.onPageScroll, true)
		window.addEventListener("resize", this.onWindowResize)
		window.addEventListener('popstate', this.onPopstate)
		this.checkSourePath()

	},
	beforeDestroy() {
		window.removeEventListener("scroll", this.onPageScroll, true);
		window.removeEventListener("resize", this.onWindowResize);
		window.removeEventListener('popstate', this.onPopstate);

	},
	methods: {
		onPopstate() {
			//后退按钮被点击 如果当前正在播放视频 则关闭视频 如果每播放 则后退
			if (this.showPhotoDetail || this.showVideoDetail) {
				this.showPhotoDetail = false
				this.showVideoDetail = false
			} else {
				this.$router.go(-1)
			}
		},
		onImageChange(indexObj) {
			//图片旋转 翻转等回调
			// this.showPhotoDetail = false
			this.$nextTick(() => {
				this.$refs.photoContent.clearList()
				this.$refs.photoContent.getPhotoByTime(this.$refs.photoHeader.firstPhoto.original_time, 1,
					true);
			})
		},
		//0为5km 对应geohash长度5位 1为20km对应geohash长度4位 2为150km对应geohash长度3位
		onChooseRange(rangeType) {
			this.showRangeType = rangeType
			this.$nextTick(() => {
				if (!this.$refs.timeline) return
				this.$refs.timeline.getTimeLine(this.$refs.photoHeader ? this.$refs.photoHeader.showFileType : "0",
					this.getGeoParam(), this.albumId, this.ordinaryAlbumId, "", this.aiClassId, this.faceId);
			})
		},

		//时间轴网络数据加载完成后回调
		onTimeLineGet(timelineData) {
			this.timeLine = timelineData
			//加载第一页照片
			this.loadFirstPage();
		},
		//加载第一页照片
		loadFirstPage() {
			//清空已有列表 重置属性
			this.$refs.photoContent.clearList()
			this.$refs.photoContent.lastHasMore = false
			// 根据时间轴加载第一页
			if (this.timeLine.length > 0) {
				this.$refs.photoContent.getPhotoByDate(this.timeLine[0], 1);
			}
		},
		checkSourePath() {
			//查询是否设置了来源文件夹 没有设置用户设置
			if (this.$store.state.currentUser.is_admin == 1) {
				this.api.post('/api/sourceFolderApi/getPathByType', {
					type: 'photo',
				}).then((res) => {
					if (!res.code) {
						if (res.data.length < 1) {
							this.showVsConfirmDialog(this.$t('common.confirm'), this.$t(
								'photo.noSourceSetAlert'), () => {
									this.goPath('/photoSourceSet')
								}, null, this.$t('photo.goToSet'))
						} else {
							for (let i in res.data) {
								if (res.data[i].exist == 0) {
									this.showVsConfirmDialog(this.$t('common.confirm'), this.$t(
										'photo.sourcePathUnusable', { path: res.data[i].path }), () => {
											this.goPath('/photoSourceSet')
										}, null, this.$t('photo.goToSet'))
									break
								}
							}
						}
					}
				}).catch((error) => { })
			}
		},
		//窗口变化回调
		onWindowResize(e) {
			this.$nextTick(() => {
				//重新计算照片高度
				this.$refs.photoContent.calculateImgHeight();
				//重新计算时间轴大小高度
				this.$refs.timeline.onWindowResize(document.documentElement.clientHeight);
			})
		},
		//滚动回调
		onPageScroll(e) {
			if (this.showPhotoDetail || this.showVideoDetail) {
				return
			}

			this.$refs.photoContent.cancelTouchEvent()


			let scrollTop = null;
			let scrollHeight = null;
			if (e.srcElement.scrollingElement) {
				scrollTop = e.srcElement.scrollingElement.scrollTop
				scrollHeight = e.srcElement.scrollingElement.scrollHeight
			} else if (e.srcElement) {
				scrollTop = e.srcElement.scrollTop
				scrollHeight = e.srcElement.scrollHeight
			} else if (e.target) {
				scrollTop = e.target.scrollTop
				scrollHeight = e.target.scrollHeight
			}
			this.scrollTop = scrollTop
			let windowHeight = document.documentElement.clientHeight;
			if (!scrollHeight && e.srcElement.scrollingElement) {
				scrollHeight = e.srcElement.scrollingElement.scrollHeight;
			}

			if (this.scrollTop > windowHeight) {
				this.$refs.photoContent.setShowTopBtn(true)
			} else {
				this.$refs.photoContent.setShowTopBtn(false)
			}

			// 页面滚动处理 上一页下一页
			if (this.scrollTop == 0) {
				if (this.$refs.photoContent) {
					this.$refs.photoContent.loadLastPage();
				}
			}
			this.calFirstPhotoDate()
			if (this.scrollTop + windowHeight >= scrollHeight - 5) {
				if (this.$refs.photoContent) {
					this.$refs.photoContent.loadNextPage();
				}
			}
			if (this.$refs.timeline) this.$refs.timeline.onScroll()
		},
		onUnSelect() {
			console.log('onUnSelect')
			this.clearSelected();
		},
		onSearch(searchStr) {
			//头部搜索回调
			this.searchStr = searchStr
			this.$refs.timeline.getTimeLine(this.$refs.photoHeader ? this.$refs.photoHeader.showFileType : "0", this
				.getGeoParam(), this.albumId, this.ordinaryAlbumId, searchStr, this.aiClassId, this.faceId);
			this.clearSelected();
		},
		//改变数据类型的回调 0全部 1照片 2视频
		onChooseDataType(fileType) {
			this.showFileType = fileType
			//重新加载时间轴数据
			this.$refs.timeline.getTimeLine(this.$refs.photoHeader ? this.$refs.photoHeader.showFileType : "0", this
				.getGeoParam(), this.albumId, this.ordinaryAlbumId, null, this.aiClassId, this.faceId);
			this.clearSelected();
		},
		getGeoParam() {
			if (!this.geohash) {
				return null
			}
			//重新加载时间轴数据
			let geoParam = this.geohash.substr(0, 5)
			if (this.showRangeType == '1') {
				geoParam = this.geohash.substr(0, 4)
			} else if (this.showRangeType == '2') {
				geoParam = this.geohash.substr(0, 3)
			} else if (this.showRangeType == '3') {
				geoParam = this.geohash.substr(0, 2)
			}
			return geoParam
		},

		// 滑块slider设置图像大小
		setImgSize(value) {
			this.$refs.photoContent.itemBaseWidth = value;
			this.$refs.photoContent.calculateImgHeight();
			this.calFirstPhotoDate()
		},
		//时间轴点击
		onTimeChoose(timestamp) {
			//清空已有列表 重置属性
			this.$refs.photoContent.clearList()
			this.$refs.photoContent.getPhotoByTime(timestamp, 1, true);
		},
		//切换显示模式的回调
		onChangeShowMode(showMode) {
			this.showMode = showMode
			this.$refs.photoContent.calculateImgHeight();
		},
		//计算屏幕上左上角第一个照片的索引 返回其对象 
		//将日期显示在左上角透明层 同时将相应时间的timeline点亮
		calFirstPhotoDate() {
			let firstPhoto = null
			if (this.$refs.photoHeader && this.$refs.photoContent) {
				firstPhoto = this.$refs.photoHeader.calPhotoDate(this.scrollTop,
					this.$refs.photoContent.photoList,
					this.$refs.photoContent.dataColumns,
					this.$refs.photoContent.photoHeight);
			}
			if (firstPhoto && this.$refs.timeline) {
				this.$refs.timeline.showSelectedTime(
					firstPhoto.original_time
				);
			}
		},
		switchEditMode() {
			this.editMode = !this.editMode
			if (!this.editMode) {
				this.clearSelected()
			}
		},
		//照片的hover层被点击
		onHoverSelected(index) {
			this.editMode = true
			this.onPhotoClick(index)
		},
		//照片加载完成后的回调
		onPhotoLoadOver() {
			this.calFirstPhotoDate()
			setTimeout(() => {
				this.$refs.photoContent.calculateImgHeight();
			}, 300);
		},
		onTrashInSuc() {
			this.$refs.photoContent.onTrashInSuc()
			this.calFirstPhotoDate()
		},
		//清除已选数据
		clearSelected() {
			this.$refs.photoContent.clearSelected()
			if (this.$refs.selectView) {
				this.$refs.selectView.clearSelected();
			}
			this.editMode = false
		},
		//照片本体被点击
		onPhotoClick(index) {
			let photoList = this.$refs.photoContent.photoList
			if (this.editMode) {
				//编辑模式
				if (photoList[index].selected) {
					this.$refs.photoContent.setPhotoSelected(index, false)
					//取消选择 要从已选数组中拿出去
					this.$refs.selectView.removeSelected(photoList[index].id);
					//没有已选的了 自动取消编辑模式
					if (this.$refs.selectView.selectedList.length < 1) {
						this.editMode = false;
					}
				} else {
					this.$refs.photoContent.setPhotoSelected(index, true)
					this.$refs.selectView.addSelected(photoList[index].id);
				}
			} else {
				// 非编辑模式 点击后进入详情展示
				if (photoList[index].type == 1) {
					this.showPhotoDetail = true;
					this.$nextTick(() => {
						this.$refs.photoDetail.showImg(photoList, index);
					});
					this.pushState()

				} else if (photoList[index].type == 2) {
					if (localStorage.getItem("rawPlayer") == "1") {
						//调用原生播放器
						jsBridge.playVideo(JSON.stringify({
							playIndex: index,
							playList: photoList,
							token: this.$store.state.token,
							fromFileBrower: false,
							serverType: "photo"
						}))
					} else {
						//继续使用网页播放器
						this.showVideoDetail = true;
						this.$nextTick(() => {
							this.$refs.videoPlayer.playVideo(photoList, index);
						});
						this.pushState()
					}
				}

			}
		},
	},
};
</script>
<style lang="scss" scoped>
.photo-header {
	width: 100%;
	height: 70px;
	position: absolute;
	left: 0;
	z-index: 2;
}

.photo-content {
	width: 100%;
	display: flex;
	height: 100%;
	flex-direction: row;
	// overflow: hidden;
	padding-top: 70px;

}

.photo-list-root {

	@media all and (max-width:640px) {
		padding-left: 10px;
		padding-right: 10px;
	}

	@media not all and (max-width:640px) {
		padding-left: 10px;
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
	}

	position: relative;
	z-index: 1;
	width: 100%;
	height: 100%;
	background-color: rgba(255, 255, 255, 0.6);
}

// 多选后的底部操作栏
.bottom-select-root {
	left: 0;
	height: 60px;
	z-index: 101;
	position: absolute;
	bottom: 0;
	width: 100%;
	display: flex;
	flex-direction: row;
	align-items: center;
}

.timeline-wrapper {
	height: 100%;
	overflow: hidden;

	@media all and (max-width:640px) {
		//手机端绝对布局 漂浮显示
		position: absolute;
		z-index: 2;
		right: 0;
	}

}
</style>
