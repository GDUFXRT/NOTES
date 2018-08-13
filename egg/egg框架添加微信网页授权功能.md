# egg框架添加微信网页授权功能

微信网页的授权校验需要存在于进入页面前及页面的每一次请求，使用egg中间件来进行微信的授权及校验正合适。

### 浏览器访问单页面功能

router.ts

```
import { Application } from 'egg';

export default (app: Application) => {
  const { router } = app;
  router.get('/*', 'home.index');
};
```

home.ts

```
import { Controller } from 'egg';
import * as path from 'path';
import * as fs from 'fs';

export default class HomeController extends Controller {
  public async index () {
    // 返回静态页面
    const file = path.resolve(__dirname, '..', 'public/index.html');
    this.ctx.set('Content-Type', 'text/html');
    this.ctx.body = await fs.readFileSync(file);
  }
}
```

## 微信网页授权的流程

![image](https://note.youdao.com/yws/public/resource/0c3fc3fee86fa713ed6154e6c1a75f07/xmlnote/WEBRESOURCEe252d8a878e90da58801c8a157bd9cf8/284)

## middleware层的编写

wechatAuth.ts

```
import { Context } from 'egg';
import {
    usertoken,
    wechatToken,
    WechatError,
} from '../tsInterface/wechat';

const USER_TOKEN_KEY = 'user_token';

function isWechatError (obj: wechatToken | WechatError): obj is WechatError {
    return (<WechatError> obj).errcode !== undefined;
}

export default () => {
    return async (ctx: Context, next: any) => {
        const userTokenCookie = ctx.cookies.get(USER_TOKEN_KEY);
        const wechatService = ctx.service.wechatInfo;
        const { helper } = ctx;
        let userToken: usertoken | undefined;

        try {
            userToken = helper.decodeAccessToken(userTokenCookie);
        } catch (err) {
            console.log('无用户信息');
        }

        if (userToken) {
            // 检查access_token是否过期
            if (userToken.expires_time > new Date().getTime()) {
                await next();
            } else {    // 更新access_token
                const newAccessTokenObj = await wechatService.updateAccessToken(userToken);
                if (isWechatError(newAccessTokenObj)) {
                    // 更新出错（如：refresh_token过期）
                    // 清空浏览器cookie信息并重定向
                    ctx.cookies.set(USER_TOKEN_KEY, '');
                    wechatService.redirect();
                } else {
                    wechatService.setAccessTokenToCookie(newAccessTokenObj);
                    await next();
                }
            }
        } else {
            if (ctx.query.code) {
                const accessTokenObj = await wechatService.getAccessTokenObj(ctx.query.code);
                if (isWechatError(accessTokenObj)) {
                    // code无效
                    await wechatService.redirect();
                } else {
                    wechatService.setAccessTokenToCookie(accessTokenObj);
                    await next();
                }
            } else {
                wechatService.redirect();
            }
        }
    };
};
```
> 编写完middleware需要在config.default.js手动挂载。

## helper

helper.ts

```
import * as _ from 'lodash';
import * as jwt from 'jsonwebtoken';
import { usertoken, accessToken } from '../tsInterface/wechat';

const JWT_SECRET = 'xxx'; // jwt加密key

module.exports = {
  /**
   * 将从微信获取到的access_token对象使用jwt转化为字符串
   * @param accessTokenObj 需要转化的access_token对象
   */
  encodeAccessToken(accessTokenObj: accessToken): string {
    const expiresIn = accessTokenObj.expires_in - 120; // 到期时间提前120秒
    const expiresTime = new Date().getTime() + expiresIn * 1000;
    const accessTokenExpires = expiresIn;
    _.assign(accessTokenObj, {
      expires_time: expiresTime,
    });
    // 去除无用属性
    _.unset(accessTokenObj, 'expires_in');
    _.unset(accessTokenObj, 'scope');
    return jwt.sign(accessTokenObj, JWT_SECRET, { expiresIn: accessTokenExpires * 1000 });
  },

  decodeAccessToken(encodedVal: string): usertoken {
    return jwt.verify(encodedVal, JWT_SECRET) as usertoken;
  },
};
```

## service 层

wechatInfo.ts

```
import { Service } from 'egg';
import * as _ from 'lodash';

import {
    AuthorizeParamsTypes,
    AccessTokenParamsTypes,
    RefreshTokenParamsTypes,
    usertoken,
    wechatToken,
    WechatError,
} from '../tsInterface/wechat';

const APPID = 'xxx'; // 公众号aapid
const SECRET = 'xxx'; // 公众号app_secret
const WECHAT_AUTHORIZE = 'https://open.weixin.qq.com/connect/oauth2/authorize';
const WECHAT_ACCESS_TOKEN = 'https://api.weixin.qq.com/sns/oauth2/access_token';
const WECHAT_REFRESH_TOKEN = 'https://api.weixin.qq.com/sns/oauth2/refresh_token';

const USER_TOKEN_KEY = 'user_token';

const AUTHORIZE_PARAMS = {
    appid: APPID,
    response_type: 'code',
    scope: 'snsapi_userinfo',
};

const ACCESS_TOKEN_PARAMS = {
    appid: APPID,
    secret: SECRET,
    grant_type: 'authorization_code',
};

const REFRESH_TOKEN_PARAMS = {
    appid: APPID,
    grant_type: 'refresh_token',
};

/**
 * 获取与微信用户相关信息
 */
export default class WechatInfo extends Service {
    async getAccessTokenObj(code: string): Promise<wechatToken | WechatError> {
        const { ctx } = this;
        const wechatParams: AccessTokenParamsTypes = _.assign(ACCESS_TOKEN_PARAMS, { code });
        const url = ctx.helper.uriGenerate(WECHAT_ACCESS_TOKEN, wechatParams);
        try {
            const result = await ctx.curl(url, {
                dataType: 'json',
            });
            return result.data;
        } catch (err) {
            throw err;
        }
    }

    async updateAccessToken(accessTokenObj: usertoken) {
        const { ctx } = this;
        const wechatParams: RefreshTokenParamsTypes = _.assign(REFRESH_TOKEN_PARAMS, {
            refresh_token: accessTokenObj.refresh_token,
        });
        const url = ctx.helper.uriGenerate(WECHAT_REFRESH_TOKEN, wechatParams);
        try {
            const result = await ctx.curl(url, {
                dataType: 'json',
            });
            return result.data;
        } catch (err) {
            throw err;
        }
    }

    redirect() {
        const { ctx } = this;
        // 重定向前去除无用的code和state属性
        ctx.url = ctx.url.replace(/code=[^&]{0,}&?/, '');
        ctx.url = ctx.url.replace(/state=[^&]{0,}&?/, '');
        ctx.url = ctx.url.replace(/\?$/, '');
        const target = this.getRedirectTarget();
        ctx.redirect(target);
    }

    setAccessTokenToCookie(accessTokenObj: wechatToken) {
        const { ctx } = this;
        const { helper } = ctx;
        // 由于在接收access_token时中间需要花费时间，所以过期时间提前120秒
        const expiresTime = new Date().getTime() + (accessTokenObj.expires_in - 120) * 1000;
        const userObj = helper.encodeAccessToken(accessTokenObj);
        ctx.cookies.set(USER_TOKEN_KEY, userObj, { expires: new Date(expiresTime) });
    }

    private getRedirectTarget() {
        const { ctx } = this;
        const requestUrl = `${ctx.protocol}://${ctx.host}${ctx.url}`;
        const wechatParams: AuthorizeParamsTypes = _.assign(AUTHORIZE_PARAMS, {
            redirect_uri: encodeURIComponent(requestUrl),
        });
        try {
            const result = ctx.helper.uriGenerate(WECHAT_AUTHORIZE, wechatParams) + '#wechat_redirect';
            return result;
        } catch (err) {
            throw err;
        }
    }
}
```

