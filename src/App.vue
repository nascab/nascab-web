<template>
	<div id="app" style="background-color: white;">
		<keep-alive>
			<router-view v-if="$route.meta.keepAlive && isRouterAlive"></router-view>
		</keep-alive>
		<transition :name="animationName">
			<router-view v-if="!$route.meta.keepAlive && isRouterAlive"></router-view>
		</transition>

		<!-- 全局confirm对话框 -->
		<my-dialog-confirm ref="appConfirmDialog" :title="confirmDialogTitle" :content="confirmDialogContent"
			@onOkClick="onConfirmOkClick" @onCancelClick="onConfirmCancelClick" :btOkTitle="confirmOkTitle"
			:btCancelTitle="confirmCancelTitle">
		</my-dialog-confirm>

		<!-- 全局的提示对话框 -->
		<my-dialog-alert :preventClose="false" ref="appAlertDialog" :title="alertDialogTitle" :content="alertDialogContent"
			@onOkClick="onAlertClick"></my-dialog-alert>

		<!-- 语言选择对话框 -->
		<my-dialog-select :options="languages" :isBlur="true" ref="languageDialog" :title="$t('setting.language')"
			:placeholder="$t('setting.chooseLanguage')" @onOkClick="onSelectLanguage"></my-dialog-select>


		<!-- 全局上传 -->
		<transition name="fade" v-if="initFinish">
			<div v-show="uploadIsShow" class="upload-wrapper">
				<Upload ref="uploadComponent"></Upload>
			</div>
		</transition>

		<!-- 全局背景任务列表 -->
		<transition name="fade" v-if="initFinish">
			<div v-show="bgTaskIsShow" class="bgtask-wrapper">
				<bg-task @setBgTaskShow="(show) => { bgTaskIsShow = show }"></bg-task>
			</div>
		</transition>

	</div>
</template>
<script>
import Vue from 'vue';
import Upload from "@/views/upload/upload"
import bgTask from "@/components/bg-task/bg-task"
import jsBridge from "@/plugins/jsBridge"

