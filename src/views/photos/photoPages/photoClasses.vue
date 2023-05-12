<template>
		<div class="album-root-wrapper">
			<!-- 无数据提示 -->
			<div
				style="position: absolute;width: 100%;margin-top:150px;display:flex;flex-direction: column;align-items:center">
				<my-nodata v-if="!loading && dataList.length < 1" :title="$t('photo.classes')">
				</my-nodata>
				<my-btn v-if="!enable" @click="enableClass" :title="$t('photo.enableClass')"
					style="margin-top:20px;"></my-btn>

					<div style="margin-top:10px" v-if="enable&&dealState">[{{ dealState }}]</div>
	
			</div>
			<div style="width:100%;display:flex;height: 100%;flex-direction:row;overflow: hidden;">
				<!-- 分类列表 -->
				<div class="album-list-root" ref="listWrapper">
					<vs-card v-for="(classItem, index) in dataList" type='1' @click="onAlbumClick(index)"
						@contextmenu="showRightMenu($event, $root, classItem, index)"
						:style="{ 'margin': itemMargin + 'px', 'width': itemWidth + 'px' }">
						<template #title>
							<h3 v-if="classItem.class_type == 'coco_ssd'" style="text-align: left;">{{
								$t(`coco.${classItem.class_name
							}`)
							}}</h3>
							<h3 v-if="classItem.class_type == 'mobilenet'" style="text-align: left;">
								{{ classItem.class_name }}</h3>
						</template>
						<template #img>
							<img style="object-fit: cover;" v-if="classItem.url"
								:style="{ 'width': itemWidth + 'px', 'height': itemWidth + 'px' }"
								:src="classItem.url" />
							<img v-else style="object-fit: cover;"
								:style="{ 'width': itemWidth + 'px', 'height': itemWidth + 'px' }"
								src="@/static/photo/icon-album-empty.png" />
						</template>
						<template #text>
							<h3 style="text-align: left;">{{ }}</h3>
						</template>
					</vs-card>
					<div style="width:100%;height:80px"></div>

				</div>
			</div>

			<!-- 相册详情对话框 -->
			<Modal :scrollable="false" footer-hide ref="myModal" class-name="modal-style-nopadding"
				v-model="showAlbumDetail" fullscreen :closable="false">

				<album-detail v-if="showAlbumDetail" @onClose="showAlbumDetail = false" :propsShowSearchBtn="false"
					:propsTitle="$t(`coco.${ selectedItem.class_name }`)" :propsShowAddToAlbum="false"
					:propsShowDelete="false" :propsShowModeSwitch="false" :propsAiClassId="selectedItem.class_id + ''">
				</album-detail>


			</Modal>

			<!-- 右键菜单 -->
			<easy-cm @ecmcb="rightMenuClick" :list="rightMenuList"></easy-cm>
		</div>
</template>

<script>
import axios from "@/plugins/axios";
import albumDetail from "@/views/photos/photoPages/albumDetail.vue"

