import i18n from '@/plugins/i18n' // 导入vue-i18n

let day29 = []
let day30 = []
let day31 = []
for (let i = 1; i < 32;i++) {
	day31.push({
		value: i < 10 ? ('0' + i) : i,
		label: i < 10 ? ('0' + i) : i
	})
	if (i < 31) {
		day30.push({
			value: i < 10 ? ('0' + i) : i,
			label: i < 10 ? ('0' + i) : i
		})
	}
	if(i<30){
		day29.push({
			value: i < 10 ? ('0' + i) : i,
			label: i < 10 ? ('0' + i) : i
		})
	}
}
let aiDataValue = [{
	value: '%',
	label: i18n.t('album.everyYear'),
	children: [{
		value: '%',
		label: i18n.t('album.everyMonth'),
		children:day31
	}, {
		value: '01',
		label: i18n.t('album.January'),
		children:day31
	}, {
		value: '02',
		label: i18n.t('album.February'),
		children:day29
	}, {
		value: '03',
		label: i18n.t('album.March'),
		children:day31
	}, {
		value: '04',
		label: i18n.t('album.April'),
		children:day30
	}, {
		value: '05',
		label: i18n.t('album.May'),
		children:day31
	}, {
		value: '06',
		label: i18n.t('album.June'),
		children:day30
	}, {
		value: '07',
		label: i18n.t('album.July'),
		children:day31
	}, {
		value: '08',
		label: i18n.t('album.August'),
		children:day31
	}, {
		value: '09',
		label: i18n.t('album.September'),
		children:day30
	}, {
		value: '10',
		label: i18n.t('album.October'),
		children:day31
	}, {
		value: '11',
		label: i18n.t('album.November'),
		children:day30
	}, {
		value: '12',
		label: i18n.t('album.December'),
		children:day31
	}, ]
}]
export default {
	aiDataValue: aiDataValue
}
