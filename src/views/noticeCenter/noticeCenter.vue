<template>
	<div class="msg-root">
		<my-bg></my-bg>
		<!-- 顶部菜单栏 手机端不显示 -->
		<div class="nas-mobile-none">
			<p class="my-header-position"></p>
		</div>
		<div class="nas-mobile-none">
			<my-header></my-header>
		</div>

		<div class="main-layout  nas-padding-right-zero">
			<!-- 左侧边栏 -->
			<div class="sidebar-root">
				<my-sidebar ref="sidebar" @onItemClick="setLeftMenuId" :optionList="sideOptionList"></my-sidebar>
			</div>
			<!-- 左侧边栏-手机 -->
			<div class="sidebar-mobile-root">
				<my-sidebar-mobile ref="sidebarMobile" @onItemClick="setLeftMenuId" :optionList="sideOptionList">
				</my-sidebar-mobile>
			</div>
			<div class="right-root">
				<my-nodata v-if="messageList.length < 1" :title="$t('common.noMore')"
					style="position: absolute;width: 100%;margin-top: 150px;">
				</my-nodata>
				<div class="top-root">
					<!-- 全部已读 -->
					<my-btn @click="markAllRead" :title="$t('notice.markAllAsRead')"></my-btn>
					<!-- 清空消息 -->
					<my-btn @click="deleteAll" :title="$t('notice.deleteAll')" type="white"></my-btn>
				</div>
				<div style="width: 100%;height: 100%;padding-top: 80px;overflow: hidden;">
					<div v-if="messageList.length > 0"
						style="padding-bottom: 15px;overflow: auto;height: 100%;width: 100%;" @scroll="onPageScroll">
						<Card class="card-root" v-for="(msg, index) in messageList">

							<div
								style="display: flex;align-items: center;justify-content: space-between;margin-top: 10px;">
								<div style="display: flex;align-items: center;">
									<!-- 未读红点 -->
									<div v-if="msg.read == 0" class="red-dot"></div>
									<div v-else class="grey-dot"></div>
									<!-- 标题 -->
									<p style="word-break: break-all;margin-left: 15px;font-size: 16px;text-align: left;"
										@click="itemClick(msg, index)"> [{{
												msg.create_time_str
										}}] {{ msg.title }}</p>
								</div>
								<!-- 内容 -->
								<a @click.prevent="deleteMsg(index,false)" style="flex-shrink: 0;margin-left: 10px;">
									{{ $t('common.delete') }}
								</a>
							</div>
							<p style="word-break: break-all;margin-top: 15px;margin-bottom: 20px;width: 100%;text-align: left;margin-left: 28px;font-size: 14px;padding-right: 40px;"
								@click="itemClick(msg, index)">{{ msg.content }}</p>

						</Card>

						<div style="margin-top: 30px;margin-bottom: 30px;width: 100%;">
							<p style="text-align:center" v-if="messageList.length < 1 || !hasMore">
								{{ $t('common.noMore') }}
							</p>
						</div>
					</div>
				</div>

			</div>
		</div>
	</div>
</template>
<script>
import myHeader from "@/components/my-header/my-header.vue"

