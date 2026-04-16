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
    await instance.add([
        {
            id: 123123,
            content: '456',
        },
        {
            id: 123123,
            content: '4561',
        },
    ]);
    // await instance.add({
    //     id: 123123,
    //     content: '4561',
    // });
    // await instance.update(
    //     [
    //         {
    //             id__local__: '3a80fe09-a45b-402b-9983-7104f502d24e',
    //         },
    //         {
    //             id__local__: 'e86002b1-4b2e-496e-af73-ea66f1b6103d',
    //         },
    //     ],
    //     [
    //         {
    //             idU: '12312',
    //         },
    //         {
    //             idU: 'qweqweqwe',
    //         },
    //     ],
    // );
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
