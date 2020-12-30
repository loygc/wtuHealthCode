/*************************
【Surge 4.2+ 脚本配置】:
*************************

[Script]
武纺畅行码签到 = type=cron,cronexp=5 0 * * *,wake-system=1,timeout=20,script-path=https://raw.githubusercontent.com/loyio/wtuHealthCode/main/wtuCode.js

获取武纺畅行码Cookie = type=http-request,pattern=https:\/\/js\.wtu\.edu\.cn\/health\/mobile\/health_report,script-path=https://raw.githubusercontent.com/loyio/wtuHealthCode/main/getWtuCookie.js

[MITM]
hostname = jk.wtu.edu.cn

**************************/

const checkInUrl= "https://jk.wtu.edu.cn/health/mobile/health_report/"
const loyio= init()



GetCookie()



function GetCookie() {
  try {
    if ($request.headers && $request.url.match(/jk\.wtu\.edu\.cn.*=health\/mobile\/health_report/)) {
        var ckHeader = $request.headers
        var rqBody = $request.body
        loyio.msg("测试数据ckHeader: ", ckHeader)
        loyio.msg("测试数据rqBody: ", rqBody)
        if (ckHeader["Authorization"] && rqBody){
            var CookieHeaderKey = "wtuCkHeader"
            var CookieBodyKey = "wtuRqBody"
        } else {
          loyio.msg("写入纺大畅行码Cookie失败", "", "请查看脚本内说明, 打开企业微信获取 ‼️")
          loyio.done()
          return
        }
        if (loyio.getdata(CookieHeaderKey) || loyio.getdata(CookieBodyKey)) {
          if (loyio.getdata(CookieHeaderKey) != ckHeader) {
            var cookieH = loyio.setdata(CookieHeaderKey, ckHeader);
            if (!cookie) {
              loyio.msg("更新纺大畅行码Cookie失败 ‼️");
            } else {
              loyio.msg("更新纺大畅行码Cookie成功 🎉");
            }
          } else if(loyio.getdata(CookieBodyKey) != rqBody) {
            var cookieB = loyio.setdata(CookieBodyKey, rqBody);
            if (!cookie) {
              loyio.msg("更新纺大畅行码位置失败 ‼️");
            } else {
              loyio.msg("更新纺大畅行码位置成功 🎉");
            }
          }else{
            console.log("纺大畅行码: \n与历史Cookie相同, 跳过写入")
          }
        } else {
          var cookieH = loyio.setdata(CookieHeaderKey, ckHeader);
          var cookieB = loyio.setdata(CookieBodyKey, rqBody);
          if (!cookieH ||  !cookieB) {
            loyio.msg("首次写入纺大畅行码Cookie失败 ‼️");
          } else {
            loyio.msg("首次写入纺大畅行码Cookie成功 🎉");
          }
        }
      } else {
        loyio.msg("写入纺大畅行码Cookie失败", "", "请检查匹配URL或配置内脚本类型 ‼️");
      }
  } catch (eor) {
    loyio.setdata("wtuCkHeader", "")
    loyio.setdata("wtuRqBody", "")
    $nobyda.notify("写入纺大畅行码Cookie失败", "", '已尝试清空历史Cookie, 请重试 ⚠️')
    console.log(JSON.stringify(eor) + "\n" + eor + "\n" + JSON.stringify($request.headers))
  }
  loyio.done()
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