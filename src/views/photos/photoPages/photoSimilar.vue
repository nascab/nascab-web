<template>
	<div class="root-wrapper">
		<!-- 无数据提示 -->
		<div
			style="z-index:2; position: absolute;width: 100%;margin-top:150px;display:flex;flex-direction: column;align-items:center">
			<my-nodata v-if="!loading && dataList.length < 1" :title="$t('photo.noSimilarPhoto')">
			</my-nodata>
			<div v-if="!enable" @click="enableSimilarPhoto()">
				<my-btn :title="$t('photo.enableSimilarPhoto')" style="margin-top:20px;"></my-btn>
			</div>
			<div style="margin-top:10px" v-if="enable && dealState">[{{ dealState }}]</div>
		</div>
		<div class="list-root" ref="listWrapper">


			<div v-for="(item, index) in dataList" class="list-item-root">
				<div
					style="width:100%;text-align: left;font-size: 18px;margin-bottom:20px;margin-top:30px;font-weight: bold;">
					{{ $t('photo.checkKeepPhoto') }}</div>
				<div v-for="(similarItem, indexb) in item.similarIndexList" class="item-div">
					<img class="item-img" :src="similarItem.url" @click="checkImage(index, indexb)" />
					<div style="margin-top: 10px;display: flex;flex-direction: column;" @click="nameClick(index, indexb)">
						<div style="text-align: left;" class="max-line-one">{{$t("common.folder")}}: {{ similarItem.path }}</div>
						<div style="text-align: left;" class="max-line-one">{{$t("common.name")}}: {{ similarItem.filename }}</div>
						<div style="display: flex;align-items: center;">
							<Checkbox v-model="similarItem.checked"></Checkbox><span style="color:#999999">{{
								utils.getSizeStr(similarItem.size) }}</span>
						</div>
					</div>
				</div>
			</div>

			<div style="width:100%;height:200px;" v-if="dataList.length > 0">
				<div style="padding-top: 20px;">{{ $t('photo.leftSimilarGroupCount', { count: waitDealCount }) }}</div>
			</div>
		</div>
		<div class="bottom-root" v-if="dataList.length > 0">

			<div @click.stop="dealSimilarPhotoApi(true)"><my-btn :title="$t('photo.keepAll')"></my-btn></div>
			<div @click.stop="dealSimilarPhotoApi(false)"><my-btn type="red" style="margin-left:10px"
					:title="$t('photo.moveSimilarToTrash')"></my-btn></div>
		</div>

		<!-- 点击照片后弹出的照片详情 -->
		<Modal v-model="showPhotoDetail" fullscreen footer-hide style="background-color: transparent;">
			<photo-detail v-if="showPhotoDetail" @onClose="showPhotoDetail = false" ref="photoDetail"></photo-detail>
		</Modal>

		<!-- 右键菜单 -->
		<easy-cm @ecmcb="rightMenuClick" :list="rightMenuList"></easy-cm>
	</div>
</template>

<script>
import axios from "@/plugins/axios";
import photoDetail from "@/views/photos/components/photoDetail.vue";

