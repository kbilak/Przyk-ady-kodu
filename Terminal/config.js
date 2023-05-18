import BSON from 'bson';
const sandboxUrl = 'usermd.net/api';
const url = 'usermd.net/api';
import store from '../store';

export default async (method = "GET", collection, data, sandbox = true) => {
    let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${store.state.user.token}`,
        User: store.state.user.token == null ? '5e25613d170ef32114cc0528' : store.state.user.token,
        Location: store.state.warehouse == null ? '5e0dbaba9e33df43f0b3a495' : store.state.warehouse,
    };
    let body = JSON.stringify(data);

    return fetch((sandbox ? sandboxUrl : url) + '/scanner/v1/' + collection, {
        method: method,
        headers: headers,
        body: body,
    }).then(async res => {
        let resData = {};
        if (res.headers.get('content-type') === 'application/octet-stream') {
            let buffer = await res.arrayBuffer();
            buffer = new Uint8Array(buffer);
            resData = BSON.deserialize(buffer);
        } else {
            if (res.headers.get('content-type') === 'application/pdf;charset=UTF-8') {
                resData = res.blob();
            } else {
                resData = await res.json();
            }
        }
        if (res.ok) {
            return resData;
        } else {
            throw resData;
        }
    });
};