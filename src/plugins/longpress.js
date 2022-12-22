// import Vue from 'vue'
// //自定义长按指令
// Vue.directive('longpress', {
//     bind: function (el, binding, vNode) {
//         if (typeof binding.value !== 'function') {
//             const compName = vNode.context.name
//             let warn = `[longpress:] provided expression '${binding.expression}' is not a function, but has to be`
//             if (compName) { warn += `Found in component '${compName}' ` }
//             console.warn(warn)
//         }

//         let pressTimer = null
//         let start = (e) => {
//             e.stopPropagation()
//             e.preventDefault()
//             if (pressTimer === null) {
//                 pressTimer = setTimeout(() => {
//                     binding.value(e, true)
//                 }, 1000)
//             }
//         }
//         let cancel = (e) => {
//             if (pressTimer !== null) {
//                 clearTimeout(pressTimer)
//                 pressTimer = null
//             }
//         }
//         el.addEventListener('touchstart', start, true)
//         el.addEventListener('touchend', cancel, true)
//     }
// })