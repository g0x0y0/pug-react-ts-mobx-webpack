export class Api {
	private mainUrl = '';

	setUrl(url: string) {
		this.mainUrl = url;
	}

	handleRequest(response: Response) {
		return response.ok ? response.json() : Promise.reject('Error');
	}

	async getData() {
		return await fetch(this.mainUrl).then(this.handleRequest);
	}
}
