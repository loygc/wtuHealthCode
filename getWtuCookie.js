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


GetCookie()



function GetCookie() {
  try {
    if ($request.headers && $request.url.match(/jk\.wtu\.edu\.cn.*=health\/mobile\/health_report/)) {
      var CV = $request.headers['Cookie']
      if (CV.match(/(pt_key=.+?pt_pin=|pt_pin=.+?pt_key=)/)) {
        var CookieValue = CV.match(/pt_key=.+?;/) + CV.match(/pt_pin=.+?;/)
        var CK1 = $nobyda.read("CookieJD")
        var CK2 = $nobyda.read("CookieJD2")
        var AccountOne = CK1 ? CK1.match(/pt_pin=.+?;/) ? CK1.match(/pt_pin=(.+?);/)[1] : null : null
        var AccountTwo = CK2 ? CK2.match(/pt_pin=.+?;/) ? CK2.match(/pt_pin=(.+?);/)[1] : null : null
        var UserName = CookieValue.match(/pt_pin=(.+?);/)[1]
        var DecodeName = decodeURIComponent(UserName)
        if (!AccountOne || UserName == AccountOne) {
          var CookieName = "wtuCodeCookie";
          var CookieKey = "CookieJD";
        } else if (!AccountTwo || UserName == AccountTwo) {
          var CookieName = " [账号二] ";
          var CookieKey = "CookieJD2";
        } else {
          loyio.msg("更新纺大畅行码Cookie失败", "非历史写入账号 ‼️", '请开启脚本内"DeleteCookie"以清空Cookie ‼️')
          loyio.done()
          return
        }
      } else {
        loyio.msg("写入纺大畅行码Cookie失败", "", "请查看脚本内说明, 打开企业微信获取 ‼️")
        loyio.done()
        return
      }
      if ($nobyda.read(CookieKey)) {
        if ($nobyda.read(CookieKey) != CookieValue) {
          var cookie = $nobyda.write(CookieValue, CookieKey);
          if (!cookie) {
            $nobyda.notify("用户名: " + DecodeName, "", "更新京东" + CookieName + "Cookie失败 ‼️");
          } else {
            $nobyda.notify("用户名: " + DecodeName, "", "更新京东" + CookieName + "Cookie成功 🎉");
          }
        } else {
          console.log("京东: \n与历史Cookie相同, 跳过写入")
        }
      } else {
        var cookie = $nobyda.write(CookieValue, CookieKey);
        if (!cookie) {
          $nobyda.notify("用户名: " + DecodeName, "", "首次写入京东" + CookieName + "Cookie失败 ‼️");
        } else {
          $nobyda.notify("用户名: " + DecodeName, "", "首次写入京东" + CookieName + "Cookie成功 🎉");
        }
      }
    } else {
      $nobyda.notify("写入京东Cookie失败", "", "请检查匹配URL或配置内脚本类型 ‼️");
    }
  } catch (eor) {
    loyio.setdata("", "CookieWtu")
    loyio.setdata("", "wtuHCdata")
    $nobyda.notify("写入京东Cookie失败", "", '已尝试清空历史Cookie, 请重试 ⚠️')
    console.log(JSON.stringify(eor) + "\n" + eor + "\n" + JSON.stringify($request.headers))
  }
  $nobyda.done()
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