<template>
	<div class="right-root">

		<div class="operation-header">
			<!-- 创建时间排序 文件名排序 -->
			<my-menu-select :shrinkModeTh="500" style="flex-shrink:0;margin-right: 20px;" @onItemClick="clickType"
				:optionList="typeMenuOptionList"></my-menu-select>

			<!-- 搜索栏 -->
			<my-search :placeholder="$t('file.recordSearchPlaceholder')" @onSearch="onSearch"></my-search>
		</div>

		<my-nodata v-if="recordList.length < 1" :title="$t('common.noMore')"
			style="position: absolute;width: 100%;margin-top: 150px;">
		</my-nodata>

		<!-- 操作记录列表 -->
		<div v-else style="width: 100%;height: 100%;padding-top: 80px;overflow: hidden;">
			<div style="padding-bottom: 15px;overflow: auto;height: 100%;width: 100%;">
				<Card class="card-root" v-for="(record, index) in recordList">
					<!-- 操作类型 -->
					<div class="item-row">
						<b class="item-title">{{ $t('file.operationType') }}:</b>
						<p class="item-text">{{ getTypeStr(record.type) }} - {{ getStateStr(record.state) }}</p>
					</div>
					<!-- 操作用户 -->
					<div class="item-row">
						<b class="item-title">{{ $t('file.operator') }}:</b>
						<p class="item-text">{{ record.username }}</p>
					</div>
					<!-- 失败原因 -->
					<div class="item-row" v-if="record.state == '3'">
						<b class="item-title">{{ $t('file.failReason') }}:</b>
						<p class="item-text">{{ record.remark }}</p>
					</div>
					<!-- 源路径 -->
					<div class="item-row" v-if="record.type != 'delete'">
						<b class="item-title">{{ $t('file.sourcePath') }}:</b>
						<p class="item-text">{{ record.source_path }}</p>
					</div>
					<!-- 目标路径 -->
					<div class="item-row">
						<b class="item-title">{{ $t('file.targetPath') }}:</b>
						<p class="item-text">{{ record.target_path }}</p>
					</div>
					<!-- 开始时间 -->
					<div class="item-row">
						<b class="item-title">{{ $t('common.startTime') }}:</b>
						<p class="item-text">{{ record.create_time | dateFormat('YYYY-MM-DD HH:mm:ss') }}</p>
					</div>
				</Card>


				<!-- 底部的loading和没有更多 -->
				<div style="display: flex;justify-content: center;width: 100%;flex-direction:column;align-items:center">
					<!-- 手动加载更多的按钮 -->
					<Button v-if="hasMore && recordList.length > 0" @click="loadNextPage()" type="default"
						style="width: 250px;margin-top: 30px;height:45px;border-radius:20px">{{
							$t('common.loadmore')
						}}</Button>
					<Spin size="large" v-if="isLoading" style="margin-top:30px"></Spin>
					<span v-if="!isLoading && !hasMore" style="margin-top: 30px;">{{
						$t('common.noMore')
					}}</span>
					<div style="height:80px"></div>
				</div>
			</div>
		</div>
</div>
</template>
<script>



export default {
	components: {

	},
	computed: {

	},
	data() {
		return {
			page: 1,
			pageSize: 10,
			currentType: '',//空代表全部
			recordLevel: 1,
			hasMore: true,
			searchStr: "",
			isLoading: false,
			recordList: [],//文件记录列表
			typeMenuOptionList: [{
				title: this.$t('common.all'),
				id: "all"
			}, {
				title: this.$t('file.copy'),
				id: "copy"
			}, {
				title: this.$t('file.cut'),
				id: "cut"
			}, {
				title: this.$t('upload.rename'),
				id: "rename"
			}, {
				title: this.$t('file.delete'),
				id: "delete"
			}, {
				title: this.$t('file.zip'),
				id: "zip"
			}, {
				title: this.$t('file.unzip'),
				id: "unzip"
			}]
		}
	},
	mounted() {
		this.clickType("")
		// 监听滚动条
		window.addEventListener("scroll", this.onPageScroll, true);
	},
	beforeDestroy() {
		window.removeEventListener("scroll", this.onPageScroll, true);

	},
	methods: {
		//滚动回调
		onPageScroll(e) {
			this.dealOnPageScroll(e, () => {
				this.loadNextPage();
			})
		},
		onSearch(searchStr) {
			this.searchStr = searchStr
			this.clickType(this.currentType)
		},
		loadNextPage() {
			this.getRecordList(this.page + 1)
		},
		clickType(menu) {
			this.recordList = []
			let type = menu
			this.currentType = type
			this.page = 1
			this.currentType = type == "all" ? "" : type
			this.recordLevel = 1
			this.hasMore = true
			this.isLoading = false
			this.getRecordList(this.page)
		},
		//获取文件记录列表
		getRecordList(reqPage) {
			if (this.isLoading||!this.hasMore) {
				return
			}
			this.isLoading = true
			let params = {
				page: reqPage,
				pageSize: this.pageSize,
				level: this.recordLevel
			}
			if (this.currentType) {
				params.type = this.currentType
			}
			if (this.searchStr) {
				params.searchStr = this.searchStr
			}
			this.api
				.post("/api/file/getOperationRecord", params)
				.then((res) => {
					this.isLoading = false

					if (!res.code) {
						this.page = reqPage
						if (res.data) {
							if (this.page == 1) {
								this.recordList = res.data
							} else {
								this.recordList.push(...res.data)
							}
							this.hasMore = res.data.length >= this.pageSize
						} else {
							this.hasMore = false
						}
					}
				})
				.catch((error) => {
					this.isLoading = false
				});
		},
		getStateStr(state) {
			if (state == "1") {
				return this.$t("file.stateStarted")
			} else if (state == "2") {
				return this.$t("common.operationSuccess")
			} else if (state == "3") {
				return this.$t("common.operationFail")
			} else if (state == "4") {
				return this.$t("file.stateStoped")
			}
		},
		getTypeStr(type) {
			if (type == "copy") {
				return this.$t("file.copy")
			} else if (type == "cut") {
				return this.$t("file.cut")
			} else if (type == "rename") {
				return this.$t("upload.rename")
			} else if (type == "zip") {
				return this.$t("file.zip")
			} else if (type == "unzip") {
				return this.$t("file.unzip")
			} else if (type == "delete") {
				return this.$t("file.delete")
			}
		}
	}
}
</script>

<style scoped lang="scss">
.operation-header {
	left: 0;
	position: absolute;
	z-index: 2;
	width: 100%;
	position: absolute;
	height: 80px;
	padding-left: 10px;
	padding-right: 10px;

	@media not all and (max-width:640px) {
		padding-left: 30px;
		padding-right: 30px;
	}

	display: flex;
	align-items: center;
	justify-content: space-between;
}


.right-root {
	background-color: rgba(255, 255, 255, 0.6);
	position: relative;
	width: 100%;
	height: 100%;
	padding-left: 10px;
	padding-right: 10px;

	@media not all and (max-width:640px) {
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
		padding-left: 20px;
		padding-right: 20px;
	}
}

.card-root {
	margin-bottom: 10px;
	border-radius: 10px;

	.item-row {
		display: flex;
		align-items: start;
		margin-top: 10px;

		.item-title {
			flex-shrink: 0;
		}

		.item-text {
			text-align: left;
			margin-left: 5px;
			color: $nas-text-grey;
			word-break: break-all;
		}
	}
}
</style>
