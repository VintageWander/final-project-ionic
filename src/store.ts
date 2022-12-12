import { atomWithStorage } from "jotai/utils";
import { User } from "./model/User";

const loggedIn = atomWithStorage<boolean>("loggedIn", false);
const user = atomWithStorage<User>("user", {
	id: "",
	username: "",
	email: "",
	files: [],
	folders: [],
});

const exports = { loggedIn, user };

export default exports;
