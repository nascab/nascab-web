let getToken = () => {
    return localStorage.getItem('token')
}

let formatTimeStamp = (value) => {
    if (value) {
        let date = new Date(value)	// 时间戳为秒：10位数
        //let date = new Date(value)	// 时间戳为毫秒：13位数
        let year = date.getFullYear()
        let month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
        let day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
        let hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
        let minute = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
        let second = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds()
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`
    } else {
        return ''
    }
}
let formatSeconds = (value) => {
    //秒转为时分秒
    var secondTime = parseInt(value); // 秒
    var minuteTime = 0; // 分
    var hourTime = 0; // 小时
    if (secondTime >= 60) {
        minuteTime = parseInt(secondTime / 60);
        secondTime = parseInt(secondTime % 60);
        if (minuteTime >= 60) {
            hourTime = parseInt(minuteTime / 60);
            minuteTime = parseInt(minuteTime % 60);
        }
    }
    var result = "" + (parseInt(secondTime) < 10 ? "0" + parseInt(secondTime) : parseInt(secondTime));
    result = "" + (parseInt(minuteTime) < 10 ? "0" + parseInt(minuteTime) : parseInt(minuteTime)) + ":" +
        result;
    if (parseInt(hourTime) > 0) {
        result = "" + (parseInt(hourTime) < 10 ? "0" + parseInt(hourTime) : parseInt(hourTime)) + ":" + result;
    }
    if (result.length == 5) {
        result = '00:' + result
    }
    return result;
}
let getSizeStr = function (size) {
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
    return sizeStr
}

function filterMovieName(fname) {
    fname = fname.replace('1080p', '').replace('1080P', '').replace('720p', '').replace('720P', '').replace('X265', '').replace('X264', '')
    return nafnameme
}

// 传id按照id搜索  传名字按名字
let checkDouban = function (filename, doubanId) {
    if (doubanId) {
        let doubanUrl = "https://movie.douban.com/subject/"
        window.open(doubanUrl + doubanId, '_blank')
    } else {
        filename = filename.substr(0, filename.lastIndexOf("."))
        let zhName = filename.replace(/[^\u4E00-\u9FA5]/g, '')
        if (zhName.length > 0) {
            filename = zhName
        } else {
            filename = this.filterMovieName(filename)
        }
        let doubanUrl = "https://search.douban.com/movie/subject_search?search_text="
        window.open(doubanUrl + filename, '_blank')
    }

}
// 传id按照id搜索 传名字按名字
let checkImdb = function (filename, imdbId) {
    if (imdbId) {
        let imdbUrl = "https://www.imdb.com/title/"
        window.open(imdbUrl + imdbId, '_blank')
    } else {
        filename = filename.substr(0, filename.lastIndexOf("."))
        let zhName = filename.replace(/[^\u4E00-\u9FA5]/g, '')
        if (zhName.length > 0) {
            filename = zhName
        } else {
            filename = this.filterMovieName(filename)
        }
        let imdbUrl = "https://www.imdb.com/find?q="
        window.open(imdbUrl + filename, '_blank')
    }

}
//根据wrapper的宽度计算条目宽度
let calItemWidth = function (wrapper, itemBaseWidth, itemMargin) {
    if (wrapper) {
        let baseCount = parseFloat(wrapper.width / itemBaseWidth).toFixed()
        if (baseCount < 1) {
            baseCount = 1
        }
        let itemWidth = (parseInt(wrapper.width * 10) / 10 - itemMargin * baseCount * 2) / baseCount;
        // 保留一位小数 后面舍弃
        itemWidth = parseInt(itemWidth * 10) / 10
        return itemWidth
    }

}

export default {
    calItemWidth,
    getToken,
    formatSeconds,
    getSizeStr,
    checkDouban,
    checkImdb,
    formatTimeStamp
}