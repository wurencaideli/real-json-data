## Introduce

A simple json data store.

#### Install

```javascript
npm install real-json-data
```

#### How to use

```javascript
import { RealJsonData } from 'real-json-data';

const instance = new RealJsonData('./demo-data.json', {
    idU: {
        default: '',
    },
    content: {
        default: '',
    },
});
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
    // await instance.delete(target);
    console.log(await instance.list());
}
start();

```