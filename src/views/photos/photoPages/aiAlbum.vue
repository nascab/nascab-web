<template>
	<photo-base :initIndex="2">
		<div class="ai-album-root-wrapper">
			<!-- 无数据提示 -->
			<my-nodata v-if="!loading && albumList.length < 1" @onBtnClick="showAddAlbum = true"
				:title="$t('album.noAlubmDesc')" :btnTitle="$t('album.addASmartAlbum')"
				style="position: absolute;width: 100%;margin-top: 150px;">
			</my-nodata>
			<div style="width:100%;display:flex;height: 100%;flex-direction:row;overflow: hidden;">
				<!-- 相册列表 -->
				<div class="album-list-root" ref="listWrapper">
					<vs-card v-for="(album, index) in albumList" type='1' @click="onAlbumClick(index)"
						@contextmenu="showRightMenu($event, $root, album, index)"
						:style="{ 'margin': itemMargin + 'px', 'width': itemWidth + 'px' }">
						<template #title>
							<h3 class="max-line-one" style="text-align: left;">{{ album.name }}</h3>
						</template>
						<template #img>
							<img style="object-fit: cover;" v-if="album.imgList.length > 0"
								:style="{ 'width': itemWidth + 'px', 'height': itemWidth + 'px' }"
								:src="album.imgList[0].url" />
							<img v-else style="object-fit: cover;"
								:style="{ 'width': itemWidth + 'px', 'height': itemWidth + 'px' }"
								src="@/static/photo/icon-album-empty.png" />
						</template>
						<template #text>
							<!-- 日期相册 -->
							<div v-if="album.type == 'date'">
								<!-- 智能日期 -->
								<p v-if="album.data_value.type == 'aiDate'" class="item-subtitle max-line-one">
									<!-- 公历、农历 -->
									{{  album.data_value.isLunar==1?$t("photo.lunar"):$t("photo.solar") }}:
									{{ album.data_value.year == '%' ? $t('album.everyYear') : album.data_value.year }}{{
										'/' + (album.data_value.month == '%' ? $t('album.everyMonth') : album.data_value.month)
									}}{{ '/' +
	album.data_value.day
}}
								</p>
								<!-- 固定日期 -->
								<p v-if="album.data_value.type == 'fix'" class="item-subtitle max-line-one">
									{{ album.data_value.year + '/' }}{{ album.data_value.month + '/' }}{{
										album.data_value.day
									}}
									<span v-if="album.data_value.sign == '>'">{{ $t('album.gt') }}</span>
									<span v-if="album.data_value.sign == '<'">{{ $t('album.lt') }}</span>
									<span v-if="album.data_value.sign == '='">{{ $t('album.eq') }}</span>
								</p>

								<p v-if="album.data_value.type == 'holidays'" class="item-subtitle max-line-one">
									{{ $t('album.holidays') }}-{{ album.data_value.holidayName }}
								</p>
								<!-- 区间日期 -->
								<p v-if="album.data_value.type == 'section'" class="item-subtitle max-line-one">
									{{ album.data_value.year_start + '/' }}{{ album.data_value.month_start + '/' }}{{
										album.data_value.day_start
									}}
									-
									{{ album.data_value.year_end + '/' }}{{ album.data_value.month_end + '/' }}{{
										album.data_value.day_end + '/'
									}}
								</p>
							</div>
							<!-- 地理围栏 -->
							<div v-if="album.type == 'geo'">
								<p class="item-subtitle max-line-one">{{ $t('album.geoAlbumDetail') }}</p>
							</div>


							<!-- 设备相册 -->
							<div v-if="album.type == 'mode'">
								<p class="item-subtitle max-line-one">{{ album.data_value.mode }}</p>
							</div>

							<!-- 条件相册 -->
							<div v-if="album.type == 'condition'">
								<p class="item-subtitle max-line-one">{{ album.data_value }}</p>
							</div>
						</template>
						<template #interactions>
							<vs-button icon>
								<!-- 相册类型 -->
								<div v-if="album.type == 'date'">
									<!-- 智能日期相册 -->
									<h3 v-if="album.data_value.type == 'aiDate'" class="album-type max-line-one">{{ $t('album.aiDate') }}</h3>
									<h3 v-if="album.data_value.type == 'fix'" class="album-type max-line-one">{{ $t('album.fixDate') }}</h3>
									<h3 v-if="album.data_value.type == 'section'" class="album-type max-line-one">{{ $t('album.sectionDate') }}</h3>
									<h3 v-if="album.data_value.type == 'holidays'" class="album-type max-line-one">{{ $t('album.holidays') }}</h3>
								</div>
								<div v-if="album.type == 'geo'">
									<h3 class=" max-line-one">{{ $t('album.geoAlbum') }}</h3>
								</div>
								<div v-if="album.type == 'mode'">
									<h3 class=" max-line-one">{{ $t('album.modeAlbum') }}</h3>
								</div>
								<div v-if="album.type == 'condition'">
									<h3 class=" max-line-one">{{ $t('photo.filterAlubm') }}</h3>
								</div>
							</vs-button>
							<vs-button icon class="btn-chat" shadow primary @click.stop="showChangeNameModal(index)">
								<Icon type="md-settings" size="20" />
							</vs-button>
						</template>
					</vs-card>

					<!-- 添加相册 -->
					<div v-if="albumList.length > 0" @click="showAddAlbum = true"
						:style="{ 'margin': itemMargin + 'px', 'width': itemWidth + 'px' }"
						style="background-color: white;border-radius: 10px;display: flex;flex-direction: column;justify-content: center;cursor: pointer;">
						<span class="nasIcons icon-add-album icon-add"></span>
						<div style="font-size: 20px;font-weight: bold;margin-bottom: 60px;">{{ $t('album.addASmartAlbum') }}
						</div>
					</div>
				</div>
			</div>

			<!--修改相册名 -->
			<my-dialog-input @onOkClick="onChangeAlbumName" :placeholder="$t('album.albumName')" :showCloseBtn="true"
				ref="changeAlbumDialog" :content="$t('album.albumName')" :title="$t('album.changeAlbumName')"
				:initValue="changeAlbumName">
			</my-dialog-input>

			<!--添加相册对话框 -->
			<vs-dialog v-model="showAddAlbum" scroll>
				<template #header>
					<h4 style="font-size: 16px;">
						{{ $t('album.addAAlbum') }}
					</h4>
				</template>
				<album-add v-if="showAddAlbum" @onClose="showAddAlbum = false" @onAdd="onAddAlbum"></album-add>
			</vs-dialog>
			<!-- 相册详情对话框 -->
			<Modal :scrollable="false" footer-hide ref="myModal" class-name="modal-style-nopadding"
				v-model="showAlbumDetail" fullscreen :closable="false">
				<album-detail v-if="showAlbumDetail" @onClose="showAlbumDetail = false" :propsShowSearchBtn="false"
					:propsTitle="selectedAlbum.name" :propsShowAddToAlbum="true" :propsShowDelete="true"
					:propsShowModeSwitch="true" @onDelete="deleteAlbum" :propsAlbumId="selectedAlbum.id + ''">
				</album-detail>
			</Modal>
			<!-- 右键菜单 -->
			<easy-cm @ecmcb="rightMenuClick" :list="rightMenuList"></easy-cm>
		</div>
	</photo-base>
