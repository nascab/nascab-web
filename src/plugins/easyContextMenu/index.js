import EasyCm from './EasyCm.vue'
const VueEasyCm  = {
  install: function (Vue) {
    Vue.component('easy-cm', EasyCm)
    Vue.prototype.$easycm = function (e,root,tag) {
      e.stopPropagation()
      e.preventDefault()
      root.$emit('easyAxis',{
        tag: tag,
        x: e.clientX,
        y: e.clientY
      })
    }
  }
}

if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(VueEasyCm)
}

export default VueEasyCm
