import { exec } from 'child_process'
import { Restart } from "../../other/restart.js"
import fs from 'fs'

export class example extends plugin {
  constructor () {
    super({
      name: '安装插件',
      dsc: '安装插件',
      event: 'message',
      priority: -10,
      rule: [
        {
          reg: "^#?跑路(代理)?安装插件.+$",
          fnc: 'install'
        },
        {
          reg: "^#?跑路安装插件$",
          fnc: 'add'
        }
      ]
    })
  }

  async add (e) {
    this.reply('少女为你痛哭\n正确的格式应该是#跑路安装插件+仓库链接')
    return true
  }

  async install (e) {
    if (!e.isMaster) {
      return this.reply('暂无权限，只有主人才能操作')
    }

    let url = e.msg.replace(/^#跑路(代理)?安装插件/, "").trim()
    let isProxy = e.msg.includes("代理")
    let urlformat = /^(https?:\/\/)?(gitee\.com|github\.com)\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/

    if (url.match(urlformat)) {
    if (isProxy) {
      if (url.includes("github.com")) {
        url = `https://mirror.ghproxy.com/${url}`
      } else {
        this.reply('少女为你痛哭\n代理安装仅支持GitHub库，如果您有需求，请找开发者适配吧')
        return true
      }
    }
      let parts = url.split('/')
      let Name = parts[parts.length - 1]

      if (await Bot.fsStat(`plugins/${Name}`)) {
        await this.reply(`少女为你痛哭\n你好像已经安装了${Name}`)
        return false
      }

      await this.reply(`少女祈祷中\n正在为你安装插件${Name}`)

      const clone = `git clone --depth=1 ${url} ./plugins/${Name}`
      const gg = await Bot.exec(clone)

      if (await Bot.fsStat(`plugins/${Name}/package.json`)) {
        await Bot.exec("pnpm install")
      }

      if (gg.error) {
        this.reply(`安装错误:${gg.error.message}`)
        return false
      }

      await this.reply('安装成功，开始执行重启')
      this.restart()
    } else {
      this.reply('少女为你痛哭\n你好像输入了错误的仓库地址')
    }

    return true
  }

  restart() {
    new Restart(this.e).restart()
  }
}