export default {
	watch: {
		$route(to, from) {
			if (to.path.includes('login')) {
				this.uploadIsShow = false
			}
			// if (to.meta && to.meta.level) {
			// 	if(to.meta.level==this.currentPageLevel){
			// 		this.animationName=""
			// 	}else{
			// 		if(to.meta.level>this.currentPageLevel){
			// 			this.animationName="slide-left"
			// 		}else{
			// 			this.animationName="slide-right"
			// 		}
			// 	}
			// }
			// this.currentPageLevel=to.meta.level
		},
	},
	components: {
		Upload,
		bgTask
	},
	provide() {
		return {
			reload: this.reload
		}
	},
	data() {
		return {
			currentPageLevel: 1,
			animationName: "fade",
			initFinish: false,
			bgTaskIsShow: false,
			uploadIsShow: false,
			confirmDialogTitle: "",
			confirmOkTitle: "",
			confirmCancelTitle: "",
			confirmDialogContent: "",
			confirmDialogOkCallback: null,
			confirmDialogCancelCallback: null,
			alertDialogTitle: "",
			alertDialogContent: "",
			alertDialogCallback: null,
			languages: [{
				label: "简体中文",
				value: "zh-CN"
			},
			{
				label: "English",
				value: "en-US"
			}
			],
			isRouterAlive: true
		}
	},
	mounted() {


		let token = localStorage.getItem('token')
		if (token) {
			this.$store.state.token = token
		}
		let currentUser = localStorage.getItem('currentUser')
		if (currentUser) {
			currentUser = JSON.parse(currentUser)
			this.$store.state.currentUser = currentUser
		}


		if (this.isMobile()) {
			//手机端
			Vue.prototype.isMobile = true
		} else {
			//pc端
			Vue.prototype.isMobile = false
		}
		let runInElectron = false
		// 判断当前是否运行于electron内部 并记录
		var userAgent = navigator.userAgent.toLowerCase();
		if (userAgent.indexOf(' electron/') > -1) {
			localStorage.setItem('runInElectron', true)
			this.$store.commit('setRunInElectron', true)
			runInElectron = true
		} else {
			localStorage.setItem('runInElectron', false)
			this.$store.commit('setRunInElectron', false)
		}
		this.getLanguageApi()
		//把弹出对话框的函数挂载到全局
		Vue.prototype.showVsAlertDialog = this.showVsAlertDialog;
		Vue.prototype.showVsConfirmDialog = this.showVsConfirmDialog;
		Vue.prototype.switchUpload = this.switchUpload;
		Vue.prototype.switchBgTask = this.switchBgTask;
		Vue.prototype.runInElectron = runInElectron;
		Vue.prototype.shouldShowTour = this.shouldShowTour
		Vue.prototype.isAndroid = /(Android)/i.test(navigator.userAgent)
		Vue.prototype.dealOnPageScroll = this.dealOnPageScroll
		Vue.prototype.pushState = this.pushState
		Vue.prototype.openNewWebViewByPath = this.openNewWebViewByPath
		Vue.prototype.goPathNewWebView = this.goPathNewWebView
		Vue.prototype.goPath = this.goPath
		Vue.prototype.copyText = this.copyText



		//标记是否在app里面
		Vue.prototype.isFromApp = localStorage.getItem("from") == "app"
		this.initFinish = true
	},
	methods: {
		copyText(text) {
			let clip = navigator.clipboard
			if (clip) {
				clip.writeText(text)
				this.showVsNotification(this.$t('system.copied'))
			}
		},
		goPathNewWebView(path, title, query, newTag) {
			if (this.isFromApp) {
				//如果在app里面就打开新页面
				jsBridge.onOpenNewWebViewByPath(path, title)
			} else {
				console.log("newTag",newTag)
				if (newTag) {
					console.log("location.href",location.href)
					window.open(location.protocol+'//' + window.location.host + "/#" + path,"_blank");                 
				} else {
					this.goPath(path, query)
				}
			}
		},
		pushState() {
			//要想监听后退时间必须pushstate
			if (window.history && window.history.pushState) {
				history.pushState(null, null, document.URL);
			}
		},
		//App.vue
		isMobile() {
			function isIos() {
				return ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
			}
			function isMobile() {
				let check = false;
				(function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
				return check;
			};
			let mobileSign = false
			if (isIos() || isMobile()) mobileSign = true
			return mobileSign
		},
		switchBgTask() {
			if (this.isMobile()) {
				this.uploadIsShow = false
			}
			this.bgTaskIsShow = !this.bgTaskIsShow
		},
		switchUpload(isShow, uploadTargetPath) {
			if (this.isFromApp && jsBridge && isShow) {
				jsBridge.onClickUpload(uploadTargetPath)
			} else {
				if (this.isMobile()) {
					this.bgTaskIsShow = false
				}
				if (isShow === false || isShow === true) {
					console.log("this.uploadIsShow =", isShow)
					this.uploadIsShow = isShow
					//设置目标上传目录
					if (uploadTargetPath) {
						this.$refs.uploadComponent.onSelectPath(uploadTargetPath)
					}
				} else {
					this.uploadIsShow = !this.uploadIsShow
				}
			}
		},
		// 显示全局提示对话康
		showVsAlertDialog(title, msg, callback) {
			if (!title) {
				title = this.$t('common.alert')
			}
			this.alertDialogTitle = title
			this.alertDialogContent = msg
			this.$refs.appAlertDialog.setShow(true)
			this.alertDialogCallback = callback
		},
		//显示全局确认对话框
		showVsConfirmDialog(title, msg, okCallBack, cancelCallBack, confirmOkTitle, confirmCancelTitle, enableDelay, isDanger) {
			this.confirmOkTitle = confirmOkTitle ? confirmOkTitle : this.$t("common.ok")
			this.confirmCancelTitle = confirmCancelTitle ? confirmCancelTitle : this.$t("common.cancel")
			this.confirmDialogTitle = title ? title : this.$t('common.confirm')
			this.confirmDialogContent = msg
			this.$refs.appConfirmDialog.setShow(true, enableDelay, isDanger)
			this.confirmDialogOkCallback = okCallBack
			this.confirmDialogCancelCallback = cancelCallBack
		},
		onAlertClick() {
			if (this.alertDialogCallback) {
				this.alertDialogCallback()
				this.alertDialogCallback = null
			}
		},
		onConfirmOkClick() { //全局confrim 确认点击
			if (this.confirmDialogOkCallback) {
				this.confirmDialogOkCallback()
				this.confirmDialogOkCallback = null
			}
		},
		onConfirmCancelClick() { //全局confrim 取消点击
			if (this.confirmDialogCancelCallback) {
				this.confirmDialogCancelCallback()
				this.confirmDialogCancelCallback = null
			}
		},
		onSelectLanguage(lan) {
			console.log("onSelectLanguage", lan)
			this.setLanguageApi(lan)
		},
		getLanguageApi() {
			this.api.post('/api/commonApi/getLanguage').then((res) => {
				if (!res.code) {
					if (!res.data) {
						//当前没有设置语言 弹出让用户选择
						this.$refs.languageDialog.setShow(true)
					} else {
						this.$store.state.language = res.data
						this.$i18n.locale = res.data
					}
				}
			})
		},
		setLanguageApi(language) {
			this.api.post('/api/commonApi/setLanguage', {
				language
			}).then((res) => {
				if (!res.code) {
					this.$i18n.locale = language
				}
			})
		},
		reload() {
			this.isRouterAlive = false
			this.$nextTick(function () {
				this.isRouterAlive = true
			})
		},
		shouldShowTour(page, cb) {
			if (!localStorage.getItem(`tour-${page}`)) {
				this.api
					.post("/api/commonApi/shouldShowTour", { hideLoading: true, page: page })
					.then((res) => {
						if (!res.code) {
							localStorage.setItem(`tour-${page}`, 1)
							if (res.show == 1) {
								if (cb) cb()
							}
						}
					})
					.catch((error) => {
						console.log(error);
					});
			}

		},
		dealOnPageScroll(e, onReachBottom, onShowToTopBtn) {
			//滚动回调
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
			if (!scrollHeight && e.srcElement.scrollingElement) {
				scrollHeight = e.srcElement.scrollingElement.scrollHeight;
			}
			if (scrollTop > windowHeight) {
				if (onShowToTopBtn) onShowToTopBtn(true)
			} else {
				if (onShowToTopBtn) onShowToTopBtn(false)
			}
			if (scrollTop + windowHeight >= scrollHeight - 5) {
				if (onReachBottom) onReachBottom()
			}
		},
		goPath(path, query) {
			this.switchUpload(false)
			this.$router.push({
				path: path,
				query: query,
			});
		}
	}
}
</script>
<style lang="scss">
@import 'nas.scss';



.bgtask-wrapper {
	position: fixed;
	z-index: 5;

	@media all and (max-width:640px) {
		width: 95%;
		margin-left: 2.5%;
		bottom: 20px;
	}

	@media not all and (max-width:640px) {
		right: 40px;
		bottom: 40px;
		min-width: 200px;
		max-width: 600px;
	}
}

.upload-wrapper {
	position: fixed;
	z-index: 5;

	@media all and (max-width:640px) {
		width: 95%;
		margin-left: 2.5%;
		bottom: 20px;
	}

	@media not all and (max-width:640px) {
		left: 40px;
		bottom: 40px;
		min-width: 400px;
		max-width: 600px;
	}
}

.icon-main-color {
	color: $nas-main;
}

.icon-red-color {
	color: $nas-red;
}

img {
	-webkit-user-drag: none;
}

#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
}

