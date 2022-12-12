export type File = {
	id: string;
	owner: string;
	filename: string;
	extension: string;
	visibility: string;
	fullFilename: string;
	position: string;
	fullpath: string;
	version: number[];

	createdAt: number;
	updatedAt: number;
};
