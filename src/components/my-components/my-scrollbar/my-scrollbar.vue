<template>
	<div  ref="cursorRoot" class="my-scroll-root" >
		<div v-show="visiable" class="cursor" :style="{ 'width': cursorWidth + 'px', 'top': cursorTop + 'px', 'height': cursorHeight + 'px' ,'min-height':cursorMinHeight+'px'}"
			@mousedown="onMouseDown" @touchend="onTouchEnd" @touchstart="onTouchStart" @touchmove="onTouchMove">
		</div>
	</div>
</template>

<script>
export default {
	props: {

	},
	components: {},
	data() {
		return {
			cursorMinHeight:80,
			visiable: false,
			cursorHeight: 50,
			cursorWidth: 10,
			cursorDefaultWidth: 10,
			cursorFocusWidth: 10,
			cursorTop: 0,
			cursorInFocus: false,
			timer: null,
			scrollTarget: null ,//外部滚动的元素
			cursorTopWhenDown:0,
			cursorClientYWhenDown:0,
			lastOnMoveTime:0
		};
	},
	mounted() {
		//全局鼠标移动事件
		document.onmousemove=this.onMouseMove
		document.onmouseup=this.onMouseUp
	},
	beforeDestroy() {
		if (this.timer) {
			clearTimeout(this.timer)
		}
		this.scrollTarget = null
		document.onmousemove=null
		document.onmouseup=null
	},
	methods: {
		onMouseMove(e){
			//xx毫秒只触发一次 nowTs-this.lastOnMoveTime)<20||
			if(!this.cursorInFocus||!this.$refs.cursorRoot){
				return
			}
			this.setScrollBarPosition(e.clientY)
		},
		onMouseUp(e){
			this.cursorInFocus = false
		},
		onMouseDown(e) {
			this.cursorWidth = this.cursorFocusWidth
			this.cursorTopWhenDown=this.cursorTop
			this.cursorClientYWhenDown=e.clientY
			this.cursorInFocus = true
		},
		onTouchStart(e) {
			this.cursorTopWhenDown=this.cursorTop
			this.cursorClientYWhenDown=e.targetTouches[0].pageY
			this.cursorInFocus = true
		},
		onTouchEnd(e) {
			this.cursorInFocus = false
			this.setVisiableTimer()
		},
		onTouchMove(e){
			if(!this.cursorInFocus||! this.$refs.cursorRoot||!e||!e.targetTouches){
				return
			}
			let pageY=e.targetTouches[0].pageY
			this.setScrollBarPosition(pageY)
			
		},
		setScrollBarPosition(touchY){
			//touchY是鼠标相对于窗口的y坐标 
			//this.cursorClientYWhenDown是鼠标按下的时候鼠标相对于窗口的y坐标
			//this.cursorTop是当前游标的顶部y坐标
			//this.cursorTopWhenDown是鼠标按下的时候游标的顶部y坐标
			//下面的targetTop计算的是鼠标按下以后y方向的移动距离
			let targetTop=this.cursorTopWhenDown+(touchY-this.cursorClientYWhenDown)
			//cursorRootHeight轨道容器高度
			let cursorRootHeight = this.$refs.cursorRoot.clientHeight 
			//防止游标超出屏幕
			if(targetTop<0){
				targetTop=0
			}
			if((targetTop+this.cursorHeight)>cursorRootHeight){
				targetTop=cursorRootHeight-this.cursorHeight
			}
			
			this.cursorTop=targetTop

			let targetScrollPercent=(targetTop)/(cursorRootHeight)//计算目标容器应该滚动的量
			if(targetScrollPercent>0.98){
				targetScrollPercent=1
			}
			if(this.scrollTarget){
				this.scrollTarget.scrollTop=this.scrollTarget.scrollHeight*targetScrollPercent
			}
		},
		setVisiableTimer() {
			//2.5秒后消失
			if (this.timer) {
				clearTimeout(this.timer)
			}
			this.timer = setTimeout(() => {
				if (!this.cursorInFocus) {
					this.visiable = false
				}
			}, 5000);
		},
		onScroll(e) {
			if (!e || !e.target || !this.$refs.cursorRoot) { return }
			this.scrollTarget = e.target //记录外部滚动元素的引用 
			let scrollTop = e.target.scrollTop; //距离顶部高度
			let scrollHeight = e.target.scrollHeight; //滑动区域总高度
			let clientHeight = e.target.clientHeight //可见区域高度
			let cursorRootHeight = this.$refs.cursorRoot.clientHeight //cursor轨道容器高度
			if(cursorRootHeight<1){
				return
			}
			this.cursorHeight = clientHeight / scrollHeight * cursorRootHeight //cursor高度计算
			if(this.cursorHeight<this.cursorMinHeight){
				this.cursorHeight=this.cursorMinHeight
			}
			if(!this.cursorInFocus){
				//非手动移动情况下 移动游标
				this.cursorTop = scrollTop / scrollHeight * cursorRootHeight //cursor位置计算
			}
			if(this.cursorHeight>0&&this.cursorHeight>=cursorRootHeight*0.8){//滚动条太长的时候不显示
				this.visiable=false
			}else{
				this.visiable = true //滚动的时候显示
				this.setVisiableTimer()
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.my-scroll-root {
	z-index: 9999999;
	position: fixed;
	right: 0;
	top: 0;
	height: 100%;
	width: 8px;
	display: flex;
	justify-content: center;

	.cursor {
		border-radius: 4px;
		position: absolute;
		right: 0;
		background-color: rgba($color: #666, $alpha: 0.6);
		width: 100%;
	}
}
</style>
