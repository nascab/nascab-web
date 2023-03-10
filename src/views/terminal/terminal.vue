<template>
    <div style="text-align: left;height: 100%;width: 100%;" id="xterm" />
</template>
<script>
import 'xterm/css/xterm.css'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { AttachAddon } from 'xterm-addon-attach'
import axios from "@/plugins/axios";

export default {
    name: 'Xterm',
    props: {
    },
    mounted() {
        window.addEventListener("resize", this.onResize);
        // // 先通过post请求让服务器开一个终端 然后服务器返回pid 再用pid发送ws链接
        // this.api.post('/api/terminal/newConnect').then((res) => {
        //     if (!res.code) {
        //         this.pid=res.data
               
        //     }
        // })
        this.initSocket()

    },
    beforeDestroy() {
        if (this.socket) this.socket.close()
        if (this.term) this.term.dispose()
        window.removeEventListener("resize", this.onResize);

    },
    data() {
        return {
            pid:null,
            term: null,
            socketURI: "",
            fitAddon: null
        }
    },
    methods: {
        onResize() {
            console.log("onResize")
            if (!this.term) return
            this.fitAddon.fit();
            let beforeRow =Object.assign( this.term.rows) 
            let beforeCols = Object.assign( this.term.cols) 
            setTimeout(() => {
                if (this.term.rows == beforeRow && this.term.cols == beforeCols) {
                    console.log("已停止变动窗口尺寸")
                    this.socket.send(`nastermresize-${this.term.rows}-${this.term.cols}`)
                }
            }, 500);
        },
        initTerm() {
            const term = new Terminal({
                scrollback: 1000, //终端中的回滚量
                disableStdin: false, //是否应禁用输入
                cursorBlink: true, //光标闪烁
            });
            this.term = term

            const attachAddon = new AttachAddon(this.socket);
            this.fitAddon = new FitAddon();
            term.loadAddon(attachAddon);
            term.loadAddon(this.fitAddon);
            term.open(document.getElementById('xterm'));
            this.onResize()
            term.focus();
        },
        initSocket(pid) {
            this.socketURI = `${axios.webSocketUrl}/ws/terminal/connect?token=${this.$store.state.token}`
            this.socket = new WebSocket(this.socketURI);
            this.socketOnClose();
            this.socketOnOpen();
            this.socketOnError();
        },
        socketOnOpen() {
            this.socket.onopen = () => {
                // 链接成功后
                this.initTerm()
                this.showVsNotification(this.$t('terminal.connected'))
            }
        },
        socketOnClose() {
            this.socket.onclose = () => {
                console.log('close socket')
                this.showVsNotification(this.$t('terminal.disconnect'))
            }
        },
        socketOnError() {
            this.socket.onerror = (e) => {
                console.log('socket 链接失败', e)
                this.showVsNotification(this.$t('terminal.failConnect'))
            }
        }
    }
}
</script>
<style lang="scss" scoped>
#xterm {}
</style>