#nav {
	padding: 30px;

	a {
		font-weight: bold;
		color: #2c3e50;

		&.router-link-exact-active {
			color: #42b983;
		}
	}
}


.modal-style-nopadding {
	.ivu-modal-body {
		padding: 0 !important;
	}
}

html,
body,
#app {
	height: 100%;
}

//ui框架的卡片 本来是四面圆角 改为上面两个圆角
.vs-card__img {
	border-top-left-radius: 20px !important;
	border-top-right-radius: 20px !important;
	border-bottom-left-radius: 0 !important;
	border-bottom-right-radius: 0 !important;

	img {
		border-top-left-radius: 20px !important;
		border-top-right-radius: 20px !important;
		border-bottom-left-radius: 0 !important;
		border-bottom-right-radius: 0 !important;
	}

}

//left-side的标题
.left-side-title {
	font-size: 14px;
}

.my-header-position {
	width: 100%;
	height: 80px;

	// 高度过低的情况下
	@media all and (max-height:640px) {
		height: 60px;
	}
}

.max-line-one {
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 1;
	-webkit-box-orient: vertical
}

.max-line-three {
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical
}

.ivu-slider-wrap {
	background-color: $nas-grey !important;
}

html {
	overflow: -moz-scrollbars-none;
}

// 全局隐藏滚动条
::-webkit-scrollbar {
	display: none;
	width: 0 !important;
	-ms-overflow-style: none;
	/* IE 11 */
	scrollbar-width: none;
	/* Firefox 64 */
}

div {
	scrollbar-width: none;
	/* Firefox 隐藏滚动条 */
}

.flex-row {
	display: flex;
	flex-direction: row;
	align-items: center;
}

body {
	scrollbar-width: none;
}


.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
	will-change: transform;
	transition: all 0.5s;
	width: 100vw;
	position: absolute;
}

.slide-right-enter {
	opacity: 0;
	transform: translate3d(-100%, 0, 0);
}

.slide-right-leave-active {
	opacity: 0;
	transform: translate3d(100%, 0, 0);
}

.slide-left-enter {
	opacity: 0;
	transform: translate3d(100%, 0, 0);
}

.slide-left-leave-active {
	opacity: 0;
	transform: translate3d(-100%, 0, 0);
}
</style>
