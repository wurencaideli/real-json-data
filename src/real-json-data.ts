import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';

import { completionData, SerialQueue } from './common.js';

/**
 * 简单的json数据库，数据必须以数组存在，适用于小量数据
 * 实时操作，每次读取全量数据
 */
export class RealJsonData {
    jsonPath = '';
    config: any = {};
    queueInstance: SerialQueue;
    constructor(jsonPath: string, config: any) {
        this.queueInstance = new SerialQueue();
        this.jsonPath = jsonPath;
        this.config = Object.assign({}, config);
        this.config['id__local__'] = {
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
            return completionData(item, this.config);
        });
        return list;
    }
    async #write(data: any) {
        return fs.writeFile(this.jsonPath, JSON.stringify(data, null, 2), 'utf8');
    }
    /** 格式化数据 */
    async format() {
        return await this.queueInstance.push(async () => {
            const list = await this.#read();
            await this.#write(list);
            return list;
        });
    }
    /** 返回所有数据列表 */
    async list() {
        return await this.queueInstance.push(async () => {
            return await this.#read();
        });
    }
    /** 删除第一个 */
    async shift() {
        return await this.queueInstance.push(async () => {
            const list = await this.#read();
            const target = list.shift();
            await this.#write(list);
            return target;
        });
    }
    /** 删除最后一个 */
    async pop() {
        return await this.queueInstance.push(async () => {
            const list = await this.#read();
            const target = list.pop();
            await this.#write(list);
            return target;
        });
    }
    /** 直接写入新的list，风险较高 */
    async setList(list: any) {
        return await this.queueInstance.push(async () => {
            await this.#read(); // 读取检测
            list = list.map((item: any) => {
                return completionData(item, this.config);
            });
            await this.#write(list);
            return list;
        });
    }
    /** 添加一个数据 */
    async add(data: any) {
        return await this.queueInstance.push(async () => {
            const list = await this.#read();
            if (list.find((item: any) => item.id__local__ === data.id__local__)) {
                throw 'ERROR: Repeating Instances';
            }
            data = completionData(data, this.config);
            list.push(data);
            await this.#write(list);
            return data;
        });
    }
    /** 更新一个数据 */
    async update(instance: any, data: any) {
        return await this.queueInstance.push(async () => {
            const list = await this.#read();
            const target = list.find((item: any) => item.id__local__ == instance.id__local__);
            if (!target) {
                throw 'ERROR: No corresponding instance found';
            }
            Object.keys(target).forEach((key) => {
                if (key === 'id__local__') return;
                if (!this.config.hasOwnProperty(key)) return;
                if (data.hasOwnProperty(key) && data[key] !== undefined) {
                    target[key] = data[key];
                }
            });
            await this.#write(list);
            return target;
        });
    }
    /** 删除个体，参数是实例 || [实例] */
    async delete(instance: any) {
        return await this.queueInstance.push(async () => {
            const list = await this.#read();
            if (!Array.isArray(instance)) {
                instance = [instance];
            }
            const signMap: any = {};
            instance.forEach((item: any) => {
                signMap[item.id__local__] = true;
            });
            const newList = list.filter((item: any) => {
                return !signMap[item.id__local__];
            });
            await this.#write(newList);
            return newList;
        });
    }
}