export default {
	components: {
		photoDetail
	},
	data() {
		return {
			dealState: "",
			rightMenuList: [{
				text: this.$t('file.check'),
				type: "CHECK",
			}],
			showPhotoDetail: false,
			changeAlbumName: "",
			itemBaseWidth: 220,
			itemWidth: 220,
			itemMargin: 10,
			selectedItem: '',
			showAddAlbum: false,
			dataList: [],
			loading: false,
			selectedIndex: false,
			enable: true,
			checkStateTimeout: null,
			waitDealCount: 0,
			pageSize: 5
		}
	},
	mounted() {
		this.getDealList()
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
		checkImage(index, indexb) {
			this.showPhotoDetail = true;
			let similarList = this.dataList[index].similarIndexList
			for (let i in similarList) {
				similarList[i].type = 1
			}
			this.$nextTick(() => {
				this.$refs.photoDetail.showImg(similarList, indexb);
			});
			this.pushState()
		},
		nameClick(index, indexb) {
			console.log("nameClick")
			this.dataList[index].similarIndexList[indexb].checked = !this.dataList[index].similarIndexList[indexb].checked
			this.$forceUpdate()
		},
		onPopstate() {
			//后退按钮被点击 如果当前正在播放视频 则关闭视频 如果每播放 则后退
			if (this.showPhotoDetail) {
				this.showPhotoDetail = false
			} else {
				this.$router.go(-1)
			}
		},
		enableSimilarPhoto() {
			console.log("enableSimilarPhoto")
			this.api.post('/api/commonApi/saveConfigPhoto', { aiSimilarPhotoEnable: '1' }).then((res) => {
				this.getDealList()
			}).catch((error) => { console.log(error) })
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
			let wrapper = this.$refs.listWrapper.getBoundingClientRect();
			let itemWidth = this.utils.calItemWidth(wrapper, this.itemBaseWidth, this.itemMargin)
			if (itemWidth) this.itemWidth = itemWidth
		},
		getDealList() {
			this.loading = true
			this.api
				.post("/api/photoApi/getSimilarPhoto", { count: this.pageSize })
				.then((res) => {
					if (!res.code) {
						this.enable = res.enable
						this.dataList = res.data;
						this.waitDealCount = res.waitDealCount - this.dataList.length
						for (let i = 0; i < this.dataList.length; i++) {
							let item = this.dataList[i]
							let biggestSizeIndex = 0
							let biggestSize = 0
							for (let j in item.similarIndexList) {
								let url = axios.getImgFullPath(this.dataList[i].similarIndexList[j].id, true)+"&ts="+new Date().getTime()
								this.dataList[i].similarIndexList[j].url = url
								if (this.dataList[i].similarIndexList[j].size > biggestSize) {
									biggestSize = this.dataList[i].similarIndexList[j].size
									biggestSizeIndex = j
								}
							}
							//选中尺寸最大的
							for (let k in item.similarIndexList) {
								this.dataList[i].similarIndexList[k].checked = biggestSizeIndex == k
							}
							console.log(this.dataList)
							let url = axios.getImgFullPath(item.indexObj.id, true);
							this.dataList[i].indexObj.url = url
							this.$nextTick(() => {
								this.calImageWidth()
							});
						}
						if (this.dataList.length < 1 && this.enable) {
							//查一下是不是还在处理中
							this.getDealState()
						}
					}
					this.loading = false
				})
				.catch((error) => {
					this.loading = false
				});
		},
		dealSimilarPhotoApi(keepAll) {
			console.log(this.dataList)
			let sendDataList = []

			for (let i in this.dataList) {
				let keepIndexList = []
				for (let j in this.dataList[i].similarIndexList) {
					if (keepAll || this.dataList[i].similarIndexList[j].checked) {
						keepIndexList.push(this.dataList[i].similarIndexList[j].id)
					}
				}
				sendDataList.push({
					index_id: this.dataList[i].index_id,
					keepIndexList: keepIndexList
				})
			}
			this.api
				.post("/api/photoApi/dealSimilarPhoto", { dealList: sendDataList })
				.then((res) => {
					if (!res.code) {
						this.showVsNotification(this.$t('common.operationSuccess'))
						this.$refs.listWrapper.scrollTo({ top: 0})

						this.getDealList()
					}
				})
				.catch((error) => {
				});
		},
		getDealState() {
			this.api
				.post("/api/photoApi/getAiDealState", {
					hideLoading: true,
					type: "similar"
				})
				.then((res) => {
					if (!res.code) {
						if (res.data && res.data.similarWaitDealCount) {
							if (res.data.isIndexing == 1) {
								this.dealState = this.$t("photo.indexingNoAi")
							} else if (res.data.similarWaitDealCount) {
								this.dealState = this.$t("photo.waitDealCount", { count: res.data.similarWaitDealCount })
								if (res.data.similarWaitDealCount > 1) {
									this.checkStateTimeout = setTimeout(() => {
										this.getDealState()
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
.root-wrapper {
	z-index: 1;

	padding-left: 10px;
	padding-right: 10px;
	width: 100%;
	height: 100%;
}

.item-div {
	margin-bottom: 10px;
	width: 350px;
	margin-right: 10px;
	display: flex;
	flex-direction: column;
	justify-content: center;

	@media all and (max-width:640px) {
      //手机
      width: 47.5%;
	  margin-right: 2.5%;
    }
}

.item-img {
	border-radius: 10px;
	width: 100%;
}

.list-root {
	position: relative;

	padding: 10px;
	width: 100%;
	height: 100%;
	overflow-y: auto;
}

.list-item-root {
	margin-bottom: 20px;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	overflow-y: auto;
	align-content: flex-start;
}

.bottom-root {
	z-index: 2;
	position: absolute;
	bottom: 0;
	left: 0;
	height: 60px;
	width: 100%;
	background-color: white;
	padding-left: 20px;
	padding-right: 20px;
	display: flex;
	justify-content: center;
	align-items: center;
}
</style>
