
import { InsightDataset } from "../../IInsightFacade";
import { isDatasetAdded, QUERYKEYS } from "./QueryValidation";
import { APPLYKEYS, GROUPKEYS, isTransformationsValid } from "./TransformationValidation";

const DIRKEYS: string[] = ["UP", "DOWN"];
let columnArray: string[] = [];

export function isOptionsTypeValid(options: any) {
	if (typeof options !== "object"
		|| options === null
		|| typeof options === "undefined"
		|| Object.keys(options).length < 1
		|| Object.keys(options).length > 2) {
		return false;
	} else if (Object.keys(options).length === 1) {
		if (Object.keys(options)[0] !== "COLUMNS") {
			return false;
		}
	} else if (Object.keys(options).length === 2) {
		if (!Object.keys(options).includes("COLUMNS") || !Object.keys(options).includes("ORDER")) {
			return false;
		}
	}
	return true;
}

export function isColumnsValid(column: any, datasets: InsightDataset[], transformations: any) {
	if (!(column instanceof Array) || column.length === 0) {
		return false;
	}
	let keyArray: string[] = [];
	let courseNames: string[] = [];
	// console.log(GROUPKEYS.length);

	if (typeof transformations === "undefined"){
		column.forEach((element) => {
			let arr: string[] = element.split("_");
			courseNames.push(arr[0]);
			keyArray.push(arr[1]);
		});
	} else {
		for (let element of column){
			if (element.split("_")[0] !== element) {
				if (!GROUPKEYS.includes(element)){
					return false;
				}
				let arr: string[] = element.split("_");
				courseNames.push(arr[0]);
				keyArray.push(arr[1]);
			} else {
				if (!APPLYKEYS.includes(element)){
					return false;
				}
			}
		}
	}

	if (!checkDistinctValue(courseNames)) {
		return false;
	} else if (!isDatasetAdded(courseNames[0], datasets)) {
		return false;
	}

	let getIntersection = QUERYKEYS.filter((value: any) => keyArray.includes(value));
	if (!keyArray.every((value: any) => getIntersection.includes(value))) {
		return false;
	}
	return true;
}

export function isOrderValid(order: any, column: string[], datasets: InsightDataset[]) {
	if (typeof order === "undefined"){
		return true;
	}

	if (typeof order === "string"){
		if (isStringOrderValid(order, column, datasets)){
			return true;
		}
	} else if (typeof order === "object"){
		if (isSortValid(order, column)){
			return true;
		}
	}
	return false;
}

function isStringOrderValid(order: string, column: string[], datasets: InsightDataset[]): boolean {
	if (order.split("_")[0] === order){
		if (!column.includes(order)){
			return false;
		}
	} else {
		let arr: string[] = order.split("_");
		if (!isDatasetAdded(arr[0], datasets)
		|| !QUERYKEYS.includes(arr[1])) {
			return false;
		}
	}
	return true;
}

function isSortValid(order: any, column: string[]): boolean {
	if (typeof order !== "object"
	|| !Object.keys(order).includes("dir")
	|| !Object.keys(order).includes("keys")
	|| Object.keys(order).length !== 2){
		return false;
	}
	if (!isDirValid(order.dir) || !isKeysValid(order.keys, column)){
		return false;
	}

	return true;
}

function isDirValid(dir: string){
	if (typeof dir !== "string" || !DIRKEYS.includes(dir)){
		return false;
	}
	return true;
}

function isKeysValid(keys: any, column: string[]){
	if (!(keys instanceof Array) || keys === null || typeof keys === "undefined"){
		return false;
	}
	for (let key of keys){
		if (!column.includes(key)){
			return false;
		}
	}
	return true;
}

export function isOrderKeyInColumn(column: any, order: any) {
	if (typeof order === "undefined"){
		return true;
	}

	if (typeof order === "string"){
		if (typeof order !== "undefined"){
			if (!column.includes(order)){
				return false;
			}
		}
	} else {
		const keys = order.keys;
		for (let key of keys){
			if (!column.includes(key)){
				return false;
			}
		}
	}
	return true;
}

function checkDistinctValue(arr: string[]) {
	return new Set(arr).size === 1;
}
