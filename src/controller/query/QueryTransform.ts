import { Decimal } from "decimal.js";
import { InsightError } from "../IInsightFacade";

/* Transfroms the query result acording to query.TRANSFORMATIONS. */
export function transformQueryResult(result: any[], transformations: any): any[] {
	if (typeof transformations === "undefined" || transformations === {}) {
		return result;
	}
	let groups: any[][] = groupQueryResult(result, transformations.GROUP);
	return aggregateQueryResult(groups, transformations.APPLY);
}

/* Groups result into list of groups as specified by GROUP. */
function groupQueryResult(result: any[], group: string[]): any[][] {
	const splitGroupByKey = (curGroup: any[], groupKey: string): any[][] => {
		let res: any[][] = [];
		let groupKeyMap: any = {};
		curGroup.forEach((entry) => {
			if (!(entry[groupKey] in groupKeyMap)) {
				groupKeyMap[entry[groupKey]] = [];
			}
			groupKeyMap[entry[groupKey]].push(entry);
		});
		Object.keys(groupKeyMap).forEach((i) => res.push(groupKeyMap[i]));
		return res;
	};

	let curGroups: any[][] = [result], nextGroups: any[][] = [];
	group.forEach((groupKey: string) => {
		curGroups.forEach((curGroup: any[]) => {
			nextGroups = nextGroups.concat(splitGroupByKey(curGroup, groupKey));
		});
		curGroups = nextGroups;
		nextGroups = [];
	});
	return curGroups;
}

/* Aggregates groups into result based on APPLY. */
function aggregateQueryResult(groups: any[][], apply: any[]): any[] {
	let res: any[] = [];
	groups.forEach((group: any[]) => {
		let aggregateRow = group[0];
		apply.forEach((applyRule: any) => {
			let applyKey: string = Object.keys(applyRule)[0];
			let aggregateValue: number = getAggregateValue(group, applyRule[applyKey]);
			aggregateRow[applyKey] = aggregateValue;
		});
		res.push(aggregateRow);
	});
	return res;
}

/* Returns aggregate value of group based on applyToken. */
function getAggregateValue(group: any[], applyTokenObj: any): number {
	let applyToken: string = Object.keys(applyTokenObj)[0];
	switch (applyToken) {
		case "MAX":
			return getGroupMax(group, applyTokenObj[applyToken]);
		case "MIN":
			return getGroupMin(group, applyTokenObj[applyToken]);
		case "AVG":
			return getGroupAvg(group, applyTokenObj[applyToken]);
		case "COUNT":
			return getGroupCount(group, applyTokenObj[applyToken]);
		case "SUM":
			return getGroupSum(group, applyTokenObj[applyToken]);
		default:
			throw new InsightError("Invalid apply token.");
	}
}

/* Returns the maximum value at specified key for rows in group. */
function getGroupMax(group: any[], key: string): number {
	return group.map((row) => row[key]).reduce((a, b) => (a > b) ? a : b);
}

/* Returns the minimum value at specified key for rows in group. */
function getGroupMin(group: any[], key: string): number {
	return group.map((row) => row[key]).reduce((a, b) => (a < b) ? a : b);
}

/* Returns the average value at specified key for rows in group. */
function getGroupAvg(group: any[], key: string): number {
	let decimals: Decimal[] = group.map((row) => new Decimal(row[key]));
	let total: Decimal = decimals.reduce((a, b) => Decimal.add(a, b));
	let avg = total.toNumber() / group.length;
	let res = Number(avg.toFixed(2));
	return res;
}

/* Returns the number of unique values at specified key for rows in group. */
function getGroupCount(group: any[], key: string): number {
	let uniqueKeys = new Set<any>();
	for (let row of group){
		uniqueKeys.add(row[key]);
	}
	// group.forEach((row) => uniqueKeys.add(row[key]));
	return uniqueKeys.size;
}

/* Returns the sum of values at specified key for rows in group. */
function getGroupSum(group: any[], key: string): number {
	return Number(group.map((row) => row[key]).reduce((a, b) => a + b).toFixed(2));
}
