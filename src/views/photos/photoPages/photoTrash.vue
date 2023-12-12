<template>
	<photo-base :initIndex="8">
		<div class="trash-root" ref="photoListRoot">
			<!-- 头部操控条 -->
			<photo-operation-header style="width:100%;height:70px;position: absolute;left: 0;z-index: 2;" ref="photoHeader"
				@onChooseDataType="onChooseDataType" @onChangeShowMode="onChangeShowMode" @onSizeChange="setImgSize"
				:datePrefix="$t('file.trashBin')">
			</photo-operation-header>
			<div style="width:100%;display:flex;height: 100%;flex-direction:row;overflow: hidden;padding-top: 70px;">
				<!-- 照片列表容器 -->
				<photo-list-content ref="photoContent" :trash="1" @onHoverSelected="onHoverSelected"
					@onPhotoClick="onPhotoClick" @onPhotoLoadOver="onPhotoLoadOver" :showMode="showMode"
					:showFileType="showFileType" sortField="in_trash_time" :pageRows="10">
				</photo-list-content>
			</div>
			<!-- 多选后的操作栏 -->
			<div class="bottom-select-root"
				v-show="!showTrashChoose && !showPhotoDetail && !showVideoDetail && $refs.photoContent && $refs.photoContent.photoList.length > 0">
				<photo-bottom-select :trashMode="true" ref="selectView" @onUnSelect="onUnSelect"
					@onTrashOutSuc="onTrashOutSuc()" @restoreAll="restoreAll" @deleteAll="deleteAll"
					@onDeleteSuc="onTrashOutSuc" @onNeedRefresh="onNeedRefresh" :editMode="editMode">
				</photo-bottom-select>
			</div>
			<!-- 点击照片后弹出的照片详情 -->
			<Modal v-model="showPhotoDetail" fullscreen footer-hide>
				<photo-detail v-if="showPhotoDetail" @onClose="showPhotoDetail = false" ref="photoDetail"></photo-detail>
			</Modal>
			<Modal v-model="showVideoDetail" fullscreen footer-hide :closable="false">
				<video-detail propsServerType="photo" v-if="showVideoDetail" @onClose="showVideoDetail = false"
					ref="videoPlayer"></video-detail>
			</Modal>
			<vs-dialog v-model="showTrashChoose">
				<template #header>
					<h4 style="font-size: 16px;">
						{{ $t('common.whatWillYouDo') }}
					</h4>
				</template>
				<div class="pop-root">
					<img @dragstart.prevent class="pop-img" :src="selectedPhoto.url" mode="aspectFill" />
					<!-- 查看详情 -->
					<div class="pop-text-root" @click="checkDetail" style="margin-top: 20px;">
						<my-btn type="white" :title="$t('file.goDetail')" style="width: 80%;"></my-btn>
					</div>
					<!-- 恢复 -->
					<div class="pop-text-root" @click="popRestore" style="margin-top: 20px;">
						<my-btn :title="$t('file.restore')" style="width: 80%;"></my-btn>
					</div>
					<!-- 永久删除 -->
					<div class="pop-text-root" @click="popDelete" style="margin-top: 20px;">
						<my-btn :title="$t('file.deleteForever')" type="red" style="width: 80%;"></my-btn>
					</div>
				</div>
			</vs-dialog>


		</div>
	</photo-base>
</template>
<script>
// 回收站不能用时间轴 回收站是根据删除时间排序的 用时间轴会导致时间错乱

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
import jsBridge from "@/plugins/jsBridge"

