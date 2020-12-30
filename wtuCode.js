/*************************
【Surge 4.2+ 脚本配置】:

成功获取畅行码Cookie后，请禁用“获取纺大畅行码Cookie”脚本
*************************

[Script]
纺大畅行码签到 = type=cron,cronexp=5 0 * * *,wake-system=1,timeout=20,script-path=https://raw.githubusercontent.com/loyio/wtuHealthCode/main/wtuCode.js

获取纺大畅行码Cookie = type=http-request,pattern=https:\/\/jk\.wtu\.edu\.cn\/health\/mobile\/health_report,script-path=https://raw.githubusercontent.com/loyio/wtuHealthCode/main/getWtuCookie.js

[MITM]
hostname = api.m.jd.com 

*/

const checkInUrl= "https://jk.wtu.edu.cn/health/mobile/health_report/"
const loyio= init()


sign()

function sign() {
  var urlbody = loyio.getdata("wtuRqBody")
  var ckheader= loyio.getdata("wtuCkHeader")
    if(urlbody || ckheader){
      const url = { url: checkInUrl, headers: JSON.parse(ckheader) ,body: urlbody}
      loyio.post(url, (error, response, data) => {
      const title = `纺大畅行码打卡`
      let subTitle = ''
      let detail = ''
      const result = JSON.parse(data)
      if (result.errorCode == "0x00000000") {
        subTitle = `打卡结果: 成功`
        detail = `纺大畅行码打卡成功`
      } else {
        subTitle = `打卡结果: 失败`
        detail = `编码: ${result.errorCode}, 说明: ${result.message}`
      }
      loyio.msg(title, subTitle, detail)
      loyio.done()
    })
  }else{
    loyio.msg("暂未获取纺大畅行码Cookie及填报数据!!!")
    loyio.done()
  }
  
}




function init() {
  isSurge = () => {
    return undefined === this.$httpClient ? false : true
  }
  isQuanX = () => {
    return undefined === this.$task ? false : true
  }
  getdata = (key) => {
    if (isSurge()) return $persistentStore.read(key)
    if (isQuanX()) return $prefs.valueForKey(key)
  }
  setdata = (key, val) => {
    if (isSurge()) return $persistentStore.write(key, val)
    if (isQuanX()) return $prefs.setValueForKey(key, val)
  }
  msg = (title, subtitle, body) => {
    if (isSurge()) $notification.post(title, subtitle, body)
    if (isQuanX()) $notify(title, subtitle, body)
  }
  log = (message) => console.log(message)
  get = (url, cb) => {
    if (isSurge()) {
      $httpClient.get(url, cb)
    }
    if (isQuanX()) {
      url.method = 'GET'
      $task.fetch(url).then((resp) => cb(null, {}, resp.body))
    }
  }
  post = (url, cb) => {
    if (isSurge()) {
      $httpClient.post(url, cb)
    }
    if (isQuanX()) {
      url.method = 'POST'
      $task.fetch(url).then((resp) => cb(null, {}, resp.body))
    }
  }
  done = (value = {}) => {
    $done(value)
  }
  return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }
}