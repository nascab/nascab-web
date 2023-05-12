<template>
    <div class="nas-account-root">
        <h3>{{ $t('nascab.account') }}</h3>
        <Divider></Divider>
        <div class="list-root">
            <!-- 用户名 -->

            <div class="item-root">
                <span class="item-text-left">{{ $t('common.username') }}:</span>
                <span>{{ currentNasUserInfo ? currentNasUserInfo.nickname : $t('nascab.notLogin') }}</span>
                <a @click="toNasLogin()" style="margin-left:10px">
                    {{ currentNasUserInfo ? $t('nascab.switchAccount') : $t('login.goLogin') }}</a>

                <!-- 刷新 -->
                <a v-if="this.currentNasUserInfo" @click="tokenLogin()" style="margin-left:10px;">
                    {{ $t('common.refresh') }}</a>
            </div>
            <div class="item-root" v-if="currentVipInfo">
                <span class="item-text-left">{{ $t('user.subCountNum') }}:</span>
                <span>{{ currentVipInfo.sub_account_num}}</span>

                <!-- 增加更多 -->
                <a v-if="this.currentNasUserInfo" @click="showAddUser" style="margin-left:10px;">
                    {{ $t('common.addMore') }}</a>
            </div>

            <!-- 当前版本 -->
            <div class="item-root">
                <span class="item-text-left">{{ $t('nascab.version') }}:</span>
                <!-- 版本显示 -->
                <span v-if="!currentVipInfo">{{ $t('nascab.versionFree') }}</span>
                <span v-if="currentVipInfo && currentVipInfo.type == 1">{{ $t('nascab.versionPro') }} </span>
                <span v-if="currentVipInfo && currentVipInfo.type == 2">{{ $t('nascab.versionTeam') }} </span>

                <!-- 升级按钮 -->
                <a @click="toBuyVip()" style="margin-left:10px;"
                    v-if="!currentVipInfo || (currentVipInfo && currentVipInfo.type == 1)">
                    {{ $t('nascab.upgrade') }}</a>

            </div>
            <!-- 版本有效期 -->
            <div v-if="currentVipInfo" class="item-root">
                <span class="item-text-left">{{ $t('nascab.validUntil') }}:</span>
                <!-- 有效期显示 -->
                {{utils.formatTimeStamp(currentVipInfo.end_date)}}
                <!-- 续期按钮 -->
                <a @click="toBuyVip()" style="margin-left:10px;">
                    {{ $t('nascab.renewal') }}</a>
            </div>

            <!-- 手机 -->
            <div v-if="currentNasUserInfo && currentNasUserInfo.mobile" class="item-root">
                <span class="item-text-left" style="margin-right: 10px;">{{ $t('nascab.phone') }}:</span>
                <span>{{ currentNasUserInfo.mobile }}</span>
            </div>
            <!-- 邮箱 -->
            <div class="item-root" v-if="currentNasUserInfo && currentNasUserInfo.email">
                <span class="item-text-left" style="margin-right: 10px;">{{ $t('nascab.email') }}:</span>
                <span>{{ currentNasUserInfo.email }}</span>
            </div>

            <!-- 联系客服 -->
            <a @click="showContactUs" style="margin-top:10px">{{ $t('nascab.contactServe') }}</a>
            <!-- 退出nascab账号 -->
            <div v-if="currentNasUserInfo"
                style="width:100%;display:flex;justify-content: center;margin-top:20px;flex-direction:column;align-items:center">
                <my-btn @click="nasCabLogout" style="width:300px" :title="$t('nascab.exitAccount')" type="white">
                </my-btn>
            </div>
        </div>

      
        <Modal v-model="showUserLoginDialog" footer-hide>
            <iframe v-if="showUserLoginDialog" :src="loadUrl" style="width:100%;height:550px;border:none;" scrolling="no"></iframe>
        </Modal>

        <Modal v-model="showBuyVipDialog" footer-hide fullscreen>
            <iframe v-if="showBuyVipDialog" :src="loadUrl" style="width:100%;height:100%;border:none;"></iframe>
        </Modal>
        <iframe v-if="marketingUrl && currentNasUserInfo" :src="marketingUrl"
            style="width:100%;height:600px;border:none;"></iframe>



    </div>
</template>

<script>
import MyBtn from '../../components/my-components/my-btn/my-btn.vue';
import Divider from '../../plugins/myViewDesign/components/divider/divider.vue';
import axios from '../../plugins/axios'
// let baseUrl = "http://localhost:8080/#/"
let baseUrl = axios.nasCabBaseUrl + "/userCenter/#/"

if (process.env.NODE_ENV !== "development") {
    baseUrl = axios.nasCabBaseUrl + "/userCenter/#/"
}
import utils from "@/plugins/utils";

let loginUrl = baseUrl + "?iframeMode=1"
let vipUrl = baseUrl + "pages/vip/vip?iframeMode=1"
let contactUrl = baseUrl + "pages/contactUs/contactUs"
let marketingUrl = baseUrl + "pages/marketing/marketing"
let addMoreUrl = baseUrl + "pages/addUser/addUser"