</template>

<script>
import albumAdd from "@/views/photos/components/albumAdd.vue";
import axios from "@/plugins/axios";
import albumDetail from "./albumDetail.vue"
import photoBase from "@/views/photos/photoBase";

export default {
	components: {
		albumAdd,
		albumDetail,
		photoBase
	},
	data() {
		return {
			rightMenuList: [{
				text: this.$t('file.check'),
				type: "CHECK",
			}, {
				text: this.$t('common.delete'),
				type: "DELETE"
			}],
			changeAlbumName: "",
			itemBaseWidth:200,
			itemWidth: 200,
			itemMargin: 10,
			selectedAlbum: '',
			showAlbumDetail: false,
			showAddAlbum: false,
			albumList: [],
			loading: false,
			selectedIndex: false
		}
	},
	mounted() {
		this.getAlbumList()
		window.addEventListener("resize", this.calImageWidth);
		//监听后退事件
		window.addEventListener('popstate', this.onPopstate)
	},
	activated() {
		let deleteAlbumId = sessionStorage.getItem('albumDelete')
		if (!deleteAlbumId) {
			return
		}
		sessionStorage.removeItem('ordinaryAlbumDelete')
		for (let i in this.albumList) {
			if (this.albumList[i].id == deleteAlbumId) {
				return this.albumList.splice(i, 1)
			}
		}
	},
	beforeDestroy() {
		window.removeEventListener("resize", this.calImageWidth);
		window.removeEventListener('popstate', this.onPopstate);

	},
	methods: {
		onPopstate() {
			console.log("后退点击")
			//后退按钮被点击 如果当前正在播放视频 则关闭视频 如果每播放 则后退
			if (this.showAlbumDetail) {
				this.showAlbumDetail = false
			} else {
				this.$router.go(-1)
			}
		},
		showRightMenu(event, root, album, index) {
			if (this.isMobile) return event.preventDefault()
			this.selectedIndex = index
			this.selectedAlbum = album
			this.$easycm(event, root)
		},
		//右键菜单点击
		rightMenuClick(indexList) {
			let type = this.rightMenuList[indexList[0]].type
			if (type == 'CHECK') { //查看
				this.onAlbumClick(this.selectedIndex)
			} else if (type == 'DELETE') { //删除
				this.deleteAlbum()
			}
		},
		showChangeNameModal(index) {
			this.selectedAlbum = this.albumList[index]
			this.changeAlbumName = this.selectedAlbum.name
			this.$nextTick(() => {
				this.$refs.changeAlbumDialog.setShow(true)
			})
		},
		onChangeAlbumName(inputVal) {
			this.changeAlbumName = inputVal
			//当点击添加相册
			if (this.changeAlbumName.length < 1) {
				this.showVsNotification(this.$t('album.pleaseInputAlbumName'));
			}
			this.api
				.post("/api/photoApi/updateAlbum", {
					id: this.selectedAlbum.id,
					name: this.changeAlbumName
				})
				.then((res) => {
					if (!res.code) {
						this.showVsNotification(this.$t('common.changeSuccess'));
						this.getAlbumList()
					}
				})
				.catch((error) => { });
		},
		onAddAlbum() {
			this.showAddAlbum = false
			this.getAlbumList()
		},
		//计算item宽度
		calImageWidth() {
			let wrapper = this.$refs.listWrapper.getBoundingClientRect();
			let itemWidth = this.utils.calItemWidth(wrapper, this.itemBaseWidth, this.itemMargin)
			if (itemWidth) this.itemWidth = itemWidth
		},
		onAlbumClick(index) {
			this.selectedAlbum = this.albumList[index]
			this.showAlbumDetail = true
			this.pushState()
		},
		getAlbumList() {
			this.loading = true
			this.api
				.post("/api/photoApi/getAllAlbum", {})
				.then((res) => {
					if (!res.code) {
						this.albumList = res.data;
						for (let i = 0; i < this.albumList.length; i++) {
							let albumObj = this.albumList[i]
							albumObj.data_value = JSON.parse(albumObj.data_value)
							for (let j = 0; j < this.albumList[i].imgList.length; j++) {
								let url = axios.getImgFullPath(this.albumList[i].imgList[j].id, true);
								this.albumList[i].imgList[j].url = url
							}
						}
						// for(let i=0;i<20;i++){
						// 	this.albumList.push(res.data[0])
						// }
						this.$nextTick(() => {
							this.calImageWidth()
							setTimeout(() => {
								this.calImageWidth()
							}, 300);
						});
					}
					this.loading = false
				})
				.catch((error) => {
					this.loading = false
				});
		},
		deleteAlbum() {
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('common.deleteSure'), () => {
				this.api
					.post("/api/photoApi/deleteAlbum", {
						id: this.selectedAlbum.id
					})
					.then((res) => {
						if (!res.code) {
							this.showVsNotification(this.$t('common.deleteSuccess'))
							this.getAlbumList()
							this.showAlbumDetail = false
						}
					})
					.catch((error) => { });
			})
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
		height: 60px;
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
	padding-top: 60px;

	@media not all and (max-width:640px) {
		padding-left: 30px;
		padding-right: 30px;
		padding-top: 80px;
	}

}

.ai-album-root-wrapper {
	position: relative;
	z-index: 1;
	width: 100%;
	height: 100%;

	@media not all and (max-width:640px) {
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
		padding: 10px;

	}

	background-color: rgba(255, 255, 255, 0.6);


	.icon-add {
		margin-top: 30px;
		margin-bottom: 20px;
		font-size: 50px;
		color: $nas-main;
	}

	.album-list-root {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		overflow-y: auto;
		align-content: flex-start;
		scrollbar-width: none;
		/* Firefox 64 */

	}

	.album-header {
		z-index: 100;
		position: absolute;
		left: 0;
		height: 80px;
		width: 100%;
		display: flex;
		padding-left: 30px;
		padding-right: 30px;
		align-items: center;
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
}
.album-type{
	flex-shrink: 0;
}
</style>
