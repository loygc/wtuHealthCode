/*************************
【Surge 4.2+ 脚本配置】:
*************************

[Script]
武纺畅行码签到 = type=cron,cronexp=5 0 * * *,wake-system=1,timeout=20,script-path=wtuCode.js

获取Cookie = type=http-request,pattern=https:\/\/js\.wtu\.edu\.cn\/health\/mobile\/health_report,script-path=wtuCode.js

[MITM]
hostname = api.m.jd.com */

const checkInUrl= "https://jk.wtu.edu.cn/health/mobile/health_report/"
const loyio= init()


sign()

function sign() {
  var urlbody = ""
  var ckheader='{"Host":"jk.wtu.edu.cn","Content-Type":"application/x-www-form-urlencoded","Accept-Language":"en-us","Accept-Encoding":"gzip, deflate, br","Connection":"keep-alive","Accept":"*/*","User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 wxwork/3.0.36 MicroMessenger/7.0.11(0x17000b21) NetType/4G Language/en","Authorization":"","Referer":"https://servicewechat.com/wx186658badc0a17c7/11/page-frame.html","Content-Length":"668"}'
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