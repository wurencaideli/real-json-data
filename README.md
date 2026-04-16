## Introduce

A simple json data store.

#### Install

```javascript
npm install real-json-data
```

#### How to use

```javascript
import { RealJsonData } from './dist/real-json-data.esm.js';

const instance = new RealJsonData(
    './demo-data.json',
    {
        idU: {
            default: '',
        },
        content: {
            default: '',
        },
    },
    {
        cache: true,
        idKey: 'id__local__',
        afterSetCache(list) {
            console.log('afterSetCache', list);
        },
        afterDataChange(list) {
            console.log('afterDataChange', list);
        },
    },
);
async function start() {
    console.log(instance);
    console.log(await instance.list());
    await instance.add({
        id: 123123,
        content: '456',
    });
    await instance.add({
        id: 123123,
        content: '4561',
    });
    await instance.update(
        {
            id__local__: '4e280548-9738-4c67-a1bc-6dfe2143e713',
        },
        {
            idU: '12312',
        },
    );
    // await instance.setupCache();
    // await instance.getCacheData();
    // await instance.delete(target);
    // await instance.format();
    // await instance.shift();
    // await instance.pop();
    // await instance.setList([]);
    console.log(await instance.list());
}
start();

```