<template>
	<photo-base :initIndex="6">
		<div class="photo-recent-root" ref="photoListRoot">
			<!-- 头部操控条 -->
			<photo-operation-header style="width:100%;height:70px;position: absolute;left: 0;z-index: 2;"
				ref="photoHeader" @onChooseDataType="onChooseDataType" @onChangeShowMode="onChangeShowMode"
				@onSizeChange="setImgSize" @onSearch="onSearch" @albumId="albumId">
			</photo-operation-header>
			<div style="width:100%;display:flex;height: 100%;flex-direction:row;overflow: hidden;padding-top: 70px;">
				<!-- 照片列表容器 -->
				<photo-list-content ref="photoContent" @onHoverSelected="onHoverSelected" @onPhotoClick="onPhotoClick"
					@onPhotoLoadOver="onPhotoLoadOver" :showMode="showMode" :albumId="albumId"
					:ordinaryAlbumId="ordinaryAlbumId" :showFileType="showFileType" :searchStr="searchStr"
					sortField="check_time">
				</photo-list-content>
			</div>
			<!-- 多选后的操作栏 -->
			<div v-show="editMode" class="bottom-select-root">
				<photo-bottom-select @onRemoveFromAlbum="onTrashInSuc" :ordinaryAlbumId="ordinaryAlbumId"
					:showAddToAlbum="showAddToAlbum" ref="selectView" @onUnSelect="onUnSelect"
					@onTrashInSuc="onTrashInSuc()" :editMode="editMode">
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
	</photo-base>
</template>
<script>
//底部选择指示器
import photoBottomSelect from "@/views/photos/components/photoBottomSelect.vue";
//照片点击详情
import photoDetail from "@/views/photos/components/photoDetail.vue";
//视频点击详情
import videoDetail from "@/views/videoDetail/videoDetail.vue";
//头部控制组件
import photoOperationHeader from "@/views/photos/components/photoOperationHeader.vue"
//照片列表内容组件
import photoListContent from "@/views/photos/components/photoListContent.vue"
import photoBase from "@/views/photos/photoBase";

export default {
	props: {
		// 是否展示左侧sider占位组件
		hasSider: {
			default: false,
			type: Boolean
		},
		//是否展示添加到相册按钮
		showAddToAlbum: {
			default: true,
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
		}
	},
	components: {
		photoBase,
		photoBottomSelect,
		photoDetail,
		videoDetail,
		photoOperationHeader,
		photoListContent
	},
	data() {
		return {
			searchStr: "",
			showVideoDetail: false,
			scrollTop: 0, //页面滑动距离顶部距离
			showPhotoDetail: false,
			editMode: false, //当前是否处于编辑模式
			showMode: "cover", //图像显示模式
			showFileType: '0'
		};
	},
	mounted() {
		//在header的mounted中触发加载第一页数据 在onChooseRange
		// 监听滚动条
		window.addEventListener("scroll", this.onPageScroll, true);
		//窗口变化监听
		window.addEventListener("resize", this.onWindowResize);
		this.loadFirstPage()
		window.addEventListener('popstate', this.onPopstate)

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
		//加载第一页照片
		loadFirstPage() {
			//清空已有列表 重置属性
			this.$refs.photoContent.clearList()
			this.$refs.photoContent.lastHasMore = false
			this.$nextTick(() => {
				// 加载第一页
				this.$refs.photoContent.getPhotoByTime(new Date().getTime(), 1);
			})

		},
		//窗口变化回调
		onWindowResize() {
			//重新计算照片高度
			this.$refs.photoContent.calculateImgHeight();
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
			// 页面滚动处理 下一页
			this.calFirstPhotoDate()
			if (this.scrollTop + windowHeight >= scrollHeight - 5) {
				if (this.$refs.photoContent) {
					this.$refs.photoContent.loadNextPage();
				}
			}
		},
		onUnSelect() {
			console.log('onUnSelect')
			this.clearSelected();
		},
		onSearch(searchStr) {
			//头部搜索回调
			this.searchStr = searchStr
			this.loadFirstPage()
			this.clearSelected();
		},
		//改变数据类型的回调 0全部 1照片 2视频
		onChooseDataType(fileType) {

			this.showFileType = fileType
			console.log('onChooseDataType', this.showFileType)
			this.loadFirstPage()
			this.clearSelected();
		},
		// 滑块slider设置图像大小
		setImgSize(value) {
			this.$refs.photoContent.itemBaseWidth = value;
			this.$refs.photoContent.calculateImgHeight();
			this.calFirstPhotoDate()
		},
		//切换显示模式的回调
		onChangeShowMode(showMode) {
			this.showMode = showMode
			this.$refs.photoContent.calculateImgHeight();
		},
		//计算屏幕上左上角第一个照片的索引 返回其对象 
		calFirstPhotoDate() {
			let firstPhoto = null
			if (this.$refs.photoHeader && this.$refs.photoContent) {
				firstPhoto = this.$refs.photoHeader.calPhotoDate(this.scrollTop,
					this.$refs.photoContent.photoList,
					this.$refs.photoContent.dataColumns,
					this.$refs.photoContent.photoHeight);
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
					this.showVideoDetail = true;
					this.$nextTick(() => {
						this.$refs.videoPlayer.playVideo(photoList, index);
					});
					this.pushState()

				}

			}
		},
	},
};
</script>
<style lang="scss" scoped>
.photo-recent-root {
	position: relative;
	z-index: 1;
	width: 100%;
	height: 100%;
	padding-left: 10px;
	padding-right: 10px;

	@media not all and (max-width:640px) {
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
	}

	background-color: rgba(255, 255, 255, 0.6);
}

// 多选后的底部操作栏
.bottom-select-root {
	height: 60px;
	z-index: 101;
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	display: flex;
	flex-direction: row;
	align-items: center;
}
</style>
