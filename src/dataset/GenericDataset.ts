import {
	InsightDataset,
	InsightDatasetKind,
} from "../controller/IInsightFacade";

export default class GenericDataset implements InsightDataset {
	public id: string;
	public kind: InsightDatasetKind;
	public numRows: number;

	constructor(id: string, kind: InsightDatasetKind, data: any[]) {
		this.id = id;
		this.kind = kind;
		this.numRows = data.map((dp) => (kind === InsightDatasetKind.Courses) ?
			dp.result.length : dp.rooms.length).reduce((l1, l2) => l1 + l2);
	}
}
