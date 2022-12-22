<template>
	<div class="timeline-root" ref="timeLineRoot" @mouseenter="mouseEnter" @mouseleave="mouseLeave"
		@mousemove="mouseMove" @touchmove.prevent="barTouchMove" @touchstart="barTouchStart" @touchend="barTouchEnd">
		<div v-if="showTimeLine" class="date-list" ref="dateList">
			<div class="item" v-for="(item, index) in dateList" :style="{ height: item.height + 'px' }"
				@click="onTimeClick(index)" @mouseenter="itemMouseEnter(item)">
				<!-- 年份文字 -->
				<div class="year-text"
					v-if="item.showYear && (item.yearPhotoCount * itemHeight > 30 || index == dateList.length - 1)">
					<p>{{ item.year }}</p>
				</div>
				<!-- 灰色圆点 -->
				<div class="ring-wrapper" v-if="(item.height > 10 && !item.showYear)">
					<div class="ring">
					</div>
				</div>
			</div>
		</div>
		<!-- 游标 -->
		<div v-if="showTimeLine" :style="{ top: cursorTop + 'px' }" class="cursor-root">
			<!--  底部线 -->
			<div class="cursor-line"></div>
			<p class="cursor-text">
				{{ cursorDateStr }}
			</p>
		</div>
	</div>
</template>

<script>
export default {
	name: "photo-timeline",
	props: {
		//如果传入则代表获取附近的
		geohash: {
			default: '',
			type: String
		}
	},
	data() {
		return {
			mouseInTimeLine: false,
			showTimeLine: false,
			showTimeOut: null,
			scrolling: false,
			rootWrapper: null,
			cursorTop: 0,
			cursorDateStr: "",
			dateList: [],
			itemHeight: 1,
			tmHeight: 0,
			photoTotalCount: 0,
			movePointerIndex: 0,
			hadMoved: false
		};
	},
	methods: {
		barTouchStart(e) {
			console.log('barTouchStart', e)
			this.cancelTimeout()
			this.movePointerIndex = 0
			this.hadMoved = false
		},
		barTouchMove(e) {
			if (!this.rootWrapper) {
				this.rootWrapper = this.$refs.timeLineRoot.getBoundingClientRect();
			}
			let y = e.changedTouches[0].pageY - this.rootWrapper.top
			this.cursorTop = y

			let moveDownDistance = 0
			let pointerIndex = 0
			for (let i = 0; i < this.dateList.length; i++) {
				moveDownDistance += this.dateList[i].height
				if (this.cursorTop <= moveDownDistance) {
					pointerIndex = i > 0 ? i - 1 : 0
					break
				}
			}
			this.movePointerIndex = pointerIndex
			this.cursorDateStr = this.dateList[pointerIndex].yearMonth
			this.hadMoved = true
		},
		barTouchEnd(e) {
			if (this.hadMoved) {
				// 没有移动不走这里 避免和点击时间冲突
				console.log('barTouchEnd', e)
				this.setTimeoutInvisiable()
				this.$emit('onTimeChoose', this.dateList[this.movePointerIndex].original_time)
			}
		},
		cancelTimeout() {
			if (this.showTimeOut) {
				clearTimeout(this.showTimeOut)
			}
		},
		setTimeoutInvisiable() {
			this.cancelTimeout()
			this.showTimeOut = setTimeout(() => {
				if (this.isMobile) {
					this.showTimeLine = false
					this.scrolling = false
				} else {
					if (!this.mouseInTimeLine) {
						this.showTimeLine = false
						this.scrolling = false
					}
				}
			}, 2000)
		},
		onScroll() {
			this.scrolling = true
			this.showTimeLine = true
			this.setTimeoutInvisiable()
		},
		mouseMove(e) {
			if (!this.rootWrapper) {
				this.rootWrapper = this.$refs.timeLineRoot.getBoundingClientRect();
			}
			this.cursorTop = e.pageY - this.rootWrapper.top
		},
		mouseEnter(e) {
			this.mouseInTimeLine = true
			this.showTimeLine = true
		},
		itemMouseEnter(item) {
			console.log('itemMouseEnter')
			this.cursorDateStr = item.yearMonth
		},
		mouseLeave(e) {
			this.mouseInTimeLine = false
			setTimeout(() => {
				if (!this.mouseInTimeLine && !this.scrolling) {
					this.showTimeLine = false
				}
			}, 1000)
		},
		onTimeClick(index) {
			console.log('onTimeClick')
			this.hadMoved=false
			this.$emit('onTimeChoose', this.dateList[index].original_time)
		},
		onWindowResize() {
			this.calItemHeight()
		},
		showSelectedTime(timestamp) {
			// 根据时间移动游标
			let currentShowDateIndex = 0
			let dateBeforeCount = 0
			for (let i in this.dateList) {
				dateBeforeCount += this.dateList[i].count
				if (timestamp >= this.dateList[i].original_time) {
					currentShowDateIndex = i
					break
				}
			}
			this.cursorTop = dateBeforeCount / this.photoTotalCount * this.tmHeight
			this.cursorDateStr = this.dateList[currentShowDateIndex].yearMonth
		},
		// 计算每个时间数据的高度
		calItemHeight() {
			if (this.photoTotalCount < 1) return
			this.$nextTick(() => {
				this.rootWrapper = this.$refs.timeLineRoot.getBoundingClientRect();
				console.log('this.rootWrapper', this.rootWrapper)
				this.tmHeight = this.rootWrapper.height - 60
				this.itemHeight = this.tmHeight / this.photoTotalCount
				console.log('this.itemHeight', this.itemHeight)
				console.log('this.photoTotalCount', this.photoTotalCount)
				for (let i = 0; i < this.dateList.length; i++) {
					this.dateList[i].height = this.dateList[i].count * this.itemHeight
				}
				// this.$forceUpdate()
				console.log('this.itemHeight', this.itemHeight)
			})

		},
		//获取时间轴
		getTimeLine(fileType, geohash, albumId, ordinaryAlbumId, searchStr, aiClassId, faceId) {
			// 先获取时间轴
			let params = {
				type: parseInt(fileType),
			}
			if (geohash) {
				params['geohash'] = geohash
			}
			if (albumId) {
				params['albumId'] = albumId
			}
			if (ordinaryAlbumId) {
				params['ordinaryAlbumId'] = ordinaryAlbumId
			}
			if (searchStr) {
				params['searchStr'] = searchStr
			}
			if (aiClassId) {
				params['aiClassId'] = parseInt(aiClassId)
			}
			if (faceId) {
				params['faceId'] = faceId
			}
			this.api
				.post("/api/photoApi/getTimeLineDateList", params)
				.then((res) => {
					if (!res.code) {
						this.dateList = res.data
						this.$emit('onTimeLineGet', res.data)
						this.initDate()
					}
				})
				.catch((error) => {

				});
		},
		initDate() {
			if (this.dateList.length < 1) {
				return
			}
			//找到每年最早的哪个日期用来显示年份
			this.photoTotalCount = 0
			for (let i = 0; i < this.dateList.length; i++) {
				let dateObj = new Date(this.dateList[i].original_time)
				this.dateList[i].dateObj = dateObj
				this.dateList[i].year = dateObj.getFullYear()
				let month = dateObj.getMonth() + 1
				this.dateList[i].yearMonth = (this.dateList[i].year) + '-' + (month < 10 ? '0' + month : month)
			}
			// 服务器返回的日期列表都是倒叙
			let yearPhotoCount = 0
			for (let i = 0; i < this.dateList.length; i++) {
				this.photoTotalCount += this.dateList[i].count
				yearPhotoCount += this.dateList[i].count
				if (i > 0 && this.dateList[i].year != this.dateList[i - 1].year) {
					//过渡到了新的一年 把上一年最后一个日期标记为显示年的条目
					this.dateList[i - 1].showYear = true
					this.dateList[i - 1].yearPhotoCount = yearPhotoCount
					yearPhotoCount = 0
				}
				if (i == this.dateList.length - 1) {
					this.dateList[i].showYear = true
					this.dateList[i].yearPhotoCount = yearPhotoCount
					yearPhotoCount = 0
				}
			}
			this.calItemHeight()
		},
	},
	mounted() {

	},

}
</script>