export default {
	components: {
		photoBottomSelect,
		photoDetail,
		videoDetail,
		photoOperationHeader,
		photoListContent,
		photoBase
	},
	props: {
		serverType: {
			default: 'photo',
			type: String
		},
		// 是否展示左侧sider占位组件
		hasSider: {
			default: true,
			type: Boolean
		}
	},
	data() {
		return {
			selectedPhotoIndex: 0,
			selectedPhoto: '',
			showTrashChoose: false,
			showVideoDetail: false,
			scrollTop: 0, //页面滑动距离顶部距离
			showPhotoDetail: false,
			editMode: false, //当前是否处于编辑模式
			showMode: "cover", //图像显示模式
			showFileType: '0'
		};
	},
	mounted() {
		//初始化
		this.loadFirstPage();
		// 监听滚动条
		window.addEventListener("scroll", this.onPageScroll, true);
		//窗口变化监听
		window.addEventListener("resize", this.onWindowResize);
		window.addEventListener('popstate', this.onPopstate)

		setTimeout(() => {
			this.$forceUpdate()
		}, 500);

	},
	beforeDestroy() {
		window.removeEventListener("resize", this.onWindowResize);
		window.removeEventListener("scroll", this.onPageScroll, true);
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
			this.$refs.photoContent.getPhotoByTime('9999999999999', 1);
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
		},
		//恢复全部的回调
		restoreAll() {
			if (this.$refs.photoContent.photoList.length < 1) {
				this.showVsNotification(this.$t('common.noData'))
				return
			}
			this.$refs.selectView.restoreAll(this.$refs.photoContent.photoList)
			this.calFirstPhotoDate()
		},
		//删除全部的回调
		deleteAll() {
			if (this.$refs.photoContent.photoList.length < 1) {
				this.showVsNotification(this.$t('common.noData'))
				return
			}
			this.$refs.selectView.deleteAll(this.$refs.photoContent.photoList)
			this.calFirstPhotoDate()
		},
		onUnSelect() {
			this.clearSelected();
		},
		//改变数据类型的回调 0全部 1照片 2视频
		onChooseDataType(fileType) {
			this.showFileType = fileType
			this.clearSelected();
			this.$nextTick(() => {
				this.loadFirstPage()
			})
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
			if (this.$refs.photoHeader && this.$refs.photoContent) {
				this.$refs.photoHeader.calPhotoDate(this.scrollTop,
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
		},
		onTrashOutSuc() {
			console.log('onTrashOutSuc')
			this.$refs.photoContent.onTrashInSuc()
			this.calFirstPhotoDate()
		},
		onNeedRefresh() {
			this.loadFirstPage()
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
				this.selectedPhotoIndex = index
				this.selectedPhoto = photoList[index]
				this.showTrashChoose = true
			}
		},
		checkDetail() {
			this.showTrashChoose = false
			if (this.selectedPhoto.type == 1) {
				this.showPhotoDetail = true;
				this.$nextTick(() => {
					this.$refs.photoDetail.showImg(this.$refs.photoContent.photoList, this.selectedPhotoIndex);
				});
				this.pushState()
			} else if (this.selectedPhoto.type == 2) {
				if (localStorage.getItem("rawPlayer") == "1") {
					//调用原生播放器
					jsBridge.playVideo({
						playIndex: this.selectedPhotoIndex,
						playList: this.$refs.photoContent.photoList,
						token: this.$store.state.token,
						fromFileBrower: false,
						serverType: "photo"
					})
				} else {
					//继续使用网页播放器
					this.showVideoDetail = true;
					this.$nextTick(() => {
						this.$refs.videoPlayer.playVideo(this.$refs.photoContent.photoList, this.selectedPhotoIndex);
					});
					this.pushState()
				}
			}
		},
		popRestore() {
			this.selectedPhoto.selected = true
			this.$refs.selectView.addSelected(this.selectedPhoto.id)
			this.showTrashChoose = false
			this.$refs.selectView.trashPhotos(0)
		},
		popDelete() {
			this.selectedPhoto.selected = true
			this.$refs.selectView.addSelected(this.selectedPhoto.id)
			this.showTrashChoose = false
			this.$refs.selectView.deleteFromDisk()
		},


	},
};
</script>
<style lang="scss" scoped>
.trash-root {
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
	z-index: 3;
	left: 0;
	position: absolute;
	bottom: 0;
	width: 100%;
	display: flex;
	flex-direction: row;
	align-items: center;
}

.pop-root {
	padding-bottom: 20px;
	border-radius: 15px;
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	background-color: white;

	.pop-text-root {
		display: flex;
		align-items: center;
		width: 100%;
		height: 2.5rem;
		justify-content: center;
	}

	.pop-img {
		object-fit: cover;
		border-radius: 15px;
		width: 330px;
		height: 330px;
		margin: 10px;
	}
}
</style>
