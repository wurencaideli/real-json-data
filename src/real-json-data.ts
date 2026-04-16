import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';

import { completionData, SerialQueue } from './common.js';

export type Option = {
    cache?: boolean;
    idKey?: string;
    afterSetCache?: (cache?: any) => {};
};
/**
 * 简单的json数据库，数据必须以数组存在，适用于小量数据
 * 实时操作，每次读取全量数据
 */
export class RealJsonData {
    jsonPath = '';
    keyConfig: any = {};
    cache: boolean = false;
    idKey: string = 'id__local__';
    queueInstance: SerialQueue;
    #cacheData: any = [];
    #afterSetCache?: (cache?: any) => {};
    constructor(jsonPath: string, keyConfig: any, option: Option = {}) {
        this.cache = !!option.cache;
        if (option.idKey) {
            this.idKey = option.idKey;
        }
        if (option.afterSetCache) {
            this.#afterSetCache = option.afterSetCache;
        }
        this.queueInstance = new SerialQueue();
        this.jsonPath = jsonPath;
        this.keyConfig = Object.assign({}, keyConfig);
        this.keyConfig[this.idKey] = {
            default: () => {
                return uuidv4();
            },
        };
    }
    async #read() {
        const listContent = await fs.readFile(this.jsonPath, 'utf8');
        let list: any = JSON.parse(listContent);
        if (!Array.isArray(list)) {
            throw 'data is not an array json string.';
        }
        list = list.map((item) => {
            return completionData(item, this.keyConfig);
        });
        if (this.cache) {
            this.#cacheData = list;
        }
        return list;
    }
    async #write(data: any) {
        const content = JSON.stringify(data, null, 2);
        await fs.writeFile(this.jsonPath, content, 'utf8');
        if (this.cache) {
            this.#cacheData = JSON.parse(content);
        }
        return;
    }
    /** 预热缓存 */
    async setupCache() {
        if (!this.cache) {
            throw 'No cache configured';
        }
        const data = await this.queueInstance.push(async () => {
            return await this.#read();
        });
        if (this.cache) {
            this.#afterSetCache?.(this.#cacheData);
        }
        return data;
    }
    /** 获取缓存数据，方便查找 */
    getCacheData() {
        if (!this.cache) {
            throw 'No cache configured';
        }
        return this.#cacheData;
    }
    /** 格式化数据 */
    async format() {
        const data = await this.queueInstance.push(async () => {
            const list = await this.#read();
            await this.#write(list);
            return list;
        });
        if (this.cache) {
            this.#afterSetCache?.(this.#cacheData);
        }
        return data;
    }
    /** 返回所有数据列表 */
    async list() {
        const data = await this.queueInstance.push(async () => {
            return await this.#read();
        });
        if (this.cache) {
            this.#afterSetCache?.(this.#cacheData);
        }
        return data;
    }
    /** 删除第一个 */
    async shift() {
        const data = await this.queueInstance.push(async () => {
            const list = await this.#read();
            const target = list.shift();
            await this.#write(list);
            return target;
        });
        if (this.cache) {
            this.#afterSetCache?.(this.#cacheData);
        }
        return data;
    }
    /** 删除最后一个 */
    async pop() {
        const data = await this.queueInstance.push(async () => {
            const list = await this.#read();
            const target = list.pop();
            await this.#write(list);
            return target;
        });
        if (this.cache) {
            this.#afterSetCache?.(this.#cacheData);
        }
        return data;
    }
    /** 直接写入新的list，风险较高 */
    async setList(list: any) {
        const data = await this.queueInstance.push(async () => {
            await this.#read(); // 读取检测
            list = list.map((item: any) => {
                return completionData(item, this.keyConfig);
            });
            await this.#write(list);
            return list;
        });
        if (this.cache) {
            this.#afterSetCache?.(this.#cacheData);
        }
        return data;
    }
    /** 添加一个数据 */
    async add(data: any) {
        const data_ = await this.queueInstance.push(async () => {
            const list = await this.#read();
            if (list.find((item: any) => item[this.idKey] === data[this.idKey])) {
                throw 'ERROR: Repeating Instances';
            }
            data = completionData(data, this.keyConfig);
            list.push(data);
            await this.#write(list);
            return data;
        });
        if (this.cache) {
            this.#afterSetCache?.(this.#cacheData);
        }
        return data_;
    }
    /** 更新一个数据 */
    async update(instance: any, data: any) {
        const data_ = await this.queueInstance.push(async () => {
            const list = await this.#read();
            const target = list.find((item: any) => item[this.idKey] == instance[this.idKey]);
            if (!target) {
                throw 'ERROR: No corresponding instance found';
            }
            Object.keys(target).forEach((key) => {
                if (key === this.idKey) return;
                if (!this.keyConfig.hasOwnProperty(key)) return;
                if (data.hasOwnProperty(key) && data[key] !== undefined) {
                    target[key] = data[key];
                }
            });
            await this.#write(list);
            return target;
        });
        if (this.cache) {
            this.#afterSetCache?.(this.#cacheData);
        }
        return data_;
    }
    /** 删除个体，参数是实例 || [实例] */
    async delete(instance: any) {
        const data = await this.queueInstance.push(async () => {
            const list = await this.#read();
            if (!Array.isArray(instance)) {
                instance = [instance];
            }
            const signMap: any = {};
            instance.forEach((item: any) => {
                signMap[item[this.idKey]] = true;
            });
            const newList = list.filter((item: any) => {
                return !signMap[item[this.idKey]];
            });
            await this.#write(newList);
            return newList;
        });
        if (this.cache) {
            this.#afterSetCache?.(this.#cacheData);
        }
        return data;
    }
}
