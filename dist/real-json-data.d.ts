import { SerialQueue } from './common.js';
/**
 * 简单的json数据库，数据必须以数组存在，适用于小量数据
 * 实时操作，每次读取全量数据
 */
export declare class RealJsonData {
    #private;
    jsonPath: string;
    config: any;
    queueInstance: SerialQueue;
    constructor(jsonPath: string, config: any);
    /** 格式化数据 */
    format(): Promise<unknown>;
    /** 返回所有数据列表 */
    list(): Promise<unknown>;
    /** 删除第一个 */
    shift(): Promise<unknown>;
    /** 删除最后一个 */
    pop(): Promise<unknown>;
    /** 直接写入新的list，风险较高 */
    setList(list: any): Promise<unknown>;
    /** 添加一个数据 */
    add(data: any): Promise<unknown>;
    /** 更新一个数据 */
    update(instance: any, data: any): Promise<unknown>;
    /** 删除个体，参数是实例 || [实例] */
    delete(instance: any): Promise<unknown>;
}