export default {
    data() {
        return {
            showAddUserDiaolog:false,
            marketingUrl: marketingUrl,
            loadUrl: loginUrl, //iframe加载的url
            showUserLoginDialog: false,
            showBuyVipDialog: false,
            userToken: "",
            currentNasUserInfo: "",
            currentVipInfo: "",
            proxyState: ""
        };
    },
    mounted() {
        window.addEventListener("message", this.dealIframeMessage);
        this.getNasAccountInfo();
    },
    beforeDestroy() {
        window.removeEventListener("message", this.dealIframeMessage);
    },
    methods: {
        reconnect() {
            //尝试重连
        },
        showContactUs() {
            this.loadUrl = contactUrl
            console.log(this.loadUrl)
            // if (this.$store.state.language) {
            //     this.loadUrl += "&language=" + this.$store.state.language
            // }
            this.showUserLoginDialog = true
        },
        showAddUser() {
            this.loadUrl = addMoreUrl + "?token=" + this.userToken
            if (this.$store.state.language) {
                this.loadUrl += "&language=" + this.$store.state.language
            }
            console.log(" this.loadUrl", this.loadUrl)
            this.showUserLoginDialog = true
        },
        toNasUserInfo() {
            let returnUrl = encodeURIComponent(window.location.href)
            this.loadUrl = `${loginUrl}&target=userInfo&token=${this.userToken}&returnUrl=${returnUrl}`
            console.log(this.loadUrl)
            if (this.$store.state.language) {
                this.loadUrl += "&language=" + this.$store.state.language
            }
            this.showUserLoginDialog = true
        },
        toNasLogin() {
            let returnUrl = encodeURIComponent(window.location.href)
            this.loadUrl = `${loginUrl}&returnUrl=${returnUrl}`
            if (this.$store.state.language) {
                this.loadUrl += "&language=" + this.$store.state.language
            }
            this.showUserLoginDialog = true
        },
        toBuyVip() {
            if(localStorage.ios==1){
                return this.showVsNotification(this.$t('common.buyVipInPc'))
            }
            if (!this.currentNasUserInfo) {
                return this.showVsNotification(this.$t('nascab.loginFirst'))
            }
            this.loadUrl = vipUrl + "&token=" + this.userToken
            if (this.$store.state.language) {
                this.loadUrl += "&language=" + this.$store.state.language
            }
            console.log(this.loadUrl)
            this.showBuyVipDialog = true
        },
        dealIframeMessage(e) {
            console.log('接收到登录返回值:', e)
            if (e.data && e.data.type == "loginSuccess") {
                this.showUserLoginDialog = false;
                let tokenObj = JSON.parse(e.data.data);
                this.userToken = tokenObj.token
                //使用token去登录
                this.tokenLogin();
            } else if (e.data && e.data.type == "payDone") {
                //支付完成的通知
                //重新获取用户的vip信息等 
                this.showBuyVipDialog = false
                this.tokenLogin()
            }
        },
        nasCabLogout() {
            this.showVsConfirmDialog(this.$t('common.confirm'), this.$t('header.okLogout'), () => {
                this.api
                    .post("/api/nasAccountApi/nasCabLogout", {})
                    .then((res) => {
                        if (!res.code) {
                            console.log("token登出成功了");
                            this.showVsNotification(this.$t('header.logoutSuccess'))
                            this.getNasAccountInfo();
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            })
        },
        tokenLogin() {
            this.api
                .post("/api/nasAccountApi/nasCabLoginByToken", {
                    token: this.userToken
                })
                .then((res) => {
                    if (!res.code) {
                        console.log("token登录成功了");
                        this.showVsNotification(this.$t('login.success'))
                    }
                    this.getNasAccountInfo();
                })
                .catch((error) => {
                    this.getNasAccountInfo();

                    console.log(error);
                });
        },
        //获取缓存的用户登录信息
        getNasAccountInfo() {
            this.api
                .post("/api/nasAccountApi/getNasAccountInfo", { hideLoading: true })
                .then((res) => {
                    if (!res.code) {
                        this.currentNasUserInfo = res.data.userInfo;
                        this.currentVipInfo = res.data.vipInfo
                        if (this.currentNasUserInfo && this.currentNasUserInfo.token && this.currentNasUserInfo.token.length > 0) {
                            this.userToken = this.currentNasUserInfo.token[this.currentNasUserInfo.token.length - 1]
                        }
                        this.proxyState = res.proxyState
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    },
    components: { MyBtn, Divider }
}
</script>

<style lang="scss" scoped>
.nas-account-root {
    padding: 15px;
    height: 100%;
    @media not all and (max-width:640px) {
        padding: 30px;
    }
	border-top-left-radius: 20px;
	border-top-right-radius: 20px;
    background-color: white;
    width: 100%;
}

.list-root {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    position: relative;
}

.item-root {
    display: flex;
    align-items: center;
    margin-bottom: 30px;
}

.item-text-left {
    margin-right: 10px;
}
</style>
