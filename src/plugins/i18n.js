import Vue from 'vue'
import VueI18n from 'vue-i18n'
import iviewen from '@/plugins/myViewDesign/locale/lang/en-US';
import iviewzh from '@/plugins/myViewDesign/locale/lang/zh-CN';
import zhCn from '@/languages/zh-CN.json'
import enUs from '@/languages/en-US.json'
Vue.use(VueI18n)

const messages = {
  'zh-CN': Object.assign(zhCn, iviewzh),
  'en-US': Object.assign(enUs,iviewen),
};

const i18n = new VueI18n({
      // 使用localStorage存储语言状态是为了保证页面刷新之后还是保持原来选择的语言状态
    locale: localStorage.getItem('lang') ? localStorage.getItem('lang') : 'zh-CN', // 定义默认语言为中文 
    messages
})

export default i18n