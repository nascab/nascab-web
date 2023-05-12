

export default {
    // js调APP方法 （参数分别为:app提供的方法名  传给app的数据  回调）
    onLoginSuc(usernameAndPwd) {
        try {
            // 通知app登录成功 app可以保存token
            if (android) {
                android.onLoginSuc(usernameAndPwd)
            }
        } catch (err) {
        }
        try{
            //ios 处理
            if(webkit&&webkit.messageHandlers){
                webkit.messageHandlers.bridge.postMessage(`{"func": "onLoginSuc","usernameAndPwd":"${usernameAndPwd}"}`)
            }
        }catch(err){}
        return
    },

    //通知app跳转到服务器选择页面
    onChooseOtherServer() {
        try {
            if (android) {
                android.onChooseOtherServer()
            }
        } catch (err) {}
        try{
            //ios 处理
            if(webkit&&webkit.messageHandlers){
                webkit.messageHandlers.bridge.postMessage(`{"func": "onChooseOtherServer"}`)
            }
        }catch(err){}
        return
    },

    //通知app进入到同步设置
    onClickMobileSync(token) {
        try {
            if (android) {
                android.onClickMobileSync(token)
            }
        } catch (err) {}
        try{
            //ios 处理
            if(webkit&&webkit.messageHandlers){
                webkit.messageHandlers.bridge.postMessage(`{"func": "onClickMobileSync","token":"${token}"}`)
            }
        }catch(err){}

        return
    },

    //通知app进入到上传
    onClickUpload(uploadTargetPath,token) {
        try {
            if (android) {
                if (uploadTargetPath) {
                    android.onClickUploadToPath(uploadTargetPath)
                } else {
                    android.onClickUpload()
                }
            }
        } catch (err) {}
        try{
            //ios 处理
            if(webkit&&webkit.messageHandlers){
                webkit.messageHandlers.bridge.postMessage(`{"func": "onClickUpload","uploadTargetPath":"${uploadTargetPath?uploadTargetPath:""}","token":"${token}"}`)
            }
        }catch(err){}
        return
    },
    //通知app进入到私密空间上传
    onClickSpaceUpload(spaceId, spaceToken) {
        try {
            if (android) {
                android.onClickSpaceUpload(spaceId, spaceToken)
            }
        } catch (err) {}
        try{
            //ios 处理
            if(webkit&&webkit.messageHandlers){
                webkit.messageHandlers.bridge.postMessage(`{"func": "onClickSpaceUpload","spaceId":"${spaceId}","spaceToken":"${spaceToken}"}`)
            }
        }catch(err){}
        return
    },
    //打开新webview并加载指定路径
    onOpenNewWebViewByPath(path, title) {
        try {
            if (android) {
                android.onOpenNewWebViewByPath(path, title)
            }
        } catch (err) {}

        try{
            //ios 处理
            if(webkit&&webkit.messageHandlers){
                webkit.messageHandlers.bridge.postMessage(`{"func": "onOpenNewWebViewByPath","path":"${path}","title":"${title}"}`)
            }
        }catch(err){}
        //IOS TODO
        return
    },
    //设置屏幕方向 LANDSCAPE横 PORTRAIT竖向 AUTO自动
    setScreenDirection(direction) {
        try {
            if (android) {
                android.setScreenDirection(direction)
            }
        } catch (err) { }
        try{
            //ios 处理
            if(webkit&&webkit.messageHandlers){
                webkit.messageHandlers.bridge.postMessage(`{"func": "setScreenDirection","direction":"${direction}"}`)
            }
        }catch(err){}
        return
    },
    setIsShowNavBar(isShow) {
        try {
            if (android) {
                android.setIsShowNavBar(isShow)
            }
        } catch (err) {  }
    },
    // 在浏览器中打开
    openInBrowser(url){
        try {
            if (android) {
                android.openInBrowser(url)
            }
        } catch (err) { }
        try{
            //ios 处理
            if(webkit&&webkit.messageHandlers){
                webkit.messageHandlers.bridge.postMessage(`{"func": "openInBrowser","url":"${url}"}`)
            }
        }catch(err){}
    },
    onClickLogout() {
        try {
            if (android) {
                android.onClickLogout()
            }
        } catch (err) {  }
        try{
            //ios 处理
            if(webkit&&webkit.messageHandlers){
                webkit.messageHandlers.bridge.postMessage(`{"func": "onClickLogout"}`)
            }
        }catch(err){}
    },
    //调用原生播放器
    playVideo(playData) {
        console.log("playVideo",playData)
        try {
            if (android) {
                android.playVideo(playData)
            }
        } catch (err) {}
        try{
            //ios 处理
            if(webkit&&webkit.messageHandlers){
                webkit.messageHandlers.bridge.postMessage(`{"func": "playVideo","playData":"${playData}"}`)
            }
        }catch(err){}
    }
};
