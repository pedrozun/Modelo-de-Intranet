import axios from "axios";
import https from "https";
import crypto from "crypto";

const baseUrl = "https://192.168.100.35:8089/api/";
const username = process.env.CENTRALAPI;
const password = process.env.CENTRALAPIPASS;

const agent = new https.Agent({ rejectUnauthorized: false });

export class ExtensionsService {
	async getChallenge() {
		try {
			const response = await axios.post(
				`${baseUrl}challenge`,
				{
					request: {
						action: "challenge",
						user: username,
					},
				},
				{ httpsAgent: agent }
			);
			return response.data?.response?.challenge || null;
		} catch (error) {
			console.error("Error getting challenge:", error);
			return null;
		}
	}

	async login() {
		const challenge = await this.getChallenge();
		if (!challenge) return null;

		const token = crypto
			.createHash("md5")
			.update(challenge + password)
			.digest("hex");

		try {
			const response = await axios.post(
				`${baseUrl}login`,
				{
					request: {
						action: "login",
						token: token,
						user: username,
					},
				},
				{ httpsAgent: agent }
			);

			const sid = response.headers["set-cookie"]
				?.find((cookie) => cookie.startsWith("session-identify"))
				?.split(";")[0]
				.replace("session-identify=", "");

			return sid || null;
		} catch (error) {
			console.error("Login error:", error);
			return null;
		}
	}

	async listAccount(sid) {
		try {
			const response = await axios.post(
				`${baseUrl}listAccount`,
				{
					request: {
						action: "listAccount",
						cookie: sid,
						options: "extension,fullname",
					},
				},
				{
					headers: { Cookie: `session-identify=${sid}` },
					httpsAgent: agent,
				}
			);
			return response.data?.response || null;
		} catch (error) {
			console.error("Error getting extensions list:", error);
			return null;
		}
	}

	async getExtensions() {
		const sid = await this.login();
		if (!sid) return null;

		const accountInfo = await this.listAccount(sid);
		return accountInfo?.account || [];
	}
}
