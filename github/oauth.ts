import Koa from 'koa';
import KoaRouter from 'koa-router';
import axios from 'axios';
import * as GithubInterface from './GithubInterface';


export default function webhookOAuth(): void {
    const app = new Koa();
    const router = new KoaRouter();
    
    router.post('/oauth', async (ctx) => {
        const resp = ctx.body as GithubInterface.OAuthResponse;
        const { clientID = resp.clientId, clientSecret = resp.ClientSecret, code } = ctx.body;
        const { status, data } = await axios({
            method: 'post',
            url: 'http://github.com/login/oauth/access_token?' +
                `client_id=${clientID}&` +
                `client_secret=${clientSecret}&` +
                `code=${code}`,
            headers: {
                accept: 'application/json',
            },
        }).catch(e => e.response);
        ctx.body = { status, data };
    });
    
    app.use(router.routes());
    app.listen(22333);
}
