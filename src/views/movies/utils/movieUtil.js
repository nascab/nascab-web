
let movieUtil = {}
import axios from "@/plugins/axios";

//删除文件的api
movieUtil.deleteApi = function (vue, selectedMovieIndex) {
    vue.api.post('/api/fileApi/deleteFromDisk', {
        ids: [selectedMovieIndex.id],
        serverType: "movie"
    }).then((res) => {
        console.log("deleteFromDisk deleteFromDisk", res)
        if (!res.code) {
            if (res.errCount > 0) {
                vue.showVsNotification(vue.$t('file.deleteFail'));
            } else {
                vue.showVsNotification(vue.$t('file.deleteSuc'));
            }
        }
        vue.api.post('/api/movieApi/deleteIndex', {
            indexId: selectedMovieIndex.id,
        }).then((res) => {
            if (!res.code) {
                vue.showVsNotification(vue.$t('movie.indexDeleted'));
                vue.removeSelectedFileFromList()
            }
        }).catch((error) => { })
    }).catch((error) => { })
}
// 初始化右键菜单
movieUtil.initRightMenu = function (vue, file, selectedMovieIndex, collectionId, isAiCollection) {
    let rightMenuList = [{
        text: vue.$t('file.check'),
        type: "CHECK",
    }]
    if (file.is_tvplay == 0) {
        rightMenuList.push({
            text: vue.$t('common.delete'),
            type: "DELETE"
        })
    }
    console.log('file.is_tvplay', file.is_tvplay)
    if (file.is_tvplay == 1) {
        rightMenuList.push({
            text: vue.$t('movie.setAsMovie'),
            type: "setAsMovie"
        })

    } else {
        rightMenuList.push({
            text: vue.$t('movie.setAsTv'),
            type: "setAsTv"
        })
    }
    if (collectionId == 0) {
        // 菜单： 添加到影库
        rightMenuList.push({
            text: vue.$t('movie.addToCollection'),
            type: "addToCollection"
        })
    } else {
        if (!isAiCollection) {
            //菜单 从影库移出
            rightMenuList.push({
                text: vue.$t('movie.removeFromCollection'),
                type: "removeFromCollection"
            })
        }
    }
    // 菜单 收藏
    rightMenuList.push({
        text: selectedMovieIndex.favorite == 1 ? vue.$t("common.cancelFavorite") : vue.$t('file.collect'),
        type: "FAVORITE"
    })
    return rightMenuList
}

//收藏电影
movieUtil.favoriteMovie = function (vue, selectedMovieIndex, onSuc) {
    vue.api.post('/api/movieApi/movieFavorite', {
        movieIndexId: selectedMovieIndex.id,
        hideLoading: true
    }).then((res) => {
        if (!res.code) {
            selectedMovieIndex.favorite = res.favorite
            if (onSuc) onSuc(res.favorite)
        }
    }).catch((error) => { })
}

movieUtil.onSelectCollection = function (vue, selectedMovieIndex, collectionId, onSuc) {
    // 移动到影集
    vue.api.post('/api/movieApi/addIndexToCollection', {
        collectionId: collectionId,
        indexId: selectedMovieIndex.id
    }).then((res) => {
        if (!res.code) {
            if (onSuc) onSuc()
        }
    }).catch((error) => { })
}
//处理服务器返回的数据列表
movieUtil.dealMovieList = function (showMovieInfoName, dataList) {
    for (let i = 0; i < dataList.length; i++) {
        let url = axios.getImgFullPath(dataList[i].id, true, dataList[i].filename, 'movie');
        let rawUrl = axios.getImgFullPath(dataList[i].id, false, dataList[i].filename, 'movie');
        dataList[i].url = url
        if (dataList[i].movie_cover_path && dataList[i].movie_info_state == 1) {
            //如果有封面 则使用封面
            dataList[i].url = axios.getRawFileUrl(dataList[i].movie_cover_path, '', 'movie')
        } else if (dataList[i].folder_cover_path) {
            //没有封面 看看有没有同文件夹下匹配的海报
            dataList[i].url = axios.getRawFileUrl(dataList[i].folder_cover_path, '', 'movie')
        }
        dataList[i].rawUrl = rawUrl;

        let size = dataList[i].size
        if(size){
            let sizeKb = parseInt(size / 1024 * 100) / 100 //kb
            let sizeStr = sizeKb + 'KB'
            if (sizeKb > 1024) {
                let sizeMb = parseInt(sizeKb / 1024 * 100) / 100
                sizeStr = sizeMb + 'MB'
                if (sizeMb > 1024) {
                    let sizeGb = parseInt(sizeMb / 1024 * 100) / 100
                    sizeStr = sizeGb + 'GB'
                }
            }
            dataList[i].sizeStr = sizeStr
        }
        

        if (!dataList[i].show_name) {
            if (showMovieInfoName && dataList[i].movie_info_state == 1 && dataList[i].movie_info_name) {
                dataList[i].show_name = dataList[i].movie_info_name
            }
            if (!dataList[i].show_name) {
                dataList[i].show_name = dataList[i].filename
            }
        }
    }
}
//设置为电影、电视剧
movieUtil.setAsTvMovie = function (vue, isTvplay, indexId, onSuc) {
    vue.api.post('/api/movieApi/setTvplay', {
        isTvPlay: isTvplay,
        indexId: indexId
    }).then((res) => {
        if (!res.code) {
            vue.showVsNotification(vue.$t('common.operationSuccess'))
            if (onSuc) onSuc()
        }
    }).catch((error) => { })
}
export default movieUtil