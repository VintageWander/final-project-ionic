import { File } from "./File";
import { Folder } from "./Folder";

export type User = {
	id: String;
	username: String;
	email: String;
	files: File[];
	folders: Folder[];
};