export default {
	components: {
		myHeader
	},
	watch: {
		msgType: function (newVal, oldVal) {
			this.loadFirstPage()
		}
	},
	data() {
		return {
			sideOptionList: [{
				id: 'info',
				title: this.$t('notice.info'),
				font: "nasIcons icon-msg-list"
			}, {
				id: 'error',
				title: this.$t('notice.error'),
				font: "nasIcons icon-msg-error"
			}],
			infoUnReadCount: 0,
			errorUnReadCount: 0,
			msgType: "info",
			messageList: [],
			isLoading: false,
			hasMore: true
		};
	},
	mounted() {
		this.getMessageList()
		//在header的mounted中触发加载第一页数据 在onChooseRange
	},
	beforeDestroy() {
	},
	computed: {

	},
	methods: {
		setLeftMenuId(menu) {
			let menuId=menu.id
			this.msgType = menuId
		},
		itemClick(msg, index) {
			console.log('itemClick')
			this.showVsAlertDialog(msg.title, msg.content)
			this.readMsg(msg, index)

		},
		markAllRead() {
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('notice.markAllAsRead') + '?', () => {
				this.readMsg(null, null, true)
			})
		},
		deleteAll() {
			this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('notice.deleteAll') + '?', () => {
				this.deleteMsg(null, true)
			})
		},
		readMsg(msg, index, isAll) {
			let params = {
				id: msg ? msg.id : 0
			}
			if (isAll) {
				params.isAll = isAll
				params.level = this.msgType
			}
			this.api
				.post("/api/messageApi/read", params)
				.then((res) => {
					if (!res.code) {
						if (isAll) {
							if (this.msgType == 'info') {
								this.infoUnReadCount = 0
							} else if (this.msgType == 'error') {
								this.errorUnReadCount = 0
							}
							for (let i in this.messageList) {
								if (this.messageList[i].level == this.msgType) {
									this.messageList[i].read = 1
								}
							}
						} else {
							this.messageList[index].read = 1
							if (this.msgType == 'info') {
								this.infoUnReadCount = parseInt(this.infoUnReadCount) - 1
							} else if (this.msgType == 'error') {
								this.errorUnReadCount = parseInt(this.errorUnReadCount) - 1
							}
						}
						this.$store.state.unreadMsgCount = this.infoUnReadCount + this.errorUnReadCount
					}
				})
				.catch((error) => {

				});
		},
		loadFirstPage() {
			this.messageList = []
			this.hasMore = true
			this.timestamp = 0
			this.getMessageList()
		},
		deleteMsg(index, isAll) {
			let params = {
				id: index!=null ? this.messageList[index].id : null
			}
			if (isAll) {
				params.isAll = isAll
				params.level = this.msgType
			}
			this.api
				.post("/api/messageApi/delete", params)
				.then((res) => {
					if (!res.code) {
						this.showVsNotification(this.$t('common.deleteSuccess'))
						if (isAll) {
							this.messageList = []
							this.getMessageList()
							if (this.msgType == 'info') {
								this.infoUnReadCount = 0
							} else if (this.msgType == 'error') {
								this.errorUnReadCount = 0
							}
							this.$store.state.unreadMsgCount = this.infoUnReadCount + this.errorUnReadCount
						} else {
							for (let i = 0; i < this.messageList.length; i++) {
								if (index == i) {
									this.messageList.splice(i, 1)
									console.log('删除:' + index)
								}
							}
						}
					}
				})
				.catch((error) => {

				});
		},
		getMessageList(append) {
			let reqCount = 20
			if (this.isLoading || !this.hasMore) {
				return
			}
			this.isLoading = true
			this.api
				.post("/api/messageApi/getMessage", {
					msgType: this.msgType,
					count: reqCount,
					id: this.messageList.length > 0 ? this.messageList[this.messageList.length - 1]
						.id : 0

				})
				.then((res) => {
					if (!res.code) {
						for (let i = 0; i < res.data.length; i++) {
							res.data[i].create_time_str = new Date(res.data[i].create_time)
								.toLocaleString()
						}
						if (res.data.length < reqCount) {
							this.hasMore = false
						}
						if (append) {
							res.data.forEach(item => {
								this.messageList.push(item)
							})
						} else {
							this.messageList = res.data
						}
						this.infoUnReadCount = res.infoUnReadCount
						this.errorUnReadCount = res.errorUnReadCount

					}
					this.isLoading = false
				})
				.catch((error) => {
					this.isLoading = false
				});
		},
		//滚动回调
		onPageScroll(e) {
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
			let windowHeight = document.documentElement.clientHeight;
			if (scrollTop + windowHeight >= scrollHeight - 5) {
				this.getMessageList(true)
			}
		},

	}
}
</script>
<style lang="scss" scoped>
.msg-root {
	overflow-x: hidden;
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
}

.main-layout {
	position: relative;
	display: flex;
	flex-direction: row;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.card-root {
	margin-bottom: 20px;
	width: 100%;
	border-radius: 10px;
}

.top-root {
	z-index: 3;
	width: 100%;
	display: flex;
	align-items: center;
	height: 80px;
	position: absolute;
}

.red-dot {
	flex-shrink: 0;
	width: 15px;
	height: 15px;
	border-radius: 50%;
	background-color: #F1323D;
}

.grey-dot {
	flex-shrink: 0;
	width: 15px;
	height: 15px;
	border-radius: 50%;
	background-color: #CED8E5;

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
</style>