<style lang="scss" scoped>
.timeline-root {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	height: 100%;
	overflow: hidden;

	@media not all and (max-width:640px) {
		width: 70px;
	}
}

.date-list {
	overflow: hidden;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	width: 100%;
}

.item {
	align-items: center;
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	width: 60px;

	.year-text {
		background-color: rgba(255, 255, 255, 0.7);
		border-radius: 10px;
		font-size: 12px;
		color: $nas-grey;

		p {
			margin: 2px 6px;
		}
	}

	.ring-wrapper {
		display: flex;
		height: 100%;
		flex-direction: row;
		align-items: center;
		justify-content: flex-end;

		@media all and (max-width:640px) {
			//手机端不显示灰色圆点
			display: none;
		}
	}

	.ring {
		height: 6px;
		width: 6px;
		background-color: #99AABF;
		border-radius: 10px;
		margin-right: 5px;
	}
}

.cursor-root {
	z-index: 1;
	position: absolute;
	right: 0;
	background-color: rgba(248, 248, 248, 0.9);
	border-top-left-radius: 15px;
	border-bottom-left-radius: 15px;
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	pointer-events: none;

	.cursor-line {
		background-color: $nas-main;
		width: 40px;
		height: 1px;
	}

	.cursor-text {
		text-align: center;
		width: 60px;
		font-weight: bold;
		color: $nas-main;
		font-size: 12px;
		margin-top: 5px;
		margin-bottom: 5px;
	}
}
</style>