export default {
	components: {
		albumDetail
	},
	data() {
		return {
			dealState:"",
			rightMenuList: [{
				text: this.$t('file.check'),
				type: "CHECK",
			}],
			changeAlbumName: "",
			itemBaseWidth: 220,
			itemWidth: 220,
			itemMargin: 10,
			selectedItem: '',
			showAlbumDetail: false,
			showAddAlbum: false,
			dataList: [],
			loading: false,
			selectedIndex: false,
			enable: true,
			checkStateTimeout:null
		}
	},
	mounted() {
		this.getClassesList()
		window.addEventListener("resize", this.calImageWidth);
		//监听后退事件
		window.addEventListener('popstate', this.onPopstate)
	},
	beforeDestroy() {
		window.removeEventListener("resize", this.calImageWidth);
		window.removeEventListener('popstate', this.onPopstate);
		clearTimeout(this.checkStateTimeout)
	},
	methods: {
		onPopstate() {
			//后退按钮被点击 如果当前正在播放视频 则关闭视频 如果每播放 则后退
			if (this.showAlbumDetail) {
				this.showAlbumDetail = false
			} else {
				this.$router.go(-1)
			}
		},
		enableClass() {
			this.api.post('/api/commonApi/saveConfigPhoto', { aiClassesEnable: '1' }).then((res) => {
				this.getClassesList()
			}).catch((error) => { })
		},
		showRightMenu(event, root, classVal, index) {
			if (this.isMobile) return event.preventDefault()

			this.selectedIndex = index
			this.selectedItem = classVal
			this.$easycm(event, root)
		},
		//右键菜单点击
		rightMenuClick(indexList) {
			let type = this.rightMenuList[indexList[0]].type
			if (type == 'CHECK') { //查看
				this.onAlbumClick(this.selectedIndex)
			}
		},

		//计算item宽度
		calImageWidth() {
			// if (this.dataList.length < 2) {
			// 	return
			// }
			let wrapper = this.$refs.listWrapper.getBoundingClientRect();
			let itemWidth = this.utils.calItemWidth(wrapper, this.itemBaseWidth, this.itemMargin)
			if (itemWidth) this.itemWidth = itemWidth
		},
		onAlbumClick(index) {
			this.selectedItem = this.dataList[index]
			this.showAlbumDetail = true
			this.pushState()
		},
		getClassesList() {
			this.loading = true
			this.api
				.post("/api/photoApi/getPhotoClasses", {})
				.then((res) => {
					if (!res.code) {
						this.enable = res.enable
						this.dataList = res.data;
						for (let i = 0; i < this.dataList.length; i++) {
							let classObj = this.dataList[i]
							let url = axios.getImgFullPath(classObj.photo_index_id, true);
							this.dataList[i].url = url
						}
						if(this.dataList.length<1&&this.enable){
							//没有人脸 查一下是不是还在处理中
							this.getDealState()
						}
						this.$nextTick(() => {
							this.calImageWidth()
						});
					}
					this.loading = false
				})
				.catch((error) => {
					this.loading = false
				});
		},
		getDealState() {
			this.api
				.post("/api/photoApi/getAiDealState", {
					hideLoading: true,
					type:"cocossd"
				})
				.then((res) => {
					if (!res.code) {
						if(res.data&&res.data.cocossdWaitDealCount){
							if (res.data.isIndexing == 1) {
								this.dealState = this.$t("photo.indexingNoAi")
							} else if(res.data.cocossdWaitDealCount){
								this.dealState = this.$t("photo.waitDealCount", { count: res.data.cocossdWaitDealCount })
								if (res.data.cocossdWaitDealCount > 1) {
									this.checkStateTimeout = setTimeout(() => {
										this.getFaceDealState()
									}, 8000);
								}
							}
						}
					}
				})
				.catch((error) => {
				});
		}
	}
}
</script>
<style lang="scss" scoped>
.album-detail-header {
	padding-left: 30px;
	padding-right: 30px;
	height: 80px;

	@media all and (max-width:640px) {
		padding-left: 10px;
		padding-right: 10px;
	}

	position: absolute;
	flex-shrink: 0;
	z-index: 2;
	width: 100%;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
}

.album-detail-content {
	width: 100%;
	height: 100%;
	padding-top: 80px;

	@media not all and (max-width:640px) {
		padding-left: 30px;
		padding-right: 30px;
	}

}

.icon-add {
	margin-top: 30px;
	margin-bottom: 20px;
	font-size: 50px;
	color: $nas-main;
}

.album-root-wrapper {
	padding-left: 10px;
	padding-right: 10px;
	position: relative;
	z-index: 1;
	width: 100%;
	height: 100%;


}

.album-list-root {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	overflow-y: auto;
	align-content: flex-start;

}

.item-subtitle {
	text-align: left;
	font-size: 14px;
	color: $nas-grey;
}


::v-deep .vs-card {
	border-radius: 10px;

	.vs-card__img {
		border-top-left-radius: 10px !important;
		border-top-right-radius: 10px !important;
		border-bottom-left-radius: 0 !important;
		border-bottom-right-radius: 0 !important;

		img {
			border-top-left-radius: 10px !important;
			border-top-right-radius: 10px !important;
			border-bottom-left-radius: 0 !important;
			border-bottom-right-radius: 0 !important;
		}
	}
}
</style>
