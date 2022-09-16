/* Sorts the query result according to query.ORDER. */
export function sortQueryResult(result: any[], order: string | any): any[] {
	if (result.length === 0) {
		return result; // Require length > 0 as we may order based on an element.
	}

	let orderKeys: string[] = getOrderKeys(order, result);
	let direction: string = getSortDirection(order);
	return result.sort((entry1: any, entry2: any) => {
		let sortIndex = orderKeys.findIndex((key: string, i: number) =>
			(i === orderKeys.length - 1) || (entry1[key] !== entry2[key]));

		if (entry1[orderKeys[sortIndex]] === entry2[orderKeys[sortIndex]]) {
			return 0;
		} else if (direction === "UP") {
			return (entry1[orderKeys[sortIndex]] < entry2[orderKeys[sortIndex]]) ? -1 : 1;
		} else {
			return (entry1[orderKeys[sortIndex]] > entry2[orderKeys[sortIndex]]) ? -1 : 1;
		}
	});
}

/* Returns a list of keys (in order) to sort the result by. */
function getOrderKeys(order: string | any, result: any[]): string[] {
	if (typeof order === "undefined" || order === null) {
		return [Object.keys(result[0])[0]];
	} else if (typeof order === "string") {
		return [order];
	} else {
		return order.keys;
	}
}

/* Returns the direction to sort the result in. */
function getSortDirection(order: string | any): string {
	if (typeof order === "undefined" || order === null || typeof order === "string") {
		return "UP";
	} else {
		return order.dir;
	}
}
