
export default class Hello {
	constructor(name) {
		this.name = name;
	}
	async say() {
		let result = await this.foo();
		return `Hello, ${this.name}!`;
	}
	foo(){
		return new Promise((resolve, reject) => {
			resolve('hdello');
		});
	}
}
